export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@element-plus/nuxt",
    "nuxt-gtag",
    "@vercel/analytics",
    "@nuxt/fonts",
  ],

  // Shriftlar saytning o'zidan beriladi (build paytida yuklab olinadi).
  // Avval main.scss da Google Fonts @import qilinardi — u sahifa chizilishini
  // ~0.5s to'sib turardi (CSS → fonts CSS → shrift fayllari zanjiri)
  fonts: {
    families: [
      // preload: shrift birinchi chizishdan oldin kelsin — aks holda Arial'dan
      // Space Grotesk'ga almashganda matn kengayib, sahifa siljirdi (CLS 0.19)
      {
        name: "Space Grotesk",
        provider: "google",
        weights: [400, 500, 600, 700],
        preload: true,
      },
      { name: "JetBrains Mono", provider: "google", weights: [400, 500] },
    ],
    defaults: { subsets: ["latin", "latin-ext"] },
  },

  app: {
    head: {
      htmlAttrs: { lang: "uz" },
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
        { name: "theme-color", content: "#5850ec" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "Bilim Manba" },
        { name: "mobile-web-app-capable", content: "yes" },
      ],
      // Reklama vaqtincha o'chirilgan (2026-10): trafik kam, daromad ~0,
      // lekin har sahifani sekinlashtirardi. Trafik ~10K MAU ga yetganda
      // qaytarish uchun quyidagilarni yoqing va [slug].vue ga <YandexAd /> qo'shing:
      //   { src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7020897778969649", async: true, crossorigin: "anonymous" },
      //   { innerHTML: "window.yaContextCb=window.yaContextCb||[]" },
      //   { src: "https://yandex.ru/ads/system/context.js", async: true },
      script: [],
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
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/icon-192.png" },
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

  // Token localStorage'da — server kim kirganini bilmaydi. Login holatiga
  // bog'liq shaxsiy sahifalarni faqat brauzerda chizamiz, aks holda server
  // bitta sahifani chizadi, middleware boshqasiga yo'naltiradi va sahifa
  // "sakraydi" (hydration mismatch). Bu sahifalar robots.txt da yopiq.
  routeRules: {
    // Ommaviy sahifalar Vercel CDN'da keshlanadi: har tashrifda AQShdagi
    // funksiya + Render backend chaqirilmaydi (TTFB 1.2-2.2s edi). Login
    // holati faqat brauzerda — server HTML hamma uchun bir xil, keshlash xavfsiz.
    // Muddat tugagach eski nusxa darhol beriladi va fonda yangilanadi.
    // Ma'lumot olinmagan yoki xato sahifalar keshlanmaydi (useNoStoreUnless, error.vue).
    "/": { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    "/articles": { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    "/articles/**": { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    "/categories": { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    "/categories/**": { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    "/about": { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    "/faq": { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    "/terms": { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    "/privacy-policy": { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } },

    "/profile": { ssr: false },
    "/admin": { ssr: false },
    "/admin/**": { ssr: false },
    "/login": { ssr: false },
    "/register": { ssr: false },
    "/forgot-password": { ssr: false },
  },

  plugins: ["~/plugins/auth.interceptor.ts"],

  gtag: {
    id: "G-CSHHXTH27V",
  },

  runtimeConfig: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        // 👈 "modules" olib tashlandi
        scss: {
          additionalData: `@use "~/assets/scss/variables" as *;`,
        },
      },
    },
  },
});
