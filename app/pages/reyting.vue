<template>
  <div class="rank container">
    <header class="rank__head">
      <span class="rank__badge">🏆 Test reytingi</span>
      <h1 class="rank__title">Kim eng ko'p bilim yig'di?</h1>
      <p class="rank__sub">
        Har maqola oxirida 3 savollik test bor: har to'g'ri javob
        <strong>10 ball</strong>, hammasi to'g'ri bo'lsa yana
        <strong>10 ball</strong> bonus. Ro'yxatdan o'tmagan bo'lsangiz ham
        ballaringiz saqlanadi — kirsangiz profilingizga o'tadi.
      </p>
    </header>

    <div class="rank__bar">
      <div class="tabs" role="tablist">
        <button
          v-for="t in TABS"
          :key="t.key"
          type="button"
          role="tab"
          class="tabs__item"
          :class="{ 'is-active': period === t.key }"
          :aria-selected="period === t.key"
          @click="period = t.key"
        >
          {{ t.label }}
        </button>
      </div>
      <ClientOnly>
        <span v-if="data && !loading" class="rank__count">
          👥 {{ data.participants }} ishtirokchi
        </span>
      </ClientOnly>
    </div>

    <ClientOnly>
      <!-- O'z natijam (foydalanuvchi yoki mehmon) -->
      <div v-if="data?.me && data.me.quizzes > 0" class="me">
        <div class="me__who">
          <span class="me__avatar">{{ initials(myName) }}</span>
          <div>
            <span class="me__label">Siz</span>
            <strong class="me__name">{{ myName }}</strong>
            <span v-if="data.me.guest" class="chip">mehmon</span>
          </div>
        </div>
        <div class="me__stats">
          <div class="me__item">
            <span>O'rin</span>
            <strong>{{ data.me.rank ? `${data.me.rank}` : "—" }}</strong>
          </div>
          <div class="me__item">
            <span>Ball</span>
            <strong>{{ data.me.points }}</strong>
          </div>
          <div class="me__item">
            <span>Testlar</span>
            <strong>{{ data.me.quizzes }}</strong>
          </div>
          <div class="me__item">
            <span>Aniqlik</span>
            <strong>{{ data.me.accuracy }}%</strong>
          </div>
        </div>
        <p v-if="data.me.guest" class="me__save">
          Ballaringiz shu brauzerda saqlanyapti.
          <NuxtLink to="/register?next=/reyting">Ro'yxatdan o'ting</NuxtLink>
          — reytingda ismingiz chiqadi va ballar hech qachon yo'qolmaydi.
        </p>
      </div>
      <div v-else class="cta">
        <span>📖 Maqola o'qing, oxiridagi testni yeching — siz ham shu yerda bo'lasiz!</span>
        <NuxtLink to="/articles" class="btn btn--primary">Test yechish</NuxtLink>
      </div>

      <div v-if="loading" class="rank__empty">Yuklanmoqda…</div>
      <div v-else-if="failed" class="rank__empty">
        Reyting yuklanmadi — birozdan keyin qayta urinib ko'ring.
        <button type="button" class="btn btn--outline" @click="load">Qayta urinish</button>
      </div>
      <div v-else-if="!data?.top.length" class="rank__empty card">
        <span class="rank__empty-emoji">🌱</span>
        {{
          period === "week"
            ? "Bu hafta hali hech kim ball to'plamadi — birinchi bo'ling!"
            : "Hali hech kim ball to'plamadi — birinchi bo'ling!"
        }}
        <NuxtLink to="/articles">Maqola o'qib, test yechish →</NuxtLink>
      </div>

      <template v-else>
        <!-- Shohsupa: 2 — 1 — 3 -->
        <div class="podium">
          <template v-for="(r, i) in podium" :key="i">
          <div v-if="!r" class="podium__place is-empty" aria-hidden="true" />
          <div
            v-else
            class="podium__place"
            :class="[`is-${r.rank}`, { 'is-me': r.me }]"
          >
            <span class="podium__medal">{{ MEDALS[r.rank - 1] }}</span>
            <span class="podium__avatar">{{ initials(r.name) }}</span>
            <strong class="podium__name" :title="r.name">{{ r.name }}</strong>
            <span v-if="r.guest" class="chip">mehmon</span>
            <span v-if="r.me" class="chip chip--me">siz</span>
            <span class="podium__points">{{ r.points }} <small>ball</small></span>
            <span class="podium__meta">{{ r.quizzes }} test · {{ r.accuracy }}%</span>
            <div class="podium__step">{{ r.rank }}</div>
          </div>
          </template>
        </div>

        <ol v-if="rest.length" class="board">
          <li
            v-for="r in rest"
            :key="r.rank"
            class="board__row"
            :class="{ 'is-me': r.me }"
          >
            <span class="board__rank">{{ r.rank }}</span>
            <span class="board__avatar">{{ initials(r.name) }}</span>
            <span class="board__name">
              <span class="board__text">{{ r.name }}</span>
              <span v-if="r.guest" class="chip">mehmon</span>
              <span v-if="r.me" class="chip chip--me">siz</span>
            </span>
            <span class="board__meta">{{ r.quizzes }} test · {{ r.accuracy }}%</span>
            <span class="board__points">{{ r.points }}</span>
          </li>
        </ol>
      </template>

      <template #fallback>
        <div class="rank__empty">Yuklanmoqda…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
