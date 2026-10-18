<template>
  <div class="admin-preview">
    <!-- Amallar paneli -->
    <div class="preview-bar">
      <NuxtLink to="/admin/articles" class="btn btn--outline"
        >← Ro'yxat</NuxtLink
      >

      <div v-if="article" class="preview-bar__actions">
        <span class="preview-bar__status" :class="`is-${statusKind}`">
          {{ statusLabel }}
        </span>
        <NuxtLink
          :to="`/admin/articles/${article.id}/edit`"
          class="btn btn--outline"
          >✏️ Tahrirlash</NuxtLink
        >
        <button
          class="btn btn--outline"
          :disabled="busy || coverBusy"
          title="AI erkin rasm bazalaridan yangi muqova tanlaydi (18+ tekshiruvi bilan)"
          @click="handleRegenerateCover"
        >
          {{ coverBusy ? "⏳ Rasm qidirilmoqda…" : "🔄 Muqovani almashtirish" }}
        </button>
        <template v-if="article.status === 'draft'">
          <button
            class="btn btn--outline"
            :disabled="busy"
            @click="scheduleOpen = !scheduleOpen"
          >
            ⏰ Rejalashtirish
          </button>
          <button
            class="btn btn--primary"
            :disabled="busy"
            @click="handlePublish"
          >
            ✅ Hozir chop etish
          </button>
          <button
            class="btn btn--danger-outline"
            :disabled="busy"
            @click="handleDelete"
          >
            🗑
          </button>
        </template>
        <a
          v-else
          :href="`/articles/${article.slug}`"
          target="_blank"
          class="btn btn--primary"
          >🌐 Saytda ochish</a
        >
      </div>
    </div>

    <div v-if="scheduleOpen && article" class="schedule-box">
      <label for="schedule-at">Chop etish vaqti (Toshkent)</label>
      <input id="schedule-at" v-model="scheduleLocal" type="datetime-local" />
      <button
        class="btn btn--primary"
        :disabled="busy || !scheduleLocal"
        @click="handleSchedule"
      >
        💾 Saqlash
      </button>
      <button
        v-if="article.scheduledAt"
        class="btn btn--outline"
        :disabled="busy"
        @click="handleUnschedule"
      >
        Vaqtni olib tashlash
      </button>
    </div>

    <div v-if="loading" class="preview-loading">⏳ Yuklanmoqda…</div>
    <div v-else-if="error" class="alert alert--danger">⚠️ {{ error }}</div>

    <template v-else-if="article">
      <div v-if="isAi && article.status === 'draft'" class="alert alert--info">
        🤖 <strong>AI qoralama.</strong> O'qib chiqing: raqamlar, sanalar va
        ismlarni tekshiring. Kerak bo'lsa "Tahrirlash"da tuzating, so'ng chop
        eting yoki vaqtini belgilang.
      </div>
      <div v-if="!article.coverImage" class="alert alert--warn">
        🖼 Muqova rasmi yo'q — "Tahrirlash"da qo'shing (Telegram va Instagram
        postlari muqova bilan chiroyliroq chiqadi).
      </div>

      <AdminFactCheck
        :article-id="article.id"
        @issues="onIssues"
        @focus="focusQuote"
      />

      <!-- Saytdagidek ko'rinish -->
      <article class="preview-article">
        <img
          v-if="article.coverImage"
          :src="cldImg(article.coverImage, 1200)"
          :alt="article.title"
          class="preview-article__cover"
        />
        <div class="preview-article__meta">
          <span v-if="article.category?.name" class="preview-article__badge">{{
            article.category.name
          }}</span>
          <span>📖 {{ readTime }} daqiqa</span>
          <span v-if="article.source">✍️ {{ article.source }}</span>
        </div>
        <h1 class="preview-article__title">{{ article.title }}</h1>
        <p v-if="article.excerpt" class="preview-article__excerpt">
          {{ article.excerpt }}
        </p>
        <div ref="contentEl" class="article-content" v-html="content" />
        <div v-if="tags.length" class="preview-article__tags">
          <span v-for="t in tags" :key="t">#{{ t }}</span>
        </div>
      </article>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";

definePageMeta({ middleware: "admin", layout: "admin" });

const route = useRoute();
const adminStore = useAdminStore();

const article = ref<any>(null);
const content = ref("");
const loading = ref(true);
const error = ref("");
const busy = ref(false);
const coverBusy = ref(false);
const scheduleOpen = ref(false);
const scheduleLocal = ref("");

