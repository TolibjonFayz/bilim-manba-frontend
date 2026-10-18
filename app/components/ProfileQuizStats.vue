<template>
  <div class="sidebar-card qs">
    <h3 class="sidebar-card__title">🏆 Test ballari</h3>
    <div v-if="s" class="qs__grid">
      <div class="qs__item">
        <span>Jami ball</span>
        <strong>{{ s.all.points }}</strong>
      </div>
      <div class="qs__item">
        <span>Shu hafta</span>
        <strong>{{ s.week.points }}</strong>
      </div>
      <div class="qs__item">
        <span>Haftalik o'rin</span>
        <strong>{{ s.week.rank ? `${s.week.rank}-o'rin` : "—" }}</strong>
      </div>
      <div class="qs__item">
        <span>Testlar · aniqlik</span>
        <strong>{{ s.all.quizzes }} · {{ s.all.accuracy }}%</strong>
      </div>
    </div>
    <p v-if="s && !s.all.quizzes" class="qs__hint">
      Maqola oxiridagi testni yeching — har to'g'ri javob uchun 10 ball.
    </p>
    <NuxtLink to="/reyting" class="qs__link">Reytingni ko'rish →</NuxtLink>
  </div>
</template>

<script setup lang="ts">
/** Profil yon paneli: test ballari va haftalik o'rin (/quiz/me) */
interface Stat {
  points: number;
  quizzes: number;
  accuracy: number;
  rank: number | null;
}

const authStore = useAuthStore();
const s = ref<{ all: Stat; week: Stat; month: Stat } | null>(null);

onMounted(async () => {
  if (!authStore.token) return;
  try {
    s.value = await $fetch("/quiz/me", {
      baseURL: useRuntimeConfig().public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
  } catch {
    s.value = null;
  }
});
</script>

<style lang="scss" scoped>
.qs {
  margin-bottom: 1.25rem;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem 0.75rem;
    margin-bottom: 0.9rem;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    span {
      font-size: 0.72rem;
      font-weight: 700;
      color: $text-muted;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    strong {
      font-size: 1.15rem;
      font-weight: 800;
    }
  }

  &__hint {
    font-size: 0.82rem;
    color: $text-secondary;
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }

  &__link {
    font-size: 0.88rem;
    font-weight: 700;
    color: $primary;
  }
}
</style>
