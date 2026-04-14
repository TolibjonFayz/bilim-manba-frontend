<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero__inner container">
        <div class="hero__badge">⚡ O'qish — eng foydali investitsiya!</div>

        <h1 class="hero__title">
          Bilim oling,<br />
          <span class="hero__title-gradient">rivojlaning</span>
        </h1>

        <p class="hero__subtitle">
          Zamonaviy texnologiyalar, ilm-fan va shaxsiy rivojlanishga oid eng
          saralangan maqolalar va hamjamiyat bir joyda.
        </p>

        <div class="hero__actions">
          <NuxtLink to="/articles" class="btn btn--primary">
            Maqolalarni ko'rish →
          </NuxtLink>
          <NuxtLink
            v-if="!authStore.isLoggedIn"
            to="/register"
            class="btn btn--outline"
          >
            Ro'yxatdan o'tish
          </NuxtLink>
        </div>
      </div>

      <!-- Background shapes -->
      <div class="hero__shape hero__shape--1" />
      <div class="hero__shape hero__shape--2" />
    </section>

    <!-- KATEGORIYALAR -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <div class="section-header__left">
            <h2>
              <Icon name="map:compass" size="1em" mode="css" />
              Kategoriyalar
            </h2>
            <p>O'zingizga yoqqan yo'nalishni tanlang</p>
          </div>
          <NuxtLink to="/categories" class="section-header__link">
            Barchasini ko'rish →
          </NuxtLink>
        </div>

        <div class="categories-list">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/categories/${cat.name}`"
            class="category-chip"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </NuxtLink>

          <!-- Skeleton -->
          <template v-if="!categories?.length">
            <div
              v-for="i in 6"
              :key="i"
              class="category-chip category-chip--skeleton"
            />
          </template>
        </div>
      </div>
    </section>

    <!-- MAQOLALAR -->
    <section class="articles-section">
      <div class="container">
        <div class="section-header">
          <div class="section-header__left">
            <h2>✨ So'nggi maqolalar</h2>
            <p>Ekspertlarimiz tomonidan yozilgan eng yangi materiallar</p>
          </div>
          <div class="articles-section__search">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Maqola qidirish..."
              class="search-input"
            />
          </div>
        </div>

        <div class="articles-grid">
          <ArticleCard
            v-for="article in filteredArticles"
            :key="article.id"
            :article="article"
          />
        </div>

        <div v-if="filteredArticles?.length" class="articles-section__more">
          <NuxtLink to="/articles" class="btn btn--outline">
            Yana yuklash
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- PREMIUM BANNER -->
    <section class="premium-banner">
      <div class="premium-banner__inner container">
        <div class="premium-banner__left">
          <h2 class="premium-banner__title">Bilimni cheksiz oching</h2>
          <p class="premium-banner__desc">
            Premium obuna bilan barcha ekskluziv maqolalar, PDF qo'llanmalar va
            yopiq webinar-larga ruxsat oling. Atigi
            <strong>15,000 so'm/oy.</strong>
          </p>
          <ul class="premium-banner__features">
            <li>✅ Reklamasiz interfeys</li>
            <li>✅ Yuklab olish imkoniyati</li>
          </ul>
        </div>

        <div class="premium-banner__right">
          <div class="premium-banner__price">
            <span class="premium-banner__amount">15.000 UZS</span>
            <span class="premium-banner__period">oyiga 1 marta to'lov</span>
          </div>
          <NuxtLink to="/premium" class="btn btn--white">
            Premium bo'lish
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const searchQuery = ref("");

const categories = ref([
  { id: 1, name: "Sport", slug: "sport", icon: "⚽" },
  { id: 2, name: "Kompyuter fanlari", slug: "kompyuter-fanlari", icon: "💻" },
  { id: 3, name: "Tarix", slug: "tarix", icon: "⚔️" },
  { id: 4, name: "O'yinlar", slug: "oyinlar", icon: "🎮" },
  { id: 5, name: "Kino", slug: "kino", icon: "🎬" },
  { id: 6, name: "Matematika", slug: "matematika", icon: "📐" },
  { id: 7, name: "Geografiya", slug: "geografiya", icon: "🌍" },
  { id: 8, name: "Biologiya", slug: "biologiya", icon: "🧬" },
  { id: 9, name: "Fizika", slug: "fizika", icon: "🔋" },
  { id: 10, name: "San'at", slug: "sanat", icon: "🎨" },
  { id: 11, name: "Umumiy", slug: "umumiy", icon: "⚖️" },
]);

const articles = ref([
  {
    id: 1,
    title: "Zamonaviy veb-ishlab chiqishda React o'rni va kelajagi",
    slug: "react-orni-va-kelajagi",
    excerpt:
      "Veb texnologiyalar kundan-kunga rivojlanib bormoqda. React dasturlash sohasida o'z pozitsiyasini ushlab turolarmikan?",
    coverImage: null,
    type: "free",
    viewCount: 1200,
    category: { name: "Texnologiya", slug: "texnologiya", icon: "💻" },
    author: { fullName: "Azizbek Toshmatov" },
  },
  {
    id: 2,
    title: "Sun'iy intellekt: Insoniyat uchun imkoniyat yoki tahdid?",
    slug: "suniy-intellekt",
    excerpt:
      "AI hayotimizning har bir jabhaziga kirib bormoqda. Bu o'zgarishlar bizga qanday ta'sir qiladi?",
    coverImage: null,
    type: "premium",
    viewCount: 2400,
    category: { name: "Ilm-Fan", slug: "ilm-fan", icon: "🔬" },
    author: { fullName: "Madina Aliyeva" },
  },
  {
    id: 3,
    title: "Muvaffaqiyatli startap qurish: G'oyadan real loyihagacha",
    slug: "startap-qurish",
    excerpt:
      "Startap olami sodda ko'rinsa-da, aslida murakkab. Qanday qilib xatolardan qochish mumkin?",
    coverImage: null,
    type: "free",
    viewCount: 860,
    category: { name: "Biznes", slug: "biznes", icon: "💼" },
    author: { fullName: "Jamshid Karimov" },
  },
  {
    id: 4,
    title: "Kvant fizikasi sirlari: Eng sodda tushuntirish",
    slug: "kvant-fizikasi",
    excerpt:
      "Muazzam va oddiy tilda tushuntirish: Kvant olamining qonuniyatlari bizning olamdan qanchalik farq qiladi?",
    coverImage: null,
    type: "premium",
    viewCount: 2100,
    category: { name: "Fizika", slug: "fizika", icon: "🧪" },
    author: { fullName: "Sardor Rahimov" },
  },
  {
    id: 5,
    title: "Ma'lumotlar xavfsizligi: Shaxsiy ma'lumotlarni qanday saqlash",
    slug: "malumotlar-xavfsizligi",
    excerpt:
      "Kiberxavfsizlik dunyoda shiddat bilan rivojlanib, eng muhim 10 ta qoida haqida tanishing.",
    coverImage: null,
    type: "free",
    viewCount: 4100,
    category: { name: "Kiberxavfsizlik", slug: "kiberxavfsizlik", icon: "🔐" },
    author: { fullName: "Nilufar Ortiqova" },
  },
  {
    id: 6,
    title: "Samarali vaqt boshqaruvi: Pomodoro texnikasidan tashqari",
    slug: "vaqt-boshqaruvi",
    excerpt:
      "Vaqtingizni to'g'ri boshqarish uchun 3 ta kamtarona strategiyani o'rganib, zamonaviy vositalar bilan tanishing.",
    coverImage: null,
    type: "free",
    viewCount: 5200,
    category: { name: "Psixologiya", slug: "psixologiya", icon: "🧠" },
    author: { fullName: "Jasur Odilov" },
  },
]);

const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value;
  const q = searchQuery.value.toLowerCase();
  return articles.value.filter(
    (a) =>
      a.title.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q),
  );
});
</script>

<style lang="scss" scoped>
// HERO
.hero {
  position: relative;
  background: $bg-secondary;
  padding: 6rem 0 5rem;
  overflow: hidden;
  text-align: center;

  &__inner {
    position: relative;
    z-index: 2;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba($primary, 0.1);
    color: $primary;
    border: 1px solid rgba($primary, 0.2);
    padding: 0.4rem 1rem;
    border-radius: $border-radius-pill;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }

  &__title-gradient {
    background: linear-gradient(135deg, $primary, $secondary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $text-secondary;
    max-width: 560px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;

    &--1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba($primary, 0.15), transparent);
      top: -100px;
      right: -100px;
    }

    &--2 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba($secondary, 0.1), transparent);
      bottom: -80px;
      left: -80px;
    }
  }
}

// CATEGORIES
.categories-section {
  padding: 4rem 0;
}

.categories-list {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: $bg-primary;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-pill;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: $primary;
    color: $primary;
    background: $primary-light;
    transform: translateY(-2px);
    box-shadow: $shadow-sm;
  }

  &--skeleton {
    width: 120px;
    height: 42px;
    background: $bg-secondary;
    animation: pulse 1.5s infinite;
  }
}

// ARTICLES
.articles-section {
  padding: 2rem 0 4rem;

  &__search {
    flex-shrink: 0;
  }

  &__more {
    text-align: center;
    margin-top: 2.5rem;
  }
}

.search-input {
  padding: 0.6rem 1.25rem;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-pill;
  font-size: 0.9rem;
  outline: none;
  width: 220px;
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: $desktop) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

// PREMIUM BANNER
.premium-banner {
  margin: 3rem 0;

  &__inner {
    background: linear-gradient(135deg, #6c63ff 0%, #ff6584 100%);
    border-radius: $border-radius-lg;
    padding: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;

    @media (max-width: $tablet) {
      flex-direction: column;
      text-align: center;
    }
  }

  &__left {
    flex: 1;
  }

  &__title {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  &__desc {
    color: rgba(#fff, 0.85);
    line-height: 1.7;
    font-size: 0.95rem;
    margin-bottom: 1rem;

    strong {
      color: #fff;
    }
  }

  &__features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    li {
      color: rgba(#fff, 0.9);
      font-size: 0.9rem;
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    flex-shrink: 0;
  }

  &__price {
    background: rgba(#fff, 0.15);
    border: 1px solid rgba(#fff, 0.3);
    border-radius: $border-radius;
    padding: 1rem 2rem;
    text-align: center;
    backdrop-filter: blur(8px);
  }

  &__amount {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
  }

  &__period {
    font-size: 0.8rem;
    color: rgba(#fff, 0.8);
  }
}

// Skeleton animation
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
