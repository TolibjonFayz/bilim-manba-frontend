export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@element-plus/nuxt",
    "nuxt-gtag",
  ],

  elementPlus: {
    importStyle: "scss",
  },

  css: ["~/assets/scss/main.scss"],

  nitro: {
    preset: "vercel",
  },

  gtag: {
    id: "G-CSHHXTH27V",
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
          additionalData: `@use "~/assets/scss/variables" as *;`,
        },
      },
    },
  },
});
