/**
 * Server (Node, UTC) va brauzerda bir xil natija beradigan sana formatlari.
 * toLocaleDateString("uz-UZ") Node'da "29/06/2026", brauzerda "2026-06-29"
 * qaytaradi — SSR sahifada hydration mismatch bo'ladi. Shuning uchun
 * qo'lda formatlaymiz, vaqt mintaqasi doim Toshkent (UTC+5, DST yo'q).
 */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

function tashkent(date: string | number | Date | null | undefined) {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(t + TASHKENT_OFFSET_MS);
}

/** 29.06.2026 */
export function formatDate(date: string | number | Date | null | undefined): string {
  const d = tashkent(date);
  if (!d) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

/** iyun 2026 */
export function formatMonthYear(date: string | number | Date | null | undefined): string {
  const d = tashkent(date);
  if (!d) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
