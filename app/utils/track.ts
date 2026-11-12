// Saytning o'z statistikasi — brauzer tomoni (backend: src/analytics).
//
// Har bir tashrifchi nima qilganini yozadi: qaysi sahifani ochdi, unda necha
// soniya FAOL bo'ldi (sahifa ko'rinib turgan va odam harakatda), maqolaning
// qancha qismini o'qidi, qayerni bosdi, emailni qaysi formaga kiritdi.
// Shaxsiy ma'lumot (email matni, parol) YUBORILMAYDI — faqat forma nomi.
//
// Hodisalar navbatga yig'iladi va har 5 soniyada yoki sahifa yopilayotganda
// bitta so'rov bilan yuboriladi (text/plain + sendBeacon — sekinlashtirmaydi).

type Ev = { t: string; p: string; ts: number; d?: Record<string, unknown> };

const SESSION_GAP = 30 * 60 * 1000;
const queue: Ev[] = [];
let endpoint = "";
let enabled = false;

const rid = () =>
  (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 24);

const ls = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* xotira yopiq — mayli */
    }
  },
};

let memVisitor = "";
let memSession: { id: string; last: number } | null = null;
let sessionCtx: Record<string, string> | null = null;

export function visitorId() {
  let v = ls.get("bm_vid") || memVisitor;
  if (!v) {
    v = rid();
    ls.set("bm_vid", v);
  }
  memVisitor = v;
  return v;
}

/** 30 daqiqa harakatsizlikdan keyin yangi tashrif (sessiya) boshlanadi */
function sessionId(touch = true) {
  let s = memSession;
  try {
    s = JSON.parse(ls.get("bm_sid") || "null") ?? s;
  } catch {
    /* buzilgan qiymat */
  }
  const now = Date.now();
  let isNew = false;
  if (!s || !s.id || now - s.last > SESSION_GAP) {
    s = { id: rid(), last: now };
    isNew = true;
  }
  if (touch) s.last = now;
  memSession = s;
  ls.set("bm_sid", JSON.stringify(s));
  if (isNew) sessionCtx = null;
  return s.id;
}

/** Tashrif qayerdan boshlandi: referrer, utm, kirish sahifasi, ekran */
function context() {
  if (sessionCtx) return sessionCtx;
  const u = new URL(location.href);
  const ref = document.referrer || "";
  sessionCtx = {
    ref: ref && !ref.startsWith(location.origin) ? ref : "",
    us: u.searchParams.get("utm_source") || "",
    um: u.searchParams.get("utm_medium") || "",
    uc: u.searchParams.get("utm_campaign") || "",
    landing: location.pathname,
    sc: `${screen.width}x${screen.height}`,
  };
  return sessionCtx;
}

export function initTracker(apiBase: string) {
  endpoint = `${apiBase.replace(/\/$/, "")}/t`;
  enabled = true;
  sessionId();
  context();
}

/** Bitta hodisa (sahifa manzili avtomatik qo'shiladi) */
export function track(type: string, data?: Record<string, unknown>) {
  if (!import.meta.client || !enabled) return;
  if (location.pathname.startsWith("/admin")) return;
  queue.push({ t: type, p: location.pathname, ts: Date.now(), d: data });
  if (queue.length >= 40) flushTrack();
}

/** Ichki: sahifa manzili oldindan ma'lum bo'lsa (sahifa almashayotganda) */
export function trackAt(path: string, type: string, data?: Record<string, unknown>) {
  if (!import.meta.client || !enabled || path.startsWith("/admin")) return;
  queue.push({ t: type, p: path, ts: Date.now(), d: data });
}

export function flushTrack(useBeacon = false) {
  if (!enabled || !queue.length) return;
  // Admin o'z saytini ko'rganda statistika buzilmasin (backend ham tekshiradi)
  const internal = ls.get("bm_internal") === "1";
  const batch = queue.splice(0, queue.length);
  const body = JSON.stringify({
    v: visitorId(),
    s: sessionId(),
    tk: ls.get("access_token") || undefined,
    now: Date.now(),
    internal: internal || undefined,
    ctx: context(),
    e: batch,
  });
  try {
    if (useBeacon && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: "text/plain;charset=UTF-8" }),
      );
      if (ok) return;
    }
    void fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {
    /* statistika hech qachon saytni buzmasin */
  }
}

/** Email formasi natijasi: qaysi forma, muvaffaqiyatlimi, xato matni */
export function trackEmailSubmit(form: string, ok: boolean, err?: string) {
  track("email_submit", { form, ok, err: err ? String(err).slice(0, 120) : undefined });
  flushTrack();
}
