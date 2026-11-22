// Maqola matni odatda HTML (<p>, <h2> ...). Lekin ba'zan admin matnni
// ChatGPT'dan oddiy matn yoki markdown ko'rinishida (## sarlavha, **qalin**)
// yuklab yuboradi — brauzer qatorlarni birlashtirib, bitta yaxlit "devor"
// qilib chiqaradi. Shunday matnni o'qishga qulay HTML'ga aylantiramiz.

const BLOCK_TAG = /<(p|h[1-6]|ul|ol|li|div|blockquote|br|figure|table|section)\b/i;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** **qalin**, *kursiv*, _kursiv_ */
const inline = (s: string) =>
  esc(s)
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(«"])\*([^*\s][^*]*?)\*(?=[\s).,!?:;»"]|$)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(«"])_([^_\s][^_]*?)_(?=[\s).,!?:;»"]|$)/g, "$1<em>$2</em>");

// Xavfli elementlar: ichidagi matni bilan birga olib tashlanadi
const DROP_WITH_CONTENT =
  /<(script|style|template|noscript|svg|math|iframe|object|textarea|select)\b[\s\S]*?<\/\1\s*>/gi;
// Yopilmagan / o'zi yopiladigan xavfli teglar
const DROP_TAG =
  /<\/?(script|style|template|noscript|svg|math|iframe|frame|frameset|object|embed|applet|form|input|button|textarea|select|option|link|meta|base)\b[^>]*>/gi;
// onclick=, onerror= ... va srcdoc= atributlari
const EVENT_ATTR = /\s(?:on[a-z]+|srcdoc|formaction)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
// href/src/action ichidagi javascript:, vbscript:, data: (rasmdan tashqari)
const BAD_URL_ATTR = new RegExp(
  String.raw`(\s(?:href|src|action|xlink:href|poster|background)\s*=\s*)` +
    String.raw`(?:"\s*(?:javascript|vbscript|data(?!:image\/(?:png|jpe?g|gif|webp);))[^"]*"|'\s*(?:javascript|vbscript|data(?!:image\/(?:png|jpe?g|gif|webp);))[^']*'|(?:javascript|vbscript|data(?!:image\/(?:png|jpe?g|gif|webp);))[^\s>]*)`,
  "gi",
);

/**
 * Maqola HTML'ini xavfsiz qiladi: skript, iframe, forma, hodisa atributlari
 * (onclick, onerror) va javascript: havolalari olib tashlanadi. Matn odatda
 * admin yoki AI yozadi — bu himoyaning qo'shimcha qatlami (masalan manbadan
 * ko'chirilgan matnda yashirin kod bo'lib qolsa). Oddiy teglar (<p>, <h2>,
 * <a>, <img>, <table> ...) va uslublar o'zgarmaydi.
 */
export function cleanArticleHtml(html: string): string {
  let s = html;
  // Ichma-ich hiyla (<scr<script>ipt>) — o'zgarish to'xtaguncha takrorlanadi
  for (let i = 0; i < 5; i++) {
    const next = s
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(DROP_WITH_CONTENT, "")
      .replace(DROP_TAG, "")
      .replace(EVENT_ATTR, "")
      .replace(BAD_URL_ATTR, '$1"#"');
    if (next === s) break;
    s = next;
  }
  return s;
}

export function toArticleHtml(raw?: string | null): string {
  const text = String(raw ?? "");
  if (!text.trim()) return text;
  if (BLOCK_TAG.test(text)) return cleanArticleHtml(text);

  const out: string[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join(" ")}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flushPara();
      flushList();
      out.push(h[1]!.length <= 2 ? `<h2>${inline(h[2]!)}</h2>` : `<h3>${inline(h[2]!)}</h3>`);
      continue;
    }
    const li = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (li) {
      flushPara();
      list.push(li[1]!);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushPara();
      flushList();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    flushList();
    // Har bir qator — alohida xatboshi (ChatGPT matnlarida qisqa qatorlar ko'p)
    para.push(line);
    flushPara();
  }
  flushPara();
  flushList();
  return out.join("\n");
}
