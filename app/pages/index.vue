<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero__inner container">
        <div class="hero__badge">⚡ O'qish — eng foydali investitsiya!</div>

        <h1 class="hero__title">
          Bilim oling,<br />
          <span class="hero__title-gradient">rivojlaning</span>
        </h1>

        <p class="hero__subtitle">
          Zamonaviy texnologiyalar, ilm-fan va shaxsiy rivojlanishga oid eng
          saralangan maqolalar va hamjamiyat bir joyda.
        </p>

        <div class="hero__actions">
          <NuxtLink to="/articles" class="btn btn--primary">
            Maqolalarni ko'rish →
          </NuxtLink>
          <NuxtLink
            v-if="!authStore.isLoggedIn"
            to="/register"
            class="btn btn--outline"
          >
            Ro'yxatdan o'tish
          </NuxtLink>
        </div>
      </div>

      <!-- Background shapes -->
      <div class="hero__shape hero__shape--1" />
      <div class="hero__shape hero__shape--2" />
    </section>

    <!-- KATEGORIYALAR -->
    <section class="categories-section" v-loading="loading">
      <div class="container">
        <div class="section-header">
          <div class="section-header__left">
            <h2>
              <Icon name="map:compass" size="1em" mode="css" />
              Kategoriyalar
            </h2>
            <p>O'zingizga yoqqan yo'nalishni tanlang</p>
          </div>
          <NuxtLink to="/categories" class="section-header__link">
            Barchasini ko'rish →
          </NuxtLink>
        </div>

        <div class="categories-list">
          <NuxtLink
            v-for="cat in categoryStore.allCategories"
            :key="cat.id"
            :to="`/categories/${cat.name}`"
            class="category-chip"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </NuxtLink>

          <!-- Skeleton -->
          <template v-if="!categoryStore.allCategories?.length">
            <div
              v-for="i in 6"
              :key="i"
              class="category-chip category-chip--skeleton"
            />
          </template>
        </div>
      </div>
    </section>

    <!-- MAQOLALAR -->
    <section class="articles-section" v-loading="loading">
      <div class="container">
        <div class="section-header">
          <div class="section-header__left">
            <h2>✨ So'nggi maqolalar</h2>
            <p>Ekspertlarimiz tomonidan yozilgan eng yangi materiallar</p>
          </div>
        </div>

        <div class="articles-grid">
          <ArticleCard
            v-for="article in articleStore.allArticles.slice(0, 6)"
            :key="article.id"
            :article="article"
          />
        </div>

        <div class="articles-section__more">
          <NuxtLink to="/articles" class="btn btn--primary"> Ko'proq </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const articleStore = useArticleStore();
const categoryStore = useCategoryStore();
const loading = ref(false);

useHead({
  title: "Bilim Manba — O'zbek tilidagi bilim platformasi",
  meta: [
    {
      name: "description",
      content:
        "Zamonaviy texnologiyalar, ilm-fan va shaxsiy rivojlanishga oid eng saralangan maqolalar",
    },
    { property: "og:title", content: "Bilim Manba" },
    {
      property: "og:description",
      content: "O'zbek tilidagi eng yaxshi bilim platformasi",
    },
    { property: "og:type", content: "website" },
  ],
});

onMounted(async () => {
  loading.value = true;
  await categoryStore.getCategories();
  await articleStore.getAllArticles();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
// HERO
.hero {
  position: relative;
  background: $bg-secondary;
  padding: 6rem 0 5rem;
  overflow: hidden;
  text-align: center;

  @media (max-width: $tablet) {
    padding: 4rem 0 3.5rem;
  }

  @media (max-width: $mobile) {
    padding: 3rem 0 2.5rem;
  }

  &__inner {
    position: relative;
    z-index: 2;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba($primary, 0.1);
    color: $primary;
    border: 1px solid rgba($primary, 0.2);
    padding: 0.4rem 1rem;
    border-radius: $border-radius-pill;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }

  &__title-gradient {
    background: linear-gradient(135deg, $primary, $secondary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $text-secondary;
    max-width: 560px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;

    @media (max-width: $mobile) {
      font-size: 1rem;
      margin-bottom: 2rem;
    }
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;

    &--1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba($primary, 0.15), transparent);
      top: -100px;
      right: -100px;
    }

    &--2 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba($secondary, 0.1), transparent);
      bottom: -80px;
      left: -80px;
    }
  }
}

// CATEGORIES
.categories-section {
  padding: 4rem 0;
}

.categories-list {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: $bg-primary;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-pill;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: $primary;
    color: $primary;
    background: $primary-light;
    transform: translateY(-2px);
    box-shadow: $shadow-sm;
  }

  &--skeleton {
    width: 120px;
    height: 42px;
    background: $bg-secondary;
    animation: pulse 1.5s infinite;
  }
}

// ARTICLES
.articles-section {
  padding: 2rem 0 4rem;

  &__search {
    flex-shrink: 0;
  }

  &__more {
    text-align: center;
    margin-top: 2.5rem;
  }
}

.search-input {
  padding: 0.6rem 1.25rem;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-pill;
  font-size: 0.9rem;
  outline: none;
  width: 220px;
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: $desktop) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

// Skeleton animation
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
