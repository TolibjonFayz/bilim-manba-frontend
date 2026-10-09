<template>
  <div class="admin-articles">
    <div class="admin-page__header">
      <h1 class="admin-page__title">Maqolalar</h1>
      <div class="admin-page__actions">
        <button class="btn btn--outline" @click="openAi">🤖 AI qoralama</button>
        <NuxtLink to="/admin/articles/create" class="btn btn--primary">
          + Yangi maqola
        </NuxtLink>
      </div>
    </div>

    <!-- Avtomatik nashr holati -->
    <div v-if="pubStatus" class="pub-status">
      <span
        class="pub-status__item"
        :class="pubStatus.telegramConfigured ? 'is-ok' : 'is-warn'"
      >
        {{
          pubStatus.telegramConfigured
            ? "✈️ Telegram kanal ulangan"
            : "⚠️ Telegram ulanmagan — postlar kanalga ketmaydi"
        }}
      </span>
      <span
        class="pub-status__item"
        :class="pubStatus.instagramConfigured ? 'is-ok' : 'is-warn'"
      >
        {{
          pubStatus.instagramConfigured
            ? "📸 Instagram ulangan"
            : "⚠️ Instagram ulanmagan"
        }}
      </span>
      <span
        v-if="aiSettings"
        class="pub-status__item pub-status__item--click"
        :class="
          aiSettings.lastError ? 'is-warn' : aiSettings.daily ? 'is-ok' : ''
        "
        :title="aiSettings.lastError || 'AI qoralama sozlamalari'"
        @click="openAi"
      >
        🤖
        {{
          aiSettings.daily
            ? `Kunlik AI qoralama: ${String(aiSettings.dailyHour).padStart(2, "0")}:00`
            : "Kunlik AI qoralama o'chiq"
        }}
        <template v-if="aiSettings.pending">
          · {{ aiSettings.pending }} ta ko'rib chiqilmagan</template
        >
      </span>
      <span class="pub-status__item">
        ⏰
        {{
          pubStatus.nextScheduledAt
            ? `Keyingi rejali maqola: ${formatDateTime(pubStatus.nextScheduledAt)}`
            : "Rejalashtirilgan maqola yo'q"
        }}
      </span>
    </div>

    <div class="admin-table-wrap" v-loading="loading">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sarlavha</th>
            <th>Kategoriya</th>
            <th>Statistika</th>
            <th>Sana</th>
            <th>Status</th>
            <th>Tarmoqlar</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in adminStore.articles" :key="article.id">
            <td class="col-title">
              <div class="admin-table__title" :title="article.title">
                {{ article.title }}
              </div>
              <div class="admin-table__slug" :title="article.slug">
                {{ article.slug }}
              </div>
            </td>
            <td>
              <span class="admin-table__badge">
                {{ article.category?.name ?? "—" }}
              </span>
            </td>
            <td class="nowrap">
              <div class="stats">
                <span title="Ko'rishlar">👁 {{ article.viewCount }}</span>
                <span title="Like">❤️ {{ article.likeCount }}</span>
              </div>
            </td>
            <td class="nowrap">
              {{ article.createdAt ? formatDate(article.createdAt) : "—" }}
            </td>
            <td>
              <button
                class="status-badge"
                :class="
                  article.status === 'published'
                    ? 'status-badge--published'
                    : article.scheduledAt
                      ? 'status-badge--scheduled'
                      : 'status-badge--draft'
                "
                :title="
                  article.status === 'published'
                    ? 'Qoralamaga qaytarish'
                    : 'Hozir chop etish'
                "
                @click="handleToggleStatus(article)"
              >
                {{
                  article.status === "published"
                    ? "✅ Chop etilgan"
                    : article.scheduledAt
                      ? `⏰ ${formatDateTime(article.scheduledAt)}`
                      : "📝 Qoralama"
                }}
              </button>
            </td>
            <td>
              <div class="social">
                <!-- Telegram -->
                <div class="social__row">
                  <span
                    v-if="article.telegramPostedAt"
                    class="social__done"
                    :title="`Telegram: ${formatDateTime(article.telegramPostedAt)}`"
                    >✈️ Telegram ✓</span
                  >
                  <button
                    v-else-if="article.status === 'published'"
                    class="social__btn"
                    :disabled="tgSending === article.id"
                    title="Telegram kanalga yuborish"
                    @click="handleTelegram(article)"
                  >
                    {{ tgSending === article.id ? "⏳" : "✈️ Telegram'ga" }}
                  </button>
                  <span v-else class="social__none">✈️ —</span>
                </div>
                <!-- Instagram -->
                <div class="social__row">
                  <span
                    v-if="
                      article.instagramPostedAt &&
                      article.instagramStoryPostedAt
                    "
                    class="social__done"
                    :title="`Instagram: ${formatDateTime(article.instagramPostedAt)}`"
                    >📸 Instagram ✓</span
                  >
                  <button
                    v-else-if="article.status === 'published'"
                    class="social__btn"
                    :disabled="igSending === article.id"
                    :title="
                      article.instagramPostedAt ||
                      article.instagramStoryPostedAt
                        ? 'Yetishmaganini yuborish (post yoki story)'
                        : 'Post + story'
                    "
                    @click="handleInstagram(article)"
                  >
                    {{ igSending === article.id ? "⏳" : "📸 Instagram'ga" }}
                  </button>
                  <span v-else class="social__none">📸 —</span>
                  <button
                    class="social__eye"
                    title="Instagram rasmini oldindan ko'rish"
                    @click="openPreview(article)"
                  >
                    👁
                  </button>
                </div>
              </div>
            </td>
            <td>
              <div class="admin-table__actions">
                <NuxtLink
                  :to="`/admin/articles/${article.id}/edit`"
                  class="admin-table__btn admin-table__btn--edit"
                  title="Tahrirlash"
                >
                  ✏️
                </NuxtLink>
                <button
                  class="admin-table__btn admin-table__btn--delete"
                  title="O'chirish"
                  @click="handleDelete(article.id, article.title)"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- AI qoralama oynasi -->
      <div v-if="ai.open" class="ig-preview" @click.self="closeAi">
        <div class="ig-preview__box ai-box">
          <div class="ig-preview__head">
            <strong>🤖 AI qoralama</strong>
            <button
              class="admin-table__btn"
              :disabled="ai.generating"
              @click="closeAi"
            >
              ✕
            </button>
          </div>

          <p class="ai-box__hint">
            AI bir nechta erkin manbadan — Wikipedia maqolalari va arXiv'dagi
            yangi ilmiy ishlardan — faktlarni yig'ib, o'zbekcha maqola yozadi va
            <strong>qoralama</strong> qilib saqlaydi. Siz o'qib chiqasiz, muqova
            qo'yasiz, keyin chop etasiz yoki vaqtini belgilaysiz.
          </p>

          <label class="ai-box__label" for="ai-topic">Mavzu</label>
          <input
            id="ai-topic"
            v-model="ai.topic"
            class="ai-box__input"
            type="text"
            placeholder="Masalan: Qora tuynuklar, Amir Temur yoki Wikipedia havolasi"
            :disabled="ai.generating"
            @keyup.enter="handleGenerate"
          />
          <small class="ai-box__small">
            Bo'sh qoldirsangiz — Wikipedia'ning bugungi tanlangan maqolasi.
          </small>

          <label class="ai-box__label" for="ai-category">Kategoriya</label>
          <select
            id="ai-category"
            v-model="ai.categoryId"
            class="ai-box__input"
            :disabled="ai.generating"
          >
            <option value="">AI o'zi tanlasin</option>
            <option
              v-for="c in adminStore.categories"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </select>

          <button
            class="btn btn--primary ai-box__go"
            :disabled="ai.generating"
            @click="handleGenerate"
          >
            {{
              ai.generating
                ? "⏳ AI yozmoqda… (odatda 20–60 soniya)"
                : "✍️ Qoralama yozish"
            }}
          </button>

          <div v-if="aiSettings" class="ai-box__daily">
            <strong>Kunlik qoralama</strong>
            <label class="ai-box__check">
              <input v-model="ai.daily" type="checkbox" />
              Har kuni {{ String(aiSettings.dailyHour).padStart(2, "0") }}:00 da
              bitta qoralama yozilsin
            </label>
            <label class="ai-box__label" for="ai-topics"
              >Navbatdagi mavzular (har qatorda bitta)</label
            >
            <textarea
              id="ai-topics"
              v-model="ai.topicsText"
              class="ai-box__input"
              rows="5"
              placeholder="Fotosintez&#10;Messi va 2022 yilgi jahon chempionati&#10;https://en.wikipedia.org/wiki/Silk_Road"
            />
            <small class="ai-box__small">
              Navbat bo'sh bo'lsa — Wikipedia'ning kunlik tanlangan maqolasi.
              Ko'rib chiqilmagan {{ aiSettings.maxPending }} ta AI qoralama
              to'planib qolsa, yangisi yozilmaydi.
            </small>
            <div class="ai-box__meta">
              <span>Oxirgi: {{ aiSettings.lastRun || "—" }}</span>
              <span>Ko'rib chiqilmagan: {{ aiSettings.pending }}</span>
              <span v-if="aiSettings.model">Model: {{ aiSettings.model }}</span>
            </div>
            <div v-if="aiSettings.lastError" class="ai-box__error">
              ⚠️ {{ aiSettings.lastError }}
            </div>
            <button
              class="btn btn--outline"
              :disabled="ai.saving"
              @click="handleSaveAi"
            >
              {{ ai.saving ? "⏳" : "💾 Saqlash" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Instagram rasmini oldindan ko'rish -->
      <div v-if="preview.open" class="ig-preview" @click.self="closePreview">
        <div class="ig-preview__box">
          <div class="ig-preview__head">
            <strong>{{ preview.title }}</strong>
            <button class="admin-table__btn" @click="closePreview">✕</button>
          </div>
          <div v-if="preview.loading" class="ig-preview__loading">
            ⏳ Rasm tayyorlanmoqda…
          </div>
          <div v-else-if="preview.error" class="ig-preview__loading">
            ⚠️ {{ preview.error }}
          </div>
          <div v-else class="ig-preview__imgs">
            <figure>
              <img :src="preview.feed" alt="Instagram post" />
              <figcaption>Post (1080×1350)</figcaption>
            </figure>
            <figure>
              <img :src="preview.story" alt="Instagram story" />
              <figcaption>Story (1080×1920)</figcaption>
            </figure>
          </div>
        </div>
      </div>

      <div v-if="!adminStore.articles.length && !loading" class="admin-empty">
        <span>📝</span>
        <p>Hali maqola yo'q</p>
        <NuxtLink to="/admin/articles/create" class="btn btn--primary">
          Birinchi maqolani qo'shing
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({ middleware: "admin", layout: "admin" });

const adminStore = useAdminStore();
const loading = ref(false);
const pubStatus = ref<any>(null);
const tgSending = ref<number | null>(null);
const igSending = ref<number | null>(null);
const preview = reactive({
  open: false,
  loading: false,
  error: "",
  title: "",
  feed: "",
  story: "",
});

const loadPublishingStatus = async () => {
  const res = await adminStore.getPublishingStatus();
  if (res.success) pubStatus.value = res.data;
};

// ---- AI qoralama ----
const aiSettings = ref<any>(null);
const ai = reactive({
  open: false,
  topic: "",
  categoryId: "" as number | "",
  generating: false,
  daily: true,
  topicsText: "",
  saving: false,
});

const loadAiSettings = async () => {
  const res = await adminStore.getDraftSettings();
  if (res.success) {
    aiSettings.value = res.data;
    ai.daily = res.data.daily;
    ai.topicsText = (res.data.topics ?? []).join("\n");
  }
};

const openAi = async () => {
  ai.open = true;
  if (!adminStore.categories.length) await adminStore.getCategories();
  await loadAiSettings();
};

const closeAi = () => {
  if (!ai.generating) ai.open = false;
};

const handleGenerate = async () => {
  if (ai.generating) return;
  ai.generating = true;
  const res = await adminStore.generateDraft(ai.topic.trim(), ai.categoryId);
  ai.generating = false;
  if (res.success) {
    ElMessage({
      type: "success",
      message: `✍️ Qoralama tayyor: ${res.data.title}`,
    });
    ai.open = false;
    ai.topic = "";
    await navigateTo(`/admin/articles/${res.data.id}/edit`);
  } else {
    ElMessage({ type: "error", message: res.message, duration: 8000 });
  }
};

const handleSaveAi = async () => {
  ai.saving = true;
  const res = await adminStore.updateDraftSettings({
    daily: ai.daily,
    topics: ai.topicsText.split("\n"),
  });
  ai.saving = false;
  if (res.success) {
    aiSettings.value = res.data;
    ai.topicsText = (res.data.topics ?? []).join("\n");
    ElMessage({ type: "success", message: "💾 Saqlandi" });
  } else {
    ElMessage({ type: "error", message: res.message });
  }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    adminStore.getArticles(),
    loadPublishingStatus(),
    loadAiSettings(),
  ]);
  loading.value = false;
});

