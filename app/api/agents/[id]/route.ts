import { NextRequest, NextResponse } from "next/server";
import { MOCK_AGENTS } from "@/lib/mockData";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = MOCK_AGENTS.find((a) => a.id === params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Related agents: same category, excluding self
    const related = MOCK_AGENTS.filter(
      (a) => a.category === agent.category && a.id !== agent.id
    ).slice(0, 4);

    return NextResponse.json({
      agent: {
        ...agent,
        // Enrich with realistic prompt + parameters for demo
        prompt: `You are a helpful AI assistant specializing in ${agent.name}.

When given user input, provide a detailed, high-quality response that:
- Is accurate and well-structured
- Uses clear language appropriate for the task
- Provides actionable output the user can use immediately

{{input}}`,
        parameters: [
          {
            name: "input",
            type: "textarea",
            required: true,
            defaultValue: "",
            helpText: "Describe what you need help with",
          },
          {
            name: "tone",
            type: "select",
            required: false,
            defaultValue: "professional",
            helpText: "The tone of the output",
            options: ["professional", "casual", "technical", "friendly"],
          },
        ],
        defaultModel: "ollama",
        temperature: 0.7,
        maxTokens: 2000,
      },
      creator: agent.creator,
      isOwner: false, // Will be true when auth is wired up (Feature 5)
      related,
    });
  } catch (error) {
    console.error("GET /api/agents/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
