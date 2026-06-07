import { defineStore } from "pinia";

export const useCommentStore = defineStore("comment", () => {
  const comments = ref<any[]>([]);

  const getToken = () => {
    try { return localStorage.getItem("access_token"); } catch { return null; }
  };

  async function getComments(articleId: number) {
    try {
      const res = await $fetch<any>(`/articles/${articleId}/comments`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
      });
      comments.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function addComment(articleId: number, content: string, parentId?: number) {
    try {
      const token = getToken();
      const res = await $fetch<any>(`/articles/${articleId}/comments`, {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { content, parentId },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function deleteComment(commentId: number) {
    try {
      const token = getToken();
      await $fetch<any>(`/comments/${commentId}`, {
        method: "DELETE",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  return { comments, getComments, addComment, deleteComment };
});