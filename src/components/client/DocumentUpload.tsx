"use client";

import { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadProps {
  projectId: string;
  onUploadComplete?: (path: string) => void;
}

export function DocumentUpload({ projectId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { path } = await response.json();
      onUploadComplete?.(path);
      toast.success("Documento subido");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir documento");
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-steel/50 bg-smoke p-6">
      {fileName ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File size={20} className="text-lime" />
            <span className="text-sm text-off-white">{fileName}</span>
          </div>
          <button
            onClick={() => {
              setFileName(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-mid hover:text-off-white"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-2 text-center"
        >
          <Upload size={24} className="text-mid" />
          <span className="text-sm text-pale">
            {uploading ? "Subiendo..." : "Arrastra un archivo o haz clic para seleccionar"}
          </span>
          <span className="text-xs text-mid">PDF, DOCX, XLSX — máximo 10MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.xlsx,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
