<template>
  <div class="rank container">
    <header class="rank__head">
      <span class="rank__badge">🏆 Test reytingi</span>
      <h1 class="rank__title">Kim eng ko'p bilim yig'di?</h1>
      <p class="rank__sub">
        Har maqola oxirida 3 savollik test bor. Har to'g'ri javob uchun
        <strong>10 ball</strong>, hammasi to'g'ri bo'lsa yana
        <strong>10 ball</strong> bonus. Har test uchun ball faqat birinchi
        urinishda beriladi. Haftalik reyting har dushanba yangidan boshlanadi.
      </p>
    </header>

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
      <!-- O'z natijam -->
      <div v-if="data?.me" class="me card">
        <div class="me__item">
          <span>Mening o'rnim</span>
          <strong>{{ data.me.rank ? `${data.me.rank}-o'rin` : "—" }}</strong>
        </div>
        <div class="me__item">
          <span>Ball</span>
          <strong>{{ data.me.points }}</strong>
        </div>
        <div class="me__item">
          <span>Yechilgan testlar</span>
          <strong>{{ data.me.quizzes }}</strong>
        </div>
        <div class="me__item">
          <span>Aniqlik</span>
          <strong>{{ data.me.accuracy }}%</strong>
        </div>
      </div>
      <div v-else-if="!authStore.isLoggedIn" class="cta card">
        <span>🔒 Ball to'plash va reytingga chiqish uchun</span>
        <NuxtLink to="/register" class="btn btn--primary"
          >Ro'yxatdan o'ting</NuxtLink
        >
        <NuxtLink to="/login" class="cta__login">yoki kiring</NuxtLink>
      </div>

      <div v-if="loading" class="rank__empty">Yuklanmoqda…</div>
      <div v-else-if="failed" class="rank__empty">
        Reyting yuklanmadi — birozdan keyin qayta urinib ko'ring.
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

      <ol v-else class="board">
        <li
          v-for="r in data.top"
          :key="r.rank"
          class="board__row"
          :class="{ 'is-me': r.me, [`is-top${r.rank}`]: r.rank <= 3 }"
        >
          <span class="board__rank">{{ MEDALS[r.rank - 1] ?? r.rank }}</span>
          <span class="board__name"
            >{{ r.name }}<small v-if="r.me"> (siz)</small></span
          >
          <span class="board__meta"
            >{{ r.quizzes }} test · {{ r.accuracy }}%</span
          >
          <span class="board__points">{{ r.points }}</span>
        </li>
      </ol>

      <template #fallback>
        <div class="rank__empty">Yuklanmoqda…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
type Period = "week" | "month" | "all";
interface Board {
  period: Period;
  top: {
    rank: number;
    name: string;
    points: number;
    quizzes: number;
    accuracy: number;
    me: boolean;
  }[];
  me: {
    points: number;
    quizzes: number;
    accuracy: number;
    rank: number | null;
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
const period = ref<Period>("week");
const data = ref<Board | null>(null);
const loading = ref(true);
const failed = ref(false);

// Reyting tez o'zgaradi va "mening o'rnim" token talab qiladi — brauzerda olinadi
const load = async () => {
  loading.value = true;
  failed.value = false;
  try {
    const token = authStore.token;
    data.value = await $fetch<Board>("/quiz/leaderboard", {
      baseURL: useRuntimeConfig().public.apiBase,
      query: { period: period.value },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch {
    failed.value = true;
  }
  loading.value = false;
};

watch(period, load);
onMounted(load);
</script>

<style lang="scss" scoped>
.rank {
  padding-top: 2.5rem;
  padding-bottom: 4rem;
  max-width: 820px;

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

  &__empty {
    color: $text-secondary;
    padding: 1.25rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
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

.tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: $border-radius-pill;
  background: $bg-secondary;
  border: 1px solid $border-color;
  margin-bottom: 1.25rem;

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

.me {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 1rem 1.25rem;
  gap: 0.75rem;

  @media (max-width: $mobile) {
    grid-template-columns: repeat(2, 1fr);
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    span {
      font-size: 0.75rem;
      color: $text-muted;
      font-weight: 600;
    }

    strong {
      font-size: 1.35rem;
      font-weight: 800;
    }
  }
}

.cta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  font-weight: 600;

  &__login {
    color: $primary;
    font-size: 0.9rem;
  }
}

.board {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__row {
    display: grid;
    grid-template-columns: 2.5rem 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1rem;
    background: $bg-primary;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;

    &.is-top1 {
      border-color: rgba(245, 158, 11, 0.5);
    }

    &.is-me {
      border-color: $primary;
      background: rgba(var(--c-primary-rgb), 0.06);
    }

    @media (max-width: $mobile) {
      grid-template-columns: 2.25rem 1fr auto;
    }
  }

  &__rank {
    font-size: 1.15rem;
    font-weight: 800;
    text-align: center;
    color: $text-secondary;
  }

  &__name {
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    small {
      color: $primary;
      font-weight: 600;
    }
  }

  &__meta {
    font-size: 0.8rem;
    color: $text-muted;

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
