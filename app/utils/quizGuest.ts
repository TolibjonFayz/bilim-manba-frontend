/**
 * Mehmon o'yinchi ID: ro'yxatdan o'tmagan o'quvchi testlarni yechsa ham
 * bali serverda saqlanadi va reytingda taxallus bilan chiqadi. Kirgach/
 * ro'yxatdan o'tgach plugins/quiz-merge.client.ts ballarni akkauntga
 * ko'chiradi va ID o'chiriladi (keyin chiqib ketsa — yangi ID yaratiladi).
 */
const KEY = "bm_qid";

const uuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  // Eski brauzerlar: v4 formatida tasodifiy ID
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

/** Bor bo'lsa — ID, bo'lmasa null (yaratmaydi) */
export function peekQuizGuestId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** ID (kerak bo'lsa yaratib) — test yechayotgan mehmon uchun */
export function quizGuestId(): string {
  const old = peekQuizGuestId();
  if (old) return old;
  const id = uuid();
  try {
    localStorage.setItem(KEY, id);
  } catch {}
  return id;
}

export function clearQuizGuestId() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/** Backend bilan bir xil: har to'g'ri javob 10, hammasi to'g'ri — yana 10 */
export const quizPoints = (correct: number, total: number) =>
  correct * 10 + (total > 0 && correct === total ? 10 : 0);

/**
 * Kirish/ro'yxatdan o'tishdan keyin qaytiladigan sahifa (?next=/articles/...).
 * Faqat sayt ichidagi yo'l — boshqa saytga yo'naltirib bo'lmasin.
 */
export function safeNext(next: unknown): string {
  const s = Array.isArray(next) ? next[0] : next;
  return typeof s === "string" && /^\/(?![/\\])/.test(s) ? s : "/";
}
