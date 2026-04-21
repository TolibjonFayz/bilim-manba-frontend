<template>
  <div class="category-page" v-loading="loading">
    <!-- CATEGORY HEADER -->
    <section class="cat-header">
      <div class="container">
        <div class="cat-header__inner">
          <div class="cat-header__left">
            <span class="cat-header__label">KATEGORIYA</span>
            <div class="cat-header__title-row">
              <div class="cat-header__icon">
                {{ category?.icon }}
              </div>
              <h1 class="cat-header__title">{{ category?.name }}</h1>
            </div>
            <p class="cat-header__desc">{{ category?.slug }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT -->
    <section class="cat-content">
      <div class="container">
        <div class="cat-content__grid">
          <!-- CHAP: Maqolalar ro'yxati -->
          <div class="cat-content__main">
            <!-- Header row -->
            <div class="articles-header">
              <div class="articles-header__left">
                <h2 class="articles-header__title">So'nggi maqolalar</h2>
                <span class="articles-header__count"
                  >{{ filteredArticles.length }} ta natija</span
                >
              </div>
              <div class="articles-header__sort">
                <span class="articles-header__sort-label">Saralash:</span>
                <select v-model="sortBy" class="articles-header__select">
                  <option value="newest">Eng yangi</option>
                  <option value="popular">Mashhur</option>
                  <option value="oldest">Eng eski</option>
                </select>
              </div>
            </div>

            <!-- Article list -->
            <div class="article-list" v-if="filteredArticles.length">
              <NuxtLink
                v-for="article in filteredArticles"
                :key="article.id"
                :to="`/articles/${article.slug}`"
                class="article-row"
              >
                <!-- Cover -->
                <div class="article-row__cover">
                  <img
                    :src="article?.coverImage"
                    class="article-row__cover-placeholder"
                    loading="lazy"
                  />
                </div>

                <!-- Info -->
                <div class="article-row__info">
                  <h3 class="article-row__title">{{ article?.title }}</h3>
                  <p class="article-row__excerpt">{{ article?.excerpt }}</p>
                  <div class="article-row__meta">
                    <span class="article-row__meta-item">
                      📅
                      {{
                        article?.createdAt
                          ? new Date(article?.createdAt).toLocaleDateString(
                              "uz-UZ",
                            )
                          : ""
                      }}
                    </span>
                    <span class="article-row__meta-item">
                      👁 {{ article?.viewCount }}
                    </span>

                    <NuxtLink
                      :to="`/articles/${article.slug}`"
                      class="article-row__read-link"
                      @click.stop
                    >
                      O'qish →
                    </NuxtLink>
                  </div>
                </div>
              </NuxtLink>

              <!-- Load more -->
              <button class="load-more-btn">Ko'proq yuklash →</button>
            </div>

            <el-empty v-else description="Maqolalar topilmadi" />
            <!-- Breadcrumb -->
            <nav class="breadcrumb breadcrumb--bottom">
              <NuxtLink to="/" class="breadcrumb__item">Bosh sahifa</NuxtLink>
              <span class="breadcrumb__sep">›</span>
              <NuxtLink to="/categories" class="breadcrumb__item">
                Kategoriyalar
              </NuxtLink>
              <span class="breadcrumb__sep">›</span>
              <span class="breadcrumb__item breadcrumb__item--active">
                {{ category?.name }}
              </span>
            </nav>
          </div>

          <!-- O'NG: Sidebar -->
          <aside class="cat-sidebar">
            <!-- Mashhur maqolalar -->
            <div class="sidebar-block">
              <h3 class="sidebar-block__title">
                <span class="sidebar-block__title-icon">🔥</span>
                MASHHUR MAQOLALAR
              </h3>
              <div class="popular-items-list">
                <NuxtLink
                  v-for="item in popularArticles"
                  :key="item?.id"
                  :to="`/articles/${item?.slug}`"
                  class="popular-item"
                >
                  <div class="popular-item__cover">
                    <img
                      v-if="item?.coverImage"
                      :src="item?.coverImage"
                      :alt="item?.title"
                      class="popular-item__cover-img"
                    />
                    <div
                      v-else
                      class="popular-item__cover-placeholder"
                      :style="{ background: item?.gradient }"
                    />
                  </div>
                  <div class="popular-item__info">
                    <p class="popular-item__title">{{ item?.title }}</p>
                    <span class="popular-item__views">
                      👁 {{ item?.viewCount }}
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Tavsiya etilgan -->
            <div class="sidebar-block" v-if="featuredArticle">
              <h3 class="sidebar-block__title">
                <span class="sidebar-block__title-icon">✨</span>
                TAVSIYA ETILGAN
              </h3>
              <NuxtLink
                :to="`/articles/${featuredArticle?.slug}`"
                class="featured-card"
              >
                <div class="featured-card__header">
                  <img
                    v-if="featuredArticle?.coverImage"
                    :src="featuredArticle?.coverImage"
                    :alt="featuredArticle?.title"
                    class="featured-card__image"
                  />
                  <div
                    v-else
                    class="featured-card__image featured-card__image--placeholder"
                    :style="{ background: featuredArticle?.gradient }"
                  />
                  <div class="featured-card__badge">👑 TOP</div>
                </div>
                <div class="featured-card__body">
                  <h4 class="featured-card__title">
                    {{ featuredArticle?.title }}
                  </h4>
                  <p class="featured-card__desc">
                    {{ featuredArticle?.excerpt }}
                  </p>
                  <div class="featured-card__meta">
                    <span class="featured-card__meta-item">
                      👁 {{ featuredArticle?.viewCount }}
                    </span>
                    <span class="featured-card__meta-item">
                      📅
                      {{
                        featuredArticle?.createdAt
                          ? new Date(
                              featuredArticle?.createdAt,
                            ).toLocaleDateString("uz-UZ")
                          : ""
                      }}
                    </span>
                  </div>
                  <button class="featured-card__btn">
                    <span>O'qish</span>
                    <span class="featured-card__btn-arrow">→</span>
                  </button>
                </div>
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const loading = ref(false);
const sortBy = ref("newest");
const articleStore = useArticleStore();
const categoryStore = useCategoryStore();

const category = computed(() => categoryStore.categoryBySlug);

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
];

