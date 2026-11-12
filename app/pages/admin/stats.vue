<template>
  <div class="admin-stats-page">
    <div class="page-head">
      <div>
        <h1 class="admin-page__title">📈 Statistika</h1>
        <p v-if="a" class="page-head__sub">
          {{ rangeText }} · oldingi davr ({{ prevRangeText }}) bilan solishtirilgan
        </p>
      </div>
      <div class="page-head__right">
        <span class="live" :title="liveTitle">
          <span class="live__dot" :class="{ 'is-on': live.count > 0 }" />
          Hozir saytda: <strong>{{ live.count }}</strong>
        </span>
        <div class="tabs" role="tablist" aria-label="Davr">
          <button
            v-for="p in PERIODS"
            :key="p.value"
            role="tab"
            :aria-selected="period === p.value"
            class="tabs__btn"
            :class="{ 'is-active': period === p.value }"
            @click="setPeriod(p.value)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bo'limlar -->
    <nav class="sections" aria-label="Statistika bo'limlari">
      <button
        v-for="t in TABS"
        :key="t.key"
        class="sections__btn"
        :class="{ 'is-active': tab === t.key }"
        @click="setTab(t.key)"
      >
        {{ t.icon }} {{ t.label }}
      </button>
    </nav>

    <div v-if="error" class="alert alert--danger">⚠️ {{ error }}</div>

    <div v-loading="loading" class="stats-body">
      <template v-if="a && r">
        <div v-if="trackingNote" class="alert alert--info">ℹ️ {{ trackingNote }}</div>

        <!-- ================= UMUMIY ================= -->
        <template v-if="tab === 'overview'">
          <section class="summary">
            <h2 class="summary__title">Qisqacha</h2>
            <ul class="summary__list">
              <li v-for="(line, i) in summary" :key="i" v-html="line" />
            </ul>
          </section>

          <div class="kpi-grid">
            <AdminKpi icon="🧑‍🤝‍🧑" label="Tashrif buyuruvchilar" :value="a.current.visitors" :previous="a.previous.visitors" :hint="`${fmtNum(a.current.newVisitors)} yangi · ${fmtNum(a.current.returningVisitors)} qaytgan`" />
            <AdminKpi icon="📄" label="Ochilgan sahifalar" :value="a.current.pageviews" :previous="a.previous.pageviews" :hint="`Bir tashrifda o'rtacha ${a.current.pagesPerSession} ta`" />
            <AdminKpi icon="📖" label="Maqola o'qishlar" :value="a.current.articleViews" :previous="a.previous.articleViews" :hint="`Jami ko'rishlar (eski hisob): ${fmtNum(r.current.views)}`" />
            <AdminKpi icon="⏱" label="O'rtacha tashrif vaqti" :value="a.current.avgSessionSeconds" :previous="a.previous.avgSessionSeconds" :format="fmtDuration" hint="Faqat faol vaqt (sahifa ochiq va odam harakatda)" />
            <AdminKpi icon="⌛" label="Jami o'qish vaqti" :value="a.current.totalMinutes" :previous="a.previous.totalMinutes" :format="(v: number) => fmtDuration(v * 60)" />
            <AdminKpi icon="🚪" label="Darhol chiqib ketganlar" :value="a.current.bounceRate" :previous="a.previous.bounceRate" suffix="%" lower-is-better hint="1 sahifa ochib, 15 s ichida ketganlar" />
            <AdminKpi icon="👤" label="Ro'yxatdan o'tganlar" :value="r.current.newUsers" :previous="r.previous.newUsers" />
            <AdminKpi icon="✉️" label="Email obunalar" :value="r.current.subscribers" :previous="r.previous.subscribers" />
          </div>

          <section class="card">
            <div class="card__head">
              <h2 class="card__title">{{ chartTitle }}</h2>
              <div class="chips">
                <button
                  v-for="m in METRICS"
                  :key="m.key"
                  class="chips__btn"
                  :class="{ 'is-active': metric === m.key }"
                  @click="metric = m.key"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>
            <AdminBarChart :points="chartPoints" :aria-label="chartTitle" />
          </section>

          <div class="two-col">
            <section class="card">
              <h2 class="card__title">🪜 Tashrifchidan obunachigacha</h2>
              <p class="card__desc">Shu davrda kirgan odamlardan nechtasi qaysi bosqichgacha yetdi</p>
              <ol class="funnel">
                <li v-for="(f, i) in funnel" :key="f.label" class="funnel__step">
                  <div class="funnel__row">
                    <span class="funnel__label">{{ f.label }}</span>
                    <span class="funnel__value">
                      {{ fmtNum(f.value) }}
                      <small>{{ pctOf(f.value, funnel[0]!.value) }}</small>
                    </span>
                  </div>
                  <div class="funnel__track">
                    <span :style="{ width: barW(f.value, funnel[0]!.value) }" />
                  </div>
                  <small v-if="i > 0 && funnel[i - 1]!.value" class="funnel__drop">
                    oldingi bosqichdan {{ pctOf(f.value, funnel[i - 1]!.value) }} o'tdi
                  </small>
                </li>
              </ol>
            </section>

            <section class="card">
              <h2 class="card__title">👆 Nimalar qilishdi</h2>
              <StatsBars
                :items="actionItems"
                empty="Bu davrda like, saqlash, test kabi harakatlar yo'q."
              />
            </section>
          </div>

          <section class="card">
            <h2 class="card__title">🕒 Odamlar qachon kirishadi</h2>
            <p class="card__desc">Hafta kunlari va soatlar (Toshkent vaqti) — yangi maqolani eng faol paytga qo'yish uchun</p>
            <StatsHeatmap :cells="a.heatmap" />
          </section>

          <section class="card">
            <h2 class="card__title">🗂 Butun davr uchun</h2>
            <div class="totals">
              <div><span>Foydalanuvchilar</span><strong>{{ fmtNum(r.totals.users) }}</strong></div>
              <div><span>Premium</span><strong>{{ fmtNum(r.totals.premium) }}</strong></div>
              <div><span>Chop etilgan maqolalar</span><strong>{{ fmtNum(r.totals.articles) }}</strong></div>
              <div><span>Qoralamalar</span><strong>{{ fmtNum(r.totals.drafts) }}</strong></div>
              <div><span>Jami ko'rishlar</span><strong>{{ fmtNum(r.totals.views) }}</strong></div>
              <div><span>Like'lar</span><strong>{{ fmtNum(r.totals.likes) }}</strong></div>
              <div><span>Izohlar</span><strong>{{ fmtNum(r.totals.comments) }}</strong></div>
              <div><span>Email obunachilar</span><strong>{{ fmtNum(r.totals.subscribers) }}</strong></div>
            </div>
          </section>
        </template>

        <!-- ================= MAQOLALAR ================= -->
        <template v-else-if="tab === 'articles'">
          <section class="card">
            <h2 class="card__title">📚 Maqolalar qanday o'qilyapti</h2>
            <p class="card__desc">
              <strong>O'rtacha vaqt</strong> — maqolada faol o'tkazilgan vaqt.
              <strong>Oxirigacha</strong> — matnning 90% dan ko'pini ko'rganlar ulushi.
              <strong>Kirish</strong> — saytga aynan shu maqola orqali kirganlar (Google, Telegram...).
            </p>
            <p v-if="!a.articles.length" class="empty">Bu davrda maqola ochilmagan.</p>
            <div v-else class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Maqola</th>
                    <th class="num">Ochildi</th>
                    <th class="num">O'quvchi</th>
                    <th class="num">O'rtacha vaqt</th>
                    <th>Oxirigacha</th>
                    <th class="num">Kirish</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="x in a.articles" :key="x.path">
                    <td class="table__title">
                      <NuxtLink v-if="x.id" :to="`/admin/articles/${x.id}/preview`">{{ x.title }}</NuxtLink>
                      <span v-else>{{ x.title }}</span>
                      <small v-if="x.category">{{ x.category }}</small>
                    </td>
                    <td class="num">{{ fmtNum(x.views) }}</td>
                    <td class="num">{{ fmtNum(x.readers) }}</td>
                    <td class="num">{{ fmtDuration(x.avgSeconds) }}</td>
                    <td>
                      <div class="meter" :title="`O'rtacha ${x.avgScroll}% qismi ko'rildi`">
                        <span class="meter__bar"><span :style="{ width: `${x.finishRate}%` }" /></span>
                        <span class="meter__num">{{ x.finishRate }}%</span>
                      </div>
                    </td>
                    <td class="num">{{ fmtNum(x.entries) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="two-col">
            <section class="card">
              <h2 class="card__title">🖱 Odamlar qayerni bosadi</h2>
              <p class="card__desc">Havola sahifaning qaysi qismida bosilgan (qavsda — maqolaga olib borganlari)</p>
              <StatsBars
                :items="a.clicks.areas.map((c: any) => ({ label: areaLabel(c.area), value: c.clicks, sub: `${fmtNum(c.toArticles)} tasi maqolaga` }))"
                show-share
              />
              <template v-if="a.clicks.outbound.length">
                <h3 class="card__sub">↗️ Boshqa saytlarga chiqib ketishlar</h3>
                <StatsBars :items="a.clicks.outbound.map((c: any) => ({ label: c.url, value: c.clicks }))" :limit="5" />
              </template>
            </section>

            <section class="card">
              <h2 class="card__title">📂 Kategoriyalar bo'yicha ko'rishlar</h2>
              <StatsBars
                :items="r.topCategories.map((c: any) => ({ label: c.name, value: c.views }))"
                show-share
              />
            </section>
          </div>

          <div class="two-col">
            <section class="card">
              <h2 class="card__title">🧭 Sahifa turlari</h2>
              <p class="card__desc">Qaysi sahifalar ko'p ochiladi va ularda o'rtacha qancha qolishadi</p>
              <StatsBars
                :items="a.pages.map((p: any) => ({ label: p.name, value: p.views, sub: `o'rtacha ${fmtDuration(p.avgSeconds)}` }))"
              />
            </section>
            <section class="card">
              <h2 class="card__title">🔍 Saytda nima qidirishdi</h2>
              <p class="card__desc">Qizil belgi — natija topilmagan: yangi maqola uchun tayyor mavzu</p>
              <StatsBars
                :items="a.searches.map((q: any) => ({ label: q.query, value: q.count, icon: q.noResults ? '🔴' : '🟢' }))"
                empty="Bu davrda saytda qidiruv bo'lmagan."
              />
            </section>
          </div>
        </template>

        <!-- ================= AUDITORIYA ================= -->
        <template v-else-if="tab === 'people'">
          <div class="kpi-grid">
            <AdminKpi icon="🆕" label="Yangi tashrifchilar" :value="a.current.newVisitors" :previous="a.previous.newVisitors" />
            <AdminKpi icon="🔁" label="Qaytib kelganlar" :value="a.current.returningVisitors" :previous="a.previous.returningVisitors" />
            <AdminKpi icon="🔐" label="Kirgan holda o'qiganlar" :value="a.current.loggedIn" :previous="a.previous.loggedIn" />
            <AdminKpi icon="🧾" label="Tashriflar (sessiyalar)" :value="a.current.sessions" :previous="a.previous.sessions" hint="30 daqiqa harakatsizlikdan keyin yangi tashrif" />
          </div>

          <section class="card">
            <h2 class="card__title">🚦 Odamlar qayerdan keladi</h2>
            <p class="card__desc">Har manbadan kelganlar soni va ular saytda qancha qolgani — qaysi kanal sifatli o'quvchi berishini ko'rsatadi</p>
            <StatsBars
              :items="a.sources.map((s: any) => ({ label: s.name, value: s.visitors, icon: sourceIcon(s.name), sub: `${fmtNum(s.sessions)} tashrif · o'rtacha ${fmtDuration(s.avgSeconds)} · ${s.pagesPerSession} sahifa` }))"
              show-share
              :limit="12"
            />
          </section>

          <div class="three-col">
            <section class="card">
              <h2 class="card__title">📱 Qurilma</h2>
              <StatsBars :items="a.devices.map((d: any) => ({ label: d.name, value: d.visitors, icon: deviceIcon(d.name) }))" show-share />
            </section>
            <section class="card">
              <h2 class="card__title">⚙️ Tizim</h2>
              <StatsBars :items="a.os.map((d: any) => ({ label: d.name, value: d.visitors }))" show-share />
            </section>
            <section class="card">
              <h2 class="card__title">🌐 Brauzer</h2>
              <StatsBars :items="a.browsers.map((d: any) => ({ label: d.name, value: d.visitors }))" show-share />
            </section>
          </div>

          <section class="card">
            <h2 class="card__title">🗺 Mamlakatlar</h2>
            <StatsBars :items="a.countries.map((c: any) => ({ label: countryName(c.name), value: c.visitors }))" show-share />
          </section>
        </template>

        <!-- ================= EMAIL ================= -->
        <template v-else-if="tab === 'email'">
          <section class="card">
            <h2 class="card__title">✉️ Email qayerda kiritiladi</h2>
            <p class="card__desc">
              <strong>Boshladi</strong> — email maydoniga bosgan tashriflar,
              <strong>Yubordi</strong> — tugmani bosganlar,
              <strong>Muvaffaqiyatli</strong> — ro'yxatdan o'tgan / obuna bo'lgan / kirganlar.
            </p>
            <p v-if="!a.forms.forms.length" class="empty">Bu davrda hech kim email kiritmagan.</p>
            <div v-else class="forms">
              <div v-for="f in a.forms.forms" :key="f.form" class="forms__item">
                <h3>{{ formLabel(f.form) }}</h3>
                <div class="forms__steps">
                  <div><span>Boshladi</span><strong>{{ fmtNum(f.started) }}</strong></div>
                  <div><span>Yubordi</span><strong>{{ fmtNum(f.submitted) }}</strong></div>
                  <div><span>Muvaffaqiyatli</span><strong>{{ fmtNum(f.ok) }}</strong></div>
                </div>
                <div class="funnel__track"><span :style="{ width: barW(f.ok, Math.max(f.started, f.submitted)) }" /></div>
                <small class="forms__rate">
                  Boshlaganlarning {{ pctOf(f.ok, Math.max(f.started, f.submitted)) }} i yakunladi
                </small>
              </div>
            </div>
          </section>

          <section v-if="a.forms.errors.length" class="card">
            <h2 class="card__title">⚠️ Nima xalaqit berdi</h2>
            <StatsBars :items="a.forms.errors.map((e: any) => ({ label: `${formLabel(e.form)}: ${e.error}`, value: e.count }))" />
          </section>

          <section class="card">
            <h2 class="card__title">📬 So'nggi emaillar</h2>
            <p class="card__desc">Bazaga tushgan emaillar — qaysi formadan va qaysi sahifada turib kiritilgani bilan</p>
            <p v-if="!a.forms.recent.length" class="empty">Bu davrda yangi email yo'q.</p>
            <div v-else class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Qayerda</th>
                    <th>Qaysi sahifada</th>
                    <th>Vaqt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(e, i) in a.forms.recent" :key="i">
                    <td class="table__title">
                      {{ e.email }}
                      <small v-if="e.name">{{ e.name }}</small>
                    </td>
                    <td>
                      <span class="badge" :class="e.kind === 'register' ? 'badge--reg' : 'badge--sub'">
                        {{ e.kind === "register" ? "Ro'yxatdan o'tdi" : formLabel(e.form || "newsletter_footer") }}
                      </span>
                    </td>
                    <td class="table__path">{{ e.pathTitle ? `«${e.pathTitle}»` : e.path ? pageLabel(e.path) : "— (eski yozuv)" }}</td>
                    <td class="nowrap">{{ dateTime(e.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <!-- ================= TASHRIFLAR ================= -->
        <template v-else-if="tab === 'visits'">
          <section v-if="live.sessions.length" class="card">
            <h2 class="card__title">🟢 Hozir saytda ({{ live.count }})</h2>
            <ul class="live-list">
              <li v-for="s in live.sessions" :key="s.id">
                {{ deviceIcon(s.device) }} <strong>{{ s.source }}</strong> → {{ s.path ? pageLabel(s.path) : "…" }}
              </li>
            </ul>
          </section>
          <section class="card">
            <h2 class="card__title">👣 So'nggi tashriflar</h2>
            <p class="card__desc">Har birini bosing — odam saytda qadamma-qadam nima qilgani ochiladi (oxirgi 50 ta)</p>
            <StatsSessions :sessions="a.sessions" />
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const PERIODS = [
  { value: "day", label: "Bugun" },
  { value: "week", label: "7 kun" },
  { value: "month", label: "30 kun" },
  { value: "year", label: "Yil" },
] as const;

const TABS = [
  { key: "overview", icon: "🏠", label: "Umumiy" },
  { key: "articles", icon: "📚", label: "Maqolalar" },
  { key: "people", icon: "🧑‍🤝‍🧑", label: "Auditoriya" },
  { key: "email", icon: "✉️", label: "Email" },
  { key: "visits", icon: "👣", label: "Tashriflar" },
] as const;

const METRICS = [
  { key: "visitors", label: "Tashrifchilar", src: "a" },
  { key: "pageviews", label: "Sahifalar", src: "a" },
  { key: "minutes", label: "O'qish daqiqalari", src: "a" },
  { key: "newUsers", label: "Ro'yxatdan o'tganlar", src: "r" },
  { key: "likes", label: "Like'lar", src: "r" },
  { key: "published", label: "Maqolalar", src: "r" },
] as const;

const adminStore = useAdminStore();
const route = useRoute();
const router = useRouter();

const period = ref<string>(
  PERIODS.some((p) => p.value === route.query.period) ? String(route.query.period) : "week",
);
const tab = ref<string>(
  TABS.some((t) => t.key === route.query.tab) ? String(route.query.tab) : "overview",
);
const metric = ref<(typeof METRICS)[number]["key"]>("visitors");
const a = ref<any>(null); // saytning o'z statistikasi
const r = ref<any>(null); // eski hisobot (foydalanuvchilar, like, kategoriyalar, jami)
const live = ref<{ count: number; sessions: any[] }>({ count: 0, sessions: [] });
const loading = ref(false);
const error = ref("");

const load = async () => {
  loading.value = true;
  error.value = "";
  const [ra, rr] = await Promise.all([
    adminStore.analyticsApi("", { period: period.value }),
    adminStore.getStatsReport(period.value),
  ]);
  loading.value = false;
  if (ra.success && rr.success) {
    a.value = ra.data;
    r.value = rr.data;
    live.value = ra.data.live;
  } else error.value = ra.message || rr.message;
};

const loadLive = async () => {
  const res = await adminStore.analyticsApi("/live");
  if (res.success) live.value = res.data;
};

const setPeriod = (p: string) => {
  period.value = p;
  router.replace({ query: { ...route.query, period: p } });
  load();
};
const setTab = (t: string) => {
  tab.value = t;
  router.replace({ query: { ...route.query, tab: t } });
};

let liveTimer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  load();
  liveTimer = setInterval(loadLive, 30000);
});
onBeforeUnmount(() => clearInterval(liveTimer));

// ---------- Matnlar ----------
const dmy = (s: string) => s.split("-").reverse().join(".");
const rangeText = computed(() =>
  a.value.range.from === a.value.range.to
    ? `Bugun, ${dmy(a.value.range.from)}`
    : `${dmy(a.value.range.from)} – ${dmy(a.value.range.to)}`,
);
const prevRangeText = computed(() => {
  const x = a.value.previousRange;
  return x.from === x.to ? dmy(x.from) : `${dmy(x.from)} – ${dmy(x.to)}`;
});
const liveTitle = computed(() =>
  live.value.sessions.map((s: any) => `${s.source}: ${s.path ?? ""}`).join("\n") ||
  "So'nggi 5 daqiqada hech kim yo'q",
);

const trackingNote = computed(() => {
  const since = a.value?.trackedSince;
  if (!since)
    return "Batafsil statistika (tashrifchilar, o'qish vaqti, bosishlar, email formalari) endi yig'ila boshlaydi — birinchi tashriflardan keyin to'ladi.";
  if (since > a.value.previousRange.from)
    return `Batafsil statistika ${dmy(since)} dan beri yig'ilmoqda — undan oldingi kunlar 0 ko'rinadi, foizdagi o'zgarishlar hozircha to'liq emas.`;
  return "";
});

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const change = (cur: number, prev: number) => {
  if (!prev) return "";
  const c = Math.round(((cur - prev) / prev) * 100);
  if (Math.abs(c) < 1) return "o'tgan davr bilan bir xil";
  return c > 0 ? `o'tgan davrdan <b>${c}% ko'p</b>` : `o'tgan davrdan <b>${-c}% kam</b>`;
};

/** Oddiy tildagi xulosa — raqamlarni o'qimasdan ham holat tushunarli bo'lsin */
const summary = computed(() => {
  const c = a.value.current;
  const p = a.value.previous;
  const out: string[] = [];
  if (!c.visitors) {
    out.push("Bu davrda hali tashrif yozilmagan.");
    return out;
  }
  const ch = change(c.visitors, p.visitors);
  out.push(`🧑‍🤝‍🧑 Saytga <b>${fmtNum(c.visitors)} kishi</b> kirdi${ch ? ` — ${ch}` : ""}. Ulardan ${fmtNum(c.newVisitors)} tasi birinchi marta.`);
  out.push(`⏱ Bir tashrif o'rtacha <b>${fmtDuration(c.avgSessionSeconds)}</b> davom etdi, jami <b>${fmtDuration(c.totalMinutes * 60)}</b> o'qishdi.`);
  const top = a.value.sources[0];
  if (top) out.push(`🚦 Eng ko'p <b>${esc(top.name)}</b> orqali kelishdi (${fmtNum(top.visitors)} kishi).`);
  const art = a.value.articles[0];
  if (art) out.push(`📚 Eng ko'p ochilgan maqola: <b>«${esc(art.title)}»</b> — ${fmtNum(art.views)} marta, o'rtacha ${fmtDuration(art.avgSeconds)} o'qildi.`);
  const best = [...a.value.articles]
    .filter((x: any) => x.views >= 3)
    .sort((x: any, y: any) => y.avgSeconds - x.avgSeconds)[0];
  if (best && best.path !== art?.path)
    out.push(`🏅 Eng berilib o'qilgani: <b>«${esc(best.title)}»</b> — o'rtacha ${fmtDuration(best.avgSeconds)}.`);
  const dev = a.value.devices[0];
  if (dev) out.push(`${deviceIcon(dev.name)} Tashrifchilarning <b>${Math.round((dev.visitors / Math.max(1, a.value.devices.reduce((s: number, d: any) => s + d.visitors, 0))) * 100)}%</b> i ${dev.name.toLowerCase()}dan.`);
  if (c.signups || c.subscribes)
    out.push(`✉️ <b>${fmtNum(c.signups)}</b> kishi ro'yxatdan o'tdi, <b>${fmtNum(c.subscribes)}</b> kishi email obunaga yozildi.`);
  if (c.bounceRate >= 60)
    out.push(`🚪 Kirganlarning <b>${c.bounceRate}%</b> i bitta sahifani ko'rib tez chiqib ketdi — maqola ostidagi havolalarni kuchaytirish foydali.`);
  return out;
});

// ---------- Grafik ----------
const chartTitle = computed(() => {
  const m = METRICS.find((x) => x.key === metric.value)!;
  const src = m.src === "a" ? a.value?.series : r.value?.series;
  const n = src?.points.length ?? 0;
  const span = src?.unit === "month" ? `so'nggi ${n} oy` : src?.unit === "week" ? `so'nggi ${n} hafta` : `so'nggi ${n} kun`;
  return `${m.label} — ${span}`;
});
const chartPoints = computed(() => {
  const m = METRICS.find((x) => x.key === metric.value)!;
  const src = m.src === "a" ? a.value?.series : r.value?.series;
  return (src?.points ?? []).map((p: any) => ({
    label: bucketLabel(p.bucket, src.unit),
    value: p[metric.value] ?? 0,
  }));
});

// ---------- Voronka va harakatlar ----------
const funnel = computed(() => {
  const f = a.value.funnel;
  return [
    { label: "Saytga kirdi", value: f.visitors },
    { label: "Maqola ochdi", value: f.opened },
    { label: "30 soniyadan ko'p o'qidi", value: f.read30 },
    { label: "Maqolani oxirigacha o'qidi", value: f.finished },
    { label: "Email kiritishni boshladi", value: f.emailStarted },
    { label: "Ro'yxatdan o'tdi / obuna bo'ldi", value: f.converted },
  ];
});
const pctOf = (v: number, of: number) => (of ? `${Math.round((v / of) * 100)}%` : "0%");
const barW = (v: number, of: number) => `${Math.max(1.5, of ? (v / of) * 100 : 0)}%`;

const actionItems = computed(() =>
  Object.entries(a.value.actions as Record<string, number>)
    .filter(([t]) => t !== "theme_toggle")
    .map(([t, n]) => ({ label: actionInfo(t).label, icon: actionInfo(t).icon, value: n }))
    .sort((x, y) => y.value - x.value),
);

// ---------- Yordamchilar ----------
const SOURCE_ICONS: Record<string, string> = {
  Telegram: "✈️",
  Instagram: "📸",
  Google: "🔎",
  Yandex: "🅨",
  Facebook: "📘",
  YouTube: "▶️",
  "To'g'ridan-to'g'ri": "⌨️",
  Email: "✉️",
};
const sourceIcon = (n: string) => SOURCE_ICONS[n] ?? "🔗";
const COUNTRIES: Record<string, string> = {
  UZ: "O'zbekiston", RU: "Rossiya", KZ: "Qozog'iston", KG: "Qirg'iziston", TJ: "Tojikiston",
  TM: "Turkmaniston", US: "AQSh", TR: "Turkiya", DE: "Germaniya", KR: "Janubiy Koreya",
  GB: "Buyuk Britaniya", AE: "BAA", PL: "Polsha", "Nomaʼlum": "Noma'lum",
};
const countryName = (c: string) => COUNTRIES[c] ?? c;
const pageLabel = (p: string) => {
  const path = p.split("?")[0]!;
  const names: Record<string, string> = {
    "/": "Bosh sahifa",
    "/articles": "Maqolalar ro'yxati",
    "/register": "Ro'yxatdan o'tish",
    "/login": "Kirish",
    "/categories": "Kategoriyalar",
    "/profile": "Profil",
  };
  return names[path] ?? decodePath(p);
};
const decodePath = (p: string) => {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
};
const dateTime = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 5 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
</script>

<style lang="scss" scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;

  &__sub {
    font-size: 0.85rem;
    color: $text-secondary;
    margin-top: 0.25rem;
  }
}

.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
}

.tabs {
  display: inline-flex;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius-pill;
  padding: 0.25rem;
  gap: 0.15rem;

  &__btn {
    border: none;
    background: none;
    padding: 0.45rem 0.9rem;
    border-radius: $border-radius-pill;
    font-family: $font-primary;
    font-weight: 600;
    font-size: 0.85rem;
    color: $text-secondary;
    cursor: pointer;

    &.is-active {
      background: $primary;
      color: #fff;
    }
  }
}

.stats-body {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.85rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
}

.card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.1rem 1.25rem;
  min-width: 0;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.9rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  &__head .card__title {
    margin-bottom: 0;
  }
}

