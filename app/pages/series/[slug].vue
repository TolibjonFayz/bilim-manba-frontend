<template>
  <div v-if="series" class="series-detail container">
    <nav class="series-detail__crumbs" aria-label="Breadcrumb">
      <NuxtLink to="/">Bosh sahifa</NuxtLink> ›
      <NuxtLink to="/series">Seriyalar</NuxtLink> ›
      <span>{{ series.title }}</span>
    </nav>

    <header class="series-detail__head">
      <span class="series-detail__badge"
        >📚 Seriya · {{ series.parts.length }} qism</span
      >
      <h1 class="series-detail__title">{{ series.title }}</h1>
      <p v-if="series.description" class="series-detail__desc">
        {{ series.description }}
      </p>
      <NuxtLink
        :to="`/articles/${series.parts[0]?.slug}`"
        class="btn btn--primary"
        >1-qismdan boshlash →</NuxtLink
      >
    </header>

    <ol class="series-detail__list">
      <li v-for="(p, i) in series.parts" :key="p.slug">
        <NuxtLink :to="`/articles/${p.slug}`" class="part">
          <span class="part__num">{{ i + 1 }}</span>
          <img
            v-if="p.coverImage"
            :src="cldImg(p.coverImage, 320)"
            :alt="p.title"
            class="part__img"
            loading="lazy"
            width="160"
            height="84"
          />
          <div class="part__body">
            <span class="part__label">{{ i + 1 }}-qism</span>
            <h2 class="part__title">{{ p.title }}</h2>
            <p v-if="p.excerpt" class="part__excerpt">{{ p.excerpt }}</p>
          </div>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
interface SeriesDetail {
  title: string;
  slug: string;
  description?: string | null;
  parts: {
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
  }[];
}

const route = useRoute();
const slug = String(route.params.slug ?? "");

const { data } = await useAsyncData(`series-${slug}`, async () => {
  try {
    const series = await $fetch<SeriesDetail>(
      `/series/byslug/${encodeURIComponent(slug)}`,
      { baseURL: useRuntimeConfig().public.apiBase },
    );
    // Qismsiz javob — seriya yo'q deb hisoblanadi
    if (!series?.parts?.length) return { status: 404, series: null };
    return { status: 200, series };
  } catch (err: any) {
    return { status: err?.statusCode === 404 ? 404 : 503, series: null };
  }
});

if (data.value?.status !== 200) {
  // 404/503 sahifa CDN keshiga tushmasin
  useNoStoreUnless(false);
  throw createError({
    statusCode: data.value?.status === 404 ? 404 : 503,
    statusMessage:
      data.value?.status === 404 ? "Seriya topilmadi" : "Vaqtincha mavjud emas",
    fatal: true,
  });
}

const series = computed(() => data.value?.series ?? null);

useHead({
  title: () => `${series.value?.title ?? "Seriya"} — seriya | Bilim Manba`,
  meta: [
    {
      name: "description",
      content: () =>
        series.value?.description ||
        `«${series.value?.title}» seriyasi: ${series.value?.parts.length} qism — boshidan oxirigacha o'rganing.`,
    },
  ],
});
</script>

<style lang="scss" scoped>
.series-detail {
  max-width: 860px;
  padding-top: 2rem;
  padding-bottom: 4rem;

  &__crumbs {
    font-size: 0.85rem;
    color: $text-muted;
    margin-bottom: 1.5rem;

    a:hover {
      color: $primary;
    }
  }

  &__head {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  &__badge {
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.25rem 0.75rem;
    border-radius: $border-radius-pill;
    background: rgba(var(--c-primary-rgb), 0.1);
    color: $primary;
  }

  &__title {
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    font-weight: 800;
    line-height: 1.2;
  }

  &__desc {
    color: $text-secondary;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.part {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: rgba(var(--c-primary-rgb), 0.35);
    box-shadow: $shadow-md;
  }

  &__num {
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__img {
    flex-shrink: 0;
    width: 160px;
    height: 84px;
    object-fit: cover;
    border-radius: $border-radius-sm;

    @media (max-width: $mobile) {
      display: none;
    }
  }

  &__body {
    min-width: 0;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.35;
    margin: 0.15rem 0 0.25rem;
  }

  &__excerpt {
    font-size: 0.88rem;
    color: $text-secondary;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
