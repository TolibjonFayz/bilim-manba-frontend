<template>
  <div class="articles-page" v-loading="loading">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="container">
        <div class="page-header__inner">
          <div class="page-header__left">
            <nav class="breadcrumb">
              <NuxtLink to="/" class="breadcrumb__item">
                🏠 Bosh sahifa
              </NuxtLink>
              <span class="breadcrumb__sep">›</span>
              <span class="breadcrumb__item breadcrumb__item--active">
                Maqolalar
              </span>
            </nav>
            <h1 class="page-header__title">Maqolalar</h1>
            <p class="page-header__subtitle">
              Barcha mavzulardagi eng sifatli va chuqur tahliliy materiallar
              to'plami.
            </p>
          </div>
          <div class="page-header__search">
            <div class="search-box">
              <span class="search-box__icon">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Maqola qidirish..."
                class="search-box__input"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN -->
    <section class="articles-section">
      <div class="container">
        <div class="articles-section__grid">
          <!-- CHAP: Maqolalar -->
          <div class="articles-main">
            <!-- Filter pills -->
            <div class="filter-bar">
              <div class="filter-bar__pills">
                <button
                  v-for="cat in allCategories"
                  :key="cat.slug"
                  class="filter-pill"
                  :class="{
                    'filter-pill--active': activeCategory === cat.slug,
                  }"
                  @click="activeCategory = cat.slug"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Results + sort -->
            <div class="results-bar">
              <span class="results-bar__count">
                <strong>{{ filteredArticles.length }}</strong> ta maqola topildi
              </span>
              <div class="results-bar__sort">
                <span>Saralash:</span>
                <select v-model="sortBy" class="results-bar__select">
                  <option value="newest">Eng yangi</option>
                  <option value="popular">Mashhur</option>
                  <option value="oldest">Eng eski</option>
                </select>
              </div>
            </div>

            <!-- Article cards -->
            <div class="article-list">
              <NuxtLink
                v-for="article in paginatedArticles"
                :key="article.id"
                :to="`/articles/${article.slug}`"
                class="article-card-h"
              >
                <!-- cover -->
                <div class="article-card-h__cover">
                  <img
                    v-if="article.coverImage"
                    :src="article.coverImage"
                    :alt="article.title"
                    style="width: 100%; height: 100%; object-fit: cover"
                  />
                  <div
                    v-else
                    class="article-card-h__cover-bg"
                    :style="{ background: article.gradient }"
                  >
                    <span class="article-card-h__cat-badge">
                      {{ article.category?.name }}
                    </span>
                  </div>
                </div>

                <!-- content -->
                <div class="article-card-h__content">
                  <span class="article-card-h__cat-label">{{
                    article.category?.name
                  }}</span>
                  <h3 class="article-card-h__title">{{ article.title }}</h3>
                  <p class="article-card-h__excerpt">{{ article.excerpt }}</p>
                  <div class="article-card-h__meta">
                    <div class="article-card-h__author">
                      <div class="article-card-h__avatar">
                        {{ article.author?.fullName?.[0] }}
                      </div>
                      <span class="article-card-h__author-name">{{
                        article.author?.fullName
                      }}</span>
                    </div>
                    <div class="article-card-h__stats">
                      <span>🕐 {{ article.readTime ?? 5 }} min</span>
                      <span>👁 {{ article.viewCount }}</span>
                    </div>
                    <span class="article-card-h__read">O'qish →</span>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Pagination -->
            <div class="pagination">
              <button
                class="pagination__btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                ← Oldingi
              </button>

              <div class="pagination__pages">
                <template v-for="page in totalPages" :key="page">
                  <button
                    v-if="page <= 3 || page === totalPages"
                    class="pagination__page"
                    :class="{
                      'pagination__page--active': currentPage === page,
                    }"
                    @click="currentPage = page"
                  >
                    {{ page }}
                  </button>
                  <span v-else-if="page === 4" class="pagination__dots"
                    >...</span
                  >
                </template>
              </div>

              <button
                class="pagination__btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                Keyingi →
              </button>
            </div>
          </div>

          <!-- O'NG: Sidebar -->
          <aside class="articles-sidebar">
            <!-- Mashhur maqolalar -->
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">🔥 MASHHUR MAQOLALAR</h3>
              <ol class="popular-list">
                <NuxtLink
                  v-for="item in popularArticles"
                  :key="item.id"
                  :to="`/articles/${item.slug}`"
                  class="popular-item"
                >
                  <div
                    class="popular-item__cover"
                    :style="{ background: item.gradient }"
                  />
                  <div class="popular-item__info">
                    <p class="popular-item__title">{{ item.title }}</p>
                    <span class="popular-item__views"
                      >👁 {{ item.viewCount }}</span
                    >
                  </div>
                </NuxtLink>
              </ol>
            </div>

            <!-- Kategoriyalar -->
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">📂 KATEGORIYALAR</h3>
              <ul class="sidebar-cats">
                <li
                  v-for="cat in sidebarCategories"
                  :key="cat.slug"
                  class="sidebar-cats__item"
                  @click="activeCategory = cat.slug"
                >
                  <span class="sidebar-cats__name">{{ cat.name }}</span>
                  <span class="sidebar-cats__count">{{
                    cat.articleCount ?? 0
                  }}</span>
                </li>
              </ul>
            </div>

            <!-- Teglar -->
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">🏷 TEGLAR</h3>
              <div class="tags-wrap">
                <span
                  v-for="tag in popularTags"
                  :key="tag.name"
                  class="tag-pill"
                  :style="{ background: tag.bg, color: tag.color }"
                >
                  #{{ tag.name }}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const articleStore = useArticleStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const activeCategory = ref("barchasi");
