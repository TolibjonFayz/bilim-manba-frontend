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

export function toArticleHtml(raw?: string | null): string {
  const text = String(raw ?? "");
  if (!text.trim() || BLOCK_TAG.test(text)) return text;

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
