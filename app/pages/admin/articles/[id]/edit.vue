<template>
  <div class="admin-article-form">
    <div class="admin-page__header">
      <h1 class="admin-page__title">Maqolani tahrirlash</h1>
      <NuxtLink to="/admin/articles" class="btn btn--outline"
        >← Orqaga</NuxtLink
      >
    </div>

    <div v-loading="pageLoading" class="admin-form-card">
      <div v-if="success" class="alert alert--success">
        ✅ Maqola muvaffaqiyatli yangilandi!
      </div>
      <div v-if="error" class="alert alert--danger">⚠️ {{ error }}</div>

      <div class="admin-form">
        <div class="form-group">
          <label>Sarlavha *</label>
          <div class="form-input-wrap">
            <input
              v-model="form.title"
              type="text"
              placeholder="Maqola sarlavhasi"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Slug *</label>
          <div class="form-input-wrap">
            <input v-model="form.slug" type="text" placeholder="maqola-slug" />
          </div>
        </div>

        <div class="form-group">
          <label
            >Qisqacha tavsif *
            <span class="form-group__note"
              >(kartochkada va Google natijasida ko'rinadi)</span
            ></label
          >
          <div class="form-input-wrap form-input-wrap--textarea">
            <textarea
              v-model="form.excerpt"
              rows="3"
              maxlength="300"
              placeholder="Maqola nima haqida — 1-2 gap"
            />
          </div>
          <div class="excerpt-tools">
            <button
              type="button"
              class="btn btn--outline upload-btn"
              :disabled="excerptLoading"
              @click="handleGenerateExcerpt"
            >
              {{ excerptLoading ? "⏳ Yozilmoqda..." : "✨ AI bilan yozish" }}
            </button>
            <span
              class="excerpt-tools__count"
              :class="{ 'excerpt-tools__count--warn': form.excerpt.length > 170 }"
              >{{ form.excerpt.length }}/170</span
            >
          </div>
        </div>

        <div class="form-group">
          <label
            >Manba
            <span class="form-group__note"
              >(masalan: Quanta Magazine (Ben Brubaker))</span
            ></label
          >
          <div class="form-input-wrap">
            <input
              v-model="form.source"
              type="text"
              placeholder="Nashr (Muallif)"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Kategoriya *</label>
          <div class="form-input-wrap">
            <select v-model="form.categoryId" aria-label="Kategoriya">
              <option value="">Kategoriya tanlang</option>
              <option
                v-for="cat in adminStore.categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Maqola matni *</label>
          <div class="form-input-wrap form-input-wrap--textarea">
            <textarea
              v-model="contentText"
              rows="12"
              placeholder="Maqola matnini shu yerga yozing..."
            />
          </div>
          <button
            type="button"
            class="btn btn--outline upload-btn"
            :disabled="contentUploading || !contentText.trim()"
            @click="handleContentUpload"
          >
            {{ contentUploading ? "⏳ Yuklanmoqda..." : "☁️ R2 ga yuklash" }}
          </button>
          <div v-if="form.content" class="upload-success">
            ✅ Yuklandi:
            <a :href="form.content" target="_blank">{{ form.content }}</a>
          </div>
        </div>

        <!-- Cover rasm -->
        <div class="form-group">
          <label>Cover rasm</label>
          <div
            class="image-upload-area"
            @click="imageInput?.click()"
            @dragover.prevent
            @drop.prevent="handleImageDrop"
          >
            <img
              v-if="form.coverImage"
              :src="form.coverImage"
              alt="preview"
              class="image-upload-area__preview"
            />
            <div v-else class="image-upload-area__placeholder">
              <span>🖼️</span>
              <p>
                {{
                  imageUploading
                    ? "⏳ Yuklanmoqda..."
                    : "Rasmni bosing yoki tashlang"
                }}
              </p>
            </div>
          </div>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageUpload"
          />
          <div v-if="form.coverImage" class="upload-success">
            ✅ Rasm yuklandi
          </div>
        </div>

        <div class="form-group">
          <label
            >Teglar
            <span class="form-group__note">(vergul bilan ajrating)</span></label
          >
          <div class="form-input-wrap">
            <input
              v-model="form.tags"
              type="text"
              placeholder="javascript, dasturlash, web"
            />
          </div>
        </div>

        <div class="form-group">
          <label>O'qish vaqti (daqiqa)</label>
          <div class="form-input-wrap">
            <input v-model="form.readTime" type="number" placeholder="5" />
          </div>
        </div>

        <div class="form-group">
          <label>Status</label>
          <div class="form-input-wrap">
            <select v-model="form.status" aria-label="Status">
              <option value="published">✅ Chop etilgan</option>
              <option value="draft">📝 Qoralama</option>
            </select>
          </div>
        </div>

        <!-- Rejalashtirish: qoralama shu vaqtda o'zi chop etiladi -->
        <div v-if="form.status === 'draft'" class="form-group">
          <label
            >Chop etish vaqti
            <span class="form-group__note"
              >(Toshkent vaqti. Bo'sh qoldirsangiz — qoralama bo'lib qoladi)</span
            ></label
          >
          <div class="form-input-wrap">
            <input
              v-model="scheduleLocal"
              type="datetime-local"
              aria-label="Chop etish vaqti"
            />
          </div>
        </div>

        <button
          class="btn btn--primary admin-form__submit"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? "Saqlanmoqda..." : "💾 Saqlash" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const route = useRoute();
const adminStore = useAdminStore();

const pageLoading = ref(false);
const loading = ref(false);
const success = ref(false);
const error = ref("");

const form = reactive({
  title: "",
  slug: "",
  excerpt: "",
  source: "",
  categoryId: "" as any,
  content: "",
  coverImage: "",
  tags: "",
  readTime: 5,
});

const contentText = ref("");
const scheduleLocal = ref("");

// Qisqa tavsifni AI yozadi: matn textarea'dan yoki yuklangan R2 fayldan olinadi
const excerptLoading = ref(false);
const handleGenerateExcerpt = async () => {
  error.value = "";
  let text = contentText.value.trim();
  if (!text && form.content) {
    try {
      const c = await $fetch<any>(form.content);
      text = c?.message ?? "";
    } catch {}
  }
  text = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 50) {
    error.value = "Avval maqola matnini kiriting";
    return;
  }
  excerptLoading.value = true;
  const res = await adminStore.generateExcerpt(form.title, text);
  excerptLoading.value = false;
  if (res.success) {
    form.excerpt = res.data.excerpt;
  } else {
    error.value = res.message;
  }
};
const contentUploading = ref(false);
const imageUploading = ref(false);
const imageInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  pageLoading.value = true;

  await adminStore.getCategories();

  const res = await adminStore.getArticle(+route.params.id);

  if (res.success && res.data) {
    const article = res.data;
    form.title = article.title ?? "";
    form.slug = article.slug ?? "";
    form.excerpt = article.excerpt ?? "";
    form.source = article.source ?? "";
    form.categoryId = article.category?.id ?? article.categoryId ?? "";
    form.content = article.content ?? "";
    form.coverImage = article.coverImage ?? "";
    form.tags = article.tags ?? "";
    form.readTime = article.readTime ?? 5;
    form.status = article.status ?? "published";
    scheduleLocal.value = isoToTashkentLocal(article.scheduledAt);
  } else {
    error.value = "Maqola topilmadi";
  }

  pageLoading.value = false;
});

