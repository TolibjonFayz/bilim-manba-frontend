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
  };
});
