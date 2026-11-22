<template>
  <div class="audio-page container">
    <header class="audio-page__head">
      <h1 class="audio-page__title">🎧 Audio maqolalar</h1>
      <p class="audio-page__sub">
        Maqolalarni tinglang — yo'lda, ishda yoki uyda. Har birining to'liq
        matni, rasmlari va testi saytda. Yangi audiolar har kuni qo'shiladi.
      </p>
      <p class="audio-page__more">
        Podkast ilovangizda tinglash uchun:
        <a href="/podcast.xml" target="_blank" rel="noopener">RSS lenta</a>
        · Telegram'da: <a href="https://t.me/bilim_manba" target="_blank" rel="noopener">@bilim_manba</a>
      </p>
    </header>

    <div v-if="list?.length" class="audio-list">
      <article v-for="a in list" :key="a.slug" class="audio-item">
        <NuxtLink :to="`/articles/${a.slug}`" class="audio-item__cover">
          <img
            v-if="a.coverImage"
            :src="cldImg(a.coverImage, 320)"
            :alt="a.title"
            loading="lazy"
            width="320"
            height="168"
          />
        </NuxtLink>
        <div class="audio-item__body">
          <span v-if="a.category" class="audio-item__cat">{{ a.category }}</span>
          <h2 class="audio-item__title">
            <NuxtLink :to="`/articles/${a.slug}`">{{ a.title }}</NuxtLink>
          </h2>
          <ArticleAudio
            :audio="{ url: a.url, seconds: a.seconds }"
            :title="a.title"
            :slug="a.slug"
            :cover="a.coverImage ? cldImg(a.coverImage, 512) : null"
          />
        </div>
      </article>
    </div>

    <p v-else class="audio-page__empty">
      Audio maqolalar tayyorlanmoqda — tez orada shu yerda paydo bo'ladi. Shu
      orada <NuxtLink to="/articles">maqolalarni</NuxtLink> o'qib turing.
    </p>
  </div>
</template>

<script setup lang="ts">
interface AudioItem {
  title: string;
  slug: string;
  coverImage: string | null;
  category: string | null;
  url: string;
  seconds: number;
}

useHead({
  title: "Audio maqolalar — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "O'zbek tilidagi ilmiy-ommabop maqolalarni tinglang: koinot, tarix, tabiat, texnologiya, kino. Bepul audio maqolalar va podkast.",
    },
  ],
  link: [
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: "Bilim Manba — audio maqolalar",
      href: "https://bilimmanba.uz/podcast.xml",
    },
  ],
});

const { data: list, error } = await useAsyncData("audio-list", () =>
  $fetch<AudioItem[]>("/audio/feed", {
    baseURL: useRuntimeConfig().public.apiBase,
  }),
);
useNoStoreUnless(!error.value);
</script>

<style lang="scss" scoped>
.audio-page {
  padding-top: 2.5rem;
  padding-bottom: 4rem;
  max-width: 900px;

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
    max-width: 640px;
  }

  &__more {
    margin-top: 0.6rem;
    font-size: 0.88rem;
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 600;
    }
  }

  &__empty {
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 600;
    }
  }
}

.audio-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.audio-item {
  display: flex;
  gap: 1.1rem;
  padding: 1rem;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;

  @media (max-width: $mobile) {
    flex-direction: column;
  }

  &__cover {
    flex-shrink: 0;
    width: 180px;
    aspect-ratio: 1200 / 630;
    border-radius: $border-radius-sm;
    overflow: hidden;
    background: linear-gradient(135deg, #5850ec, #ff6584);

    @media (max-width: $mobile) {
      width: 100%;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;

    :deep(.aud) {
      margin: 0.6rem 0 0;
    }
  }

  &__cat {
    font-size: 0.75rem;
    font-weight: 700;
    color: $primary;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.4;
    margin-top: 0.15rem;

    a {
      color: $text-primary;

      &:hover {
        color: $primary;
      }
    }
  }
}
</style>
