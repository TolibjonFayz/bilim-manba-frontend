import { defineStore } from "pinia";

export const useArticleStore = defineStore("articles", () => {
  const allArticles = ref<any[]>([]);
  const oneArticle = ref<any>(null);

  // Token helper
  const getToken = () => {
    try {
      return localStorage.getItem("access_token");
    } catch {
      return null;
    }
  };

  // Get all articles
  async function getAllArticles() {
    try {
      const token = getToken();

      const res = await $fetch<any>("/articles/all", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      const token = getToken();

      const res = await $fetch<any>(`/articles/byslug/${slug}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
