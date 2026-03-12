"use client";

interface ReportTemplateProps {
  title: string;
  clientName: string;
  content: string;
  date: string;
}

export function ReportTemplate({ title, clientName, content, date }: ReportTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-steel/30 bg-white p-8 text-black">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-800">CIRCULR</h1>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <h2 className="mt-4 text-xl font-medium">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">Preparado para: {clientName}</p>
      </div>

      {/* Content */}
      <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">{content}</div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-400">
          Documento generado por CIRCULR. Confidencial.
        </p>
      </div>
    </div>
  );
}