const handleContentUpload = async () => {
  if (!contentText.value.trim()) return;
  contentUploading.value = true;
  error.value = "";
  const res = await adminStore.uploadContent(
    contentText.value,
    form.slug || `article-${Date.now()}`,
  );
  contentUploading.value = false;
  if (res.success) {
    form.content = res.data.url;
  } else {
    error.value = res.message;
  }
};

const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  imageUploading.value = true;
  error.value = "";
  const res = await adminStore.uploadImage(file);
  imageUploading.value = false;
  if (res.success) {
    form.coverImage = res.data.url;
  } else {
    error.value = res.message;
  }
};

const handleImageDrop = async (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  imageUploading.value = true;
  const res = await adminStore.uploadImage(file);
  imageUploading.value = false;
  if (res.success) {
    form.coverImage = res.data.url;
  } else {
    error.value = "Rasm yuklashda xato";
  }
};

const handleSubmit = async () => {
  error.value = "";
  success.value = false;

  if (!form.title.trim()) {
    error.value = "Sarlavha kiriting";
    return;
  }
  if (!form.slug.trim()) {
    error.value = "Slug kiriting";
    return;
  }
  if (!form.excerpt.trim()) {
    error.value = "Tavsif kiriting";
    return;
  }
  if (!form.categoryId) {
    error.value = "Kategoriya tanlang";
    return;
  }
  if (!form.content.trim()) {
    error.value = "Kontent URL kiriting";
    return;
  }

  loading.value = true;

  const res = await adminStore.updateArticle(+route.params.id, {
    ...form,
    categoryId: +form.categoryId,
    readTime: +form.readTime,
    scheduledAt:
      form.status === "draft" ? tashkentLocalToIso(scheduleLocal.value) : null,
  });

  loading.value = false;

  if (res.success) {
    success.value = true;
    window.scrollTo(0, 0);
  } else {
    error.value = res.message;
  }
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

.admin-form-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 2rem;
  max-width: 760px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__submit {
    align-self: flex-start;
    padding: 0.75rem 2rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__note {
    font-size: 0.75rem;
    color: $text-muted;
    font-weight: 400;
  }
}

.form-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: #fff;
  transition: all 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.12);
  }

  &--textarea {
    align-items: flex-start;
  }

  input,
  select,
  textarea {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    color: $text-primary;
    font-family: $font-primary;
    resize: vertical;
    &::placeholder {
      color: $text-muted;
    }
  }

  select {
    cursor: pointer;
  }
}

.excerpt-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__count {
    font-size: 0.75rem;
    color: $text-muted;

    &--warn {
      color: #d97706;
      font-weight: 600;
    }
  }
}

.upload-btn {
  margin-top: 0.5rem;
  align-self: flex-start;
  font-size: 0.875rem;
  padding: 0.5rem 1.25rem;
}

.upload-success {
  font-size: 0.8rem;
  color: #1a9e5e;
  margin-top: 0.35rem;
  word-break: break-all;

  a {
    color: $primary;
    &:hover {
      text-decoration: underline;
    }
  }
}

.image-upload-area {
  border: 2px dashed $border-color;
  border-radius: $border-radius;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    border-color: $primary;
    background: rgba($primary, 0.02);
  }

  &__preview {
    width: 100%;
    max-height: 280px;
    object-fit: cover;
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: $text-muted;
    padding: 2rem;

    span {
      font-size: 2.5rem;
    }
    p {
      font-size: 0.875rem;
    }
  }
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;
  margin-bottom: 1rem;

  &--success {
    background: rgba(#43d98b, 0.08);
    border: 1px solid rgba(#43d98b, 0.3);
    color: #1a9e5e;
  }

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
  }
}
</style>
