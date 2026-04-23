<template>
  <div class="article-page" v-loading="loading">
    <div class="container">
      <!-- BREADCRUMB -->
      <nav class="breadcrumb">
        <NuxtLink to="/" class="breadcrumb__item">Bosh sahifa</NuxtLink>
        <span class="breadcrumb__sep">›</span>
        <NuxtLink to="/articles" class="breadcrumb__item">Maqolalar</NuxtLink>
        <span class="breadcrumb__sep">›</span>
        <span class="breadcrumb__item breadcrumb__item--active">
          {{ article?.category?.name }}
        </span>
      </nav>

      <div class="article-page__grid">
        <!-- CHAP: Asosiy kontent -->
        <div class="article-main">
          <!-- HEADER -->
          <div class="article-header">
            <div class="article-header__badges">
              <span class="badge badge--category">
                💻 {{ article?.category?.name }}
              </span>
            </div>

            <h1 class="article-header__title">{{ article?.title }}</h1>
            <p class="article-header__excerpt">{{ article?.excerpt }}</p>

            <div class="article-header__meta">
              <div class="article-header__author">
                <div class="article-header__avatar">
                  {{ article?.author?.fullName?.[0] }}
                </div>
                <div>
                  <div class="article-header__author-name">
                    {{ article?.author?.fullName }}
                  </div>
                  <div class="article-header__author-date">
                    {{
                      article?.createdAt
                        ? new Date(article?.createdAt).toLocaleDateString(
                            "uz-UZ",
                          )
                        : ""
                    }}
                  </div>
                </div>
              </div>

              <div class="article-header__stats">
                <span>🕐 {{ readTime }} daqiqa</span>
                <span>👁 {{ article?.viewCount }}</span>
              </div>

              <div class="article-header__actions">
                <button class="article-header__action-btn" @click="handleShare">
                  <span>⤴</span> Ulashish
                </button>
                <button
                  class="article-header__action-btn article-header__action-btn--like"
                  :class="{ 'article-header__action-btn--liked': isLiked }"
                  @click="toggleLike"
                >
                  {{ isLiked ? "❤️" : "🤍" }} {{ likeCount }}
                </button>
              </div>
            </div>
          </div>

          <!-- COVER IMAGE -->
          <div class="article-cover">
            <img
              v-if="article?.coverImage"
              :src="article?.coverImage"
              :alt="article?.title"
              class="article-cover__img"
            />
            <div
              v-else
              class="article-cover__placeholder"
              :style="{ background: articleGradient }"
            />
          </div>

          <!-- CONTENT -->
          <div class="article-content-wrap">
            <div class="article-content" v-html="content?.message" />
          </div>

          <!-- ARTICLE FOOTER -->
          <div class="article-footer">
            <!-- Teglar -->
            <div class="article-footer__tags">
              <span v-for="tag in tags" :key="tag" class="tag-chip">
                #{{ tag }}
              </span>
            </div>

            <!-- Share -->
            <div class="article-footer__share">
              <span class="article-footer__share-label">Ulashish:</span>
              <button
                class="share-btn"
                title="Havolani nusxalash"
                @click="handleShare"
              >
                🔗
              </button>
            </div>
          </div>

          <!-- RELATED ARTICLES -->
          <div class="related-section">
            <div class="related-section__header">
              <h2 class="related-section__title">O'xshash maqolalar</h2>
              <NuxtLink
                :to="`/categories/${article?.category?.name}`"
                class="related-section__link"
              >
                Barchasini ko'rish →
              </NuxtLink>
            </div>
            <div class="related-grid">
              <NuxtLink
                v-for="rel in relatedArticles"
                :key="rel.id"
                :to="`/articles/${rel.slug}`"
                class="related-card"
              >
                <div class="related-card__cover">
                  <img
                    :src="rel?.coverImage"
                    :alt="rel?.title"
                    class="related-card__cover-img"
                  />
                </div>

                <div class="related-card__body">
                  <span class="related-card__date">
                    {{
                      rel.createdAt
                        ? new Date(rel.createdAt).toLocaleDateString("uz-UZ")
                        : ""
                    }}
                  </span>
                  <h4 class="related-card__title">{{ rel?.title }}</h4>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- O'NG: Sidebar -->
        <aside class="article-sidebar">
          <!-- Author card -->
          <div class="sidebar-card">
            <div class="author-card">
              <div class="author-card__source">Manba</div>
              <div class="author-card__avatar">
                {{ article?.excerpt?.[0] }}
              </div>
              <div class="author-card__info">
                <h4 class="author-card__name">
                  {{ article?.excerpt }}
                </h4>
              </div>
            </div>
          </div>

          <!-- Mashhur maqolalar -->
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">🔥 Mashhur maqolalar</h3>
            <div class="popular-items-list">
              <NuxtLink
                v-for="item in popularArticles"
                :key="item?.id"
                :to="`/articles/${item?.slug}`"
                class="popular-item"
              >
                <div class="popular-item__cover">
                  <img
                    v-if="item?.coverImage"
                    :src="item?.coverImage"
                    :alt="item?.title"
                    class="popular-item__cover-img"
                  />
                  <div
                    v-else
                    class="popular-item__cover-placeholder"
                    :style="{ background: item?.gradient }"
                  />
                </div>
                <div class="popular-item__info">
                  <p class="popular-item__title">{{ item?.title }}</p>
                  <span class="popular-item__views">
                    👁 {{ item?.viewCount }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- AI CHAT BUTTON -->
    <div class="ai-fab-wrap">
      <button class="ai-fab" @click="showAiPanel = !showAiPanel">
        🤖 AI tushuntirsin
      </button>

      <!-- AI Panel -->
      <div v-if="showAiPanel" class="ai-panel">
        <div class="ai-panel__header">
          <span>🤖 AI tushuntirma</span>
          <button class="ai-panel__close" @click="showAiPanel = false">
            ✕
          </button>
        </div>

        <div ref="messagesEl" class="ai-panel__messages">
          <div
            v-for="msg in aiMessages"
            :key="msg.id"
            class="ai-msg"
            :class="{ 'ai-msg--user': msg.role === 'user' }"
          >
            <div class="ai-msg__bubble">{{ msg?.content }}</div>
          </div>
          <div v-if="aiLoading" class="ai-msg">
            <div class="ai-msg__bubble ai-msg__bubble--loading">
              <span class="ai-typing"> <span /><span /><span /> </span>
            </div>
          </div>
        </div>

        <div class="ai-panel__input-wrap">
          <input
            v-model="aiQuestion"
            type="text"
            placeholder="Savolingizni yozing..."
            class="ai-panel__input"
            @keyup.enter="askAi"
          />
          <button class="ai-panel__send" @click="askAi">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";

const categoryStore = useCategoryStore();
const articleStore = useArticleStore();
const likeStore = useLikeStore();
const authStore = useAuthStore();
const route = useRoute();

const loading = ref(false);
const isLiked = ref(false);
const likeCount = ref(0);
const showAiPanel = ref(false);
const aiQuestion = ref("");
const aiLoading = ref(false);
const messagesEl = ref<HTMLElement | null>(null);
const tags = ref<string[]>([]);
const content = ref<any>(null);

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
];