const isAi = computed(() => /Bilim Manba AI/.test(article.value?.source ?? ""));
const readTime = computed(() => calcReadTime(content.value));
const tags = computed(() =>
  String(article.value?.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
);
const statusKind = computed(() =>
  article.value?.status === "published"
    ? "published"
    : article.value?.scheduledAt
      ? "scheduled"
      : "draft",
);
const statusLabel = computed(() =>
  statusKind.value === "published"
    ? "✅ Chop etilgan"
    : statusKind.value === "scheduled"
      ? `⏰ ${formatDateTime(article.value.scheduledAt)}`
      : "📝 Qoralama",
);

const load = async () => {
  loading.value = true;
  error.value = "";
  const res = await adminStore.getArticle(+route.params.id);
  if (!res.success || !res.data) {
    error.value = "Maqola topilmadi";
    loading.value = false;
    return;
  }
  article.value = res.data;
  scheduleLocal.value = isoToTashkentLocal(res.data.scheduledAt);
  if (res.data.content) {
    try {
      const c = await $fetch<any>(res.data.content);
      content.value = c?.message ?? "";
    } catch {
      error.value = "Maqola matnini yuklab bo'lmadi";
    }
  }
  loading.value = false;
};

// Fakt-tekshiruvdagi shubhali parchalar matnda sariq bilan belgilanadi
const contentEl = ref<HTMLElement | null>(null);
const issueQuotes = ref<string[]>([]);
// Tutuq belgilari va katta-kichik harf farqi e'tiborsiz (uzunlik o'zgarmaydi)
const norm = (s: string) => s.toLowerCase().replace(/[‘’ʻʼ`]/g, "'");

const highlight = () => {
  const root = contentEl.value;
  if (!root) return;
  root.innerHTML = content.value;
  for (const quote of issueQuotes.value) {
    const q = norm(quote);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const idx = norm(node.nodeValue ?? "").indexOf(q);
      if (idx < 0) continue;
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + q.length);
      const mark = document.createElement("mark");
      mark.className = "fc-mark";
      mark.dataset.quote = q;
      range.surroundContents(mark);
      break;
    }
  }
};

const onIssues = (list: { quote: string }[]) => {
  issueQuotes.value = list.map((i) => i.quote);
  nextTick(highlight);
};

const focusQuote = (quote: string) => {
  const el = [...(contentEl.value?.querySelectorAll<HTMLElement>(".fc-mark") ?? [])].find(
    (m) => m.dataset.quote === norm(quote),
  );
  if (!el) return ElMessage({ type: "info", message: "Bu parcha matnda topilmadi (tahrirlangan bo'lishi mumkin)" });
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("is-flash");
  void el.offsetWidth;
  el.classList.add("is-flash");
};

watch(content, () => nextTick(highlight));

onMounted(load);

const handlePublish = async () => {
  const a = article.value;
  try {
    await ElMessageBox.confirm(
      `"${a.title}" hozir chop etilsinmi? Telegram va Instagram'ga ham post ketadi.` +
        (a.coverImage ? "" : "\n\n⚠️ Muqova rasmi yo'q."),
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
  busy.value = true;
  const res = await adminStore.updateArticle(a.id, { status: "published" });
  busy.value = false;
  if (res.success) {
    ElMessage({ type: "success", message: "✅ Chop etildi!" });
    await load();
  } else {
    ElMessage({ type: "error", message: res.message });
  }
};

const handleSchedule = async () => {
  busy.value = true;
  const res = await adminStore.updateArticle(article.value.id, {
    scheduledAt: tashkentLocalToIso(scheduleLocal.value),
  });
  busy.value = false;
  if (res.success) {
    scheduleOpen.value = false;
    ElMessage({
      type: "success",
      message: `⏰ ${formatDateTime(res.data?.scheduledAt)} da chop etiladi`,
    });
    await load();
  } else {
    ElMessage({ type: "error", message: res.message });
  }
};

const handleUnschedule = async () => {
  busy.value = true;
  const res = await adminStore.updateArticle(article.value.id, {
    scheduledAt: null,
  });
  busy.value = false;
  if (res.success) {
    scheduleLocal.value = "";
    ElMessage({
      type: "success",
      message: "Vaqt olib tashlandi — qoralama bo'lib qoldi",
    });
    await load();
  }
};

const handleRegenerateCover = async () => {
  coverBusy.value = true;
  const res = await adminStore.regenerateCover(article.value.id);
  coverBusy.value = false;
  if (res.success) {
    ElMessage({
      type: res.data?.coverImage ? "success" : "warning",
      message: res.data?.coverImage
        ? `🖼 Yangi muqova: ${res.data.cover?.title ?? ""} (${res.data.cover?.provider ?? ""})`
        : "Mos va xavfsiz rasm topilmadi — muqovani \"Tahrirlash\"da o'zingiz qo'ying",
      duration: 6000,
    });
    await load();
  } else {
    ElMessage({ type: "error", message: res.message, duration: 8000 });
  }
};

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `"${article.value.title}" qoralamasi o'chirilsinmi?`,
      "O'chirish",
      {
        confirmButtonText: "Ha, o'chir",
        cancelButtonText: "Bekor",
        type: "warning",
      },
    );
  } catch {
    return;
  }
  busy.value = true;
  const res = await adminStore.deleteArticle(article.value.id);
  busy.value = false;
  if (res.success) {
    ElMessage({ type: "success", message: "Qoralama o'chirildi" });
    await navigateTo("/admin/articles");
  }
};
</script>

