import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

export const runtime = "nodejs";

interface ExecuteRequestBody {
  input_data: Record<string, string>;
  model: "claude" | "ollama";
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

// SSE helper — formats a data line per SSE spec
function sseMessage(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function streamOllama(
  prompt: string,
  temperature: number,
  maxTokens: number,
  controller: ReadableStreamDefaultController<Uint8Array>
): Promise<{ tokensIn: number; tokensOut: number }> {
  const encoder = new TextEncoder();

  const ollamaPayload = {
    model: "llama3.2", // sensible default; user can change in settings later
    prompt,
    stream: true,
    options: {
      temperature,
      num_predict: maxTokens,
    },
  };

  let response: Response;
  try {
    response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ollamaPayload),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("ECONNREFUSED")
        ? "Ollama is not running. Start it with: `ollama serve`"
        : `Could not connect to Ollama: ${err instanceof Error ? err.message : "Unknown error"}`;
    controller.enqueue(
      encoder.encode(sseMessage({ type: "error", message: msg }))
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  if (!response.ok) {
    const text = await response.text();
    controller.enqueue(
      encoder.encode(
        sseMessage({ type: "error", message: `Ollama error ${response.status}: ${text}` })
      )
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    controller.enqueue(
      encoder.encode(sseMessage({ type: "error", message: "No response body from Ollama" }))
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  let tokensOut = 0;
  const dec = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = dec.decode(value);
    // Ollama sends newline-delimited JSON
    for (const line of chunk.split("\n")) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as {
          response?: string;
          done?: boolean;
          prompt_eval_count?: number;
          eval_count?: number;
        };
        if (parsed.response) {
          controller.enqueue(
            encoder.encode(sseMessage({ type: "content", content: parsed.response }))
          );
          tokensOut++;
        }
        if (parsed.done) {
          return {
            tokensIn: parsed.prompt_eval_count ?? 0,
            tokensOut: parsed.eval_count ?? tokensOut,
          };
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  return { tokensIn: 0, tokensOut };
}

async function streamClaude(
  prompt: string,
  temperature: number,
  maxTokens: number,
  systemPrompt: string,
  controller: ReadableStreamDefaultController<Uint8Array>
): Promise<{ tokensIn: number; tokensOut: number }> {
  const encoder = new TextEncoder();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    controller.enqueue(
      encoder.encode(
        sseMessage({
          type: "error",
          message:
            "ANTHROPIC_API_KEY is not set. Add it to your .env.local file to use Claude.",
        })
      )
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "messages-2023-12-15",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    controller.enqueue(
      encoder.encode(
        sseMessage({
          type: "error",
          message: `Failed to reach Claude API: ${err instanceof Error ? err.message : "Unknown error"}`,
        })
      )
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  if (!response.ok) {
    const text = await response.text();
    controller.enqueue(
      encoder.encode(
        sseMessage({ type: "error", message: `Claude API error ${response.status}: ${text}` })
      )
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    controller.enqueue(
      encoder.encode(sseMessage({ type: "error", message: "No response body from Claude" }))
    );
    return { tokensIn: 0, tokensOut: 0 };
  }

  let tokensIn = 0;
  let tokensOut = 0;
  const dec = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = dec.decode(value);

    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as {
          type?: string;
          delta?: { type?: string; text?: string };
          message?: { usage?: { input_tokens: number; output_tokens: number } };
          usage?: { output_tokens: number };
        };
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          controller.enqueue(
            encoder.encode(sseMessage({ type: "content", content: parsed.delta.text }))
          );
        }
        if (parsed.type === "message_start" && parsed.message?.usage) {
          tokensIn = parsed.message.usage.input_tokens;
        }
        if (parsed.type === "message_delta" && parsed.usage) {
          tokensOut = parsed.usage.output_tokens;
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  return { tokensIn, tokensOut };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Resolve agent from DB with mock fallback
  type AgentRow = {
    id: string;
    name: string;
    description: string;
    creator_id?: string | null;
    prompt_template?: string | null;
  };
  let agentRow: AgentRow | null = null;
  if (DB_AVAILABLE) {
    try {
      agentRow = await prisma.agent.findUnique({
        where: { id: params.id },
        select: { id: true, name: true, description: true, creator_id: true, prompt_template: true },
      }) as AgentRow | null;
    } catch {
      // Fall through to mock
    }
  }

  // Fallback to mock data
  const mockAgent = !agentRow ? MOCK_AGENTS.find((a) => a.id === params.id) : null;
  if (!agentRow && !mockAgent) {
    return new Response(
      sseMessage({ type: "error", message: "Agent not found" }),
      { status: 404, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const agentName = agentRow?.name ?? mockAgent!.name;
  const agentDescription = agentRow?.description ?? mockAgent!.description;
  const agentCreatorId = agentRow?.creator_id ?? null;

  // Get authenticated user id if available
  let userId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email && DB_AVAILABLE) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = (dbUser?.id as string) ?? null;
    }
  } catch {
    // Non-fatal — proceed without user id
  }

  let body: ExecuteRequestBody;
  try {
    body = (await req.json()) as ExecuteRequestBody;
  } catch {
    return new Response(
      sseMessage({ type: "error", message: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const {
    input_data,
    model = "ollama",
    temperature = 0.7,
    max_tokens = 2000,
    system_prompt = `You are a helpful AI assistant.`,
  } = body;

  // Interpolate {{parameter}} placeholders into the agent prompt
  const basePrompt = `You are running as the "${agentName}" agent. ${agentDescription}\n\nUser input: ${JSON.stringify(input_data)}`;
  const finalPrompt = input_data.input ?? basePrompt;

  const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  // Capture streaming output for DB persistence
  const outputChunks: string[] = [];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      // Wrap controller to capture content chunks for DB
      const capturingController: ReadableStreamDefaultController<Uint8Array> = {
        ...controller,
        enqueue(chunk: Uint8Array) {
          // Decode to capture content events
          try {
            const text = new TextDecoder().decode(chunk);
            const dataMatch = text.match(/^data: (.+)\n\n$/);
            if (dataMatch) {
              const parsed = JSON.parse(dataMatch[1]) as { type?: string; content?: string };
              if (parsed.type === "content" && parsed.content) {
                outputChunks.push(parsed.content);
              }
            }
          } catch {
            // Non-fatal capture failure
          }
          controller.enqueue(chunk);
        },
        get desiredSize() { return controller.desiredSize; },
        close: controller.close.bind(controller),
        error: controller.error.bind(controller),
      };

      // Send start event
      controller.enqueue(
        encoder.encode(sseMessage({ type: "start", execution_id: executionId }))
      );

      let tokensIn = 0;
      let tokensOut = 0;
      let executionStatus = "success";

      try {
        if (model === "claude") {
          ({ tokensIn, tokensOut } = await streamClaude(
            finalPrompt,
            temperature,
            max_tokens,
            system_prompt,
            capturingController
          ));
        } else {
          ({ tokensIn, tokensOut } = await streamOllama(
            finalPrompt,
            temperature,
            max_tokens,
            capturingController
          ));
        }
      } catch (error) {
        executionStatus = "error";
        controller.enqueue(
          encoder.encode(
            sseMessage({
              type: "error",
              message: `Execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            })
          )
        );
      }

      const executionTimeMs = Date.now() - startTime;

      // Send end event with metadata
      controller.enqueue(
        encoder.encode(
          sseMessage({
            type: "end",
            execution_id: executionId,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            execution_time_ms: executionTimeMs,
          })
        )
      );

      controller.close();

      // Persist execution + earnings to DB (non-blocking, non-fatal)
      if (DB_AVAILABLE) {
        const outputText = outputChunks.join("");
        setImmediate(async () => {
          try {
            await prisma.execution.create({
              data: {
                id: executionId,
                agent_id: params.id,
                user_id: userId,
                input_data: input_data as Record<string, unknown>,
                output: outputText,
                model_used: model,
                tokens_input: tokensIn,
                tokens_output: tokensOut,
                execution_time_ms: executionTimeMs,
                status: executionStatus,
              },
            });

            // Create earning record for the agent's creator
            if (executionStatus === "success" && agentCreatorId) {
              await prisma.earning.create({
                data: {
                  creator_id: agentCreatorId,
                  agent_id: params.id,
                  execution_id: executionId,
                  amount: 0.05,
                  platform_fee: 0.02,
                  status: "pending",
                },
              });
            }

            // Increment agent usage count
            await prisma.agent.update({
              where: { id: params.id },
              data: { usage_count: { increment: 1 } },
            });
          } catch (dbErr) {
            console.error("[execute] DB persistence error:", dbErr);
          }
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
