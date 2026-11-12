<template>
  <div class="sess">
    <p v-if="!sessions.length" class="sess__empty">Bu davrda tashrif yo'q.</p>
    <ul v-else class="sess__list">
      <li v-for="s in sessions" :key="s.id" class="sess__item" :class="{ 'is-open': openId === s.id }">
        <button class="sess__head" :aria-expanded="openId === s.id" @click="toggle(s.id)">
          <span class="sess__time">{{ timeText(s.startedAt) }}</span>
          <span class="sess__who">
            <strong v-if="s.userName">{{ s.userName }}</strong>
            <template v-else>{{ s.visits > 1 ? `Qaytgan mehmon (${s.visits}-tashrif)` : "Yangi mehmon" }}</template>
          </span>
          <span class="sess__chips">
            <span class="chip">{{ s.source }}</span>
            <span class="chip" :title="`${s.device}, ${s.os}, ${s.browser}`">{{ deviceIcon(s.device) }} {{ s.os }}</span>
            <span v-if="s.country" class="chip">{{ s.country }}</span>
          </span>
          <span class="sess__nums">
            {{ s.pageviews }} sahifa · {{ fmtDuration(s.activeSeconds) }}
          </span>
          <span class="sess__arrow" aria-hidden="true">▾</span>
        </button>

        <div v-if="openId === s.id" class="sess__body">
          <p v-if="loading" class="sess__empty">Yuklanmoqda…</p>
          <p v-else-if="error" class="sess__empty">⚠️ {{ error }}</p>
          <template v-else-if="detail">
            <p class="sess__meta">
              Kirish: <strong>{{ landing(detail.session) }}</strong>
              <template v-if="detail.session.referrer"> · Kelgan joyi: {{ detail.session.referrer }}</template>
              <template v-if="detail.session.utmCampaign"> · Kampaniya: {{ detail.session.utmCampaign }}</template>
              · {{ detail.session.browser }}, ekran {{ detail.session.screen || "?" }}
              <template v-if="detail.session.userEmail"> · {{ detail.session.userEmail }}</template>
            </p>
            <ol class="tl">
              <li
                v-for="(e, i) in steps"
                :key="i"
                class="tl__step"
                :class="{ 'is-muted': e.muted }"
              >
                <span class="tl__time">{{ clock(e.createdAt) }}</span>
                <span class="tl__icon" aria-hidden="true">{{ e.icon }}</span>
                <span class="tl__text">{{ e.text }}</span>
              </li>
            </ol>
            <p v-if="detail.visits.length > 1" class="sess__meta">
              Bu odamning boshqa tashriflari:
              <template v-for="(v, i) in detail.visits.filter((x: any) => x.id !== s.id)" :key="v.id">
                <button class="sess__link" @click="toggle(v.id, true)">{{ timeText(v.startedAt) }}</button><template v-if="i < detail.visits.length - 2">, </template>
              </template>
            </p>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// So'nggi tashriflar: kim, qayerdan, qaysi qurilmada; bosilsa — qadamma-qadam yo'li
defineProps<{ sessions: any[] }>();

const adminStore = useAdminStore();
const openId = ref<string | null>(null);
const detail = ref<any>(null);
const loading = ref(false);
const error = ref("");

const toggle = async (id: string, force = false) => {
  if (openId.value === id && !force) {
    openId.value = null;
    return;
  }
  openId.value = id;
  detail.value = null;
  error.value = "";
  loading.value = true;
  const res = await adminStore.analyticsApi(`/session/${id}`);
  loading.value = false;
  if (res.success && res.data) detail.value = res.data;
  else error.value = res.message || "Topilmadi";
};

// Oraliq "faol vaqt" yozuvlaridan faqat har sahifaning oxirgisi ko'rsatiladi
const steps = computed(() => {
  const ev = (detail.value?.events ?? []) as any[];
  const lastExit = new Map<string, number>();
  ev.forEach((e, i) => {
    if (e.type === "page_exit" && e.data?.pv) lastExit.set(e.data.pv, i);
  });
  return ev
    .filter((e, i) => e.type !== "page_exit" || lastExit.get(e.data?.pv) === i)
    .map((e) => ({ ...describeEvent(e), createdAt: e.createdAt }));
});

const pad = (n: number) => String(n).padStart(2, "0");
const tashkent = (iso: string) => new Date(new Date(iso).getTime() + 5 * 3600 * 1000);
const clock = (iso: string) => {
  const d = tashkent(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};
const timeText = (iso: string) => {
  const d = tashkent(iso);
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
const landing = (s: any) => {
  const p = s.landingPath || "/";
  return p === "/" ? "Bosh sahifa" : decodeURIComponent(p);
};
</script>

<style lang="scss" scoped>
.sess {
  &__empty {
    font-size: 0.85rem;
    color: $text-muted;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__item {
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    overflow: hidden;

    &.is-open {
      border-color: rgba(var(--c-primary-rgb), 0.45);
    }
  }

  &__head {
    width: 100%;
    display: grid;
    grid-template-columns: 6.5rem minmax(0, 1fr) auto auto 1rem;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.8rem;
    background: $bg-primary;
    border: none;
    text-align: left;
    font-family: $font-primary;
    font-size: 0.83rem;
    color: $text-primary;
    cursor: pointer;

    &:hover {
      background: $bg-secondary;
    }

    @media (max-width: 760px) {
      grid-template-columns: 1fr auto;
      gap: 0.35rem 0.75rem;

      .sess__chips {
        grid-column: 1 / -1;
      }
      .sess__arrow {
        display: none;
      }
    }
  }

  &__time {
    color: $text-secondary;
    font-variant-numeric: tabular-nums;
  }

  &__who {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chips {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  &__nums {
    color: $text-secondary;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  &__arrow {
    color: $text-muted;
    transition: transform 0.15s;

    .is-open & {
      transform: rotate(180deg);
    }
  }

  &__body {
    padding: 0.75rem 0.9rem 0.9rem;
    background: $bg-secondary;
    border-top: 1px solid $border-color;
  }

  &__meta {
    font-size: 0.76rem;
    color: $text-secondary;
    margin: 0 0 0.6rem;
    line-height: 1.5;
    word-break: break-word;
  }

  &__link {
    border: none;
    background: none;
    padding: 0;
    color: $primary;
    font: inherit;
    cursor: pointer;
    text-decoration: underline;
  }
}

.chip {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  background: $bg-secondary;
  border: 1px solid $border-color;
  color: $text-secondary;
  white-space: nowrap;
}

.tl {
  list-style: none;
  margin: 0 0 0.6rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  &__step {
    display: grid;
    grid-template-columns: 4.2rem 1.4rem minmax(0, 1fr);
    gap: 0.4rem;
    font-size: 0.82rem;
    line-height: 1.45;
    padding: 0.2rem 0;
    border-left: 2px solid rgba(var(--c-primary-rgb), 0.25);
    padding-left: 0.6rem;

    &.is-muted {
      color: $text-secondary;
      font-size: 0.76rem;
    }
  }

  &__time {
    color: $text-muted;
    font-variant-numeric: tabular-nums;
  }

  &__text {
    word-break: break-word;
  }
}
</style>
