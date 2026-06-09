// app/stores/notification.ts
import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<any[]>([]);
  const unreadCount = ref(0);

  const getToken = () => {
    try {
      return localStorage.getItem("access_token");
    } catch {
      return null;
    }
  };

  const authHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  async function getNotifications() {
    try {
      const res = await $fetch<any>("/notifications", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: authHeader(),
      });
      notifications.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error?.data?.message || "Xato" };
    }
  }

  async function getUnreadCount() {
    try {
      const res = await $fetch<number>("/notifications/unread-count", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: authHeader(),
      });
      unreadCount.value = res;
      return res;
    } catch {
      return 0;
    }
  }

  async function markAsRead(id: number) {
    try {
      await $fetch(`/notifications/${id}/read`, {
        method: "PATCH",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: authHeader(),
      });
      const n = notifications.value.find((x: any) => x.id === id);
      if (n && !n.isRead) {
        n.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch {}
  }

  async function markAllAsRead() {
    try {
      await $fetch("/notifications/read-all", {
        method: "PATCH",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: authHeader(),
      });
      notifications.value.forEach((n: any) => (n.isRead = true));
      unreadCount.value = 0;
    } catch {}
  }

  return {
    notifications,
    unreadCount,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  };
});
