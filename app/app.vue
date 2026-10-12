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
const { season } = useSeason();

// Mavsumiy bezak: <html class="season-autumn"> — uslublar assets/scss/autumn.scss da
useHead({
  htmlAttrs: { class: () => (season.value ? `season-${season.value}` : "") },
});

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
