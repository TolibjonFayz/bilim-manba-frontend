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

// Kun/tun rejimi sahifa chizilishidan OLDIN qo'yiladi — tunda oq "chaqnash" bo'lmaydi
useHead({
  script: [
    { key: "theme-init", innerHTML: THEME_INIT_SCRIPT, tagPriority: "critical" },
  ],
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

const { followSystem } = useTheme();
let stopFollow: (() => void) | undefined;

onMounted(() => {
  authStore.initAuth();
  // Manzil satri rangi (meta theme-color) skriptdan keyin chizilgan bo'lishi mumkin
  const theme =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
  stopFollow = followSystem();
});

onBeforeUnmount(() => stopFollow?.());
</script>
