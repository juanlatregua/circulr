import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Role-specific transition rules
const consultantTransitions: Record<string, string[]> = {
  active: ["in_review"],
  in_review: ["active", "delivered"],
};

const clientTransitions: Record<string, string[]> = {
  delivered: ["closed"],
};

export async function PATCH(
  request: NextRequest,
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

    const { status } = await request.json();

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get current project
    const { data: project } = await supabase
      .from("projects")
      .select("status, consultant_id, client_id")
      .eq("id", id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Determine role-specific allowed transitions
    let allowed: string[] | undefined;

    if (project.consultant_id === user.id) {
      allowed = consultantTransitions[project.status];
    } else if (project.client_id === user.id) {
      allowed = clientTransitions[project.status];
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${project.status} to ${status}` },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Audit log
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "status_change",
      resource_type: "project",
      resource_id: id,
      old_value: project.status,
      new_value: status,
    });

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
