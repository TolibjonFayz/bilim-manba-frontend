<template>
  <div class="error-page">
    <div class="error-page__inner">
      <div class="error-page__code">404</div>
      <div class="error-page__emoji">🔍</div>
      <h1 class="error-page__title">Sahifa topilmadi</h1>
      <p class="error-page__desc">
        Siz qidirgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
      </p>
      <div class="error-page__actions">
        <NuxtLink to="/" class="btn btn--primary"> 🏠 Bosh sahifaga </NuxtLink>
        <NuxtLink to="/articles" class="btn btn--secondary">
          📚 Maqolalar
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: any }>();

useHead({
  title: "404 — Sahifa topilmadi | Bilim Manba",
});
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--color-bg-secondary);

  &__inner {
    text-align: center;
    max-width: 480px;
  }

  &__code {
    font-size: 8rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.05em;
    background: linear-gradient(135deg, #6366f1, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;

    @media (max-width: $mobile) {
      font-size: 5rem;
    }
  }

  &__emoji {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 0.75rem;

    @media (max-width: $mobile) {
      font-size: 1.4rem;
    }
  }

  &__desc {
    font-size: 0.95rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.btn--secondary {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-pill;
  border: 1.5px solid $border-color;
  color: $text-secondary;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: $primary;
    color: $primary;
  }
}
</style>
