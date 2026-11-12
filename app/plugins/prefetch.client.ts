// Maqola havolasiga sichqoncha borganda (kompyuter) yoki barmoq tekkanda
// (telefon) maqola ma'lumoti oldindan yuklanadi — bosilganda sahifa
// deyarli darhol ochiladi. Nuxt o'zi faqat sahifa KODINI oldindan yuklaydi,
// ma'lumotini emas.
export default defineNuxtPlugin(() => {
  const apiBase = useRuntimeConfig().public.apiBase as string;

  const onIntent = (e: Event) => {
    const a = (e.target as HTMLElement | null)?.closest?.("a[href]");
    if (!a) return;
    let url: URL;
    try {
      url = new URL((a as HTMLAnchorElement).href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    const m = url.pathname.match(/^\/articles\/([^/]+)\/?$/);
    if (!m) return;
    // Kesh o'zi muddatini tekshiradi — takror chaqirish arzon
    prefetchArticle(decodeURIComponent(m[1]!), apiBase);
  };

  const opts = { passive: true, capture: true } as const;
  document.addEventListener("pointerover", onIntent, opts);
  document.addEventListener("touchstart", onIntent, opts);
  document.addEventListener("focusin", onIntent, opts);
});
