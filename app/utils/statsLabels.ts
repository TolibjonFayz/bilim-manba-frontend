// Statistika sahifasi uchun: texnik nomlarni odam tushunadigan so'zlarga aylantirish

export const fmtNum = (n: number) => Number(n || 0).toLocaleString("uz-UZ");

/** 135 → "2 daq 15 s", 4000 → "1 soat 7 daq" */
export function fmtDuration(sec: number) {
  const s = Math.round(Number(sec) || 0);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) {
    const r = s % 60;
    return r ? `${m} daq ${r} s` : `${m} daq`;
  }
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h} soat ${rm} daq` : `${h} soat`;
}

const FORMS: Record<string, string> = {
  register: "Ro'yxatdan o'tish",
  newsletter_footer: "Obuna (sahifa pastidagi)",
  login: "Kirish",
  forgot_password: "Parolni tiklash",
  "forgot-password": "Parolni tiklash",
  support: "Qo'llab-quvvatlash",
  profile: "Profil",
};
export const formLabel = (f?: string | null) =>
  (f && FORMS[f]) || (f ? f : "Noma'lum forma");

const AREAS: Record<string, string> = {
  "bosh-banner": "Bosh sahifa — banner",
  "bosh-kategoriyalar": "Bosh sahifa — kategoriyalar",
  "bosh-songgi-maqolalar": "Bosh sahifa — so'nggi maqolalar",
  "maqolalar-royxati": "Maqolalar ro'yxati",
  "maqolalar-yon-panel": "Maqolalar — yon panel",
  "kategoriya-royxati": "Kategoriya sahifasi — ro'yxat",
  "kategoriya-yon-panel": "Kategoriya — yon panel",
  "oxshash-maqolalar": "Maqola ostida — o'xshash maqolalar",
  "mashhur-maqolalar": "Maqola yonida — mashhur maqolalar",
  seriya: "Maqola — seriya qismlari",
  qidiruv: "Qidiruv natijalari",
  menyu: "Yuqori menyu",
  footer: "Sahifa pasti (footer)",
  "yon-panel": "Yon panel",
  sahifa: "Matn ichidagi havolalar",
  boshqa: "Boshqa",
};
export const areaLabel = (a?: string | null) => (a && AREAS[a]) || a || "Boshqa";

const ACTIONS: Record<string, { icon: string; label: string }> = {
  like: { icon: "❤️", label: "Like" },
  bookmark: { icon: "🔖", label: "Saqlash" },
  share: { icon: "🔗", label: "Ulashish" },
  comment: { icon: "💬", label: "Izoh" },
  quiz_done: { icon: "🧠", label: "Test yechildi" },
  ai_question: { icon: "🤖", label: "AI'ga savol" },
  search: { icon: "🔍", label: "Qidiruv" },
  install_app: { icon: "📲", label: "Ilova o'rnatildi" },
  theme_toggle: { icon: "🌙", label: "Tun rejimi" },
};
export const actionInfo = (t: string) => ACTIONS[t] ?? { icon: "•", label: t };

export const deviceIcon = (d?: string | null) =>
  d === "Telefon" ? "📱" : d === "Planshet" ? "📟" : d === "Kompyuter" ? "💻" : "❔";

const pageName = (path?: string | null, title?: string | null) => {
  if (title) return `«${title}»`;
  if (!path || path === "/") return "Bosh sahifa";
  const map: Record<string, string> = {
    "/articles": "Maqolalar ro'yxati",
    "/categories": "Kategoriyalar",
    "/series": "Seriyalar",
    "/maktab": "Maktab",
    "/register": "Ro'yxatdan o'tish",
    "/login": "Kirish",
    "/profile": "Profil",
    "/reyting": "Reyting",
    "/about": "Biz haqimizda",
  };
  return map[path] ?? decodeURIComponent(path);
};

/** Tashrif tafsilotidagi bitta qadam — oddiy gap bilan */
export function describeEvent(e: {
  type: string;
  path?: string | null;
  data?: any;
  articleTitle?: string | null;
}): { icon: string; text: string; muted?: boolean } {
  const d = e.data || {};
  const page = pageName(e.path, e.articleTitle);
  switch (e.type) {
    case "page_view":
      return { icon: "📄", text: `Ochdi: ${page}` };
    case "page_exit": {
      const read = e.path?.startsWith("/articles/")
        ? `, ${d.scroll ?? 0}% qismini ko'rdi`
        : "";
      return {
        icon: "⏱",
        text: `${page} — faol ${fmtDuration(d.sec ?? 0)}${read}`,
        muted: true,
      };
    }
    case "link_click":
      return {
        icon: d.ext ? "↗️" : "🖱",
        text: `Bosdi: «${d.text || d.to}» (${areaLabel(d.area)})${d.ext ? ` → ${d.to}` : ""}`,
      };
    case "email_focus":
      return { icon: "✏️", text: `Emailni yoza boshladi — ${formLabel(d.form)}` };
    case "email_submit":
      return d.ok
        ? { icon: "✅", text: `Email yubordi — ${formLabel(d.form)}` }
        : {
            icon: "⚠️",
            text: `Email yuborilmadi — ${formLabel(d.form)}${d.err ? `: ${d.err}` : ""}`,
          };
    case "search":
      return {
        icon: "🔍",
        text: `Qidirdi: «${d.q}» — ${d.results ? `${d.results} ta natija` : "natija yo'q"}`,
      };
    case "quiz_done":
      return { icon: "🧠", text: `Testni yechdi: ${d.correct}/${d.total}` };
    case "like":
      return { icon: "❤️", text: d.on === false ? "Like'ni olib tashladi" : "Like bosdi" };
    case "bookmark":
      return { icon: "🔖", text: d.on === false ? "Saqlanganlardan olib tashladi" : "Saqladi" };
    default: {
      const a = actionInfo(e.type);
      return { icon: a.icon, text: a.label };
    }
  }
}
