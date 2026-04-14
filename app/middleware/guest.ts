import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  authStore.initAuth();

  if (authStore.isLoggedIn) {
    return navigateTo("/");
  }
});
