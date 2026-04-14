export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const authStore = useAuthStore();
  authStore.initAuth();

  if (!authStore.isLoggedIn) {
    return navigateTo("/login");
  }
});
