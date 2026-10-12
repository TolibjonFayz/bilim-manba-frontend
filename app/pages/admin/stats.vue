<template>
  <div class="admin-stats-page">
    <div class="page-head">
      <div>
        <h1 class="admin-page__title">📈 Statistika</h1>
        <p v-if="report" class="page-head__sub">
          {{ rangeText }} · oldingi davr ({{ prevRangeText }}) bilan
          solishtirilgan
        </p>
      </div>
      <div class="tabs" role="tablist">
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

    <div v-if="error" class="alert alert--danger">⚠️ {{ error }}</div>

    <div v-loading="loading" class="stats-body">
      <template v-if="report">
        <div v-if="trackingNote" class="alert alert--info">
          ℹ️ {{ trackingNote }}
        </div>

        <!-- Asosiy ko'rsatkichlar -->
        <div class="kpi-grid">
          <AdminKpi
            icon="👁"
            label="Ko'rishlar"
            :value="report.current.views"
            :previous="report.previous.views"
            hint="Mehmonlar ham hisoblanadi"
          />
          <AdminKpi
            icon="👤"
            label="Yangi foydalanuvchilar"
            :value="report.current.newUsers"
            :previous="report.previous.newUsers"
          />
          <AdminKpi
            icon="📖"
            label="Faol o'quvchilar"
            :value="report.current.activeReaders"
            :previous="report.previous.activeReaders"
            hint="Login qilib o'qiganlar"
          />
          <AdminKpi
            icon="❤️"
            label="Like'lar"
            :value="report.current.likes"
            :previous="report.previous.likes"
          />
          <AdminKpi
            icon="💬"
            label="Izohlar"
            :value="report.current.comments"
            :previous="report.previous.comments"
          />
          <AdminKpi
            icon="✉️"
            label="Yangi obunachilar"
            :value="report.current.subscribers"
            :previous="report.previous.subscribers"
          />
          <AdminKpi
            icon="📝"
            label="Chop etilgan maqolalar"
            :value="report.current.published"
            :previous="report.previous.published"
          />
        </div>

        <!-- Grafik -->
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
          <!-- Eng ko'p o'qilgan maqolalar -->
          <section class="card">
            <h2 class="card__title">🏆 Eng ko'p o'qilgan maqolalar</h2>
            <p v-if="!report.topArticles.length" class="empty">
              Bu davrda ko'rishlar hali yo'q.
            </p>
            <ol v-else class="rank">
              <li
                v-for="a in report.topArticles"
                :key="a.id"
                class="rank__item"
              >
                <div class="rank__row">
                  <NuxtLink
                    :to="`/admin/articles/${a.id}/preview`"
                    class="rank__title"
                    >{{ a.title }}</NuxtLink
                  >
                  <strong class="rank__num">{{ fmt(a.views) }}</strong>
                </div>
                <div class="rank__bar">
                  <span
                    :style="{
                      width: pct(a.views, report.topArticles[0].views),
                    }"
                  />
                </div>
                <small v-if="a.category" class="rank__meta">{{
                  a.category
                }}</small>
              </li>
            </ol>
          </section>

          <!-- Kategoriyalar -->
          <section class="card">
            <h2 class="card__title">📂 Kategoriyalar bo'yicha ko'rishlar</h2>
            <p v-if="!report.topCategories.length" class="empty">
              Bu davrda ko'rishlar hali yo'q.
            </p>
            <ul v-else class="rank">
              <li
                v-for="c in report.topCategories"
                :key="c.id"
                class="rank__item"
              >
                <div class="rank__row">
                  <span class="rank__title">{{ c.name }}</span>
                  <strong class="rank__num"
                    >{{ fmt(c.views) }}
                    <small>({{ share(c.views) }})</small></strong
                  >
                </div>
                <div class="rank__bar rank__bar--alt">
                  <span
                    :style="{
                      width: pct(c.views, report.topCategories[0].views),
                    }"
                  />
                </div>
              </li>
            </ul>
          </section>
        </div>

        <!-- Butun davr -->
        <section class="card">
          <h2 class="card__title">🗂 Butun davr uchun</h2>
          <div class="totals">
            <div>
              <span>Foydalanuvchilar</span
              ><strong>{{ fmt(report.totals.users) }}</strong>
            </div>
            <div>
              <span>Premium</span
              ><strong>{{ fmt(report.totals.premium) }}</strong>
            </div>
            <div>
              <span>Chop etilgan maqolalar</span
              ><strong>{{ fmt(report.totals.articles) }}</strong>
            </div>
            <div>
              <span>Qoralamalar</span
              ><strong>{{ fmt(report.totals.drafts) }}</strong>
            </div>
            <div>
              <span>Jami ko'rishlar</span
              ><strong>{{ fmt(report.totals.views) }}</strong>
            </div>
            <div>
              <span>Like'lar</span
              ><strong>{{ fmt(report.totals.likes) }}</strong>
            </div>
            <div>
              <span>Izohlar</span
              ><strong>{{ fmt(report.totals.comments) }}</strong>
            </div>
            <div>
              <span>Email obunachilar</span
              ><strong>{{ fmt(report.totals.subscribers) }}</strong>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const PERIODS = [
  { value: "day", label: "Kunlik" },
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
  { value: "year", label: "Yillik" },
] as const;

