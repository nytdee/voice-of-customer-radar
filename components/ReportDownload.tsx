"use client";

import { Download, Code } from "lucide-react";

interface ReportDownloadProps {
  markdown: string;
  html: string;
  fileName?: string;
}

export function ReportDownload({ markdown, html, fileName = "weekly_review_intelligence_report" }: ReportDownloadProps) {
  const downloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={downloadMd}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
      >
        <Download className="h-4 w-4" /> Markdown
      </button>
      <button
        onClick={downloadHtml}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
      >
        <Download className="h-4 w-4" /> HTML
      </button>
      <button
        onClick={previewHtml}
        className="inline-flex items-center gap-2 rounded-lg border border-teal-500/25 bg-teal-500/10 px-3 py-2 text-xs font-medium text-teal-300 hover:bg-teal-500/20"
      >
        <Code className="h-4 w-4" /> Preview
      </button>
    </div>
  );
}
