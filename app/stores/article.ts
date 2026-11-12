import { defineStore } from "pinia";

export const useArticleStore = defineStore("articles", () => {
  const allArticles = ref<any[]>([]);
  const oneArticle = ref<any>(null);
  const searchResults = ref<any[]>([]);

  // Token helper
  const getToken = () => {
    try {
      return localStorage.getItem("access_token");
    } catch {
      return null;
    }
  };

  // Brauzerda ro'yxat 2 daqiqa qayta so'ralmaydi (bosh sahifa, /articles va
  // maqola sahifasi bitta ro'yxatni ishlatadi — har o'tishda 100 KB/2 s edi).
  // SSR'dan kelgan ro'yxat ham yangi hisoblanadi.
  const LIST_TTL = 2 * 60 * 1000;
  let listAt = 0;
  let listInFlight: Promise<any> | null = null;

  // Get all articles
  async function getAllArticles() {
    if (import.meta.client) {
      if (!listAt && allArticles.value.length) listAt = Date.now();
      if (allArticles.value.length && Date.now() - listAt < LIST_TTL) {
        return { success: true, data: allArticles.value };
      }
      if (listInFlight) return listInFlight;
    }
    const run = (async () => {
      try {
        const token = getToken();

        const res = await $fetch<any>("/articles/all", {
          method: "GET",
          baseURL: useRuntimeConfig().public.apiBase,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        allArticles.value = res;
        listAt = Date.now();
        return { success: true, data: res };
      } catch (error: any) {
        return {
          success: false,
          message: error?.data?.message || "Xato yuz berdi",
        };
      } finally {
        listInFlight = null;
      }
    })();
    if (import.meta.client) listInFlight = run;
    return run;
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
        // 404 = haqiqatan yo'q; boshqa xato = backend ishlamayapti
        status: error?.statusCode ?? error?.status ?? 500,
      };
    }
  }

  async function searchArticles(query: string) {
    try {
      const res = await $fetch<any>("/articles/search", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        params: { q: query },
      });
      searchResults.value = res;
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
    searchArticles,
    searchResults,
  };
});
