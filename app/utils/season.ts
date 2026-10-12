/**
 * Mavsumiy bezak. Kuz (1-sentabr – 30-noyabr, Toshkent vaqti) kelganda sayt
 * o'zi kuzgi ko'rinishga o'tadi va dekabrda o'zi qaytadi.
 *
 * Qo'lda boshqarish: NUXT_PUBLIC_SEASON = "auto" (standart) | "autumn" | "off".
 */
export type Season = "autumn" | null;

export function seasonFor(date: Date, mode = "auto"): Season {
  if (mode === "off") return null;
  if (mode === "autumn") return "autumn";
  // Toshkent oyi (UTC+5, yozgi vaqt yo'q)
  const month = new Date(date.getTime() + 5 * 3600 * 1000).getUTCMonth() + 1;
  return month >= 9 && month <= 11 ? "autumn" : null;
}
