<template>
  <div class="about-page">
    <!-- HERO -->
    <section class="about-hero">
      <div class="container">
        <div class="about-hero__inner">
          <div class="about-hero__badge">📚 Bilim platformasi</div>
          <h1 class="about-hero__title">Bilim Manba haqida</h1>
          <p class="about-hero__desc">
            Bilim Manba — O'zbekistondagi zamonaviy bilim platformasi.
            Texnologiya, fan, psixologiya va shaxsiy rivojlanish bo'yicha
            saralangan maqolalar bir joyda.
          </p>
        </div>
      </div>
    </section>

    <!-- MISSION -->
    <section class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-card">
            <div class="about-card__icon">🎯</div>
            <h3 class="about-card__title">Maqsadimiz</h3>
            <p class="about-card__desc">
              O'zbek tilidagi sifatli bilim kontentini hamma uchun ochiq va
              qulay qilish. Har bir maqola chuqur tadqiq qilingan va amaliy
              foydaga ega.
            </p>
          </div>
          <div class="about-card">
            <div class="about-card__icon">💡</div>
            <h3 class="about-card__title">Nima taklif qilamiz</h3>
            <p class="about-card__desc">
              Texnologiya, fan, psixologiya, biznes va shaxsiy rivojlanish
              mavzularida muntazam yangilanib turadigan maqolalar to'plami.
            </p>
          </div>
          <div class="about-card">
            <div class="about-card__icon">🌍</div>
            <h3 class="about-card__title">Kimlar uchun</h3>
            <p class="about-card__desc">
              Bilimga chanqoq, o'z sohasida o'sishni xohlovchi, dunyo
              yangiliklari bilan qiziquvchi barcha o'zbek tillidagi
              foydalanuvchilar uchun.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="about-stats">
      <div class="container">
        <div class="about-stats__grid">
          <div class="about-stats__item">
            <span class="about-stats__num">50+</span>
            <span class="about-stats__label">Maqolalar</span>
          </div>
          <div class="about-stats__item">
            <span class="about-stats__num">10+</span>
            <span class="about-stats__label">Kategoriyalar</span>
          </div>
          <div class="about-stats__item">
            <span class="about-stats__num">2026</span>
            <span class="about-stats__label">Yaratilgan yil</span>
          </div>
          <div class="about-stats__item">
            <span class="about-stats__num">🇺🇿</span>
            <span class="about-stats__label">O'zbek tilida</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta">
      <div class="container">
        <div class="about-cta__inner">
          <h2 class="about-cta__title">Bilim olishni boshlang</h2>
          <p class="about-cta__desc">
            Minglab maqolalar sizi kutmoqda. Bepul ro'yxatdan o'ting va barcha
            imkoniyatlardan foydalaning.
          </p>
          <div class="about-cta__actions">
            <NuxtLink to="/articles" class="btn btn--primary">
              Maqolalarni ko'rish →
            </NuxtLink>
            <NuxtLink to="/register" class="btn btn--outline">
              Ro'yxatdan o'tish
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Biz haqimizda — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Bilim Manba — O'zbekistondagi zamonaviy bilim platformasi. Texnologiya, fan, psixologiya va shaxsiy rivojlanish bo'yicha saralangan maqolalar.",
    },
  ],
});
</script>

<style lang="scss" scoped>
.about-page {
  padding-bottom: 4rem;
}

// HERO
.about-hero {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.06),
    rgba(245, 158, 11, 0.04)
  );
  border-bottom: 1px solid $border-color;
  padding: 5rem 0 4rem;
  text-align: center;

  @media (max-width: $mobile) {
    padding: 3rem 0 2.5rem;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(99, 102, 241, 0.1);
    color: $primary;
    font-size: 0.82rem;
    font-weight: 700;
    padding: 0.4rem 1rem;
    border-radius: $border-radius-pill;
    margin-bottom: 1.25rem;
    letter-spacing: 0.03em;
  }

  &__title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: $text-primary;
    margin-bottom: 1.25rem;
    line-height: 1.2;
  }

  &__desc {
    font-size: 1.1rem;
    color: $text-secondary;
    line-height: 1.7;
    max-width: 600px;
    margin: 0 auto;

    @media (max-width: $mobile) {
      font-size: 0.95rem;
    }
  }
}

// SECTION
.about-section {
  padding: 4rem 0;

  @media (max-width: $mobile) {
    padding: 2.5rem 0;
  }
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

.about-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  padding: 2rem 1.75rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: rgba($primary, 0.3);
  }

  &__icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 0.75rem;
  }

  &__desc {
    font-size: 0.9rem;
    color: $text-secondary;
    line-height: 1.7;
  }
}

// STATS
.about-stats {
  background: $bg-secondary;
  border-top: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  padding: 3rem 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    text-align: center;

    @media (max-width: $tablet) {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: $mobile) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__num {
    font-size: 2.25rem;
    font-weight: 800;
    color: $primary;
    letter-spacing: -0.03em;
  }

  &__label {
    font-size: 0.85rem;
    color: $text-secondary;
    font-weight: 500;
  }
}

// CTA
.about-cta {
  padding: 4rem 0;

  @media (max-width: $mobile) {
    padding: 2.5rem 0;
  }

  &__inner {
    background: linear-gradient(135deg, #6366f1, #f59e0b);
    border-radius: $border-radius-lg;
    padding: 3.5rem 2rem;
    text-align: center;
    color: #fff;

    @media (max-width: $mobile) {
      padding: 2.5rem 1.5rem;
    }
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.75rem;

    @media (max-width: $mobile) {
      font-size: 1.4rem;
    }
  }

  &__desc {
    font-size: 1rem;
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.btn--outline {
  background: rgba(#fff, 0.15);
  color: #fff;
  border: 2px solid rgba(#fff, 0.5);
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(#fff, 0.25);
  }
}
</style>
