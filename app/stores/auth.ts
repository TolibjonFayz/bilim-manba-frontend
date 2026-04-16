import { defineStore } from "pinia";

interface User {
  userId: number;
  email: string;
  role: string;
  plan: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  function decodeToken(t: string) {
    try {
      const parts = t.split(".");
      if (parts.length !== 3) throw new Error("Invalid token");
      const base64 = parts[1] as string;
      const payload = JSON.parse(atob(base64));
      user.value = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        plan: payload.plan,
      };
    } catch {
      logout();
    }
  }

  function setAuth(t: any) {
    token.value = t.token.access_token;
    decodeToken(t.token.access_token);
    if (process.client) {
      localStorage.setItem("access_token", t.token.access_token);
      localStorage.setItem("userid", t.userId?.toString() || "");
    }
  }

  function initAuth() {
    if (process.client) {
      const t = localStorage.getItem("access_token");
      const userId = localStorage.getItem("userid");
      if (t && userId) {
        token.value = t;
        decodeToken(t);
      }
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    if (process.client) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("userid");
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    setAuth,
    initAuth,
    logout,
  };
});
