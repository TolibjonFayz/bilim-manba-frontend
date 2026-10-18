<template>
  <div class="school container">
    <header class="school__head">
      <span class="school__badge">🎒 O'quvchilar uchun</span>
      <h1 class="school__title">Maktab mavzulari — sodda va tushunarli</h1>
      <p class="school__sub">
        5–11-sinf dasturidagi mavzular: darsni tushunish, uy vazifasi va
        imtihonga tayyorlanish uchun. Har maqola oxirida "Asosiy fikrlar" va
        o'zingizni sinash uchun test bor.
      </p>
    </header>

    <template v-if="all.length">
      <div class="filters">
        <div class="filters__row" role="group" aria-label="Fan bo'yicha">
          <button
            type="button"
            class="chip"
            :class="{ 'is-active': !fan }"
            @click="setFilter('fan', '')"
          >
            Hamma fanlar
          </button>
          <button
            v-for="s in subjects"
            :key="s"
            type="button"
            class="chip"
            :class="{ 'is-active': fan === s }"
            @click="setFilter('fan', s)"
          >
            {{ s }}
          </button>
        </div>
        <div v-if="grades.length" class="filters__row" role="group" aria-label="Sinf bo'yicha">
          <button
            type="button"
            class="chip chip--small"
            :class="{ 'is-active': !sinf }"
            @click="setFilter('sinf', '')"
          >
            Hamma sinflar
          </button>
          <button
            v-for="g in grades"
            :key="g"
            type="button"
            class="chip chip--small"
            :class="{ 'is-active': sinf === String(g) }"
            @click="setFilter('sinf', String(g))"
          >
            {{ g }}-sinf
          </button>
        </div>
      </div>

      <div v-if="filtered.length" class="school-grid">
        <NuxtLink
          v-for="a in filtered"
          :key="a.slug"
          :to="`/articles/${a.slug}`"
          class="school-card"
        >
          <div class="school-card__cover">
            <img
              v-if="a.coverImage"
              :src="cldImg(a.coverImage, 480)"
              :alt="a.title"
              loading="lazy"
              width="480"
              height="252"
            />
          </div>
          <div class="school-card__body">
            <span class="school-card__meta"
              ><template v-if="a.grade">{{ a.grade }}-sinf · </template
              >{{ a.subject }}</span
            >
            <h2 class="school-card__title">{{ a.title }}</h2>
            <p v-if="a.excerpt" class="school-card__excerpt">{{ a.excerpt }}</p>
          </div>
        </NuxtLink>
      </div>
      <p v-else class="school__empty">
        Bu tanlov bo'yicha hozircha maqola yo'q — boshqa fan yoki sinfni
        tanlang.
      </p>
    </template>

    <p v-else class="school__empty">
      Maktab mavzulari tez orada qo'shiladi. Shu orada
      <NuxtLink to="/articles">maqolalarni</NuxtLink> o'qib turing.
    </p>
  </div>
</template>

<script setup lang="ts">
interface SchoolArticle {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  subject: string;
  grade: number | null;
}

const route = useRoute();
const router = useRouter();

useHead({
  title: "Maktab o'quvchilari uchun — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "5–11-sinf dasturidagi mavzular sodda o'zbek tilida: tarix, biologiya, fizika, geografiya va boshqalar. Asosiy fikrlar va test bilan.",
    },
  ],
});

// SSR — maqola havolalari server HTML'ida bo'lsin
const { data, error } = await useAsyncData("school-list", () =>
  $fetch<SchoolArticle[]>("/school/all", {
    baseURL: useRuntimeConfig().public.apiBase,
  }),
);
useNoStoreUnless(!error.value);

const all = computed(() => data.value ?? []);
const fan = computed(() => String(route.query.fan ?? ""));
const sinf = computed(() => String(route.query.sinf ?? ""));

const subjects = computed(() =>
  [...new Set(all.value.map((a) => a.subject))].sort((a, b) =>
    a.localeCompare(b),
  ),
);
const grades = computed(() =>
  [
    ...new Set(
      all.value.map((a) => a.grade).filter((g): g is number => Boolean(g)),
    ),
  ].sort((a, b) => a - b),
);

const filtered = computed(() =>
  all.value.filter(
    (a) =>
      (!fan.value || a.subject === fan.value) &&
      (!sinf.value || String(a.grade) === sinf.value),
  ),
);

const setFilter = (key: "fan" | "sinf", value: string) => {
  const query = { ...route.query, [key]: value || undefined };
  router.replace({ query });
};
</script>

<style lang="scss" scoped>
.school {
  padding-top: 2.5rem;
  padding-bottom: 4rem;

  &__head {
    margin-bottom: 1.75rem;
    max-width: 720px;
  }

  &__badge {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.25rem 0.75rem;
    border-radius: $border-radius-pill;
    background: rgba(245, 158, 11, 0.14);
    color: var(--c-warning-text);
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 0.6rem;
  }

  &__sub {
    color: $text-secondary;
    line-height: 1.6;
  }

  &__empty {
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 600;
    }
  }
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.75rem;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

.chip {
  padding: 0.45rem 0.95rem;
  border-radius: $border-radius-pill;
  border: 1.5px solid $border-color;
  background: $bg-primary;
  color: $text-primary;
  font-size: 0.88rem;
  font-weight: 600;
  transition:
    border-color 0.15s,
    background 0.15s;

  &--small {
    padding: 0.3rem 0.75rem;
    font-size: 0.8rem;
  }

  &:hover {
    border-color: $primary;
  }

  &.is-active {
    background: $primary;
    border-color: $primary;
    color: #fff;
  }
}

.school-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.school-card {
  display: flex;
  flex-direction: column;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
  }

  &__cover {
    aspect-ratio: 1200 / 630;
    background: linear-gradient(135deg, #f59e0b, #5850ec);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    padding: 1rem 1.15rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__meta {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--c-warning-text);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 800;
    line-height: 1.35;
  }

  &__excerpt {
    font-size: 0.88rem;
    color: $text-secondary;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
