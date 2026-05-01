export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const { hook } = useNuxtApp();

  hook("app:created", () => {
    globalThis.$fetch = $fetch.create({
      onResponseError({ response }) {
        if (response.status === 401) {
          authStore.logout();
          userStore.oneUserInfo = null;
          navigateTo("/login");
        }
      },
    });
  });
});
