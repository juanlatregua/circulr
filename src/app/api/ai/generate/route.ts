import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStream } from "@/lib/ai/generate";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, projectId } = await request.json();

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: "Missing prompt or projectId" },
        { status: 400 }
      );
    }

    // Verify user has access to this project
    const { data: project } = await supabase
      .from("projects")
      .select("id, consultant_id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const stream = await generateStream({ prompt });

    // Save generation record
    const fullContent: string[] = [];

    const readableStream = new ReadableStream({
      async start(controller) {
        const textStream = stream.on("text", (text) => {
          fullContent.push(text);
          controller.enqueue(new TextEncoder().encode(text));
        });

        textStream.on("end", async () => {
          controller.close();

          // Save to database after stream completes
          const finalMessage = await stream.finalMessage();
          await supabase.from("ai_generations").insert({
            project_id: projectId,
            consultant_id: user.id,
            prompt_used: prompt,
            raw_output: fullContent.join(""),
            tokens_used:
              finalMessage.usage.input_tokens +
              finalMessage.usage.output_tokens,
            model: finalMessage.model,
          });
        });

        textStream.on("error", (error: Error) => {
          controller.error(error);
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