const article = computed(() => articleStore.oneArticle);

const articleGradient = computed(
  () => gradients[(article.value?.id ?? 0) % gradients.length],
);

const relatedArticles = computed(() =>
  (categoryStore.categoryBySlug?.articles ?? [])
    .filter((a: any) => a.id !== article.value?.id)
    .slice(0, 3)
    .map((a: any, i: number) => ({
      ...a,
      gradient: gradients[i % gradients.length],
    })),
);

const readTime = computed(() => calcReadTime(content.value?.message ?? ""));

const popularArticles = computed(() =>
  (articleStore.allArticles ?? [])
    .filter((a: any) => a.id !== article.value?.id)
    .sort((a: any, b: any) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((a: any, i: number) => ({
      ...a,
      gradient: gradients[i % gradients.length],
    })),
);

// ✅ OPTIMISTIC TOGGLE LIKE — backend ulangan
const toggleLike = async () => {
  // Login bo'lmasa — login pagega
  if (!authStore.isLoggedIn) {
    ElNotification({
      title: "Diqqat",
      message: "Like bosish uchun avval kiring",
      type: "warning",
    });
    navigateTo("/login");
    return;
  }

  if (!article.value?.id) return;

  // 1. UI darhol yangilanadi (optimistic)
  isLiked.value = !isLiked.value;
  likeCount.value += isLiked.value ? 1 : -1;

  // 2. Backend ga so'rov
  const res = await likeStore.toggle(article.value.id);

  // 3. Xato bo'lsa qaytaramiz
  if (!res.success) {
    isLiked.value = !isLiked.value;
    likeCount.value += isLiked.value ? 1 : -1;

    ElNotification({
      title: "Xato",
      message: res.message,
      type: "error",
    });
  } else {
    // Backend dan keladigan aniq qiymat
    isLiked.value = res.data.isLiked;
    likeCount.value = res.data.likeCount;
  }
};

const handleShare = () => {
  if (process.client) {
    navigator.clipboard.writeText(window.location.href);
    ElNotification({
      title: "Muvaffaqiyatli",
      message: "Havola nusxalandi",
      type: "success",
    });
  }
};

const aiMessages = ref([
  {
    id: 1,
    role: "assistant",
    content: "Salom! Ushbu maqola bo'yicha savollaringizni bering.",
  },
]);

async function fetchContent(url: string): Promise<any | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch content from ${url}: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return null;
  }
}

