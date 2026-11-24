/**
 * Mehmon sifatida test yechgan o'quvchi kirsa yoki ro'yxatdan o'tsa —
 * uning ballari (utils/quizGuest.ts dagi ID bo'yicha) akkauntga ko'chiriladi.
 * Muvaffaqiyatli bo'lsa ID o'chiriladi; tarmoq xatosida — keyingi safar.
 */
import { ElNotification } from "element-plus";

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const apiBase = useRuntimeConfig().public.apiBase;
  let busy = false;

  const merge = async () => {
    const guest = peekQuizGuestId();
    if (!guest || !authStore.token || busy) return;
    busy = true;
    try {
      const res = await $fetch<{ merged: number; points: number }>(
        "/quiz/merge",
        {
          method: "POST",
          baseURL: apiBase,
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: { guest },
        },
      );
      clearQuizGuestId();
      window.dispatchEvent(new CustomEvent("quiz-merged", { detail: res }));
      if (res?.merged > 0) {
        track("quiz_merged", { tests: res.merged, points: res.points });
        ElNotification({
          title: `🏆 +${res.points} ball profilingizga o'tdi!`,
          message: `Mehmon sifatida yechgan ${res.merged} ta testingiz natijasi akkauntingizga saqlandi.`,
          type: "success",
        });
      }
    } catch (e: any) {
      // 4xx — qayta urinish befoyda; tarmoq/server xatosi — ID qoladi
      if (e?.statusCode && e.statusCode < 500 && e.statusCode !== 429)
        clearQuizGuestId();
    } finally {
      busy = false;
    }
  };

  watch(
    () => authStore.token,
    (t) => {
      if (t) void merge();
    },
    { immediate: true },
  );
});
