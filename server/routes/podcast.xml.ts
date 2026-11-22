/**
 * Podkast lentasi (RSS + iTunes teglari): bilimmanba.uz/podcast.xml
 * Audio maqolalar (Gemini TTS) Spotify, Apple Podcasts, YouTube Music va
 * boshqa podkast ilovalarida chiqishi uchun. Ma'lumot: backend /audio/feed.
 *
 * Spotify/Apple podkastni tasdiqlash uchun egasiga kod yuboradi —
 * email Vercel env NUXT_PODCAST_EMAIL'da (bo'lmasa <itunes:owner> yozilmaydi).
 */
const BASE = "https://bilimmanba.uz";
const TITLE = "Bilim Manba — audio maqolalar";
const DESCRIPTION =
  "O'zbek tilidagi ilmiy-ommabop maqolalar ovozli ko'rinishda: koinot, tarix, tabiat, texnologiya, kino va boshqalar. Har bir epizod — bilimmanba.uz saytidagi maqola. To'liq matn, rasmlar va bilimingizni sinash uchun test — saytda.";
// 3000×3000 kvadrat (Apple/Spotify talabi): logotip + yozuv, Cloudinary'da yasaladi
const COVER =
  "https://res.cloudinary.com/dne7ddv2a/image/upload/c_scale,w_1700/c_lpad,w_3000,h_3000,b_white,g_north,y_260/l_text:Arial_260_bold:Bilim%20Manba,co_rgb:3730a3,g_south,y_520/l_text:Arial_150:audio%20maqolalar,co_rgb:5850ec,g_south,y_300/f_jpg,q_85/v1776068517/Logo_no_text_transparent_uytuse.png";

interface FeedItem {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  url: string;
  seconds: number;
  bytes: number | null;
  published: string;
}

const xml = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const hms = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(r)}` : `${m}:${p(r)}`;
};

/** Epizod rasmi: maqola muqovasi kvadrat (Cloudinary) yoki umumiy muqova */
const episodeImage = (cover: string | null) =>
  cover && cover.includes("res.cloudinary.com") && cover.includes("/upload/")
    ? cover.replace("/upload/", "/upload/c_fill,g_auto,w_1400,h_1400,f_jpg,q_80/")
    : COVER;

const item = (a: FeedItem) => {
  const link = `${BASE}/articles/${encodeURIComponent(a.slug)}?utm_source=podcast&utm_medium=audio`;
  const desc = `${a.excerpt ? a.excerpt.trim() + "\n\n" : ""}To'liq maqola, rasmlar va test: ${link}`;
  return `
    <item>
      <title>${xml(a.title)}</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="false">bilimmanba-audio-${xml(a.slug)}</guid>
      <pubDate>${new Date(a.published).toUTCString()}</pubDate>
      <description>${xml(desc)}</description>
      <enclosure url="${xml(a.url)}" length="${a.bytes ?? 0}" type="audio/mpeg"/>
      <itunes:title>${xml(a.title)}</itunes:title>
      <itunes:summary>${xml(desc)}</itunes:summary>
      <itunes:duration>${hms(a.seconds)}</itunes:duration>
      <itunes:image href="${xml(episodeImage(a.coverImage))}"/>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>${a.category ? `\n      <category>${xml(a.category)}</category>` : ""}
    </item>`;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  let items: FeedItem[] = [];
  try {
    items = await $fetch<FeedItem[]>("/audio/feed", {
      baseURL: config.public.apiBase,
      timeout: 20000,
    });
  } catch {
    // Backend uxlab qolgan bo'lsa — bo'sh lenta keshlanmasin
    setResponseHeader(event, "Cache-Control", "no-store");
    setResponseStatus(event, 503);
    return "Podkast lentasi vaqtincha mavjud emas";
  }
  const email = String(config.podcastEmail || "").trim();
  const owner = email
    ? `
    <itunes:owner>
      <itunes:name>Bilim Manba</itunes:name>
      <itunes:email>${xml(email)}</itunes:email>
    </itunes:owner>`
    : "";

  setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=0, s-maxage=900");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(TITLE)}</title>
    <link>${BASE}/audio</link>
    <atom:link href="${BASE}/podcast.xml" rel="self" type="application/rss+xml"/>
    <language>uz</language>
    <copyright>© ${new Date().getFullYear()} Bilim Manba (TONG INC)</copyright>
    <description>${xml(DESCRIPTION)}</description>
    <image>
      <url>${xml(COVER)}</url>
      <title>${xml(TITLE)}</title>
      <link>${BASE}/audio</link>
    </image>
    <itunes:author>Bilim Manba</itunes:author>
    <itunes:summary>${xml(DESCRIPTION)}</itunes:summary>
    <itunes:image href="${xml(COVER)}"/>
    <itunes:category text="Education"/>
    <itunes:category text="Science"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>${owner}${items.map(item).join("")}
  </channel>
</rss>`;
});
