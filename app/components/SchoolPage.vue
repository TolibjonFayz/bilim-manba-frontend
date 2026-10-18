<template>
  <div class="school container">
    <nav v-if="fan || sinf" class="crumbs" aria-label="Yo'l">
      <NuxtLink to="/maktab">🎒 Maktab</NuxtLink>
      <template v-if="fan">
        <span>›</span>
        <NuxtLink v-if="sinf" :to="schoolPath(fan)">{{ fan }}</NuxtLink>
        <span v-else>{{ fan }}</span>
      </template>
      <template v-if="sinf">
        <span>›</span><span>{{ sinf }}-sinf</span>
      </template>
    </nav>

    <header class="school__head">
      <span v-if="!fan && !sinf" class="school__badge"
        >🎒 O'quvchilar uchun</span
      >
      <h1 class="school__title">{{ heading }}</h1>
      <p class="school__sub">{{ intro }}</p>
    </header>

    <template v-if="all.length">
      <div class="filters">
        <div class="filters__row" role="group" aria-label="Fan bo'yicha">
          <NuxtLink
            :to="schoolPath(null, sinf)"
            class="chip"
            :class="{ 'is-active': !fan }"
          >
            Hamma fanlar
          </NuxtLink>
          <NuxtLink
            v-for="s in subjects"
            :key="s"
            :to="
              schoolPath(s, sinf && gradesOf(s).includes(sinf) ? sinf : null)
            "
            class="chip"
            :class="{ 'is-active': fan === s }"
          >
            {{ s }}
          </NuxtLink>
        </div>
        <div
          v-if="grades.length"
          class="filters__row"
          role="group"
          aria-label="Sinf bo'yicha"
        >
          <NuxtLink
            :to="schoolPath(fan)"
            class="chip chip--small"
            :class="{ 'is-active': !sinf }"
          >
            Hamma sinflar
          </NuxtLink>
          <NuxtLink
            v-for="g in grades"
            :key="g"
            :to="schoolPath(fan, g)"
            class="chip chip--small"
            :class="{ 'is-active': sinf === g }"
          >
            {{ g }}-sinf
          </NuxtLink>
        </div>
      </div>

      <div class="school-grid">
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

/**
 * /maktab sahifalari: hammasi, fan (/maktab/tarix), sinf (/maktab/8-sinf)
 * va fan + sinf (/maktab/tarix/8-sinf). Har biri alohida manzil, o'z
 * sarlavhasi va tavsifi bilan — Google "8-sinf tarix mavzulari" kabi
 * qidiruvlarga aynan shu sahifani chiqarsin.
 */
const route = useRoute();
const SITE = "https://bilimmanba.uz";

// SSR — maqola havolalari server HTML'ida bo'lsin
const { data, error } = await useAsyncData("school-list", () =>
  $fetch<SchoolArticle[]>("/school/all", {
    baseURL: useRuntimeConfig().public.apiBase,
  }),
);
useNoStoreUnless(!error.value);

const all = computed(() => data.value ?? []);
const subjects = computed(() =>
  [...new Set(all.value.map((a) => a.subject))].sort((a, b) =>
    a.localeCompare(b),
  ),
);
const bySlug = new Map(subjects.value.map((s) => [schoolSlug(s), s]));

// Eski manzillar (/maktab?fan=Tarix&sinf=8) → yangi yo'lga 301
if (route.path === "/maktab" && (route.query.fan || route.query.sinf)) {
  const q = String(route.query.fan ?? "");
  const name = q ? bySlug.get(schoolSlug(q)) : undefined;
  const g = parseGradeSlug(`${route.query.sinf}-sinf`);
  await navigateTo(schoolPath(name ?? null, g), {
    redirectCode: 301,
    replace: true,
  });
}

