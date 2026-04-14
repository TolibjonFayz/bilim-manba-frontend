export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@nuxt/icon", "@element-plus/nuxt"],

  elementPlus: {
    importStyle: "scss",
  },

  css: ["~/assets/scss/main.scss"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3003/api",
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/scss/variables" as *;`,
        },
      },
    },
  },
});
