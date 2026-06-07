import { defineStore } from "pinia";

export const useBookmarkStore = defineStore("bookmark", () => {
  const userBookmarks = ref<any[]>([]);

  const getToken = () => {
    try {
      return localStorage.getItem("access_token");
    } catch {
      return null;
    }
  };

  async function toggle(articleId: number) {
    try {
      const token = getToken();
      const res = await $fetch<any>(`/articles/${articleId}/bookmark`, {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function getUserBookmarks() {
    try {
      const token = getToken();
      const res = await $fetch<any>("/users/me/bookmarks", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      userBookmarks.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  return { userBookmarks, toggle, getUserBookmarks };
});