type Period = "week" | "month" | "all";
interface Row {
  rank: number;
  name: string;
  guest: boolean;
  points: number;
  quizzes: number;
  accuracy: number;
  me: boolean;
}
interface Board {
  period: Period;
  participants: number;
  top: Row[];
  me: {
    points: number;
    quizzes: number;
    accuracy: number;
    rank: number | null;
    name?: string;
    guest?: boolean;
  } | null;
}

const TABS: { key: Period; label: string }[] = [
  { key: "week", label: "Shu hafta" },
  { key: "month", label: "Shu oy" },
  { key: "all", label: "Hamma vaqt" },
];
const MEDALS = ["🥇", "🥈", "🥉"];

useHead({
  title: "Test reytingi — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Maqolalar oxiridagi testlarni yeching, ball to'plang va haftalik reytingda birinchi bo'ling. Bilim Manba o'quvchilari reytingi.",
    },
  ],
});

const authStore = useAuthStore();
const userStore = useUserStore();
const period = ref<Period>("week");
const data = ref<Board | null>(null);
const loading = ref(true);
const failed = ref(false);

/** 1-o'rin o'rtada: [2, 1, 3] (bo'sh o'rin — null) */
const podium = computed(() => {
  const t = data.value?.top ?? [];
  return [t[1] ?? null, t[0] ?? null, t[2] ?? null] as (Row | null)[];
});
const rest = computed(() => (data.value?.top ?? []).slice(3));

const myName = computed(() => {
  const me = data.value?.me;
  if (me?.name) return me.name;
  const row = data.value?.top.find((r) => r.me);
  return row?.name ?? userStore.oneUserInfo?.fullName ?? "Siz";
});

const initials = (name: string) =>
  String(name || "?")
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";

