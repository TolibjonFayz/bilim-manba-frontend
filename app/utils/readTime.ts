/**
 * HTML yoki plain textdan o'qish vaqtini hisoblaydi.
 * O'rtacha o'qish tezligi: 150 so'z/daqiqa.
 */
export function calcReadTime(htmlOrText: string, wpm = 150): number {
  const text = (htmlOrText ?? "").replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wpm));
}