const handleToggleStatus = async (article: any) => {
  const newStatus = article.status === "published" ? "draft" : "published";
  if (newStatus === "published") {
    try {
      await ElMessageBox.confirm(
        `"${article.title}" hozir chop etilsinmi? Telegram kanalga ham post ketadi.`,
        "Chop etish",
        {
          confirmButtonText: "Ha, chop et",
          cancelButtonText: "Bekor",
          type: "info",
        },
      );
    } catch {
      return;
    }
  }
  const res = await adminStore.updateArticle(article.id, { status: newStatus });
  if (res.success) {
    // Sana, Telegram holati va jadval o'zgaradi — ro'yxatni yangilaymiz
    await Promise.all([adminStore.getArticles(), loadPublishingStatus()]);
    ElMessage({
      type: "success",
      message:
        newStatus === "published"
          ? "✅ Chop etildi!"
          : "📝 Qoralamaga o'tkazildi!",
    });
  }
};

const handleTelegram = async (article: any) => {
  tgSending.value = article.id;
  const res = await adminStore.postToTelegram(article.id);
  tgSending.value = null;
  if (res.success && res.data?.sent) {
    article.telegramPostedAt = new Date().toISOString();
    ElMessage({ type: "success", message: "✈️ Telegram kanalga yuborildi" });
  } else {
    ElMessage({
      type: "error",
      message: res.success
        ? "Telegram ulanmagan (Render sozlamalarini tekshiring)"
        : res.message,
    });
  }
};

