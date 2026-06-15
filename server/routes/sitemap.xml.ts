export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "application/xml");
  setHeader(event, "Cache-Control", "max-age=3600");

  const API_BASE =
    "https://bilim-manba-backend-production-f298.up.railway.app/api";

  try {
    const data = await $fetch<any>(`${API_BASE}/articles/sitemap`);

    const BASE = "https://bilimmanba.uz";

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/articles", priority: "0.9", changefreq: "daily" },
      { url: "/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/privacy-policy", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
    ];

    const staticUrls = staticPages
      .map(
        (p) => `
  <url>
    <loc>${BASE}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
      )
      .join("");

    const articleUrls = (data.articles || [])
      .map(
        (a: any) => `
  <url>
    <loc>${BASE}/articles/${a.slug}</loc>
    <lastmod>${new Date(a.updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
      )
      .join("");

    const categoryUrls = (data.categories || [])
      .map(
        (c: any) => `
  <url>
    <loc>${BASE}/categories/${c.slug}</loc>
    <lastmod>${new Date(c.updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
${categoryUrls}
</urlset>`;
  } catch (err) {
    // Backend ishlamasa fallback
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bilimmanba.uz/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bilimmanba.uz/articles</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bilimmanba.uz/sitemap</loc>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }
});
