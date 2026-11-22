/**
 * Yandex Metrica — Yandex Webmaster tavsiyasi: Metrica tegi bog'langan sayt
 * sahifalarini Yandex boti tezroq topadi va indekslaydi.
 *
 * Hisoblagich raqami: nuxt.config.ts → runtimeConfig.public.ymId
 * (yoki Vercel env NUXT_PUBLIC_YM_ID). Raqam bo'lmasa — hech narsa yuklanmaydi.
 *
 * Sahifani sekinlashtirmaslik uchun skript sahifa to'liq ochilgach yuklanadi.
 * Webvisor (ekran yozuvi) O'CHIQ — maxfiylik va sahifa yengilligi uchun.
 * Admin sahifalari va admin brauzeri (localStorage bm_internal) hisoblanmaydi.
 */
declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export default defineNuxtPlugin(() => {
  const id = Number(useRuntimeConfig().public.ymId || 0);
  if (!id || import.meta.dev) return;

  let internal = false;
  try {
    internal = localStorage.getItem("bm_internal") === "1";
  } catch {}
  if (internal) return;

  const router = useRouter();
  const isAdmin = (path: string) => path.startsWith("/admin");
  let started = false;

  const start = () => {
    if (started || isAdmin(router.currentRoute.value.path)) return;
    started = true;
    // Yandex'ning rasmiy yuklash kodi (navbat: skript kelguncha chaqiruvlar saqlanadi)
    const w = window as any;
    w.ym =
      w.ym ||
      function (...args: unknown[]) {
        (w.ym.a = w.ym.a || []).push(args);
      };
    w.ym.l = Date.now();
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://mc.yandex.ru/metrika/tag.js?id=${id}`;
    document.head.appendChild(s);

    w.ym(id, "init", {
      ssr: true,
      defer: false, // birinchi sahifa init'da hisoblanadi
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
    });
  };

  if (document.readyState === "complete") setTimeout(start, 1500);
  else
    window.addEventListener("load", () => setTimeout(start, 1500), {
      once: true,
    });

  // SPA: sahifa almashganda alohida tashrif sahifasi sifatida yuboriladi
  let prev = location.href;
  router.afterEach((to) => {
    nextTick(() => {
      const url = location.href;
      if (url === prev) return;
      const referer = prev;
      prev = url;
      if (isAdmin(to.path)) return;
      if (!started) return start();
      window.ym?.(id, "hit", url, { referer, title: document.title });
    });
  });
});
