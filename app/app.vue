<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const route = useRoute();

// Har sahifaga canonical: query (?utm=..., ?page=...) siz manzil.
// Maqola va kategoriya sahifalari o'z canonical'ini beradi — u buni almashtiradi
useHead({
  link: [
    {
      rel: "canonical",
      href: () =>
        `https://bilimmanba.uz${route.path === "/" ? "" : route.path.replace(/\/$/, "")}`,
    },
  ],
});

onMounted(() => {
  authStore.initAuth();
});
</script>