const askAi = async () => {
  if (!aiQuestion.value.trim() || aiLoading.value) return;

  aiMessages.value.push({
    id: Date.now(),
    role: "user",
    content: aiQuestion.value,
  });

  const question = aiQuestion.value;
  aiQuestion.value = "";
  aiLoading.value = true;

  try {
    const token = process.client ? localStorage.getItem("access_token") : null;

    // Tarixni Groq formatida yuboramiz
    const history = aiMessages.value
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, -1) // oxirgi user savolni tashlaymiz — alohida yuboriladi
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const res = await $fetch<any>("/ai/explain", {
      method: "POST",
      baseURL: useRuntimeConfig().public.apiBase,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        text:
          content.value?.message?.replace(/<[^>]*>/g, "").slice(0, 500) ?? "",
        question,
        history, // 👈 qo'shildi
      },
    });

    aiMessages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: res.explanation,
    });
  } catch (e: any) {
    aiMessages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: "Xato yuz berdi. Qayta urinib ko'ring.",
    });
  } finally {
    aiLoading.value = false;
    await nextTick();
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  }
};

//SEO
useHead({
  title: () => `${article.value?.title ?? "Maqola"} — Bilim Manba`,
  meta: [
    { name: "description", content: () => article.value?.excerpt ?? "" },
    {
      property: "og:title",
      content: () => article.value?.title ?? "Bilim Manba",
    },
    { property: "og:description", content: () => article.value?.excerpt ?? "" },
    {
      property: "og:image",
      content: () => article.value.coverImage,
    },
    {
      property: "og:url",
      content: () =>
        `https://bilimmanba.uz/articles/${article.value.slug ?? ""}`,
    },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:image",
      content: () => article.value.coverImage,
    },
  ],
});

onMounted(async () => {
  loading.value = true;

  // 1. Maqolani olish
  await articleStore.getArticleBySlug(route.params.slug as string);

  // 2. Content (HTML) URL orqali olish
  if (articleStore.oneArticle?.content) {
    content.value = await fetchContent(articleStore.oneArticle.content);
  }

  // 3. Tags parsing
  if (articleStore.oneArticle?.tags) {
    tags.value = articleStore.oneArticle.tags
      .split(",")
      .map((t: string) => t.trim());
  }

  // 4. Like state ni backend dan olish
  if (articleStore.oneArticle) {
    likeCount.value = articleStore.oneArticle.likeCount ?? 0;
    isLiked.value = articleStore.oneArticle.isLiked ?? false;
  }

  // 5. Related maqolalar — xuddi shu kategoriyadan
  if (articleStore.oneArticle?.category?.name) {
    await categoryStore.getCategoryBySlug(
      articleStore.oneArticle.category.name,
    );
  }
  await articleStore.getAllArticles();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.article-page {
  padding: 2rem 0 4rem;
}

// BREADCRUMB
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  &__item {
    color: $text-secondary;
    transition: color 0.15s;
    &:hover {
      color: $primary;
    }
    &--active {
      color: $primary;
      font-weight: 600;
    }
  }

  &__sep {
    color: $text-muted;
  }
}

// GRID
.article-page__grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2.5rem;
  align-items: start;

  @media (max-width: $desktop) {
    grid-template-columns: 1fr;
  }
}

// ARTICLE MAIN
.article-main {
  min-width: 0;
}

