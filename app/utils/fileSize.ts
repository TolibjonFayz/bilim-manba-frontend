/** 1536 → "1,5 KB", 4_200_000 → "4 MB" */
export function formatFileSize(bytes?: number | null): string {
  const b = Number(bytes) || 0;
  if (b <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = b;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const n = v >= 10 || i === 0 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${String(n).replace(".", ",")} ${units[i]}`;
}

/** Fayl turi uchun belgi */
export function fileIcon(ext?: string | null): string {
  const e = String(ext ?? "").toLowerCase();
  if (["pdf", "djvu"].includes(e)) return "📕";
  if (["epub", "fb2", "mobi"].includes(e)) return "📚";
  if (["doc", "docx", "odt", "rtf", "txt"].includes(e)) return "📝";
  if (["ppt", "pptx"].includes(e)) return "📊";
  if (["xls", "xlsx", "csv"].includes(e)) return "📈";
  if (e === "zip") return "🗜️";
  return "📎";
}

export interface ArticleAttachment {
  name: string;
  url: string;
  size: number;
  ext: string;
}
