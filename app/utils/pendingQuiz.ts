/**
 * Mehmon testni yechdi → natija brauzerda saqlanadi. Ro'yxatdan o'tgach/
 * kirgach plugins/quiz-claim.client.ts uni serverga yuboradi (POST /quiz/claim)
 * va ball yangi akkauntga yoziladi. Server faqat 24 soat ichida ochilgan va
 * hali bali yo'q akkauntga qabul qiladi.
 */
const KEY = "bm_pending_quiz";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingQuiz {
  slug: string;
  answers: number[];
  points: number;
  at: number;
}

/** Backend bilan bir xil: har to'g'ri javob 10, hammasi to'g'ri — yana 10 */
export const quizPoints = (correct: number, total: number) =>
  correct * 10 + (total > 0 && correct === total ? 10 : 0);

export function savePendingQuiz(p: Omit<PendingQuiz, "at">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, at: Date.now() }));
  } catch {}
}

export function readPendingQuiz(): PendingQuiz | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!p?.slug || !Array.isArray(p.answers)) return null;
    if (Date.now() - Number(p.at) > MAX_AGE_MS) {
      clearPendingQuiz();
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function clearPendingQuiz() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/**
 * Kirish/ro'yxatdan o'tishdan keyin qaytiladigan sahifa (?next=/articles/...).
 * Faqat sayt ichidagi yo'l — boshqa saytga yo'naltirib bo'lmasin.
 */
export function safeNext(next: unknown): string {
  const s = Array.isArray(next) ? next[0] : next;
  return typeof s === "string" && /^\/(?![/\\])/.test(s) ? s : "/";
}