// HEADER
.article-header {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 2rem;
  margin-bottom: 1.5rem;

  &__badges {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  &__title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }

  &__excerpt {
    font-size: 1rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding-top: 1.25rem;
    border-top: 1px solid $border-color;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  &__avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  &__author-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: $text-primary;
  }

  &__author-date {
    font-size: 0.78rem;
    color: $text-muted;
  }

  &__stats {
    display: flex;
    gap: 1rem;
    font-size: 0.825rem;
    color: $text-muted;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
    margin-left: auto;
  }

  &__action-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-pill;
    font-size: 0.825rem;
    font-weight: 600;
    color: $text-secondary;
    background: #fff;
    cursor: pointer;
    font-family: $font-primary;
    transition: all 0.2s;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    &--liked {
      border-color: $secondary;
      color: $secondary;
    }
  }
}

// Badge overrides
.badge {
  &--category {
    background: rgba($primary, 0.1);
    color: $primary;
    padding: 0.3rem 0.85rem;
    border-radius: $border-radius-pill;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
}

// COVER
.article-cover {
  border-radius: $border-radius;
  overflow: hidden;
  margin-bottom: 1.5rem;

  &__placeholder {
    height: 380px;
    width: 100%;

    @media (max-width: $tablet) {
      height: 240px;
    }
  }
}

// CONTENT
.article-content-wrap {
  position: relative;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 2rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.article-content {
  font-size: 1rem;
  line-height: 1.85;
  color: $text-primary;

  &--blurred {
    max-height: 320px;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  }

  :deep(p) {
    margin-bottom: 1.25rem;
  }

  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
    padding-left: 1rem;
    border-left: 4px solid $primary;
    color: $text-primary;
  }

  :deep(h3) {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 1.75rem 0 0.75rem;
    color: $text-primary;
  }

  :deep(blockquote) {
    border-left: 4px solid $primary;
    background: $primary-light;
    padding: 1rem 1.25rem;
    border-radius: 0 $border-radius-sm $border-radius-sm 0;
    margin: 1.5rem 0;
    font-style: italic;
    color: $text-secondary;
  }

  :deep(pre) {
    background: #1a1a2e;
    border-radius: $border-radius;
    padding: 1.25rem;
    overflow-x: auto;
    margin: 1.5rem 0;

    code {
      color: #e2e8f0;
      font-family: $font-mono;
      font-size: 0.875rem;
      line-height: 1.7;
      background: none;
      padding: 0;
    }
  }

  :deep(code) {
    background: rgba($primary, 0.1);
    color: $primary;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-size: 0.875em;
    font-family: $font-mono;
  }

  :deep(ol),
  :deep(ul) {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;

    li {
      margin-bottom: 0.5rem;
      line-height: 1.7;
    }
  }

  :deep(ol) {
    li::marker {
      color: $primary;
      font-weight: 700;
    }
  }

  :deep(ul) {
    li::marker {
      color: $primary;
    }
  }
}

// PAYWALL
.paywall {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 2rem;
  padding-top: 6rem;
  background: linear-gradient(to bottom, transparent, rgba(#f8f7ff, 0.98) 40%);

  &__card {
    background: #fff;
    border: 1px solid $border-color;
    border-radius: $border-radius-lg;
    padding: 2.5rem 2rem;
    text-align: center;
    max-width: 420px;
    width: 100%;
    box-shadow: $shadow-lg;
  }

  &__lock {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  &__desc {
    font-size: 0.875rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  &__price {
    font-size: 1.75rem;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 1.25rem;

    span {
      font-size: 0.9rem;
      color: $text-muted;
      font-weight: 400;
    }
  }

  &__btn {
    width: 100%;
    padding: 0.85rem;
    font-size: 1rem;
    margin-bottom: 0.85rem;
  }

  &__login {
    display: block;
    font-size: 0.875rem;
    color: $text-secondary;
    text-decoration: underline;

    span {
      color: $primary;
      font-weight: 600;
    }

    &:hover {
      color: $primary;
    }
  }
}

// ARTICLE FOOTER
.article-footer {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__share {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: $text-secondary;
  }

  &__share-label {
    font-weight: 500;
  }
}

.tag-chip {
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

.share-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid $border-color;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: $primary;
    transform: translateY(-1px);
  }
}

// RELATED
.related-section {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__link {
    font-size: 0.875rem;
    color: $primary;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

.related-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-lg;
    border-color: rgba($primary, 0.3);
  }

  &:hover .related-card__cover-img {
    transform: scale(1.05);
  }

  &__cover {
    position: relative;
    height: 160px;
    display: flex;
    align-items: flex-end;
    padding: 0.75rem;
    overflow: hidden;
  }

  &__cover-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    z-index: 1;
  }

  &__cover-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  &__cat {
    position: relative;
    z-index: 2;
    background: rgba(#fff, 0.95);
    color: $primary;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.3rem 0.7rem;
    border-radius: $border-radius-pill;
    text-transform: uppercase;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__body {
    padding: 1rem;
  }

  &__date {
    font-size: 0.75rem;
    color: $text-muted;
    display: block;
    margin-bottom: 0.35rem;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.4;
    color: $text-primary;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// SIDEBAR
.article-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 80px;
}

.sidebar-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.25rem;

  &__title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: $text-secondary;
    margin-bottom: 1rem;
  }
}

// AUTHOR CARD
.author-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;

  &__source {
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-muted;
  }

  &__avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
  }

  &__name {
    font-size: 1rem;
    font-weight: 700;
  }

  &__bio {
    font-size: 0.825rem;
    color: $text-secondary;
    line-height: 1.5;
  }

  &__link {
    font-size: 0.825rem;
    color: $primary;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}

// TABLE OF CONTENTS
.toc {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &__item {
    display: block;
    font-size: 0.85rem;
    color: $text-secondary;
    padding: 0.3rem 0.5rem;
    border-radius: $border-radius-sm;
    border-left: 2px solid transparent;
    transition: all 0.15s;
    line-height: 1.4;

    &:hover {
      color: $primary;
      border-left-color: $primary;
      background: $primary-light;
    }

    &--h3 {
      padding-left: 1.25rem;
      font-size: 0.8rem;
    }

    &--active {
      color: $primary;
      border-left-color: $primary;
      background: $primary-light;
      font-weight: 600;
    }
  }
}

// POPULAR
.popular-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.popular-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  transition: all 0.15s;
  border-radius: $border-radius-sm;
  padding: 0.5rem;
  margin: -0.5rem;

  &:hover {
    background: $bg-secondary;
  }

  &:hover .popular-item__cover-img {
    transform: scale(1.05);
  }

  &__cover {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: $border-radius-sm;
    overflow: hidden;
    flex-shrink: 0;
  }

  &__cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &__cover-placeholder {
    width: 100%;
    height: 100%;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 0.825rem;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.4;
    transition: color 0.15s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    &:hover {
      color: $primary;
    }
  }

  &__views {
    font-size: 0.75rem;
    color: $text-muted;
    display: block;
    margin-top: 0.25rem;
  }
}

.popular-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

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

// AI FAB
.ai-fab-wrap {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.ai-fab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: $primary;
  color: #fff;
  border: none;
  border-radius: $border-radius-pill;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: $font-primary;
  cursor: pointer;
  box-shadow: $shadow-lg;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  animation: ai-bounce 2s ease-in-out infinite;

  &:hover {
    background: $primary-dark;
    transform: translateY(-2px);
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(#fff, 0.4) 50%,
      transparent 100%
    );
    animation: ai-shimmer 2.5s ease-in-out infinite;
  }
}

@keyframes ai-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Shimmer o'tish */
@keyframes ai-shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}

// AI PANEL
.ai-panel {
  width: 340px;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  display: flex;
  flex-direction: column;
  max-height: 420px;

  @media (max-width: $mobile) {
    width: calc(100vw - 2rem);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid $border-color;
    font-weight: 700;
    font-size: 0.9rem;
    color: $primary;
  }

  &__close {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: $text-muted;
    font-family: $font-primary;
    transition: color 0.15s;

    &:hover {
      color: $danger;
    }
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__input-wrap {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid $border-color;
  }

  &__input {
    flex: 1;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-pill;
    padding: 0.5rem 0.85rem;
    font-size: 0.875rem;
    outline: none;
    font-family: $font-primary;
    transition: border-color 0.2s;

    &:focus {
      border-color: $primary;
    }
  }

  &__send {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }
}

// AI Messages
.ai-msg {
  display: flex;
  justify-content: flex-start;

  &--user {
    justify-content: flex-end;
  }

  &__bubble {
    max-width: 85%;
    padding: 0.65rem 0.9rem;
    border-radius: $border-radius;
    font-size: 0.825rem;
    line-height: 1.5;
    background: $bg-secondary;
    color: $text-primary;
    border: 1px solid $border-color;

    .ai-msg--user & {
      background: $primary;
      color: #fff;
      border-color: $primary;
    }

    &--loading {
      padding: 0.85rem 1rem;
    }
  }
}

// Typing animation
.ai-typing {
  display: flex;
  gap: 4px;
  align-items: center;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $text-muted;
    animation: typing 1.2s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}
</style>