const sortBy = ref("newest");
const currentPage = ref(1);
const perPage = 4;
const loading = ref(false);

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
];

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    articleStore.getAllArticles(),
    categoryStore.getCategories(),
  ]);
  loading.value = false;
});

// Kategoriyalar filter uchun "Barchasi" qo'shamiz
const allCategories = computed(() => [
  { name: "Barchasi", slug: "barchasi" },
  ...(categoryStore.allCategories ?? []),
]);

// Maqolalarga gradient qo'shamiz
const articles = computed(() =>
  (articleStore.allArticles ?? []).map((a: any, i: number) => ({
    ...a,
    gradient: gradients[i % gradients.length],
  })),
);

const filteredArticles = computed(() => {
  let list = [...articles.value];

  if (activeCategory.value !== "barchasi") {
    list = list.filter((a: any) => a.category?.slug === activeCategory.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (a: any) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q),
    );
  }

  if (sortBy.value === "popular") {
    list.sort((a: any, b: any) => b.viewCount - a.viewCount);
  } else if (sortBy.value === "oldest") {
    list.reverse();
  }

  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredArticles.value.length / perPage)),
);

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredArticles.value.slice(start, start + perPage);
});

// Kategoriya o'zgarganda sahifani reset qilish
watch(activeCategory, () => {
  currentPage.value = 1;
});

// Sidebar
const sidebarCategories = computed(() =>
  (categoryStore.allCategories ?? []).slice(0, 5),
);

const popularArticles = computed(() =>
  [...(articleStore.allArticles ?? [])]
    .sort((a: any, b: any) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((a: any, i: number) => ({
      ...a,
      gradient: gradients[i % gradients.length],
    })),
);

const popularTags = ref([
  { name: "javascript", bg: "rgba(108,99,255,0.1)", color: "#6C63FF" },
  { name: "python", bg: "rgba(67,233,123,0.12)", color: "#22a85a" },
  { name: "algebra", bg: "rgba(255,101,132,0.1)", color: "#FF6584" },
  { name: "kvant", bg: "rgba(79,172,254,0.12)", color: "#2176d2" },
  { name: "tarix", bg: "rgba(250,112,154,0.1)", color: "#d94f82" },
  { name: "biologiya", bg: "rgba(161,140,209,0.12)", color: "#7b5ea7" },
]);
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
    max-width: 360px;
    line-height: 1.6;
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

// MAIN GRID
.articles-section {
  padding: 2.5rem 0 4rem;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2.5rem;
    align-items: start;

    @media (max-width: $desktop) {
      grid-template-columns: 1fr;
    }
  }
}

