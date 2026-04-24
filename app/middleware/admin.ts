export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    return navigateTo("/login");
  }

  if (authStore.user?.role !== "admin") {
    return navigateTo("/");
  }
});