// Yo'l qismlari: [fan] — fan yoki "8-sinf"; [sinf] — faqat "8-sinf"
const p1 = route.params.fan ? String(route.params.fan) : "";
const p2 = route.params.sinf ? String(route.params.sinf) : "";
const p1Grade = parseGradeSlug(p1);
const fan = p1 && !p1Grade ? (bySlug.get(p1) ?? null) : null;
const sinf = p2 ? parseGradeSlug(p2) : p1Grade;

const gradesOf = (subject: string | null) =>
  [
    ...new Set(
      all.value
        .filter((a) => !subject || a.subject === subject)
        .map((a) => a.grade)
        .filter((g): g is number => Boolean(g)),
    ),
  ].sort((a, b) => a - b);
const grades = computed(() => gradesOf(fan));

const filtered = computed(() =>
  all.value.filter(
    (a) => (!fan || a.subject === fan) && (!sinf || a.grade === sinf),
  ),
);

// Noma'lum fan, noto'g'ri sinf yoki bo'sh tanlov — 404 (bo'sh sahifalar
// indekslanmasin). Backend javob bermasa — 404 emas, oddiy bo'sh sahifa.
const bad =
  !error.value &&
  ((p1 && !p1Grade && !fan) ||
    (p2 && (!sinf || p1Grade)) ||
    ((fan || sinf) && !filtered.value.length));
if (bad) {
  throw createError({
    statusCode: 404,
    statusMessage: "Sahifa topilmadi",
    fatal: true,
  });
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const heading =
  fan && sinf
    ? `${sinf}-sinf ${lower(fan)} mavzulari`
    : fan
      ? `${fan}: maktab mavzulari sodda tilda`
      : sinf
        ? `${sinf}-sinf mavzulari sodda tilda`
        : "Maktab mavzulari — sodda va tushunarli";

const intro = computed(() => {
  const n = filtered.value.length;
  if (fan && sinf)
    return `${sinf}-sinf ${lower(fan)} darsidagi mavzular oddiy o'zbek tilida: ${n} ta maqola. Har birining oxirida "Asosiy fikrlar" va o'zingizni sinash uchun test bor.`;
  if (fan)
    return `${fan} fanidan maktab dasturidagi mavzular: darsni tushunish, uy vazifasi va imtihonga tayyorlanish uchun ${n} ta maqola.`;
  if (sinf)
    return `${sinf}-sinf dasturidagi turli fanlar mavzulari: ${n} ta maqola, sodda til, "Asosiy fikrlar" va test bilan.`;
  return `5–11-sinf dasturidagi mavzular: darsni tushunish, uy vazifasi va imtihonga tayyorlanish uchun. Har maqola oxirida "Asosiy fikrlar" va o'zingizni sinash uchun test bor.`;
});

const title =
  fan || sinf
    ? `${heading} — Bilim Manba`
    : "Maktab o'quvchilari uchun — Bilim Manba";
const description = computed(() =>
  fan || sinf
    ? intro.value
    : "5–11-sinf dasturidagi mavzular sodda o'zbek tilida: tarix, biologiya, fizika, geografiya va boshqalar. Asosiy fikrlar va test bilan.",
);

// Tuzilgan ma'lumot: yo'l (breadcrumb) va maqolalar ro'yxati
const jsonLd = computed(() => {
  const crumbs = [{ name: "Maktab", path: "/maktab" }];
  if (fan) crumbs.push({ name: fan, path: schoolPath(fan) });
  if (sinf) crumbs.push({ name: `${sinf}-sinf`, path: schoolPath(fan, sinf) });
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: heading,
      description: description.value,
      url: SITE + schoolPath(fan, sinf),
      inLanguage: "uz",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: filtered.value.slice(0, 50).map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/articles/${a.slug}`,
          name: a.title,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: SITE + c.path,
      })),
    },
  ]);
});

useHead({
  title,
  meta: [
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ],
  script: [{ type: "application/ld+json", innerHTML: jsonLd }],
});
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

.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: $text-muted;
  margin-bottom: 0.9rem;

  a {
    color: $primary;
    font-weight: 600;
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
  display: inline-block;
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