const handleInstagram = async (article: any) => {
  igSending.value = article.id;
  const res = await adminStore.postToInstagram(article.id);
  igSending.value = null;
  if (res.success) {
    if (res.data?.post) article.instagramPostedAt = new Date().toISOString();
    if (res.data?.story)
      article.instagramStoryPostedAt = new Date().toISOString();
    ElMessage({
      type: "success",
      message: "📸 Instagram'ga yuborildi (post + story)",
    });
  } else {
    ElMessage({ type: "error", message: res.message, duration: 6000 });
  }
};

const openPreview = async (article: any) => {
  Object.assign(preview, {
    open: true,
    loading: true,
    error: "",
    title: article.title,
  });
  const [feed, story] = await Promise.all([
    adminStore.getSocialPreview(article.id, "feed"),
    adminStore.getSocialPreview(article.id, "story"),
  ]);
  if (feed.success && story.success) {
    Object.assign(preview, {
      feed: feed.data,
      story: story.data,
      loading: false,
    });
  } else {
    Object.assign(preview, {
      loading: false,
      error: feed.message || story.message,
    });
  }
};

const closePreview = () => {
  if (preview.feed) URL.revokeObjectURL(preview.feed);
  if (preview.story) URL.revokeObjectURL(preview.story);
  Object.assign(preview, { open: false, feed: "", story: "" });
};

