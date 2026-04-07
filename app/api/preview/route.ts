import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Lightweight preview endpoint — streams Ollama response for the prompt builder
// Shares the same SSE format as /api/agents/[id]/execute for consistency
function sseMessage(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let prompt: string;
  let model: string;

  try {
    const body = (await req.json()) as { prompt?: string; model?: string };
    prompt = body.prompt ?? "";
    model = body.model ?? "ollama";
  } catch {
    return new Response(
      sseMessage({ type: "error", message: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  if (!prompt.trim()) {
    return new Response(
      sseMessage({ type: "error", message: "Prompt is required" }),
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(sseMessage({ type: "start" })));

      if (model === "claude") {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          controller.enqueue(
            encoder.encode(sseMessage({ type: "error", message: "ANTHROPIC_API_KEY not set" }))
          );
          controller.close();
          return;
        }

        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 500,
              stream: true,
              messages: [{ role: "user", content: prompt }],
            }),
            signal: AbortSignal.timeout(12_000),
          });

          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");
          const dec = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = dec.decode(value);
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              try {
                const parsed = JSON.parse(line.slice(6)) as {
                  type?: string;
                  delta?: { text?: string };
                };
                if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                  controller.enqueue(
                    encoder.encode(sseMessage({ type: "content", content: parsed.delta.text }))
                  );
                }
              } catch { /* skip */ }
            }
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(sseMessage({ type: "error", message: err instanceof Error ? err.message : "Claude error" }))
          );
        }
      } else {
        // Ollama
        try {
          const res = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama3.2",
              prompt,
              stream: true,
              options: { num_predict: 500, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(12_000),
          });

          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");
          const dec = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = dec.decode(value);
            for (const line of chunk.split("\n")) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line) as { response?: string; done?: boolean };
                if (parsed.response) {
                  controller.enqueue(
                    encoder.encode(sseMessage({ type: "content", content: parsed.response }))
                  );
                }
                if (parsed.done) break;
              } catch { /* skip */ }
            }
          }
        } catch (err) {
          const msg =
            err instanceof Error && err.message.includes("ECONNREFUSED")
              ? "Ollama not running. Start with: `ollama serve`"
              : err instanceof Error ? err.message : "Ollama error";
          controller.enqueue(encoder.encode(sseMessage({ type: "error", message: msg })));
        }
      }

      controller.enqueue(encoder.encode(sseMessage({ type: "end" })));
      controller.close();
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
