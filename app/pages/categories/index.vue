<template>
  <div class="categories-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="container">
        <div class="page-header__inner">
          <div class="page-header__left">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
              <NuxtLink to="/" class="breadcrumb__item">
                🏠 Bosh sahifa
              </NuxtLink>
              <span class="breadcrumb__sep">›</span>
              <span class="breadcrumb__item breadcrumb__item--active">
                Kategoriyalar
              </span>
            </nav>

            <h1 class="page-header__title">Kategoriyalar</h1>
            <p class="page-header__subtitle">
              O'zingizga yoqqan yo'nalishni tanlang va bilim olishni boshlang
            </p>
          </div>

          <!-- Search -->
          <div class="page-header__search">
            <div class="search-box">
              <span class="search-box__icon">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Kategoriya qidirish..."
                class="search-box__input"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES GRID -->
    <section class="categories-section" v-loading="loading">
      <div class="container">
        <div v-if="filteredCategories.length" class="categories-grid">
          <NuxtLink
            v-for="cat in filteredCategories"
            :key="cat.id"
            :to="`/categories/${cat?.name}`"
            class="cat-card"
          >
            <!-- Gradient banner -->
            <div
              class="cat-card__banner"
              :style="{ background: colors[cat.id % colors.length] }"
            >
              <span class="cat-card__emoji">{{ cat?.icon }}</span>
            </div>

            <!-- Body -->
            <div class="cat-card__body">
              <h3 class="cat-card__name">{{ cat?.name }}</h3>
              <p class="cat-card__desc">{{ cat?.slug }}</p>

              <div class="cat-card__footer">
                <span class="cat-card__count"
                  >{{ cat?.articles.length ?? 0 }} ta maqola</span
                >
                <span class="cat-card__arrow">→</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <span class="empty-state__emoji">😔</span>
          <h3 class="empty-state__title">Kategoriya topilmadi</h3>
          <p class="empty-state__desc">Boshqa so'z bilan qidiring</p>
          <button class="btn btn--primary" @click="searchQuery = ''">
            Hammasini ko'rish
          </button>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-item__icon feature-item__icon--blue">ℹ️</div>
            <div>
              <h4 class="feature-item__title">Doimiy yangilanish</h4>
              <p class="feature-item__desc">
                Kategoriyalar ro'yxati har hafta yangi maqolalar bilan to'ldirib
                boriladi.
              </p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-item__icon feature-item__icon--coral">⭐</div>
            <div>
              <h4 class="feature-item__title">Ekspertlar maslahati</h4>
              <p class="feature-item__desc">
                Har bir yo'nalish bo'yicha malakali mutaxassislar tomonidan
                yozilgan kontent.
              </p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-item__icon feature-item__icon--purple">∞</div>
            <div>
              <h4 class="feature-item__title">To'siqsiz o'rgan</h4>
              <p class="feature-item__desc">
                Vaqt yo'q dema — materiallar 24/7 ochiq. Istalgan qurilmada,
                istalgan joyda, mutlaqo bepul.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const categoryStore = useCategoryStore();
const searchQuery = ref("");
const loading = ref(false);

const colors = ref([
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #e96c3a, #f7c59f)",
  "linear-gradient(135deg, #5c6bc0, #b39ddb)",
]);

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categoryStore.allCategories;
  const q = searchQuery.value.toLowerCase();
  return categoryStore.allCategories.filter(
    (c: any) =>
      c?.name.toLowerCase().includes(q) ||
      c?.description?.toLowerCase().includes(q),
  );
});

useHead({
  title: "Kategoriyalar — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Bilim Manba kategoriyalari — o'zingizga yoqqan yo'nalishni tanlang",
    },
  ],
});

onMounted(async () => {
  loading.value = true;
  await categoryStore.getCategories();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
// PAGE HEADER
.page-header {
  background: $bg-secondary;
  padding: 2.5rem 0;
  border-bottom: 1px solid $border-color;

  &__inner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;

    @media (max-width: $tablet) {
      flex-direction: column;
    }
  }

  &__title {
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0.75rem 0 0.5rem;
  }

  &__subtitle {
    color: $text-secondary;
    font-size: 0.95rem;
  }

  &__search {
    flex-shrink: 0;
    padding-top: 2.5rem;

    @media (max-width: $tablet) {
      padding-top: 0;
      width: 100%;
    }
  }
}

// BREADCRUMB
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  &__item {
    color: $text-secondary;
    transition: color 0.15s;

    &:hover {
      color: $primary;
    }

    &--active {
      color: $primary;
      font-weight: 600;
    }
  }

  &__sep {
    color: $text-muted;
  }
}

// SEARCH BOX
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-pill;
  padding: 0.65rem 1.25rem;
  width: 280px;
  transition: all 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }

  &__icon {
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  &__input {
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    width: 100%;
    color: $text-primary;

    &::placeholder {
      color: $text-muted;
    }
  }

  @media (max-width: $tablet) {
    width: 100%;
  }
}

// CATEGORIES SECTION
.categories-section {
  padding: 3rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: $desktop) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
  }
}

// CATEGORY CARD
.cat-card {
  background: #fff;
  border-radius: $border-radius;
  border: 1px solid $border-color;
  overflow: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: rgba($primary, 0.3);

    .cat-card__arrow {
      transform: translateX(4px);
      color: $primary;
    }

    .cat-card__emoji {
      transform: scale(1.15);
    }
  }

  // Gradient banner
  &__banner {
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  &__emoji {
    font-size: 3rem;
    transition: transform 0.3s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }

  // Card body
  &__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  &__name {
    font-size: 1.1rem;
    font-weight: 700;
    color: $text-primary;
  }

  &__desc {
    font-size: 0.875rem;
    color: $text-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
  }

  &__count {
    font-size: 0.875rem;
    color: $text-secondary;
    font-weight: 500;
  }

  &__arrow {
    font-size: 1.1rem;
    color: $primary;
    font-weight: 700;
    transition: all 0.2s ease;
  }
}

// EMPTY STATE
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &__emoji {
    font-size: 4rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__desc {
    color: $text-secondary;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
}

// FEATURES
.features-section {
  padding: 3rem 0 4rem;
  border-top: 1px solid $border-color;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;

    &--blue {
      background: rgba(#4facfe, 0.15);
    }

    &--coral {
      background: rgba($secondary, 0.15);
    }

    &--purple {
      background: rgba($primary, 0.12);
      font-size: 1.2rem;
      font-weight: 700;
      color: $primary;
    }
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.35rem;
  }

  &__desc {
    font-size: 0.85rem;
    color: $text-secondary;
    line-height: 1.6;
  }
}
</style>
