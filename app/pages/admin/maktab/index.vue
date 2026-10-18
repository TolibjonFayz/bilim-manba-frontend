<template>
  <div class="admin-school">
    <div class="admin-page__header">
      <h1 class="admin-page__title">🎒 Maktab bo'limi</h1>
    </div>

    <p class="admin-school__hint">
      Bu maqolalar <NuxtLink to="/maktab" target="_blank">/maktab</NuxtLink>
      sahifasida chiqadi va ularning tepasida "🎒 O'quvchilar uchun" belgisi
      bo'ladi. Ularni AI tanlagan, lekin maktabga mos kelmaganini shu yerdan
      olib tashlashingiz mumkin. Olib tashlangan maqola o'chmaydi, faqat
      /maktab'dan chiqadi va AI uni qayta qo'shmaydi. Fan yoki sinfni
      o'zgartirsangiz, darhol saqlanadi.
    </p>

    <!-- Qo'lda qo'shish -->
    <form class="card add" @submit.prevent="add">
      <strong>➕ Maqola qo'shish</strong>
      <select v-model="form.articleId" class="input">
        <option value="">Maqolani tanlang…</option>
        <option v-for="a in candidates" :key="a.id" :value="a.id">
          {{ a.title }}{{ a.status === "published" ? "" : " (qoralama)" }}
        </option>
      </select>
      <input
        v-model="form.subject"
        class="input"
        list="school-subjects"
        placeholder="Fan, masalan: Tarix"
        maxlength="60"
      />
      <select v-model="form.grade" class="input">
        <option value="">Sinf —</option>
        <option v-for="g in GRADES" :key="g" :value="g">{{ g }}-sinf</option>
      </select>
      <button
        class="btn btn--primary"
        :disabled="busy || !form.articleId || !form.subject.trim()"
      >
        Qo'shish
      </button>
    </form>

    <datalist id="school-subjects">
      <option v-for="s in subjects" :key="s" :value="s" />
    </datalist>

    <div v-if="loading" class="admin-school__empty">Yuklanmoqda…</div>

    <template v-else>
      <section class="card">
        <h2 class="section-title">
          Saytda ko'rinadi <span>{{ shown.length }}</span>
        </h2>
        <p v-if="!shown.length" class="admin-school__empty">
          Hozircha bitta ham maqola yo'q.
        </p>
        <ul class="rows">
          <li v-for="r in shown" :key="r.id" class="row">
            <div class="row__main">
              <a
                :href="`/articles/${r.slug}`"
                target="_blank"
                class="row__title"
                >{{ r.title }}</a
              >
              <span class="row__meta">
                <span v-if="r.category">{{ r.category }}</span>
                <span v-if="r.status !== 'published'" class="chip chip--draft"
                  >Qoralama — chop etilgach chiqadi</span
                >
              </span>
            </div>
            <input
              v-model="r.subject"
              class="input row__subject"
              list="school-subjects"
              maxlength="60"
              @change="save(r, { subject: r.subject })"
            />
            <select
              v-model="r.grade"
              class="input row__grade"
              @change="save(r, { grade: r.grade })"
            >
              <option :value="null">Sinf —</option>
              <option v-for="g in GRADES" :key="g" :value="g">
                {{ g }}-sinf
              </option>
            </select>
            <button
              class="btn btn--outline row__btn danger"
              :disabled="r.busy"
              @click="
                save(
                  r,
                  { hidden: true },
                  `«${r.title}» /maktab'dan olib tashlandi`,
                )
              "
            >
              🚫 Olib tashlash
            </button>
          </li>
        </ul>
      </section>

      <section v-if="hidden.length" class="card card--muted">
        <h2 class="section-title">
          Olib tashlanganlar <span>{{ hidden.length }}</span>
        </h2>
        <ul class="rows">
          <li v-for="r in hidden" :key="r.id" class="row row--hidden">
            <div class="row__main">
              <a
                :href="`/articles/${r.slug}`"
                target="_blank"
                class="row__title"
                >{{ r.title }}</a
              >
              <span class="row__meta">
                {{ r.subject
                }}<template v-if="r.grade"> · {{ r.grade }}-sinf</template>
              </span>
            </div>
            <button
              class="btn btn--outline row__btn"
              :disabled="r.busy"
              @click="
                save(r, { hidden: false }, `«${r.title}» /maktab'ga qaytarildi`)
              "
            >
              ↩ Qaytarish
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

definePageMeta({ middleware: "admin", layout: "admin" });

