"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectWithRelations } from "@/types";

interface UseProjectReturn {
  project: ProjectWithRelations | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function fetchProject() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:profiles!client_id(*),
          consultant:profiles!consultant_id(*)
        `
        )
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;
      setProject(data as unknown as ProjectWithRelations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  return { project, loading, error, refetch: fetchProject };
}
