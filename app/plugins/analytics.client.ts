// Statistika kuzatuvchisi: sahifa ko'rishlar, faol o'qish vaqti, o'qilgan qism,
// bosishlar va email maydonlari. Hodisalarning o'zi — utils/track.ts.
//
// Belgilar (sahifalarda ixtiyoriy):
//   data-track-area="related"  — bosilgan havola sahifaning qaysi qismida
//   data-track-form="register" — email maydoni qaysi formaga tegishli
//   data-track-read            — "o'qildi" foizi shu element bo'yicha (maqola matni)
export default defineNuxtPlugin((nuxtApp) => {
  const apiBase = useRuntimeConfig().public.apiBase as string;
  if (!apiBase) return;
  initTracker(apiBase);

  const IDLE_MS = 60 * 1000; // shuncha vaqt harakatsiz bo'lsa — "faol" hisoblanmaydi

  let page: {
    pv: string;
    path: string;
    activeMs: number;
    reportedSec: number;
    scroll: number;
    focused: Set<string>;
  } | null = null;
  let lastInput = Date.now();

  const newPv = () => Math.random().toString(36).slice(2, 12);

  const readProgress = () => {
    const el = document.querySelector<HTMLElement>("[data-track-read]");
    const vh = window.innerHeight;
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.height <= 0) return 0;
      return Math.round(Math.min(1, Math.max(0, (vh - r.top) / r.height)) * 100);
    }
    const h = document.documentElement.scrollHeight;
    return h ? Math.round(Math.min(1, (window.scrollY + vh) / h) * 100) : 100;
  };

  /** Sahifadagi holatni yuborish (oraliq yoki yakuniy) */
  const report = () => {
    if (!page) return;
    const sec = Math.round(page.activeMs / 1000);
    const add = sec - page.reportedSec;
    if (add <= 0 && page.reportedSec > 0) return;
    page.reportedSec = sec;
    trackAt(page.path, "page_exit", {
      pv: page.pv,
      sec,
      add: Math.max(0, add),
      scroll: page.scroll,
    });
  };

  let pageStartedAt = 0;
  const startPage = (path: string) => {
    // Yo'naltirish (masalan, /admin → /login) bir sahifani ikki marta yozmasin
    if (page && page.path === path && Date.now() - pageStartedAt < 2000) return;
    pageStartedAt = Date.now();
    if (page) report();
    page = {
      pv: newPv(),
      path,
      activeMs: 0,
      reportedSec: 0,
      scroll: 0,
      focused: new Set(),
    };
    lastInput = Date.now();
    trackAt(path, "page_view", { pv: page.pv, title: document.title.slice(0, 120) });
    // Qisqa sahifada aylantirish shart emas — birinchi chizilgandan keyin o'lchaymiz
    setTimeout(() => {
      if (page && page.path === path) page.scroll = Math.max(page.scroll, readProgress());
    }, 1500);
  };

  // Birinchi sahifa va har bir o'tish
  nuxtApp.hook("app:mounted", () => startPage(location.pathname));
  const router = useRouter();
  router.afterEach((to, from) => {
    if (to.path === from.path || !from.matched.length) return;
    // Sarlavha yangilanishiga ulgurishi uchun keyingi kadrda
    setTimeout(() => startPage(to.path), 300);
  });

  // Faol vaqt: sahifa ko'rinib turgan va odam so'nggi 60 s ichida harakat qilgan
  const onInput = () => (lastInput = Date.now());
  for (const ev of ["pointerdown", "keydown", "wheel", "touchstart", "mousemove"]) {
    window.addEventListener(ev, onInput, { passive: true });
  }
  let scrollRaf = 0;
  window.addEventListener(
    "scroll",
    () => {
      onInput();
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        if (page) page.scroll = Math.max(page.scroll, readProgress());
      });
    },
    { passive: true },
  );
  setInterval(() => {
    if (!page || document.visibilityState !== "visible") return;
    if (Date.now() - lastInput < IDLE_MS) page.activeMs += 1000;
  }, 1000);

  // Har 5 soniyada yuborish; har 30 soniyada oraliq o'qish holati
  setInterval(() => flushTrack(), 5000);
  setInterval(() => report(), 30000);

  // Sahifa yopilayotganda / boshqa ilovaga o'tilganda — oxirgi holat
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      report();
      flushTrack(true);
    } else {
      lastInput = Date.now();
    }
  });
  window.addEventListener("pagehide", () => {
    report();
    flushTrack(true);
  });

  // Bosishlar: qaysi havola, sahifaning qaysi qismida
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (!/^https?:$/.test(url.protocol)) return;
      const ext = url.origin !== location.origin;
      const areaEl = a.closest<HTMLElement>("[data-track-area]");
      const area =
        areaEl?.dataset.trackArea ||
        (a.closest("header, nav")
          ? "menyu"
          : a.closest("footer")
            ? "footer"
            : a.closest("aside")
              ? "yon-panel"
              : "sahifa");
      track("link_click", {
        to: ext ? url.href.slice(0, 200) : url.pathname,
        ext: ext || undefined,
        area,
        // Kartochkada butun matn emas — sarlavhasi
        text: (
          a.querySelector<HTMLElement>("h1, h2, h3, h4, [class*='title']")?.innerText ||
          a.getAttribute("aria-label") ||
          a.innerText ||
          ""
        )
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 80),
      });
      if (ext) flushTrack(true);
    },
    { capture: true, passive: true },
  );

  // Email maydoniga kirish: qaysi forma (har sahifada bir marta)
  document.addEventListener("focusin", (e) => {
    const el = e.target as HTMLInputElement | null;
    if (!el || el.tagName !== "INPUT" || el.type !== "email" || !page) return;
    const form =
      el.closest<HTMLElement>("[data-track-form]")?.dataset.trackForm ||
      location.pathname.replace(/^\//, "") ||
      "boshqa";
    if (page.focused.has(form)) return;
    page.focused.add(form);
    track("email_focus", { form });
  });
});
