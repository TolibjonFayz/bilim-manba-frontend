/**
 * Joriy mavsum. Server va brauzerda bir xil bo'lishi uchun qiymat SSR paytida
 * hisoblanib, payload orqali brauzerga uzatiladi (hydration farq qilmasin).
 */
export function useSeason() {
  const mode = String(useRuntimeConfig().public.season ?? "auto");
  const season = useState<Season>("season", () => seasonFor(new Date(), mode));
  return {
    season,
    isAutumn: computed(() => season.value === "autumn"),
  };
}
