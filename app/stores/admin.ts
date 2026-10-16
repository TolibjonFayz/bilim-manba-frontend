import { defineStore } from "pinia";

export const useAdminStore = defineStore("admin", () => {
  const stats = ref<any>(null);
  const articles = ref<any[]>([]);
  const categories = ref<any[]>([]);
  const users = ref<any[]>([]);

  const getToken = () => {
    try {
      return localStorage.getItem("access_token");
    } catch {
      return null;
    }
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Stats
  async function getStats() {
    try {
      const res = await $fetch<any>("/admin/stats", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      stats.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Articles
  async function getArticles() {
    try {
      const res = await $fetch<any>("/admin/articles", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      articles.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function createArticle(payload: any) {
    try {
      const res = await $fetch<any>("/admin/articles", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function updateArticle(id: number, payload: any) {
    try {
      const res = await $fetch<any>(`/admin/articles/${id}`, {
        method: "PUT",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function deleteArticle(id: number) {
    try {
      await $fetch(`/admin/articles/${id}`, {
        method: "DELETE",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      articles.value = articles.value.filter((a) => a.id !== id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Categories
  async function getCategories() {
    try {
      const res = await $fetch<any>("/admin/categories", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      categories.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function createCategory(payload: any) {
    try {
      const res = await $fetch<any>("/admin/categories", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function updateCategory(id: number, payload: any) {
    try {
      const res = await $fetch<any>(`/admin/categories/${id}`, {
        method: "PUT",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function deleteCategory(id: number) {
    try {
      await $fetch(`/admin/categories/${id}`, {
        method: "DELETE",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      categories.value = categories.value.filter((c) => c.id !== id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Users
  async function getUsers() {
    try {
      const res = await $fetch<any>("/admin/users", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      users.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function uploadImage(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await $fetch<any>("/admin/upload/image", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: {
          // Content-Type qo'shmaymiz — FormData o'zi qo'shadi
          ...(() => {
            const token = (() => {
              try {
                return localStorage.getItem("access_token");
              } catch {
                return null;
              }
            })();
            return token ? { Authorization: `Bearer ${token}` } : {};
          })(),
        },
        body: formData,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function uploadContent(text: string, filename: string) {
    try {
      const token = (() => {
        try {
          return localStorage.getItem("access_token");
        } catch {
          return null;
        }
      })();
      const res = await $fetch<any>("/admin/upload/content", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { text, filename },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Maqolani Telegram kanalga (qayta) yuborish
  async function postToTelegram(id: number) {
    try {
      const res = await $fetch<any>(`/admin/articles/${id}/telegram`, {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Maqolani Instagram'ga (qayta) yuborish: post + story
  async function postToInstagram(id: number) {
    try {
      const res = await $fetch<any>(`/admin/articles/${id}/instagram`, {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Instagram kartochkasi (JPEG) — oldindan ko'rish uchun blob URL
  async function getSocialPreview(id: number, format: "feed" | "story") {
    try {
      const blob = await $fetch<Blob>(`/admin/articles/${id}/social-preview`, {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        query: { format },
        responseType: "blob",
      });
      return { success: true, data: URL.createObjectURL(blob) };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Avtomatik nashr holati: Telegram sozlanganmi, keyingi rejali maqola vaqti
  async function getPublishingStatus() {
    try {
      const res = await $fetch<any>("/admin/publishing/status", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // AI qoralama: mavzu yoki Wikipedia havolasi (bo'sh — AI bo'lim uchun o'zi mavzu tanlaydi)
  async function generateDraft(topic: string, categoryId?: number | "") {
    try {
      const res = await $fetch<any>("/admin/drafts/generate", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: { topic, categoryId: categoryId || undefined },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "AI qoralama yozilmadi",
      };
    }
  }

  // Statistika hisoboti: day | week | month | year
  async function getStatsReport(period: string) {
    try {
      const res = await $fetch<any>("/admin/stats/report", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        query: { period },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Google Search Console
  async function getSearchConsole(days: number) {
    try {
      const res = await $fetch<any>("/admin/search-console", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        query: { days },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function getSearchConsoleIndexing(refresh = false) {
    try {
      const res = await $fetch<any>("/admin/search-console/indexing", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        query: refresh ? { refresh: 1 } : {},
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Muqovani AI bilan qayta tanlash (xavfsizlik tekshiruvi bilan)
  async function regenerateCover(id: number) {
    try {
      const res = await $fetch<any>(`/admin/articles/${id}/cover/regenerate`, {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Fonda yozilayotgan AI qoralama holati
  async function getDraftJob() {
    try {
      const res = await $fetch<any>("/admin/drafts/job", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res?.job ?? null };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function getDraftSettings() {
    try {
      const res = await $fetch<any>("/admin/drafts/settings", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function updateDraftSettings(body: {
    daily?: boolean;
    topics?: string[];
  }) {
    try {
      const res = await $fetch<any>("/admin/drafts/settings", {
        method: "PUT",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Maqola matnidan AI bilan qisqa tavsif (faqat admin)
  async function generateExcerpt(title: string, text: string) {
    try {
      const res = await $fetch<any>("/ai/excerpt", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: { title, text },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  // Adminga shaxsiy Telegram xabarlari: action — "" (holat) | link | check | test | unlink
  async function telegramAlerts(action: "" | "link" | "check" | "test" | "unlink" = "") {
    try {
      const res = await $fetch<any>(
        `/admin/alerts/telegram${action && action !== "unlink" ? `/${action}` : ""}`,
        {
          method: action === "" ? "GET" : action === "unlink" ? "DELETE" : "POST",
          baseURL: useRuntimeConfig().public.apiBase,
          headers: getAuthHeaders(),
        },
      );
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function getArticle(id: number) {
    try {
      const res = await $fetch<any>(`/admin/articles/${id}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  return {
    stats,
    articles,
    categories,
    users,
    getStats,
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getUsers,
    uploadImage,
    uploadContent,
    getArticle,
    generateExcerpt,
    postToTelegram,
    postToInstagram,
    generateDraft,
    getDraftJob,
    regenerateCover,
    getStatsReport,
    getSearchConsole,
    getSearchConsoleIndexing,
    getDraftSettings,
    updateDraftSettings,
    telegramAlerts,
    getSocialPreview,
    getPublishingStatus,
  };
});
