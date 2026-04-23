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

  app: {
    head: {
      meta: [
        {
          name: "google-site-verification",
          content:
            "cp5qkEakZ-AwmJ5KrJ2Y5jWyO2UODfk09v8iU",
        },
      ],
    },
  },

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
