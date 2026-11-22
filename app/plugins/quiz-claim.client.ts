/**
 * Mehmon testni yechib, keyin ro'yxatdan o'tsa/kirsa — saqlangan natija
 * (utils/pendingQuiz.ts) serverga yuboriladi va ball akkauntga yoziladi.
 * Server faqat yangi (24 soat ichida ochilgan, hali bali yo'q) akkauntga
 * qabul qiladi; boshqa holatda natija jimgina o'chiriladi.
 */
import { ElNotification } from "element-plus";

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const apiBase = useRuntimeConfig().public.apiBase;
  let busy = false;

  const claim = async () => {
    const pending = readPendingQuiz();
    if (!pending || !authStore.token || busy) return;
    busy = true;
    try {
      const result = await $fetch<any>("/quiz/claim", {
        method: "POST",
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${authStore.token}` },
        body: { slug: pending.slug, answers: pending.answers },
      });
      clearPendingQuiz();
      track("quiz_claimed", { slug: pending.slug, points: result?.points });
      window.dispatchEvent(
        new CustomEvent("quiz-claimed", {
          detail: { slug: pending.slug, result },
        }),
      );
      if (result?.awarded && result.points > 0) {
        ElNotification({
          title: `🏆 +${result.points} ball saqlandi!`,
          message: "Testdagi natijangiz akkauntingizga yozildi.",
          type: "success",
        });
      }
    } catch (e: any) {
      // Eski akkaunt / avval olingan — qayta urinish befoyda. Tarmoq xatosi — qoladi
      if (e?.statusCode && e.statusCode < 500) clearPendingQuiz();
    } finally {
      busy = false;
    }
  };

  watch(
    () => authStore.token,
    (t) => {
      if (t) void claim();
    },
    { immediate: true },
  );
});
