import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStream } from "@/lib/ai/generate";
import { rateLimit } from "@/lib/utils/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, remaining } = rateLimit(`ai:${user.id}`, { windowMs: 60_000, max: 10 });
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo en un minuto." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const { prompt, projectId } = await request.json();

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: "Missing prompt or projectId" },
        { status: 400 }
      );
    }

    // Verify user is the assigned consultant
    const { data: project } = await supabase
      .from("projects")
      .select("id, consultant_id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.consultant_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stream = await generateStream({ prompt });

    // Collect full content for DB save
    const fullContent: string[] = [];
    let aborted = false;

    // Listen for client disconnect
    request.signal.addEventListener("abort", () => {
      aborted = true;
      stream.abort();
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (aborted) break;

            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullContent.push(event.delta.text);
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }
          }

          controller.close();

          // Save to database after stream completes (not fire-and-forget)
          if (!aborted) {
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
          }
        } catch (err) {
          if (!aborted) {
            controller.error(err);
          }
        }
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
