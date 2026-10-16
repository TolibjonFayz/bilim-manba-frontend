/**
 * Kun/tun rejimi. Mavzu <html data-theme="light|dark"> da turadi.
 *
 * Birinchi qiymatni nuxt.config.ts dagi kichik skript sahifa chizilishidan
 * oldin qo'yadi (THEME_INIT_SCRIPT): foydalanuvchi tanlagan bo'lsa —
 * localStorage'dan, bo'lmasa — qurilma sozlamasidan. Server mavzuni bilmaydi,
 * shuning uchun mavzuga bog'liq hamma narsa faqat CSS orqali ko'rsatiladi.
 */
export const THEME_KEY = "theme";

// Brauzer manzil satri rangi (Android Chrome): kunduzi brend rangi, tunda fon
export const THEME_COLORS = { light: "#5850ec", dark: "#12121c" } as const;

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"${THEME_COLORS.dark}":"${THEME_COLORS.light}")}catch(e){}})()`;

type Theme = "light" | "dark";

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}

export function useTheme() {
  const toggle = () => {
    const next: Theme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    apply(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // maxfiy rejim — tanlov faqat shu sahifada qoladi
    }
  };

  /** Foydalanuvchi o'zi tanlamagan bo'lsa — qurilma sozlamasi o'zgarganda ergashamiz */
  const followSystem = () => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch {
        // e'tiborsiz
      }
      if (saved !== "light" && saved !== "dark")
        apply(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };

  return { toggle, followSystem };
}
