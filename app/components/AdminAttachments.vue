<!-- Admin forma: maqolaga fayl (kitob, qo'llanma, jadval) biriktirish -->
<template>
  <div class="form-group">
    <label class="att-label"
      >Biriktirilgan fayllar
      <span class="att-note"
        >(PDF, EPUB, DOCX, PPTX, XLSX... — ko'pi bilan 40 MB, 10 ta)</span
      ></label
    >

    <ul v-if="modelValue.length" class="att-list">
      <li v-for="(f, i) in modelValue" :key="f.url" class="att-item">
        <span class="att-item__icon">{{ fileIcon(f.ext) }}</span>
        <input
          class="att-item__name"
          :value="f.name"
          maxlength="120"
          aria-label="Fayl nomi (o'quvchiga shunday ko'rinadi)"
          @change="rename(i, ($event.target as HTMLInputElement).value)"
        />
        <span class="att-item__size">{{ formatFileSize(f.size) }}</span>
        <a :href="f.url" target="_blank" rel="noopener" class="att-item__btn"
          >⬇️</a
        >
        <button
          type="button"
          class="att-item__btn"
          :disabled="i === 0"
          aria-label="Yuqoriga"
          @click="move(i, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          class="att-item__btn att-item__btn--danger"
          aria-label="Olib tashlash"
          @click="remove(i)"
        >
          ✕
        </button>
      </li>
    </ul>

    <div
      v-if="modelValue.length < 10"
      class="att-drop"
      :class="{ 'is-busy': uploading }"
      @click="input?.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      {{
        uploading
          ? `⏳ Yuklanmoqda: ${uploading}`
          : "📎 Faylni bosing yoki shu yerga tashlang"
      }}
    </div>
    <input
      ref="input"
      type="file"
      multiple
      :accept="ACCEPT"
      style="display: none"
      @change="onPick"
    />
    <p v-if="error" class="att-error">⚠️ {{ error }}</p>
    <p class="att-hint">
      Faqat tarqatish huquqi bor fayllarni qo'ying (o'zingiz yozgan, ochiq
      litsenziyali yoki muallif ruxsat bergan). Pullik kitoblarni joylash
      mualliflik huquqini buzadi.
    </p>
  </div>
</template>

<script setup lang="ts">
const ACCEPT =
  ".pdf,.epub,.djvu,.fb2,.mobi,.doc,.docx,.odt,.rtf,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.zip";

const props = defineProps<{ modelValue: ArticleAttachment[] }>();
const emit = defineEmits<{ "update:modelValue": [ArticleAttachment[]] }>();

const adminStore = useAdminStore();
const input = ref<HTMLInputElement | null>(null);
const uploading = ref("");
const error = ref("");

const set = (list: ArticleAttachment[]) => emit("update:modelValue", list);

const upload = async (files: File[]) => {
  error.value = "";
  const errs: string[] = [];
  let list = [...props.modelValue];
  for (const file of files) {
    if (list.length >= 10) {
      errs.push("Ko'pi bilan 10 ta fayl");
      break;
    }
    if (file.size > 40 * 1024 * 1024) {
      errs.push(`${file.name}: 40 MB dan katta`);
      continue;
    }
    uploading.value = file.name;
    const res = await adminStore.uploadFile(file);
    if (res.success) {
      list = [...list, res.data];
      set(list);
    } else {
      errs.push(`${file.name}: ${res.message}`);
    }
  }
  uploading.value = "";
  error.value = errs.join(" · ");
};

const onPick = (e: Event) => {
  const el = e.target as HTMLInputElement;
  const files = [...(el.files ?? [])];
  el.value = "";
  if (files.length) void upload(files);
};

const onDrop = (e: DragEvent) => {
  const files = [...(e.dataTransfer?.files ?? [])];
  if (files.length) void upload(files);
};

const rename = (i: number, name: string) => {
  const clean = name.trim();
  if (!clean) return;
  set(props.modelValue.map((f, j) => (j === i ? { ...f, name: clean } : f)));
};

const move = (i: number, d: number) => {
  const list = [...props.modelValue];
  const [x] = list.splice(i, 1);
  list.splice(i + d, 0, x!);
  set(list);
};

const remove = (i: number) =>
  set(props.modelValue.filter((_, j) => j !== i));
</script>

<style lang="scss" scoped>
.att-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.att-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: $bg-secondary;

  &__icon {
    font-size: 1.2rem;
  }

  &__name {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: $text-primary;
    font-size: 0.9rem;
    font-family: $font-primary;
    outline: none;
    border-bottom: 1px dashed transparent;

    &:focus {
      border-bottom-color: $primary;
    }
  }

  &__size {
    font-size: 0.78rem;
    color: $text-muted;
    white-space: nowrap;
  }

  &__btn {
    border: 1px solid $border-color;
    background: $bg-primary;
    color: $text-secondary;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }

    &--danger:hover {
      color: var(--c-danger, #dc2626);
      border-color: currentColor;
    }
  }
}

.att-drop {
  border: 2px dashed $border-color;
  border-radius: $border-radius-sm;
  padding: 1rem;
  text-align: center;
  color: $text-secondary;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: $primary;
  }

  &.is-busy {
    cursor: progress;
  }
}

.att-error {
  margin-top: 0.5rem;
  color: var(--c-danger, #dc2626);
  font-size: 0.85rem;
}

.att-note {
  font-weight: 400;
  font-size: 0.78rem;
  color: $text-muted;
}

.att-hint {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  font-weight: 400;
  color: $text-muted;
  line-height: 1.5;
}
</style>
