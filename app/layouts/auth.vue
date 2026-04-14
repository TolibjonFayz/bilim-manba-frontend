<template>
  <div class="auth-page">
    <div class="auth-wrap">
      <!-- CHAP -->
      <div class="auth-wrap__left">
        <div class="auth-wrap__left-content">
          <NuxtLink to="/" class="auth-wrap__back">← Bosh sahifaga</NuxtLink>
          <h1 class="auth-wrap__title">{{ title }}</h1>
          <ul class="auth-wrap__features">
            <li><span>✅</span><span>Premium maqolalar</span></li>
            <li><span>✅</span><span>PDF yuklab olish</span></li>
          </ul>
        </div>
        <div class="auth-wrap__price-card">
          <span>⭐</span>
          <div>
            <div class="auth-wrap__price-amount">15,000 UZS/oy</div>
            <div class="auth-wrap__price-label">Premium a'zolik narxi</div>
          </div>
        </div>
        <div class="auth-wrap__shape auth-wrap__shape--1" />
        <div class="auth-wrap__shape auth-wrap__shape--2" />
      </div>

      <!-- O'NG -->
      <div class="auth-wrap__right">
        <NuxtLink to="/" class="auth-wrap__logo">
          <img
            src="../assets/images/Logo no text transparent.png"
            alt="Bilim Manba"
            class="auth-wrap__logo-image"
          />
          <span>Bilim Manba</span>
        </NuxtLink>
        <div class="auth-wrap__form">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const title = computed(() =>
  route.path === "/login"
    ? "Qaytib kelganingizdan xursandmiz!"
    : "Bilim olamiga xush kelibsiz!",
);
</script>

<style lang="scss" scoped>
// Sahifa foni
.auth-page {
  min-height: 100vh;
  background: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

// O'rtadagi container — card ko'rinishida
.auth-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 960px; // 👈 container kengligi
  min-height: 580px;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-lg;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
    max-width: 440px;
  }

  // CHAP — gradient
  &__left {
    background: linear-gradient(135deg, #6c63ff 0%, #a855f7 50%, #ff6584 100%);
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;

    @media (max-width: $tablet) {
      display: none;
    }
  }

  &__left-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__back {
    color: rgba(#fff, 0.8);
    font-size: 0.875rem;
    font-weight: 500;
    width: fit-content;
    transition: color 0.2s;
    &:hover {
      color: #fff;
    }
  }

  &__title {
    font-size: clamp(1.5rem, 2.5vw, 2.25rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  &__features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      color: rgba(#fff, 0.9);
      font-size: 0.95rem;
      font-weight: 500;
    }
  }

  &__price-card {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: rgba(#fff, 0.15);
    border: 1px solid rgba(#fff, 0.25);
    backdrop-filter: blur(10px);
    border-radius: $border-radius;
    padding: 0.85rem 1.25rem;
    width: fit-content;
  }

  &__price-amount {
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
  }

  &__price-label {
    font-size: 0.75rem;
    color: rgba(#fff, 0.75);
  }

  &__shape {
    position: absolute;
    border-radius: 50%;
    z-index: 1;

    &--1 {
      width: 300px;
      height: 300px;
      background: rgba(#fff, 0.07);
      top: -80px;
      right: -80px;
    }

    &--2 {
      width: 200px;
      height: 200px;
      background: rgba(#fff, 0.05);
      bottom: 60px;
      left: -60px;
    }
  }

  // O'NG — form
  &__right {
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 2.5rem;
    overflow-y: auto;

    @media (max-width: $mobile) {
      padding: 1.75rem 1.25rem;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
    color: $primary;
    margin-bottom: 1.5rem;

    &-image {
      width: 35px;
    }
  }

  &__form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
