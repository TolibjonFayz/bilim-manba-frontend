const BASE = "https://bilimmanba.uz";

const staticPages = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/articles", priority: "0.9", changefreq: "daily" },
  { url: "/categories", priority: "0.8", changefreq: "weekly" },
  { url: "/about", priority: "0.6", changefreq: "monthly" },
  { url: "/faq", priority: "0.5", changefreq: "monthly" },
  { url: "/support", priority: "0.5", changefreq: "monthly" },
  { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { url: "/terms", priority: "0.3", changefreq: "yearly" },
];

const day = (d: string) => new Date(d).toISOString().split("T")[0];

const urlTag = (loc: string, priority: string, changefreq: string, lastmod?: string) => `
  <url>
    <loc>${BASE}${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export default defineEventHandler(async (event) => {
  // Backend manzili env'dan olinadi (NUXT_PUBLIC_API_BASE) — hardcode qilinmaydi,
  // aks holda backend ko'chganda sitemap jimgina bo'sh qoladi
  const API_BASE = useRuntimeConfig(event).public.apiBase;

  try {
    // Kategoriya URL'lari nom bo'yicha (/categories/Sport), shuning uchun
    // nomlarni /categories/all dan olamiz
    const [data, categories] = await Promise.all([
      $fetch<any>(`${API_BASE}/articles/sitemap`, { timeout: 60000 }),
      $fetch<any[]>(`${API_BASE}/categories/all`, { timeout: 60000 }),
    ]);

    const staticUrls = staticPages
      .map((p) => urlTag(p.url, p.priority, p.changefreq))
      .join("");

    const articleUrls = (data?.articles || [])
      .map((a: any) =>
        urlTag(`/articles/${a.slug}`, "0.8", "monthly", day(a.updatedAt)),
      )
      .join("");

    const categoryUrls = (categories || [])
      .map((c: any) =>
        urlTag(
          `/categories/${encodeURIComponent(c.name)}`,
          "0.7",
          "weekly",
          day(c.updatedAt),
        ),
      )
      .join("");

    setHeader(event, "Content-Type", "application/xml");
    // Vercel CDN 1 soat keshlaydi — backend uxlab qolsa ham Google tez javob oladi
    setHeader(
      event,
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
${categoryUrls}
</urlset>`;
  } catch (err) {
    // Backend ishlamasa — 503. Google eski sitemap'ni saqlab, keyinroq qayta urinadi
    // (bo'sh sitemap qaytarsak, maqolalarni "o'chirilgan" deb o'ylashi mumkin)
    console.error("sitemap.xml: backend xatosi", err);
    throw createError({ statusCode: 503, statusMessage: "Sitemap vaqtincha mavjud emas" });
  }
});