// FILTER BAR
.filter-bar {
  margin-bottom: 1.25rem;

  &__pills {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}

.filter-pill {
  padding: 0.45rem 1.1rem;
  border-radius: $border-radius-pill;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1.5px solid $border-color;
  background: #fff;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s;
  font-family: $font-primary;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &--active {
    background: $primary;
    border-color: $primary;
    color: #fff;

    &:hover {
      background: $primary-dark;
    }
  }
}

// RESULTS BAR
.results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  &__count {
    font-size: 0.875rem;
    color: $text-secondary;

    strong {
      color: $text-primary;
    }
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: $text-secondary;
  }

  &__select {
    border: 1.5px solid $border-color;
    border-radius: $border-radius-sm;
    padding: 0.35rem 0.75rem;
    font-size: 0.875rem;
    font-family: $font-primary;
    color: $primary;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    background: #fff;

    &:focus {
      border-color: $primary;
    }
  }
}

// ARTICLE CARDS (horizontal)
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card-h {
  display: grid;
  grid-template-columns: 200px 1fr;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-lg;
    border-color: rgba($primary, 0.25);

    .article-card-h__read {
      color: $primary-dark;
    }
  }

  @media (max-width: $tablet) {
    grid-template-columns: 140px 1fr;
  }

  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
  }

  // Cover
  &__cover {
    position: relative;
    overflow: hidden;

    @media (max-width: $mobile) {
      height: 160px;
    }
  }

  &__cover-bg {
    height: 100%;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.75rem;

    @media (max-width: $mobile) {
      min-height: 0;
    }
  }

  &__cat-badge {
    background: rgba(#fff, 0.9);
    color: $primary;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
    width: fit-content;
    margin-top: auto;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  // Content
  &__content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__cat-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: $primary;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.45;
    color: $text-primary;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__excerpt {
    font-size: 0.85rem;
    color: $text-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid $border-color;
    flex-wrap: wrap;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__author-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.78rem;
    color: $text-muted;
  }

  &__read {
    font-size: 0.875rem;
    color: $primary;
    font-weight: 600;
    margin-left: auto;
    white-space: nowrap;
    transition: color 0.15s;
  }
}

// PAGINATION
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  &__btn {
    padding: 0.5rem 1rem;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-pill;
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-secondary;
    background: #fff;
    cursor: pointer;
    font-family: $font-primary;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      border-color: $primary;
      color: $primary;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__pages {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__page {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1.5px solid $border-color;
    background: #fff;
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-secondary;
    cursor: pointer;
    font-family: $font-primary;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    &--active {
      background: $primary;
      border-color: $primary;
      color: #fff;
    }
  }

  &__dots {
    font-size: 0.875rem;
    color: $text-muted;
    padding: 0 0.25rem;
  }
}

// SIDEBAR
.articles-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 80px;
}

.sidebar-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.25rem;

  

  &__title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: $text-secondary;
    margin-bottom: 1rem;
  }
}

// POPULAR LIST
.popular-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  &__num {
    font-size: 0.8rem;
    font-weight: 700;
    color: $text-muted;
    flex-shrink: 0;
    min-width: 22px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.4;
    transition: color 0.15s;

    &:hover {
      color: $primary;
    }
  }

  &__views {
    font-size: 0.75rem;
    color: $text-muted;
  }
}

// SIDEBAR CATEGORIES
.sidebar-cats {
  list-style: none;
  display: flex;
  flex-direction: column;

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.5rem;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: $primary-light;
      padding-left: 0.85rem;

      .sidebar-cats__name {
        color: $primary;
      }
    }
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    transition: color 0.15s;
  }

  &__count {
    font-size: 0.78rem;
    font-weight: 600;
    color: $text-muted;
    background: $bg-secondary;
    padding: 0.1rem 0.5rem;
    border-radius: $border-radius-pill;
  }
}


// TAGS
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  display: inline-flex;
  padding: 0.3rem 0.7rem;
  border-radius: $border-radius-pill;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    opacity: 0.75;
  }
}
</style>
