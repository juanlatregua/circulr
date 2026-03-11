"use client";

import { useState, useCallback } from "react";

interface UseAIStreamReturn {
  content: string;
  loading: boolean;
  error: string | null;
  generate: (prompt: string, projectId: string) => Promise<void>;
  reset: () => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, projectId: string) => {
    setLoading(true);
    setError(null);
    setContent("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, projectId }),
      });

      if (!response.ok) {
        throw new Error("Error generating AI content");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setContent((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error in AI generation");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setError(null);
  }, []);

  return { content, loading, error, generate, reset };
}
