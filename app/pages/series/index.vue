<template>
  <div class="series-page container">
    <header class="series-page__head">
      <h1 class="series-page__title">📚 Seriyalar</h1>
      <p class="series-page__sub">
        Bir mavzuni boshidan oxirigacha, qism-qism o'rganing — har bir qism
        oldingisini davom ettiradi.
      </p>
    </header>

    <div v-if="list?.length" class="series-grid">
      <NuxtLink
        v-for="s in list"
        :key="s.slug"
        :to="`/series/${s.slug}`"
        class="series-card"
      >
        <div class="series-card__cover">
          <img
            v-if="s.coverImage"
            :src="cldImg(s.coverImage, 640)"
            :alt="s.title"
            loading="lazy"
            width="640"
            height="336"
          />
          <span class="series-card__parts">{{ s.partCount }} qism</span>
        </div>
        <div class="series-card__body">
          <h2 class="series-card__title">{{ s.title }}</h2>
          <p v-if="s.description" class="series-card__desc">
            {{ s.description }}
          </p>
          <span class="series-card__go">Boshlash →</span>
        </div>
      </NuxtLink>
    </div>

    <p v-else class="series-page__empty">
      Hozircha seriyalar yo'q — tez orada qo'shiladi. Shu orada
      <NuxtLink to="/articles">maqolalarni</NuxtLink> o'qib turing.
    </p>
  </div>
</template>

<script setup lang="ts">
interface SeriesListItem {
  slug: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  partCount: number;
}

useHead({
  title: "Seriyalar — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Bilim Manba seriyalari: bir mavzuni qism-qism, boshidan oxirigacha o'rganing.",
    },
  ],
});

// SSR — seriya havolalari server HTML'ida bo'lsin
const { data: list, error } = await useAsyncData("series-list", () =>
  $fetch<SeriesListItem[]>("/series/all", {
    baseURL: useRuntimeConfig().public.apiBase,
  }),
);
useNoStoreUnless(!error.value);
</script>

<style lang="scss" scoped>
.series-page {
  padding-top: 2.5rem;
  padding-bottom: 4rem;

  &__head {
    margin-bottom: 2rem;
  }

  &__title {
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  &__sub {
    color: $text-secondary;
    max-width: 620px;
  }

  &__empty {
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 600;
    }
  }
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.series-card {
  display: flex;
  flex-direction: column;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
    border-color: rgba(var(--c-primary-rgb), 0.3);
  }

  &__cover {
    position: relative;
    aspect-ratio: 1200 / 630;
    background: linear-gradient(135deg, #5850ec, #ff6584);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__parts {
    position: absolute;
    left: 0.75rem;
    bottom: 0.75rem;
    padding: 0.25rem 0.7rem;
    border-radius: $border-radius-pill;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
  }

  &__body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.35;
  }

  &__desc {
    color: $text-secondary;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  &__go {
    margin-top: auto;
    color: $primary;
    font-weight: 700;
    font-size: 0.9rem;
  }
}
</style>