<style lang="scss" scoped>
.preview-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  z-index: 5;
  background: $bg-secondary;
  padding: 0.5rem 0;

  &__actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  &__status {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.3rem 0.75rem;
    border-radius: $border-radius-pill;

    &.is-published {
      background: rgba(#43d98b, 0.12);
      color: var(--c-success-strong);
    }
    &.is-scheduled {
      background: rgba(var(--c-primary-rgb), 0.1);
      color: $primary;
    }
    &.is-draft {
      background: rgba(var(--c-muted-rgb), 0.12);
      color: $text-muted;
    }
  }
}

.btn--danger-outline {
  border: 1px solid rgba($danger, 0.35);
  color: $danger;
  background: $bg-primary;

  &:hover:not(:disabled) {
    background: rgba($danger, 0.08);
  }
}

.schedule-box {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;

  input {
    padding: 0.45rem 0.6rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    font-family: $font-primary;
  }
}

.preview-loading {
  padding: 4rem;
  text-align: center;
  color: $text-secondary;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
  }

  &--info {
    background: rgba(var(--c-primary-rgb), 0.06);
    border: 1px solid rgba(var(--c-primary-rgb), 0.25);
    color: $text-primary;
  }

  &--warn {
    background: rgba(180, 83, 9, 0.06);
    border: 1px solid rgba(180, 83, 9, 0.3);
    color: var(--c-warning-text);
  }
}

.preview-article {
  max-width: 780px;
  margin: 0 auto;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 2rem;

  @media (max-width: 640px) {
    padding: 1.1rem;
  }

  &__cover {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: $border-radius-sm;
    margin-bottom: 1.25rem;
    display: block;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.8rem;
    color: $text-muted;
    margin-bottom: 0.75rem;
  }

  &__badge {
    background: rgba(var(--c-primary-rgb), 0.1);
    color: $primary;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
    font-weight: 600;
  }

  &__title {
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    margin-bottom: 0.75rem;
  }

  &__excerpt {
    font-size: 1.05rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid $border-color;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.5rem;
    font-size: 0.8rem;
    color: $primary;
  }
}

// Saytdagi maqola sahifasi bilan bir xil matn uslubi
.article-content {
  font-size: 1rem;
  line-height: 1.85;
  color: $text-primary;

  :deep(p) {
    margin-bottom: 1.25rem;
  }

  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
    padding-left: 1rem;
    border-left: 4px solid $primary;
  }

  :deep(h3) {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 1.75rem 0 0.75rem;
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

  :deep(ol),
  :deep(ul) {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;

    li {
      margin-bottom: 0.5rem;
      line-height: 1.7;
    }
  }

  :deep(li::marker) {
    color: $primary;
  }

  :deep(a) {
    color: $primary;
  }
}
</style>

<style lang="scss">
.admin-preview .fc-mark {
  background: rgba(250, 204, 21, 0.45);
  color: inherit;
  padding: 0 0.15em;
  border-radius: 3px;
  scroll-margin-top: 6rem;

  &.is-flash {
    animation: fc-flash 1.2s ease 2;
  }
}

@keyframes fc-flash {
  50% {
    background: rgba(245, 158, 11, 0.85);
  }
}
</style>