const METRICS = [
  { key: "views", label: "Ko'rishlar" },
  { key: "newUsers", label: "Foydalanuvchilar" },
  { key: "likes", label: "Like'lar" },
  { key: "published", label: "Maqolalar" },
] as const;

const adminStore = useAdminStore();
const route = useRoute();
const router = useRouter();

const period = ref<string>(
  PERIODS.some((p) => p.value === route.query.period)
    ? String(route.query.period)
    : "week",
);
const metric = ref<(typeof METRICS)[number]["key"]>("views");
const report = ref<any>(null);
const loading = ref(false);
const error = ref("");

const load = async () => {
  loading.value = true;
  error.value = "";
  const res = await adminStore.getStatsReport(period.value);
  loading.value = false;
  if (res.success) report.value = res.data;
  else error.value = res.message;
};

const setPeriod = (p: string) => {
  period.value = p;
  router.replace({ query: { ...route.query, period: p } });
  load();
};

onMounted(load);

const dmy = (s: string) => s.split("-").reverse().join(".");
const rangeText = computed(() =>
  report.value.range.from === report.value.range.to
    ? `Bugun, ${dmy(report.value.range.from)}`
    : `${dmy(report.value.range.from)} – ${dmy(report.value.range.to)}`,
);
const prevRangeText = computed(() => {
  const r = report.value.previousRange;
  return r.from === r.to ? dmy(r.from) : `${dmy(r.from)} – ${dmy(r.to)}`;
});

const UNIT_TEXT: Record<string, string> = {
  day: "kunma-kun",
  week: "haftama-hafta",
  month: "oyma-oy",
};
const chartTitle = computed(() => {
  const m = METRICS.find((x) => x.key === metric.value)!.label;
  const n = report.value?.series.points.length ?? 0;
  const unit = report.value?.series.unit;
  const span =
    unit === "day"
      ? `so'nggi ${n} kun`
      : unit === "week"
        ? `so'nggi ${n} hafta`
        : `so'nggi ${n} oy`;
  return `${m} — ${span}, ${UNIT_TEXT[unit] ?? ""}`;
});

const chartPoints = computed(() =>
  (report.value?.series.points ?? []).map((p: any) => ({
    label: bucketLabel(p.bucket, report.value.series.unit),
    value: p[metric.value],
  })),
);

// Kunlik ko'rishlar 2026-10-12 dan yig'ila boshlagan — oldingi davr bo'sh ko'rinishi tabiiy
const trackingNote = computed(() => {
  const since = report.value?.totals.viewsTrackedSince;
  if (!since)
    return "Kunlik ko'rishlar statistikasi endi yig'ila boshlaydi — birinchi o'qishlardan keyin grafik to'ladi.";
  if (since > report.value.previousRange.from)
    return `Ko'rishlar ${dmy(since)} dan beri kunma-kun hisoblanmoqda — undan oldingi kunlar grafikda 0 ko'rinadi.`;
  return "";
});

const fmt = (n: number) => Number(n || 0).toLocaleString("uz-UZ");
const pct = (v: number, max: number) =>
  `${Math.max(3, (v / (max || 1)) * 100)}%`;
const share = (v: number) => {
  const total = (report.value?.topCategories ?? []).reduce(
    (s: number, c: any) => s + c.views,
    0,
  );
  return total ? `${Math.round((v / total) * 100)}%` : "0%";
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
  background: #fff;
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
  background: #fff;
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
    background: #fff;
    border-radius: $border-radius-pill;
    padding: 0.3rem 0.75rem;
    font-family: $font-primary;
    font-size: 0.78rem;
    font-weight: 600;
    color: $text-secondary;
    cursor: pointer;

    &.is-active {
      border-color: $primary;
      background: rgba($primary, 0.08);
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
    background: rgba($primary, 0.06);
    border: 1px solid rgba($primary, 0.2);
    color: $text-primary;
  }
}
</style>
