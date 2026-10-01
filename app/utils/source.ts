/**
 * Maqola manbasi "Nashr (Muallif)" ko'rinishida saqlanadi:
 *   "Quanta Magazine (Ben Brubaker)" → { name: "Quanta Magazine", author: "Ben Brubaker" }
 *   "Claude AI"                      → { name: "Claude AI", author: "" }
 */
export function splitSource(source: string | null | undefined) {
  const s = (source ?? "").trim();
  const m = s.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!m) return { name: s, author: "" };
  return { name: m[1]!.trim(), author: m[2]!.trim() };
}
