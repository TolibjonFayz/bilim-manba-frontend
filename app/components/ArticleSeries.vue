<template>
  <!-- Maqola tepasida: seriya nomi, nechanchi qism va qismlar ro'yxati -->
  <details v-if="mode === 'top'" class="series-box">
    <summary class="series-box__head">
      <span class="series-box__badge">📚 Seriya</span>
      <span class="series-box__title">{{ series.title }}</span>
      <span class="series-box__count"
        >{{ series.part }}-qism / {{ series.total }}</span
      >
      <span class="series-box__toggle" aria-hidden="true">▾</span>
    </summary>
    <ol class="series-box__list">
      <li
        v-for="(p, i) in series.parts"
        :key="p.slug"
        :class="{ 'is-current': i + 1 === series.part }"
      >
        <span class="series-box__num">{{ i + 1 }}</span>
        <span v-if="i + 1 === series.part" class="series-box__link"
          >{{ p.title }} <em>· hozir o'qiyapsiz</em></span
        >
        <NuxtLink v-else :to="`/articles/${p.slug}`" class="series-box__link">{{
          p.title
        }}</NuxtLink>
      </li>
    </ol>
    <NuxtLink :to="`/series/${series.slug}`" class="series-box__all"
      >Seriya sahifasi →</NuxtLink
    >
  </details>

  <!-- Maqola oxirida: keyingi qism (yoki seriya tugadi) -->
  <div v-else class="series-next">
    <template v-if="next">
      <span class="series-next__label"
        >📚 «{{ series.title }}» · keyingi, {{ series.part + 1 }}-qism</span
      >
      <NuxtLink :to="`/articles/${next.slug}`" class="series-next__title">
        {{ next.title }} →
      </NuxtLink>
    </template>
    <template v-else>
      <span class="series-next__label"
        >🎉 «{{ series.title }}» seriyasining oxirgi qismini o'qidingiz</span
      >
      <NuxtLink :to="`/series/${series.slug}`" class="series-next__title">
        Barcha {{ series.total }} qismni ko'rish →
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
/** Maqola qaysi seriyaning nechanchi qismi ekanini ko'rsatadi */
interface ArticleSeriesInfo {
  title: string;
  slug: string;
  part: number;
  total: number;
  parts: { id: number; title: string; slug: string }[];
}

const props = defineProps<{
  series: ArticleSeriesInfo;
  mode: "top" | "bottom";
}>();

const next = computed(() => props.series.parts[props.series.part] ?? null);
</script>

<style lang="scss" scoped>
.series-box {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-left: 4px solid $primary;
  border-radius: $border-radius;
  margin-bottom: 1.5rem;

  &__head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  &__badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
    background: rgba(var(--c-primary-rgb), 0.1);
    color: $primary;
  }

  &__title {
    font-weight: 700;
    flex: 1;
    min-width: 0;
  }

  &__count {
    font-size: 0.85rem;
    color: $text-secondary;
    font-weight: 600;
  }

  &__toggle {
    color: $text-muted;
    transition: transform 0.2s;
  }

  &[open] &__toggle {
    transform: rotate(180deg);
  }

  &__list {
    list-style: none;
    padding: 0 1.25rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.45rem 0.5rem;
      border-radius: $border-radius-sm;

      &.is-current {
        background: $primary-light;
      }
    }
  }

  &__num {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: $bg-secondary;
    border: 1px solid $border-color;
    font-size: 0.75rem;
    font-weight: 700;
    color: $text-secondary;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .is-current &__num {
    background: $primary;
    border-color: $primary;
    color: #fff;
  }

  &__link {
    font-size: 0.92rem;
    line-height: 1.4;

    em {
      color: $text-muted;
      font-style: normal;
      font-size: 0.8rem;
    }
  }

  a.series-box__link:hover {
    color: $primary;
  }

  &__all {
    display: inline-block;
    margin: 0 1.25rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: $primary;
  }
}

.series-next {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: $border-radius;
  border: 1px solid rgba(var(--c-primary-rgb), 0.3);
  background: $primary-light;

  &__label {
    font-size: 0.85rem;
    color: $text-secondary;
    font-weight: 600;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 800;
    color: $primary;
    line-height: 1.4;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
