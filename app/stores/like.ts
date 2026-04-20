import { defineStore } from "pinia";

export const useLikeStore = defineStore("likes", () => {
  const userLikes = ref<any[]>([]);

  async function toggle(articleId: number) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await $fetch<any>(`/articles/${articleId}/like`, {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function getUserLikes() {
    try {
      const token = localStorage.getItem("access_token");
      const res = await $fetch<any>("/users/me/likes", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${token}` },
      });
      userLikes.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  return {
    getUserLikes,
    userLikes,
    toggle,
  };
});
