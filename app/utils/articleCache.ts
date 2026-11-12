// Maqola sahifasini tez ochish uchun brauzer xotirasidagi kesh.
//
// Avval maqola havolasi bosilganda Nuxt yangi sahifani 3 ta ketma-ket so'rov
// (maqola → R2 dagi matn → hamma maqolalar ro'yxati) tugaguncha kutardi —
// 2–8 soniya eski sahifa turib qolardi. Endi:
//  - havolaga sichqoncha borganda / barmoq tekkanda maqola oldindan yuklanadi;
//  - bir marta yuklangan maqola va ro'yxat bir necha daqiqa qayta so'ralmaydi;
//  - sahifa darhol ochiladi, ma'lumot kelguncha skelet ko'rsatiladi.
// Faqat brauzerda ishlaydi: serverda (SSR) har so'rov alohida bo'lishi kerak.

export interface ArticleBundle {
  ok: boolean;
  status?: number;
  article?: any;
  content?: any | null;
}

const BUNDLE_TTL = 5 * 60 * 1000;
const bundles = new Map<string, { at: number; p: Promise<ArticleBundle> }>();

const token = () => {
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
};

export async function fetchArticleContent(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function loadBundle(slug: string, apiBase: string): Promise<ArticleBundle> {
  const t = import.meta.client ? token() : null;
  try {
    const article = await $fetch<any>(`/articles/byslug/${slug}`, {
      baseURL: apiBase,
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    const content = article?.content
      ? await fetchArticleContent(article.content)
      : null;
    return { ok: true, article, content };
  } catch (err: any) {
    return { ok: false, status: err?.statusCode ?? err?.status ?? 500 };
  }
}

/** Maqola + matni. Brauzerda keshdan (yoki oldindan boshlangan so'rovdan) */
export function getArticleBundle(slug: string, apiBase: string) {
  if (!import.meta.client) return loadBundle(slug, apiBase);
  const hit = bundles.get(slug);
  if (hit && Date.now() - hit.at < BUNDLE_TTL) return hit.p;
  const p = loadBundle(slug, apiBase).then((b) => {
    // Xato keshda qolmasin — keyingi safar qayta urinamiz
    if (!b.ok) bundles.delete(slug);
    return b;
  });
  bundles.set(slug, { at: Date.now(), p });
  return p;
}

/** Havolaga sichqoncha borganda / barmoq tekkanda — oldindan yuklash */
export function prefetchArticle(slug: string, apiBase: string) {
  if (!import.meta.client || !slug) return;
  // Kesh to'lib ketmasin
  if (bundles.size > 40) {
    const oldest = [...bundles.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) bundles.delete(oldest[0]);
  }
  void getArticleBundle(slug, apiBase);
}

/** Like/saqlash o'zgarganda keshdagi nusxa eskirmasin */
export function forgetArticle(slug: string) {
  bundles.delete(slug);
}