const handleDelete = async (id: number, title: string) => {
  try {
    await ElMessageBox.confirm(
      `"${title}" maqolasini o'chirishni tasdiqlaysizmi?`,
      "O'chirish",
      {
        confirmButtonText: "Ha, o'chir",
        cancelButtonText: "Bekor",
        type: "warning",
      },
    );
    const res = await adminStore.deleteArticle(id);
    if (res.success) {
      ElMessage({ type: "success", message: "Maqola o'chirildi!" });
    }
  } catch {}
};
</script>

<style lang="scss" scoped>
.admin-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
}

.admin-page__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ai-box {
  max-width: 560px;
  display: flex;
  flex-direction: column;

  &__hint {
    font-size: 0.85rem;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 700;
    color: $text-secondary;
    margin: 0.75rem 0 0.35rem;
  }

  &__input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    font-family: $font-primary;
    font-size: 0.9rem;
    background: #fff;
    resize: vertical;

    &:focus {
      outline: 2px solid rgba($primary, 0.35);
      border-color: $primary;
    }
  }

  &__small {
    font-size: 0.75rem;
    color: $text-muted;
    margin-top: 0.3rem;
    line-height: 1.4;
  }

  &__go {
    margin-top: 1rem;
    justify-content: center;
  }

  &__daily {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    > .btn {
      align-self: flex-start;
      margin-top: 0.75rem;
    }
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    margin-top: 0.5rem;
    cursor: pointer;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: $text-muted;
    margin-top: 0.5rem;
  }

  &__error {
    font-size: 0.8rem;
    color: #b45309;
    background: rgba(180, 83, 9, 0.06);
    border: 1px solid rgba(180, 83, 9, 0.3);
    border-radius: $border-radius-sm;
    padding: 0.5rem 0.75rem;
    margin-top: 0.5rem;
  }
}

