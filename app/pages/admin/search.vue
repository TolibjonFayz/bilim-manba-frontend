<template>
  <div class="admin-search-page">
    <div class="page-head">
      <div>
        <h1 class="admin-page__title">🔎 Google qidiruv</h1>
        <p v-if="data?.configured" class="page-head__sub">
          {{ dmy(data.range.startDate) }} – {{ dmy(data.range.endDate) }} ·
          Search Console ma'lumoti 1–2 kun kechikadi · {{ data.site }}
        </p>
      </div>
      <div v-if="data?.configured" class="tabs" role="tablist">
        <button
          v-for="d in [7, 28, 90]"
          :key="d"
          role="tab"
          :aria-selected="days === d"
          class="tabs__btn"
          :class="{ 'is-active': days === d }"
          @click="setDays(d)"
        >
          {{ d }} kun
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert--danger">
      ⚠️ {{ error }}
      <p v-if="/foydalanuvchi|permission|403/i.test(error)" class="alert__more">
        Search Console → Sozlamalar → Foydalanuvchilar va ruxsatlar bo'limida
        xizmat hisobining emaili qo'shilganini tekshiring.
      </p>
    </div>

    <div v-loading="loading" class="search-body">
      <!-- Sozlanmagan: yo'riqnoma -->
      <section v-if="data && !data.configured" class="card setup">
        <h2 class="card__title">
          Search Console'ni ulash (bir martalik, ~10 daqiqa)
        </h2>
        <p class="setup__intro">
          Ulangandan keyin shu yerda ko'rasiz: Google'da qancha odam saytingizni
          ko'rdi va bosdi, qaysi so'rovlar bilan topishdi, qaysi maqolalar
          indekslangan va qayerda o'sish imkoniyati bor.
        </p>
        <ol class="setup__steps">
          <li>
            <a
              href="https://console.cloud.google.com/projectcreate"
              target="_blank"
              rel="noopener"
              >Google Cloud Console</a
            >'da yangi loyiha yarating (masalan, <code>bilim-manba</code>).
          </li>
          <li>
            <a
              href="https://console.cloud.google.com/apis/library/searchconsole.googleapis.com"
              target="_blank"
              rel="noopener"
              >Google Search Console API</a
            >
            sahifasida <strong>Enable</strong> ni bosing.
          </li>
          <li>
            <a
              href="https://console.cloud.google.com/iam-admin/serviceaccounts/create"
              target="_blank"
              rel="noopener"
              >Service account</a
            >
            yarating (nomi: <code>bilim-manba-gsc</code>, rol berish shart emas)
            → ichiga kirib
            <strong>Keys → Add key → Create new key → JSON</strong>. JSON fayl
            yuklab olinadi.
          </li>
          <li>
            <a
              href="https://search.google.com/search-console/users"
              target="_blank"
              rel="noopener"
              >Search Console → Sozlamalar → Foydalanuvchilar</a
            >
            → <strong>Foydalanuvchi qo'shish</strong>: JSON fayldagi
            <code>client_email</code> ni yozing, ruxsat —
            <strong>Cheklangan</strong> (Restricted) yetarli.
          </li>
          <li>
            Render → backend → <strong>Environment</strong>:
            <code>GSC_CREDENTIALS</code> nomli o'zgaruvchi qo'shing va qiymatiga
            JSON faylning <strong>butun matnini</strong> qo'ying. Kalitni hech
            kimga (chatga ham) yubormang.
          </li>
        </ol>
        <p class="setup__note">Deploy tugagach, shu sahifani yangilang.</p>
      </section>

      <template v-else-if="data?.configured">
        <div class="kpi-grid">
          <AdminKpi
            icon="🖱"
            label="Kliklar"
            :value="data.totals.clicks"
            :previous="data.previous.clicks"
            hint="Google'dan saytga o'tishlar"
          />
          <AdminKpi
            icon="👀"
            label="Ko'rinishlar"
            :value="data.totals.impressions"
            :previous="data.previous.impressions"
            hint="Qidiruv natijalarida chiqqanlar"
          />
          <AdminKpi
            icon="🎯"
            label="CTR"
            :value="data.totals.ctr"
            :previous="data.previous.ctr"
            suffix="%"
            :decimals="2"
            hint="Ko'rganlarning necha foizi bosgan"
          />
          <AdminKpi
            icon="📍"
            label="O'rtacha o'rin"
            :value="data.totals.position"
            :previous="data.previous.position"
            :decimals="1"
            lower-is-better
            hint="Kichik — yaxshi (1 = eng tepada)"
          />
        </div>

        <section class="card">
          <div class="card__head">
            <h2 class="card__title">
              {{ metric === "clicks" ? "Kliklar" : "Ko'rinishlar" }} — kunma-kun
            </h2>
            <div class="chips">
              <button
                class="chips__btn"
                :class="{ 'is-active': metric === 'clicks' }"
                @click="metric = 'clicks'"
              >
                Kliklar
              </button>
              <button
                class="chips__btn"
                :class="{ 'is-active': metric === 'impressions' }"
                @click="metric = 'impressions'"
              >
                Ko'rinishlar
              </button>
            </div>
          </div>
          <AdminBarChart
            v-if="data.daily.length"
            :points="dailyPoints"
            aria-label="Google qidiruv grafigi"
          />
          <p v-else class="empty">Bu davr uchun ma'lumot hali yo'q.</p>
        </section>

        <!-- Imkoniyatlar -->
        <section v-if="data.opportunities.length" class="card">
          <h2 class="card__title">💡 O'sish imkoniyatlari</h2>
          <p class="card__sub">
            Bu so'rovlarda saytingiz ko'p ko'rinadi, lekin to'liq
            foydalanilmayapti. Mos maqolani boyitish yoki sarlavha/tavsifni
            jozibaliroq qilish trafikni oshiradi.
          </p>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>So'rov</th>
                  <th>Nima qilish kerak</th>
                  <th>Ko'rinish</th>
                  <th>Klik</th>
                  <th>O'rin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in data.opportunities" :key="o.key">
                  <td class="table__strong">{{ o.key }}</td>
                  <td>
                    <span v-if="o.kind === 'page2'" class="tag tag--warn"
                      >2-sahifada — maqolani boyiting</span
                    >
                    <span v-else class="tag tag--info"
                      >Tepada, lekin kam bosilyapti — sarlavhani
                      yaxshilang</span
                    >
                  </td>
                  <td>{{ fmt(o.impressions) }}</td>
                  <td>{{ fmt(o.clicks) }}</td>
                  <td>{{ o.position }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="two-col">
          <section class="card">
            <h2 class="card__title">🔤 Qidiruv so'rovlari</h2>
            <p v-if="!data.queries.length" class="empty">
              Hali so'rovlar yo'q.
            </p>
            <div v-else class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>So'rov</th>
                    <th>Klik</th>
                    <th>Ko'rinish</th>
                    <th>CTR</th>
                    <th>O'rin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in data.queries" :key="q.key">
                    <td class="table__strong">{{ q.key }}</td>
                    <td>{{ fmt(q.clicks) }}</td>
                    <td>{{ fmt(q.impressions) }}</td>
                    <td>{{ q.ctr }}%</td>
                    <td>{{ q.position }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="card">
            <h2 class="card__title">📄 Sahifalar</h2>
            <p v-if="!data.pages.length" class="empty">Hali ma'lumot yo'q.</p>
            <div v-else class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Sahifa</th>
                    <th>Klik</th>
                    <th>Ko'rinish</th>
                    <th>O'rin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in data.pages" :key="p.key">
                    <td class="table__path">
                      <a :href="p.key" target="_blank" rel="noopener">{{
                        p.path
                      }}</a>
                    </td>
                    <td>{{ fmt(p.clicks) }}</td>
                    <td>{{ fmt(p.impressions) }}</td>
                    <td>{{ p.position }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="three-col">
          <section class="card">
            <h2 class="card__title">🌍 Mamlakatlar</h2>
            <ul class="mini">
              <li v-for="c in data.countries" :key="c.key">
                <span>{{ countryName(c.key) }}</span
                ><strong>{{ fmt(c.clicks) }} klik</strong>
              </li>
              <li v-if="!data.countries.length" class="empty">—</li>
            </ul>
          </section>
          <section class="card">
            <h2 class="card__title">📱 Qurilmalar</h2>
            <ul class="mini">
              <li v-for="d in data.devices" :key="d.key">
                <span>{{ DEVICES[d.key] ?? d.key }}</span
                ><strong>{{ fmt(d.clicks) }} klik</strong>
              </li>
              <li v-if="!data.devices.length" class="empty">—</li>
            </ul>
          </section>
          <section class="card">
            <h2 class="card__title">🗺 Sitemap</h2>
            <ul class="mini">
              <li v-for="s in data.sitemaps" :key="s.path" class="mini__col">
                <span class="mini__path">{{
                  s.path.replace(/^https?:\/\/[^/]+/, "")
                }}</span>
                <small>
                  {{
                    s.isPending
                      ? "⏳ Tekshirilmoqda"
                      : s.errors
                        ? `❌ ${s.errors} xato`
                        : "✅ Muvaffaqiyatli"
                  }}
                  <template v-if="s.warnings">
                    · ⚠️ {{ s.warnings }} ogohlantirish</template
                  >
                  · {{ s.submitted }} ta URL
                  <template v-if="s.lastDownloaded">
                    · Google o'qidi:
                    {{ formatDate(s.lastDownloaded) }}</template
                  >
                </small>
              </li>
              <li v-if="!data.sitemaps.length" class="empty">
                Sitemap yuborilmagan
              </li>
            </ul>
          </section>
        </div>

        <!-- Indekslash -->
        <section class="card">
          <div class="card__head">
            <h2 class="card__title">
              🗂 So'nggi maqolalar Google'da
              <template v-if="indexing">
                — {{ indexing.indexedCount }}/{{ indexing.items.length }} ta
                indeksda</template
              >
            </h2>
            <button
              class="btn btn--outline btn--sm"
              :disabled="indexLoading"
              @click="loadIndexing(!!indexing)"
            >
              {{
                indexLoading
                  ? "⏳ Tekshirilmoqda…"
                  : indexing
                    ? "🔄 Qayta tekshirish"
                    : "🔍 Tekshirish"
              }}
            </button>
          </div>
          <p v-if="!indexing && !indexLoading" class="card__sub">
            So'nggi 20 ta maqola Google indeksida bormi — tekshirish 10–30
            soniya oladi (natija 24 soat saqlanadi). Indekslanmaganlarini
            "So'rash" orqali Google'ga yuboring.
          </p>
          <div v-if="indexing" class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Maqola</th>
                  <th>Holat</th>
                  <th>Oxirgi tekshiruv (Google)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in indexing.items" :key="i.url">
                  <td class="table__strong">
                    <a :href="i.url" target="_blank" rel="noopener">{{
                      i.title
                    }}</a>
                    <small class="table__sub"
                      >chop etilgan: {{ formatDate(i.publishedAt) }}</small
                    >
                  </td>
                  <td>
                    <span
                      class="tag"
                      :class="
                        i.indexed
                          ? 'tag--ok'
                          : i.verdict === 'ERROR'
                            ? 'tag--bad'
                            : 'tag--warn'
                      "
                    >
                      {{
                        i.indexed
                          ? "✅ Indeksda"
                          : coverageText(i.coverageState, i.verdict)
                      }}
                    </span>
                  </td>
                  <td>
                    {{ i.lastCrawlTime ? formatDate(i.lastCrawlTime) : "—" }}
                  </td>
                  <td>
                    <a
                      v-if="!i.indexed"
                      :href="i.inspectLink"
                      target="_blank"
                      rel="noopener"
                      class="link-btn"
                    >
                      Indekslashni so'rash ↗
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const adminStore = useAdminStore();
const days = ref(28);
const metric = ref<"clicks" | "impressions">("clicks");
const data = ref<any>(null);
const loading = ref(false);
const error = ref("");
const indexing = ref<any>(null);
const indexLoading = ref(false);

const load = async () => {
  loading.value = true;
  error.value = "";
  const res = await adminStore.getSearchConsole(days.value);
  loading.value = false;
  if (res.success) data.value = res.data;
  else error.value = res.message;
};

const setDays = (d: number) => {
  days.value = d;
  load();
};

const loadIndexing = async (refresh = false) => {
  indexLoading.value = true;
  const res = await adminStore.getSearchConsoleIndexing(refresh);
  indexLoading.value = false;
  if (res.success) indexing.value = res.data;
  else error.value = res.message;
};

onMounted(load);

const dmy = (s: string) => s.split("-").reverse().join(".");
const fmt = (n: number) => Number(n || 0).toLocaleString("uz-UZ");

const dailyPoints = computed(() =>
  (data.value?.daily ?? []).map((d: any) => ({
    label: bucketLabel(d.date, "day"),
    value: d[metric.value],
  })),
);

const DEVICES: Record<string, string> = {
  MOBILE: "📱 Telefon",
  DESKTOP: "💻 Kompyuter",
  TABLET: "📟 Planshet",
};

const COUNTRIES: Record<string, string> = {
  uzb: "O'zbekiston",
  rus: "Rossiya",
  kaz: "Qozog'iston",
  kgz: "Qirg'iziston",
  tjk: "Tojikiston",
  tkm: "Turkmaniston",
  tur: "Turkiya",
  usa: "AQSh",
  kor: "Janubiy Koreya",
  deu: "Germaniya",
  gbr: "Buyuk Britaniya",
  are: "BAA",
  pol: "Polsha",
  ukr: "Ukraina",
};
const countryName = (c: string) => COUNTRIES[c] ?? c.toUpperCase();

// Google'ning indekslash holatlari — tushunarli o'zbekcha
const coverageText = (state: string | null, verdict: string) => {
  const s = String(state ?? "").toLowerCase();
  if (verdict === "ERROR") return "Tekshirib bo'lmadi";
  if (s.includes("discovered")) return "⏳ Topilgan, hali indekslanmagan";
  if (s.includes("crawled")) return "👀 Ko'rilgan, lekin indekslanmagan";
  if (s.includes("unknown")) return "❔ Google hali bilmaydi";
  if (s.includes("duplicate") || s.includes("canonical"))
    return "🔁 Boshqa sahifa asosiy deb olingan";
  if (s.includes("noindex")) return "🚫 noindex";
  if (s.includes("redirect")) return "↪️ Yo'naltirilgan";
  if (s.includes("404") || s.includes("not found")) return "❌ Topilmadi (404)";
  return state || "Indeksda emas";
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

.search-body {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

    .card__title {
      margin-bottom: 0;
    }
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  &__sub {
    font-size: 0.82rem;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
}

.chips {
  display: flex;
  gap: 0.35rem;

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
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
}

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;

  th {
    text-align: left;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: $text-muted;
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid $border-color;
    white-space: nowrap;
  }

  td {
    padding: 0.55rem 0.6rem;
    border-bottom: 1px solid $border-color;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  &__strong {
    font-weight: 600;

    a {
      color: $text-primary;
      text-decoration: none;

      &:hover {
        color: $primary;
      }
    }
  }

  &__sub {
    display: block;
    font-weight: 400;
    font-size: 0.72rem;
    color: $text-muted;
  }

  &__path a {
    color: $primary;
    text-decoration: none;
    word-break: break-all;
  }
}

.tag {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: $border-radius-pill;
  white-space: nowrap;

  &--ok {
    background: rgba(21, 128, 61, 0.08);
    color: var(--c-success-text);
  }
  &--warn {
    background: rgba(180, 83, 9, 0.08);
    color: var(--c-warning-text);
  }
  &--info {
    background: rgba(var(--c-primary-rgb), 0.08);
    color: $primary;
  }
  &--bad {
    background: rgba($danger, 0.08);
    color: var(--c-danger-text);
  }
}

.link-btn {
  font-size: 0.78rem;
  font-weight: 600;
  color: $primary;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.mini {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  font-size: 0.85rem;

  li {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__col {
    flex-direction: column;

    small {
      color: $text-secondary;
      line-height: 1.5;
    }
  }

  &__path {
    font-weight: 600;
    word-break: break-all;
  }
}

.setup {
  &__intro {
    font-size: 0.88rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  &__steps {
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.9rem;
    line-height: 1.6;

    a {
      color: $primary;
      font-weight: 600;
    }

    code {
      background: $bg-secondary;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.82em;
    }
  }

  &__note {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: $text-muted;
  }
}

.btn--sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
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
  margin-bottom: 1rem;

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: var(--c-danger-text);
  }

  &__more {
    margin-top: 0.35rem;
    color: $text-secondary;
  }
}
</style>