const article = computed(() => articleStore.oneArticle);

const popularArticles = computed(() =>
  (articleStore.allArticles ?? [])
    .filter((a: any) => a.id !== article.value?.id)
    .sort((a: any, b: any) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((a: any, i: number) => ({
      ...a,
      gradient: gradients[i % gradients.length],
    })),
);

const filteredArticles = computed(() => {
  let list = [...(categoryStore.categoryBySlug?.articles ?? [])].map(
    (a, i) => ({
      ...a,
      gradient: gradients[i % gradients.length],
    }),
  );

  if (sortBy.value === "popular") {
    list.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sortBy.value === "oldest") {
    list.reverse();
  }

  return list;
});

const featuredArticle = computed(() => {
  const articles = articleStore.allArticles ?? [];
  if (articles.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * articles.length);
  return articles[randomIndex];
});

onMounted(async () => {
  loading.value = true;
  const res = await categoryStore.getCategoryBySlug(
    route.params.slug as string,
  );
  await articleStore.getAllArticles();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
// CATEGORY HEADER
.cat-header {
  background: $bg-secondary;
  padding: 2.5rem 0 2rem;
  border-bottom: 1px solid $border-color;

  &__label {
    font-size: 0.75rem;
    font-weight: 700;
    color: $primary;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;

    &::after {
      content: "";
      display: inline-block;
      width: 40px;
      height: 2px;
      background: $primary;
      border-radius: 2px;
    }
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__icon {
    width: 56px;
    height: 56px;
    background: rgba($primary, 0.1);
    border-radius: $border-radius;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    flex-shrink: 0;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__desc {
    color: $text-secondary;
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 620px;
  }
}

// MAIN GRID
.cat-content {
  padding: 2.5rem 0 4rem;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 3rem;
    align-items: start;

    @media (max-width: $desktop) {
      grid-template-columns: 1fr;
    }
  }
}

// ARTICLES HEADER
.articles-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  &__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__count {
    font-size: 0.85rem;
    color: $text-muted;
    background: $bg-secondary;
    border: 1px solid $border-color;
    padding: 0.2rem 0.65rem;
    border-radius: $border-radius-pill;
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
    color: $text-primary;
    outline: none;
    cursor: pointer;
    background: #fff;

    &:focus {
      border-color: $primary;
    }
  }
}

// ARTICLE ROW
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.25rem;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    border-color: rgba($primary, 0.25);

    .article-row__read-link {
      color: darken($primary, 10%);
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

  &__cover-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__cat-badge {
    background: rgba(#fff, 0.9);
    color: $primary;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
  }

  // Info
  &__info {
    padding: 1.25rem 1.25rem 1.25rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @media (max-width: $mobile) {
      padding: 1rem;
    }
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
    flex-wrap: wrap;
  }

  &__meta-item {
    font-size: 0.8rem;
    color: $text-muted;
  }

  &__read-link {
    font-size: 0.875rem;
    color: $primary;
    font-weight: 600;
    margin-left: auto;
    white-space: nowrap;
    transition: color 0.15s;

    &:hover {
      text-decoration: underline;
    }
  }
}

// LOAD MORE
.load-more-btn {
  display: block;
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.85rem;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  font-size: 0.9rem;
  font-weight: 600;
  color: $text-secondary;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: $font-primary;

  &:hover {
    border-color: $primary;
    color: $primary;
    background: $primary-light;
  }
}

// BREADCRUMB
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  flex-wrap: wrap;

  &--bottom {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid $border-color;
  }

  &__item {
    color: $text-secondary;
    transition: color 0.15s;

    &:hover {
      color: $primary;
    }

    &--active {
      background: $primary-light;
      color: $primary;
      font-weight: 600;
      padding: 0.2rem 0.65rem;
      border-radius: $border-radius-pill;
    }
  }

  &__sep {
    color: $text-muted;
  }
}

// SIDEBAR
.cat-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 80px;
}

.sidebar-block {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.25rem;

  &--gradient {
    background: linear-gradient(135deg, $primary, $secondary);
    border: none;
  }

  &__title {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: $text-secondary;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &--white {
      color: rgba(#fff, 0.85);
    }

    &-icon {
      font-size: 0.85rem;
    }
  }

  &__desc {
    font-size: 0.875rem;
    color: rgba(#fff, 0.85);
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  &__btn {
    width: 100%;
    padding: 0.7rem;
    background: #fff;
    color: $primary;
    border-radius: $border-radius-pill;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    font-family: $font-primary;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-md;
    }
  }
}

// POPULAR LIST
.popular-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.popular-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  transition: all 0.15s;
  border-radius: $border-radius-sm;
  padding: 0.5rem;
  margin: -0.5rem;

  &:hover {
    background: $bg-secondary;
  }

  &:hover .popular-item__cover-img {
    transform: scale(1.05);
  }

  &__cover {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: $border-radius-sm;
    overflow: hidden;
    flex-shrink: 0;
  }

  &__cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &__cover-placeholder {
    width: 100%;
    height: 100%;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 0.825rem;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.4;
    transition: color 0.15s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    &:hover {
      color: $primary;
    }
  }

  &__views {
    font-size: 0.75rem;
    color: $text-muted;
    display: block;
    margin-top: 0.25rem;
  }
}

.popular-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  &__num {
    font-size: 0.8rem;
    font-weight: 700;
    color: $text-muted;
    flex-shrink: 0;
    min-width: 24px;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    line-height: 1.4;
    transition: color 0.15s;

    &:hover {
      color: $primary;
    }
  }
}

// TAGS
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  display: inline-flex;
  padding: 0.3rem 0.75rem;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $border-radius-pill;
  font-size: 0.8rem;
  font-weight: 500;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: $primary-light;
    border-color: $primary;
    color: $primary;
  }
}