.admin-table-wrap {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow-x: auto;
}

.pub-status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;

  &__item {
    font-size: 0.85rem;
    padding: 0.5rem 0.9rem;
    border-radius: $border-radius-sm;
    background: $bg-secondary;
    border: 1px solid $border-color;
    color: $text-secondary;

    &.is-ok {
      color: #15803d;
      border-color: rgba(21, 128, 61, 0.3);
      background: rgba(21, 128, 61, 0.06);
    }

    &.is-warn {
      color: #b45309;
      border-color: rgba(180, 83, 9, 0.3);
      background: rgba(180, 83, 9, 0.06);
    }

    &--click {
      cursor: pointer;
    }
  }
}

.nowrap {
  white-space: nowrap;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: $text-secondary;
}

.social {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &__row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
  }

  &__done {
    font-size: 0.78rem;
    font-weight: 600;
    color: #15803d;
  }

  &__none {
    font-size: 0.78rem;
    color: $text-muted;
  }

  &__btn,
  &__eye {
    height: 26px;
    border: 1px solid rgba($primary, 0.25);
    background: rgba($primary, 0.06);
    color: $primary;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: $font-primary;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: rgba($primary, 0.14);
    }

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }

  &__btn {
    padding: 0 0.55rem;
  }

  &__eye {
    width: 26px;
    padding: 0;
  }
}

.ig-preview {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 15, 30, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  &__box {
    background: #fff;
    border-radius: $border-radius;
    padding: 1.25rem;
    max-width: 760px;
    width: 100%;
    max-height: 92vh;
    overflow: auto;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__loading {
    padding: 3rem 0;
    text-align: center;
    color: $text-secondary;
  }

  &__imgs {
    display: grid;
    grid-template-columns: 1fr 0.75fr;
    gap: 1rem;
    align-items: start;

    figure {
      margin: 0;
    }

    img {
      width: 100%;
      height: auto;
      border-radius: $border-radius-sm;
      border: 1px solid $border-color;
    }

    figcaption {
      font-size: 0.75rem;
      color: $text-muted;
      margin-top: 0.35rem;
      text-align: center;
    }
  }
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: $font-primary;
  transition: all 0.2s;
  white-space: nowrap;

  &--published {
    background: rgba(#43d98b, 0.12);
    color: #1a9e5e;
    &:hover {
      background: rgba(#43d98b, 0.2);
    }
  }

  &--scheduled {
    background: rgba($primary, 0.1);
    color: $primary;
    white-space: nowrap;
    &:hover {
      background: rgba($primary, 0.18);
    }
  }

  &--draft {
    background: rgba($text-muted, 0.12);
    color: $text-muted;
    &:hover {
      background: rgba($text-muted, 0.2);
    }
  }
}

.admin-table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: $bg-secondary;
    padding: 0.875rem 0.7rem;
    text-align: left;
    white-space: nowrap;
    font-size: 0.8rem;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid $border-color;
  }

  td {
    padding: 0.85rem 0.7rem;
    border-bottom: 1px solid $border-color;
    font-size: 0.875rem;
    color: $text-primary;
    vertical-align: middle;

    &:last-child {
      border-bottom: none;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background: $bg-secondary;
  }

  // Sarlavha ekran eniga qarab qisqaradi, qolgan ustunlar sig'ishi uchun
  .col-title {
    min-width: 180px;
    max-width: clamp(180px, 18vw, 380px);
  }

  &__title,
  &__slug {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__title {
    font-weight: 600;
    margin-bottom: 0.2rem;
  }

  &__slug {
    font-size: 0.75rem;
    color: $text-muted;
  }

  &__badge {
    background: rgba($primary, 0.1);
    color: $primary;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  &__btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    transition: all 0.15s;

    &--edit {
      background: rgba($primary, 0.1);
      &:hover {
        background: rgba($primary, 0.2);
      }
    }

    &--delete {
      background: rgba($danger, 0.1);
      &:hover {
        background: rgba($danger, 0.2);
      }
    }
  }
}

.admin-empty {
  padding: 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 3rem;

  p {
    font-size: 1rem;
    color: $text-secondary;
  }
}
</style>
