import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is the client for this project
    const { data: project } = await supabase
      .from("projects")
      .select("status, client_id")
      .eq("id", id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (project.status !== "delivered") {
      return NextResponse.json(
        { error: "Can only approve delivered projects" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({ status: "closed" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ status: "closed" });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
