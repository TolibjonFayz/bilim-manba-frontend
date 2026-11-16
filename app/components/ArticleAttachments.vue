<!-- Maqola sahifasi: biriktirilgan kitob/hujjatlarni yuklab olish -->
<template>
  <section class="article-files" data-track-area="fayllar">
    <h2 class="article-files__title">📎 Maqolaga ilova fayllar</h2>
    <ul class="article-files__list">
      <li v-for="f in files" :key="f.url">
        <a
          :href="f.url"
          class="article-files__item"
          :download="f.name"
          rel="noopener"
        >
          <span class="article-files__icon">{{ fileIcon(f.ext) }}</span>
          <span class="article-files__name">{{ f.name }}</span>
          <span class="article-files__meta"
            >{{ f.ext.toUpperCase()
            }}<template v-if="f.size"> · {{ formatFileSize(f.size) }}</template></span
          >
          <span class="article-files__dl">Yuklab olish ⬇️</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
defineProps<{ files: ArticleAttachment[] }>();
</script>

<style lang="scss" scoped>
.article-files {
  margin: 2rem 0;
  padding: 1.25rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background: $bg-secondary;

  &__title {
    font-size: 1.05rem;
    font-weight: 800;
    margin-bottom: 0.9rem;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-sm;
    background: $bg-primary;
    color: $text-primary;
    transition: border-color 0.2s, transform 0.2s;

    &:hover {
      border-color: $primary;
      transform: translateY(-1px);
    }

    @media (max-width: $mobile) {
      flex-wrap: wrap;
    }
  }

  &__icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    font-size: 0.95rem;
    overflow-wrap: anywhere;
  }

  &__meta {
    font-size: 0.78rem;
    color: $text-muted;
    white-space: nowrap;
  }

  &__dl {
    font-size: 0.85rem;
    font-weight: 700;
    color: $primary;
    white-space: nowrap;

    @media (max-width: $mobile) {
      width: 100%;
      padding-left: 2.25rem;
    }
  }
}
</style>
