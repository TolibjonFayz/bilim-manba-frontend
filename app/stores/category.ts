import { defineStore } from "pinia";

export const useCategoryStore = defineStore("categories", () => {
  const allCategories = ref<any[]>([]);
  const categoryBySlug = ref<any>(null);

  // Brauzerda 5 daqiqa qayta so'ralmaydi (kategoriyalar kam o'zgaradi)
  let listAt = 0;

  // Barcha kategoriyalar
  async function getCategories() {
    if (import.meta.client) {
      if (!listAt && allCategories.value.length) listAt = Date.now();
      if (allCategories.value.length && Date.now() - listAt < 5 * 60 * 1000) {
        return { success: true, data: allCategories.value };
      }
    }
    try {
      const res = await $fetch<any>("/categories/all", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      allCategories.value = res;
      listAt = Date.now();
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  // Bitta kategoriya — slug bo'yicha
  // Brauzerda: ochilgan kategoriya 2 daqiqa qayta so'ralmaydi (orqaga qaytish darhol)
  const bySlugCache = new Map<string, { at: number; data: any }>();

  async function getCategoryBySlug(slug: string) {
    if (import.meta.client) {
      const hit = bySlugCache.get(slug);
      if (hit && Date.now() - hit.at < 2 * 60 * 1000) {
        categoryBySlug.value = hit.data;
        return { success: true, data: hit.data };
      }
    }
    try {
      const res = await $fetch<any>(`/categories/byslug/${slug}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      categoryBySlug.value = res;
      if (import.meta.client) bySlugCache.set(slug, { at: Date.now(), data: res });
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
        // 404 = haqiqatan yo'q; boshqa xato = backend ishlamayapti
        status: error?.statusCode ?? error?.status ?? 500,
      };
    }
  }

  return {
    allCategories,
    getCategories,
    getCategoryBySlug,
    categoryBySlug,
  };
});
