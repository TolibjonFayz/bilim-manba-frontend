import { defineStore } from "pinia";

export const useArticleStore = defineStore("articles", () => {
  const allArticles = ref<any[]>([]);
  const oneArticle = ref<any>(null);

  // Get all articles
  async function getAllArticles() {
    try {
      const url = "/articles/all";

      const res = await $fetch<any>(url, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      allArticles.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  // Get article by slug
  async function getArticleBySlug(slug: string) {
    try {
      const res = await $fetch<any>(`/articles/byslug/${slug}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      oneArticle.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  return {
    getAllArticles,
    allArticles,
    oneArticle,
    getArticleBySlug,
  };
});