interface Row {
  id: number;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  subject: string;
  grade: number | null;
  hidden: boolean;
  busy?: boolean;
}

const GRADES = [5, 6, 7, 8, 9, 10, 11];
const BASE_SUBJECTS = [
  "Tarix",
  "Biologiya",
  "Fizika",
  "Kimyo",
  "Geografiya",
  "Matematika",
  "Informatika",
  "Adabiyot",
];

const adminStore = useAdminStore();
const list = ref<Row[]>([]);
const loading = ref(true);
const busy = ref(false);
const form = reactive({
  articleId: "" as number | "",
  subject: "",
  grade: "" as number | "",
});

const shown = computed(() => list.value.filter((r) => !r.hidden));
const hidden = computed(() => list.value.filter((r) => r.hidden));
const subjects = computed(() =>
  [...new Set([...BASE_SUBJECTS, ...list.value.map((r) => r.subject)])].sort(
    (a, b) => a.localeCompare(b),
  ),
);
// Ro'yxatda yo'q maqolalar (olib tashlanganini "Qaytarish" orqali qaytariladi)
const candidates = computed(() => {
  const inList = new Set(list.value.map((r) => r.id));
  return (adminStore.articles ?? []).filter((a: any) => !inList.has(a.id));
});

const load = async () => {
  const res = await adminStore.schoolApi("GET");
  if (res.success) list.value = res.data ?? [];
  else ElMessage({ type: "error", message: res.message });
  loading.value = false;
};

const save = async (
  r: Row,
  patch: Record<string, unknown>,
  done = "💾 Saqlandi",
) => {
  r.busy = true;
  const res = await adminStore.schoolApi("PUT", `/${r.id}`, patch);
  r.busy = false;
  if (!res.success) {
    ElMessage({ type: "error", message: res.message });
    return load();
  }
  Object.assign(
    r,
    res.data
      ? {
          subject: res.data.subject,
          grade: res.data.grade,
          hidden: res.data.hidden,
        }
      : {},
  );
  ElMessage({ type: "success", message: done });
};

const add = async () => {
  busy.value = true;
  const res = await adminStore.schoolApi("PUT", `/${form.articleId}`, {
    subject: form.subject,
    grade: form.grade || null,
    hidden: false,
  });
  busy.value = false;
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  form.articleId = "";
  form.subject = "";
  form.grade = "";
  ElMessage({ type: "success", message: "🎒 Maktab bo'limiga qo'shildi" });
  await load();
};

onMounted(async () => {
  await Promise.all([load(), adminStore.getArticles()]);
});
</script>

<style lang="scss" scoped>
.admin-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
}

.admin-school {
  &__hint {
    color: $text-secondary;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    max-width: 820px;

    a {
      color: $primary;
      font-weight: 600;
    }
  }

  &__empty {
    color: $text-muted;
    padding: 0.5rem 0;
  }
}

.card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  &--muted {
    background: $bg-secondary;
  }
}

.input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: $bg-secondary;
  color: $text-primary;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.card .btn--outline {
  border: 1.5px solid $border-color;

  &:hover:not(:disabled) {
    border-color: $primary;
  }

  &.danger:hover:not(:disabled) {
    color: $danger;
    border-color: $danger;
  }
}

.add {
  display: grid;
  grid-template-columns: auto 2fr 1fr 0.7fr auto;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

.section-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 1rem;

  span {
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.1rem 0.55rem;
    margin-left: 0.35rem;
    border-radius: $border-radius-pill;
    background: rgba(var(--c-primary-rgb), 0.12);
    color: $primary;
    vertical-align: middle;
  }
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  background: $bg-secondary;

  &--hidden {
    background: $bg-primary;
    opacity: 0.8;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__title {
    font-size: 0.92rem;
    font-weight: 700;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: $primary;
    }
  }

  &__meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.78rem;
    color: $text-muted;
  }

  &__subject {
    width: 150px;
    flex-shrink: 0;
  }

  &__grade {
    width: 105px;
    flex-shrink: 0;
  }

  &__btn {
    flex-shrink: 0;
    white-space: nowrap;
  }

  @media (max-width: $tablet) {
    flex-wrap: wrap;

    &__main {
      flex-basis: 100%;
    }

    &__subject {
      flex: 1 1 0;
      min-width: 0;
      width: auto;
    }

    &__btn {
      flex-basis: 100%;
    }
  }
}

.chip {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: $border-radius-pill;

  &--draft {
    background: rgba(var(--c-muted-rgb), 0.15);
    color: $text-secondary;
  }
}
</style>