// Reyting tez o'zgaradi va "mening o'rnim" token yoki mehmon ID talab qiladi — brauzerda
const load = async () => {
  loading.value = true;
  failed.value = false;
  try {
    const token = authStore.token;
    const guest = token ? undefined : peekQuizGuestId() ?? undefined;
    data.value = await $fetch<Board>("/quiz/leaderboard", {
      baseURL: useRuntimeConfig().public.apiBase,
      query: { period: period.value, ...(guest ? { guest } : {}) },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch {
    failed.value = true;
  }
  loading.value = false;
};

watch(period, load);
watch(() => authStore.token, load);
onMounted(() => {
  load();
  // Kirgach mehmon ballari ko'chirildi — reytingni yangilash
  window.addEventListener("quiz-merged", load);
});
onBeforeUnmount(() => window.removeEventListener("quiz-merged", load));
</script>

<style lang="scss" scoped>
.rank {
  padding-top: 2.5rem;
  padding-bottom: 4rem;
  max-width: 860px;

  &__head {
    margin-bottom: 1.5rem;
  }

  &__badge {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.25rem 0.75rem;
    border-radius: $border-radius-pill;
    background: rgba(var(--c-primary-rgb), 0.12);
    color: $primary;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 0.6rem;
  }

  &__sub {
    color: $text-secondary;
    line-height: 1.6;
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  &__count {
    font-size: 0.88rem;
    font-weight: 600;
    color: $text-secondary;
  }

  &__empty {
    color: $text-secondary;
    padding: 1.25rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;

    &.card {
      padding: 2rem 1.25rem;
    }

    a {
      color: $primary;
      font-weight: 700;
    }
  }

  &__empty-emoji {
    font-size: 2rem;
  }
}

.card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  margin-bottom: 1.25rem;
}

.chip {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: $border-radius-pill;
  background: $bg-secondary;
  border: 1px solid $border-color;
  color: $text-muted;
  vertical-align: middle;
  white-space: nowrap;

  &--me {
    background: rgba(var(--c-primary-rgb), 0.14);
    border-color: transparent;
    color: $primary;
  }
}

.tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: $border-radius-pill;
  background: $bg-secondary;
  border: 1px solid $border-color;

  &__item {
    padding: 0.45rem 1rem;
    border-radius: $border-radius-pill;
    font-size: 0.88rem;
    font-weight: 700;
    color: $text-secondary;
    background: transparent;

    &.is-active {
      background: var(--c-primary-solid);
      color: #fff;
    }
  }
}

/* --- Mening natijam --- */
.me {
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: $border-radius;
  border: 1px solid rgba(var(--c-primary-rgb), 0.35);
  background: linear-gradient(
    135deg,
    rgba(var(--c-primary-rgb), 0.12),
    rgba(var(--c-primary-rgb), 0.03)
  );

  &__who {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.9rem;
  }

  &__avatar {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--c-primary-solid);
    color: #fff;
    font-weight: 800;
    flex-shrink: 0;
  }

  &__label {
    display: block;
    font-size: 0.72rem;
    color: $text-muted;
    font-weight: 600;
  }

  &__name {
    font-size: 1.05rem;
    margin-right: 0.35rem;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;

    @media (max-width: $mobile) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.55rem 0.7rem;
    border-radius: $border-radius-sm;
    background: $bg-primary;

    span {
      font-size: 0.72rem;
      color: $text-muted;
      font-weight: 600;
    }

    strong {
      font-size: 1.3rem;
      font-weight: 800;
    }
  }

  &__save {
    margin-top: 0.85rem;
    font-size: 0.86rem;
    color: $text-secondary;
    line-height: 1.5;

    a {
      color: $primary;
      font-weight: 700;
    }
  }
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  background: $bg-primary;
  border: 1px dashed $border-color;
  border-radius: $border-radius;
}

/* --- Shohsupa --- */
.podium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: 0.75rem;
  margin: 0.5rem 0 1.5rem;

  &__place {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.3rem;
    min-width: 0;

    &.is-me .podium__avatar {
      box-shadow: 0 0 0 3px $primary;
    }
  }

  &__medal {
    font-size: 1.8rem;
    line-height: 1;
  }

  &__avatar {
    width: 3.4rem;
    height: 3.4rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.1rem;
    color: #fff;
    background: linear-gradient(135deg, #5850ec, #8b5cf6);

    .is-1 & {
      width: 4.2rem;
      height: 4.2rem;
      font-size: 1.35rem;
      background: linear-gradient(135deg, #f59e0b, #f97316);
    }

    .is-2 & {
      background: linear-gradient(135deg, #94a3b8, #64748b);
    }

    .is-3 & {
      background: linear-gradient(135deg, #d97706, #92400e);
    }
  }

  &__name {
    max-width: 100%;
    font-size: 0.92rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__points {
    font-weight: 800;
    font-size: 1.15rem;
    color: $primary;

    small {
      font-size: 0.7rem;
      font-weight: 600;
      color: $text-muted;
    }
  }

  &__meta {
    font-size: 0.74rem;
    color: $text-muted;
  }

  &__step {
    width: 100%;
    margin-top: 0.4rem;
    border-radius: $border-radius-sm $border-radius-sm 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0.5rem;
    font-weight: 800;
    font-size: 1.4rem;
    color: rgba(255, 255, 255, 0.9);
    background: linear-gradient(180deg, #5850ec, #4338ca);
    height: 4.5rem;

    .is-1 & {
      height: 6.5rem;
      background: linear-gradient(180deg, #f59e0b, #d97706);
    }

    .is-2 & {
      height: 5rem;
      background: linear-gradient(180deg, #94a3b8, #64748b);
    }

    .is-3 & {
      height: 3.8rem;
      background: linear-gradient(180deg, #d97706, #92400e);
    }
  }
}

/* --- Qolganlar --- */
.board {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  &__row {
    display: grid;
    grid-template-columns: 2rem 2.2rem 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    background: $bg-primary;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;

    &.is-me {
      border-color: $primary;
      background: rgba(var(--c-primary-rgb), 0.06);
    }

    @media (max-width: $mobile) {
      grid-template-columns: 1.6rem 2rem 1fr auto;
      gap: 0.55rem;
    }
  }

  &__rank {
    font-weight: 800;
    color: $text-muted;
    text-align: center;
  }

  &__avatar {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 800;
    color: $primary;
    background: rgba(var(--c-primary-rgb), 0.12);

    @media (max-width: $mobile) {
      width: 2rem;
      height: 2rem;
    }
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    font-weight: 700;
  }

  &__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    font-size: 0.8rem;
    color: $text-muted;
    white-space: nowrap;

    @media (max-width: $mobile) {
      display: none;
    }
  }

  &__points {
    font-weight: 800;
    font-size: 1.05rem;
    color: $primary;
    min-width: 3rem;
    text-align: right;
  }
}
</style>
