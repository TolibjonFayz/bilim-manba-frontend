export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: ["@pinia/nuxt", "@vueuse/nuxt"],

  css: ["~/assets/scss/main.scss"],

  nitro: {
    preset: "vercel",
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3003/api",
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Global SCSS variables hamma joyda ishlaydi
          additionalData: `@use "~/assets/scss/variables" as *;`,
        },
      },
    },
  },
});
