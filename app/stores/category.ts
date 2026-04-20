import { defineStore } from "pinia";

export const useCategoryStore = defineStore("categories", () => {
  const allCategories = ref<any[]>([]);
  const categoryBySlug = ref<any>(null);

  // Barcha kategoriyalar
  async function getCategories() {
    try {
      const res = await $fetch<any>("/categories/all", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      allCategories.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  // Bitta kategoriya — slug bo'yicha
  async function getCategoryBySlug(slug: string) {
    try {
      const res = await $fetch<any>(`/categories/byslug/${slug}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      categoryBySlug.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
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
