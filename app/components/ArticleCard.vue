<!-- app/components/ArticleCard.vue -->
<template>
  <NuxtLink :to="`/articles/${article.slug}`" class="article-card">
    <div class="article-card__cover">
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.title"
      />
      <div
        v-else
        class="article-card__cover-placeholder"
        :style="placeholderStyle"
      >
        {{ article.category?.icon ?? "📄" }}
      </div>
    </div>

    <div class="article-card__body">
      <span class="badge badge--category">{{ article.category?.name }}</span>

      <h3 class="article-card__title">{{ article.title }}</h3>

      <!-- <p v-if="article.excerpt" class="article-card__excerpt">
        {{ article.excerpt }}
      </p> -->

      <div class="article-card__meta">
        <div class="article-card__author">
          <div class="article-card__author-avatar">
            {{ article.excerpt?.[0] }}
          </div>
          <span>{{ article.excerpt }}</span>
        </div>
        <div class="article-card__stats">
          <span>👁 {{ article.viewCount }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    type: "free";
    viewCount: number;
    category?: { name: string; slug: string; icon?: string };
    author?: { fullName: string };
  };
}>();

// Placeholder uchun har bir kartaga boshqa gradient
const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
];

const placeholderStyle = computed(() => ({
  background: gradients[props.article.id % gradients.length],
}));
</script>

<style lang="scss" scoped>
.article-card {
  display: flex;
  flex-direction: column;
  background: $bg-primary;
  border-radius: $border-radius;
  border: 1px solid $border-color;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-lg;
    border-color: rgba($primary, 0.3);

    .article-card__cover img {
      transform: scale(1.05);
    }
  }

  &__cover {
    position: relative;
    height: 200px;
    overflow: hidden;
    background: $bg-secondary;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
  }

  &__cover-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
  }

  &__badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }

  &__body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    flex: 1;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: $text-primary;
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
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid $border-color;
    margin-top: auto;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: $text-secondary;
    font-weight: 500;
  }

  &__author-avatar {
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

  &__stats {
    font-size: 0.8rem;
    color: $text-muted;
  }
}
</style>
