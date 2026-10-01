/**
 * Ommaviy sahifalar Vercel CDN'da keshlanadi (nuxt.config.ts → routeRules).
 * Agar SSR paytida backend'dan ma'lumot olinmagan bo'lsa, bu sahifa (bo'sh
 * ro'yxat, matnsiz maqola) keshga tushmasligi kerak — aks holda keyingi
 * tashrif buyuruvchilar ham bir necha daqiqa davomida buzuq sahifani ko'radi.
 */
export function useNoStoreUnless(ok: boolean) {
  if (import.meta.server && !ok) {
    useResponseHeader("cache-control").value = "no-store";
  }
}