.chips {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;

  &__btn {
    border: 1px solid $border-color;
    background: $bg-primary;
    border-radius: $border-radius-pill;
    padding: 0.3rem 0.75rem;
    font-family: $font-primary;
    font-size: 0.78rem;
    font-weight: 600;
    color: $text-secondary;
    cursor: pointer;

    &.is-active {
      border-color: $primary;
      background: rgba(var(--c-primary-rgb), 0.08);
      color: $primary;
    }
  }
}

.two-col {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.rank {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  counter-reset: rank;

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: baseline;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: $primary;
    }
  }

  &__num {
    font-size: 0.85rem;
    white-space: nowrap;

    small {
      color: $text-muted;
      font-weight: 500;
    }
  }

  &__bar {
    height: 6px;
    background: $bg-secondary;
    border-radius: 3px;
    margin-top: 0.3rem;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: $primary;
      border-radius: 3px;
    }

    &--alt span {
      background: $secondary;
    }
  }

  &__meta {
    font-size: 0.72rem;
    color: $text-muted;
  }
}

.totals {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.75rem;

  div {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.75rem;
    background: $bg-secondary;
    border-radius: $border-radius-sm;
  }

  span {
    font-size: 0.75rem;
    color: $text-secondary;
  }

  strong {
    font-size: 1.15rem;
  }
}

