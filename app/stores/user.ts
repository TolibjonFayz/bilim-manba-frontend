import { defineStore } from "pinia";

export const useUserStore = defineStore("users", () => {
  const oneUserInfo = ref<any>(null);
  const recentReads = ref<any[]>([]);
  const weeklyActivity = ref<any>({ days: [], totalThisWeek: 0 });
  const stats = ref<any>({ readCount: 0, totalTime: 0, savedCount: 0 });

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

  async function login(payload: { email: string; password: string }) {
    try {
      const res = await $fetch<any>("/auth/login", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function register(payload: any) {
    try {
      const res = await $fetch<any>("/auth/register", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function getOneUserInfo(userId: string) {
    try {
      const res = await $fetch<any>(`/users/one/${userId}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      oneUserInfo.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function UpdateOneUserInfo(userId: string, payload: any) {
    try {
      const res = await $fetch<any>(`/users/one/${userId}`, {
        method: "PUT",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: payload,
      });
      oneUserInfo.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function updatePassword(userId: number, passwordForm: any) {
    try {
      const res = await $fetch<any>(`/users/password/${userId}`, {
        method: "PUT",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
        body: {
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        },
      });
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function getStats() {
    try {
      const res = await $fetch<any>("/users/me/stats", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      stats.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function getRecentReads() {
    try {
      const res = await $fetch<any>("/users/me/recent-reads", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      recentReads.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  async function getWeeklyActivity() {
    try {
      const res = await $fetch<any>("/users/me/weekly-activity", {
        method: "GET",
        baseURL: useRuntimeConfig().public.apiBase,
        headers: getAuthHeaders(),
      });
      weeklyActivity.value = res;
      return { success: true, data: res };
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Xato yuz berdi",
      };
    }
  }

  return {
    login,
    register,
    getOneUserInfo,
    oneUserInfo,
    UpdateOneUserInfo,
    updatePassword,
    getStats,
    getRecentReads,
    getWeeklyActivity,
    stats,
    recentReads,
    weeklyActivity,
  };
});
