export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@element-plus/nuxt",
    "nuxt-gtag",
    "@nuxtjs/sitemap",
    "@vercel/analytics",
  ],

  sitemap: {
    siteUrl: "https://bilimmanba.uz",
  },

  site: {
    url: "https://bilimmanba.uz",
    name: "Bilim Manba",
  },

  app: {
    head: {
      title: "Bilim Manba — O'zbek tilidagi bilim ulashish platformasi",
      meta: [
        {
          name: "description",
          content:
            "Zamonaviy texnologiyalar, ilm-fan, matematika va shaxsiy rivojlanishga oid eng saralangan maqolalar. O'zbek tilida mutlaqo bepul o'qish va bilim olish imkoniyatidan foydalaning!",
        },
        {
          property: "og:title",
          content: "Bilim Manba — O'zbek tilidagi bilim ulashish platformasi",
        },
        {
          property: "og:description",
          content:
            "Zamonaviy texnologiyalar, ilm-fan, matematika va shaxsiy rivojlanishga oid eng saralangan maqolalar. O'zbek tilida mutlaqo bepul o'qish va bilim olish imkoniyatidan foydalaning!",
        },
        {
          name: "google-site-verification",
          content: "cp5qkEakZ-AwmJ5KrJ2Y5jWyO2UODfk09v8iUFwTP-4",
        },
        {
          property: "og:image",
          content:
            "https://res.cloudinary.com/dne7ddv2a/image/upload/q_auto/f_auto/v1776068601/Main_logo_with_text_transparent_wzcdl8.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:image",
          content:
            "https://res.cloudinary.com/dne7ddv2a/image/upload/q_auto/f_auto/v1776068601/Main_logo_with_text_transparent_wzcdl8.png",
        },
      ],
      script: [
        {
          src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7020897778969649",
          async: true,
          crossorigin: "anonymous",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
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

  plugins: ["~/plugins/auth.interceptor.ts"],

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