.empty {
  font-size: 0.85rem;
  color: $text-muted;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  line-height: 1.5;

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
    margin-bottom: 1rem;
  }

  &--info {
    background: rgba(var(--c-primary-rgb), 0.06);
    border: 1px solid rgba(var(--c-primary-rgb), 0.2);
    color: $text-primary;
  }
}

// ---------- Yangi qismlar ----------
.page-head__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.live {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: $text-secondary;
  padding: 0.4rem 0.8rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-pill;
  background: $bg-primary;

  strong {
    color: $text-primary;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $text-muted;

    &.is-on {
      background: var(--c-success-text);
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
    }
  }
}

.sections {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  margin-bottom: 1.1rem;
  padding-bottom: 0.2rem;
  scrollbar-width: none;

  &__btn {
    flex: none;
    border: 1px solid $border-color;
    background: $bg-primary;
    border-radius: $border-radius-pill;
    padding: 0.5rem 1rem;
    font-family: $font-primary;
    font-size: 0.86rem;
    font-weight: 600;
    color: $text-secondary;
    cursor: pointer;

    &:hover {
      color: $text-primary;
    }

    &.is-active {
      border-color: $primary;
      background: rgba(var(--c-primary-rgb), 0.1);
      color: $primary;
    }
  }
}

.summary {
  background: rgba(var(--c-primary-rgb), 0.06);
  border: 1px solid rgba(var(--c-primary-rgb), 0.2);
  border-radius: $border-radius;
  padding: 1rem 1.25rem;

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.9rem;
    line-height: 1.55;
    color: $text-primary;
  }
}

