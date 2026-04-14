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
            <div class="article-list">
              <NuxtLink
                v-for="article in filteredArticles"
                :key="article.id"
                :to="`/articles/${article.slug}`"
                class="article-row"
              >
                <!-- Cover -->
                <div class="article-row__cover">
                  <div
                    class="article-row__cover-placeholder"
                    :style="{ background: category?.gradient }"
                  >
                    <span class="article-row__cat-badge">{{
                      category?.name
                    }}</span>
                  </div>
                </div>

                <!-- Info -->
                <div class="article-row__info">
                  <span
                    v-if="article.type === 'premium'"
                    class="badge badge--premium"
                    >⭐ Premium</span
                  >
                  <h3 class="article-row__title">{{ article?.title }}</h3>
                  <p class="article-row__excerpt">{{ article?.excerpt }}</p>
                  <div class="article-row__meta">
                    <span class="article-row__meta-item"
                      >📅 {{ article?.date }}</span
                    >
                    <span class="article-row__meta-item"
                      >🕐 {{ article?.readTime }} daqiqa</span
                    >
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
            </div>

            <!-- Load more -->
            <button class="load-more-btn">Ko'proq yuklash →</button>

            <!-- Breadcrumb -->
            <nav class="breadcrumb breadcrumb--bottom">
              <NuxtLink to="/" class="breadcrumb__item">Bosh sahifa</NuxtLink>
              <span class="breadcrumb__sep">›</span>
              <NuxtLink to="/categories" class="breadcrumb__item"
                >Kategoriyalar</NuxtLink
              >
              <span class="breadcrumb__sep">›</span>
              <span class="breadcrumb__item breadcrumb__item--active">
                {{ category?.name }} va texnologiya
              </span>
            </nav>
          </div>

          <!-- O'NG: Sidebar -->
          <aside class="cat-sidebar">
            <!-- Mashhur maqolalar -->
            <div class="sidebar-block">
              <h3 class="sidebar-block__title">
                <span class="sidebar-block__title-icon">📈</span>
                MASHHUR MAQOLALAR
              </h3>
              <ol class="popular-list">
                <li
                  v-for="(item, i) in popularArticles"
                  :key="item.id"
                  class="popular-list__item"
                >
                  <span class="popular-list__num">{{
                    String(i + 1).padStart(2, "0")
                  }}</span>
                  <NuxtLink
                    :to="`/articles/${item?.slug}`"
                    class="popular-list__title"
                  >
                    {{ item?.title }}
                  </NuxtLink>
                </li>
              </ol>
            </div>

            <!-- Haftalik xat -->
            <div class="sidebar-block sidebar-block--gradient">
              <h3 class="sidebar-block__title sidebar-block__title--white">
                Haftalik xat
              </h3>
              <p class="sidebar-block__desc">
                Eng so'nggi ilmiy yangiliklar va maqolalarni har dushanba
                elektron pochtangizda qabul qiling.
              </p>
              <button class="btn sidebar-block__btn">Obuna bo'lish</button>
            </div>

            <!-- Ommabop teglar -->
            <div class="sidebar-block">
              <h3 class="sidebar-block__title">OMMABOP TEGLAR</h3>
              <div class="tags-list">
                <span v-for="tag in popularTags" :key="tag" class="tag-chip">
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Tavsiya etilgan -->
            <div class="sidebar-block">
              <h3 class="sidebar-block__title">TAVSIYA ETILGAN</h3>
              <div class="featured-card">
                <div
                  class="featured-card__image"
                  :style="{ background: category?.gradient }"
                />
                <div class="featured-card__body">
                  <h4 class="featured-card__title">Ilmiy Ekspozitsiya 2024</h4>
                  <p class="featured-card__desc">
                    Toshkentda bo'lib o'tadigan yirik ilmiy ko'rgazmada ishtirok
                    eting.
                  </p>
                  <button class="featured-card__btn">Batafsil ma'lumot</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const categoryStore = useCategoryStore();
const articleStore = useArticleStore();
const loading = ref(false);
const sortBy = ref("newest");

const category = computed(() => categoryStore.oneCategory);

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
];

const filteredArticles = computed(() => {
  let list = [...(articleStore.allArticles ?? [])].map((a, i) => ({
    ...a,
    gradient: gradients[i % gradients.length],
  }));

  if (sortBy.value === "popular") {
    list.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sortBy.value === "oldest") {
    list.reverse();
  }

  return list;
});

// Sidebar static
const popularArticles = ref([
  {
    id: 1,
    title: "Koinot qanday paydo bo'lgan?",
    slug: "koinot",
    views: "15k",
  },
  { id: 2, title: "Sun'iy intellekt va kelajak", slug: "ai", views: "12k" },
  { id: 3, title: "Inson miyasi qanday ishlaydi?", slug: "miya", views: "10k" },
  { id: 4, title: "Qora tuynuklar siri", slug: "qora-tuynuk", views: "8k" },
]);

const popularTags = ref([
  "Astronomiya",
  "Fizika",
  "Biologiya",
  "Robototexnika",
  "Koinot",
  "Ekologiya",
]);

onMounted(async () => {
  console.log("Hkdbasj");

  loading.value = true;
  await categoryStore.getCategoryBySlug(route.params.slug as string);
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
    height: 100%;
    min-height: 160px;
    display: flex;
    align-items: flex-end;
    padding: 0.75rem;

    @media (max-width: $mobile) {
      min-height: 0;
    }
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
  border-radius: $border-radius-sm;
  overflow: hidden;
  border: 1px solid $border-color;

  &__image {
    height: 120px;
  }

  &__body {
    padding: 1rem;
  }

  &__title {
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }

  &__desc {
    font-size: 0.8rem;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  &__btn {
    width: 100%;
    padding: 0.55rem;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-sm;
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-primary;
    background: #fff;
    cursor: pointer;
    font-family: $font-primary;
    transition: all 0.15s;

    &:hover {
      border-color: $primary;
      color: $primary;
    }
  }
}
</style>
