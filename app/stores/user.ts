import { defineStore } from "pinia";

export const useUserStore = defineStore("users", () => {
  const authStore = useAuthStore();

  const oneUserInfo = ref<any>(null);

  async function login(payload: { email: string; password: string }) {
    try {
      const res = await $fetch<any>("/auth/login", {
        method: "POST",
        baseURL: useRuntimeConfig().public.apiBase,
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

  return {
    login,
    register,
    getOneUserInfo,
    oneUserInfo,
    UpdateOneUserInfo,
    updatePassword,
  };
});
