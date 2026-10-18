/**
 * Service worker (public/sw.js): ilova sifatida o'rnatish va internetsiz
 * o'qish. Faqat production'da — dev'da Vite fayllari keshlanib qolmasin.
 * O'chirish kerak bo'lsa: NUXT_PUBLIC_PWA=off — eski worker ham olib tashlanadi.
 */
export default defineNuxtPlugin(() => {
  if (!("serviceWorker" in navigator)) return;
  const off = useRuntimeConfig().public.pwa === "off";
  if (import.meta.dev || off) {
    navigator.serviceWorker
      .getRegistrations()
      .then((list) => list.forEach((r) => r.unregister()))
      .catch(() => {});
    return;
  }
  // Ilk yuklanishga xalaqit bermasin — sahifa to'liq ochilgach
  const register = () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
  // Darhol tinglaymiz — "o'rnatish" hodisasi erta kelishi mumkin
  usePwa();
});