// FEATURED CARD
.featured-card {
  border-radius: $border-radius;
  overflow: hidden;
  border: 1.5px solid transparent;
  background: #fff;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba($primary, 0.05),
      rgba($secondary, 0.05)
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba($primary, 0.15);
    border-color: rgba($primary, 0.2);

    &::before {
      opacity: 1;
    }

    .featured-card__image {
      transform: scale(1.08);
    }

    .featured-card__btn {
      background: $primary;
      color: #fff;
      border-color: $primary;

      .featured-card__btn-arrow {
        transform: translateX(3px);
      }
    }
  }

  &__header {
    position: relative;
    overflow: hidden;
  }

  &__image {
    height: 140px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.4s ease;
    overflow: hidden;
    width: 100%;
    object-fit: cover;

    &--placeholder {
      background-size: cover;
      background-position: center;
    }

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at 30% 30%,
        rgba(#fff, 0.2),
        transparent 60%
      );
    }
  }

  &__badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba(#fff, 0.95);
    color: $primary;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.4rem 0.8rem;
    border-radius: $border-radius-pill;
    z-index: 2;
    letter-spacing: 0.08em;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &__body {
    padding: 1.25rem;
    position: relative;
    z-index: 1;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 800;
    margin-bottom: 0.6rem;
    background: linear-gradient(135deg, $primary, $secondary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.01em;
  }

  &__desc {
    font-size: 0.8rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  &__meta-item {
    font-size: 0.75rem;
    color: $text-muted;
  }

  &__btn {
    width: 100%;
    padding: 0.7rem;
    border: 1.5px solid $primary;
    border-radius: $border-radius-pill;
    font-size: 0.8rem;
    font-weight: 700;
    color: $primary;
    background: rgba($primary, 0.05);
    cursor: pointer;
    font-family: $font-primary;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    letter-spacing: 0.05em;

    &:active {
      transform: scale(0.98);
    }
  }

  &__btn-arrow {
    transition: transform 0.3s ease;
    display: inline-block;
  }
}
</style>
