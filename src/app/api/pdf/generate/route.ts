import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ReactPDF from "@react-pdf/renderer";
import { CirculrReport } from "@/components/pdf/CirculrReport";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, content } = await request.json();

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Missing projectId or content" },
        { status: 400 }
      );
    }

    // Get project + client info
    const { data: project } = await supabase
      .from("projects")
      .select("title, client:profiles!client_id(full_name, company_name)")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const client = project.client as unknown as {
      full_name?: string;
      company_name?: string;
    } | null;

    const pdfStream = await ReactPDF.renderToStream(
      CirculrReport({
        title: project.title,
        clientName: client?.company_name || client?.full_name || "Cliente",
        content,
        date: new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      })
    );

    // Convert to ReadableStream for the response
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of pdfStream) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ciculr-${projectId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