.card__desc {
  font-size: 0.8rem;
  color: $text-secondary;
  margin: -0.4rem 0 0.9rem;
  line-height: 1.5;
}

.card__sub {
  font-size: 0.88rem;
  font-weight: 700;
  margin: 1.25rem 0 0.6rem;
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.funnel {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.86rem;
  }

  &__label {
    font-weight: 600;
  }

  &__value {
    font-weight: 700;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;

    small {
      margin-left: 0.3rem;
      color: $text-muted;
      font-weight: 500;
    }
  }

  &__track {
    height: 10px;
    margin-top: 0.3rem;
    background: $bg-secondary;
    border-radius: 5px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: $primary;
      border-radius: 5px;
    }
  }

  &__drop {
    font-size: 0.72rem;
    color: $text-muted;
  }
}

.table-wrap {
  overflow-x: auto;
  margin: 0 -0.25rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;

  th {
    text-align: left;
    font-size: 0.74rem;
    font-weight: 700;
    color: $text-secondary;
    padding: 0.5rem;
    border-bottom: 1px solid $border-color;
    white-space: nowrap;
  }

  td {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid $border-color;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__title {
    min-width: 170px;
    max-width: 420px;

    a {
      color: $text-primary;
      font-weight: 600;
      text-decoration: none;

      &:hover {
        color: $primary;
      }
    }

    small {
      display: block;
      color: $text-muted;
      font-size: 0.72rem;
    }
  }

  &__path {
    font-size: 0.78rem;
    color: $text-secondary;
    word-break: break-word;
    min-width: 120px;
  }
}

.nowrap {
  white-space: nowrap;
}

.meter {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 110px;

  &__bar {
    flex: 1;
    height: 8px;
    background: $bg-secondary;
    border-radius: 4px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: $primary;
      border-radius: 4px;
    }
  }

  &__num {
    font-size: 0.78rem;
    font-weight: 700;
    width: 2.6rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}

.forms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.85rem;

  &__item {
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    padding: 0.85rem 1rem;

    h3 {
      font-size: 0.92rem;
      font-weight: 700;
      margin-bottom: 0.6rem;
    }
  }

  &__steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;

    div {
      display: flex;
      flex-direction: column;
    }

    span {
      font-size: 0.7rem;
      color: $text-secondary;
    }

    strong {
      font-size: 1.15rem;
    }
  }

  &__rate {
    display: block;
    margin-top: 0.3rem;
    font-size: 0.74rem;
    color: $text-muted;
  }
}

.badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  white-space: nowrap;
  border: 1px solid $border-color;
  background: $bg-secondary;
  color: $text-primary;

  &--reg::before {
    content: "👤 ";
  }

  &--sub::before {
    content: "✉️ ";
  }
}

.live-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.84rem;
  word-break: break-word;
}
</style>
