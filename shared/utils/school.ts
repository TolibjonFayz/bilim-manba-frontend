/**
 * Maktab bo'limi manzillari (sayt va sitemap uchun umumiy):
 *   /maktab                 — hammasi
 *   /maktab/tarix           — fan bo'yicha
 *   /maktab/8-sinf          — sinf bo'yicha (hamma fanlar)
 *   /maktab/tarix/8-sinf    — fan + sinf
 */
export const schoolSlug = (subject: string) =>
  subject
    .toLowerCase()
    .replace(/[ʻʼ'‘’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "umumiy";

export const gradeSlug = (grade: number) => `${grade}-sinf`;

/** "8-sinf" → 8; boshqa narsa → null */
export const parseGradeSlug = (s: unknown): number | null => {
  const m = /^(\d{1,2})-sinf$/.exec(String(s ?? ""));
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= 11 ? n : null;
};

export const schoolPath = (subject?: string | null, grade?: number | null) =>
  ["/maktab", subject ? schoolSlug(subject) : "", grade ? gradeSlug(grade) : ""]
    .filter(Boolean)
    .join("/");
