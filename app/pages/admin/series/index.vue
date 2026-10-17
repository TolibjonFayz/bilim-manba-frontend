<template>
  <div class="admin-series">
    <div class="admin-page__header">
      <h1 class="admin-page__title">📚 Seriyalar</h1>
    </div>

    <p class="admin-series__hint">
      Seriya — bir mavzudagi ketma-ket maqolalar. O'quvchi maqola tepasida
      "2-qism / 4" belgisini va oxirida "Keyingi qism →" kartasini ko'radi,
      hamma seriyalar <NuxtLink to="/series" target="_blank">/series</NuxtLink>
      sahifasida. Saytda kamida 2 ta chop etilgan qismi bor seriya ko'rinadi.
    </p>

    <!-- Yangi seriya -->
    <form class="card new-series" @submit.prevent="create">
      <strong>➕ Yangi seriya</strong>
      <input
        v-model="form.title"
        class="input"
        placeholder="Nomi, masalan: Koinot sirlari"
        maxlength="150"
      />
      <input
        v-model="form.description"
        class="input"
        placeholder="Qisqa tavsif (ixtiyoriy)"
        maxlength="600"
      />
      <button class="btn btn--primary" :disabled="busy || !form.title.trim()">
        Yaratish
      </button>
    </form>

    <div v-if="loading" class="admin-series__empty">Yuklanmoqda…</div>
    <div v-else-if="!list.length" class="admin-series__empty">
      Hali seriya yo'q — yuqorida birinchisini yarating.
    </div>

    <section v-for="s in list" :key="s.id" class="card series">
      <header class="series__head">
        <div class="series__names">
          <input v-model="s.title" class="input series__title" />
          <input
            v-model="s.description"
            class="input"
            placeholder="Qisqa tavsif"
          />
          <a :href="`/series/${s.slug}`" target="_blank" class="series__slug"
            >/series/{{ s.slug }} ↗</a
          >
        </div>
        <button class="btn-icon danger" title="Seriyani o'chirish" @click="remove(s)">
          🗑
        </button>
      </header>

      <!-- Qismlar -->
      <ol class="parts">
        <li v-for="(p, i) in s.parts" :key="p.id" class="parts__item">
          <span class="parts__num">{{ i + 1 }}</span>
          <NuxtLink :to="`/admin/articles/${p.id}/preview`" class="parts__title">{{
            p.title
          }}</NuxtLink>
          <span
            class="chip"
            :class="p.status === 'published' ? 'chip--ok' : 'chip--draft'"
            >{{ p.status === "published" ? "Chop etilgan" : "Qoralama" }}</span
          >
          <button class="btn-icon" :disabled="i === 0" title="Yuqoriga" @click="move(s, i, -1)">↑</button>
          <button
            class="btn-icon"
            :disabled="i === s.parts.length - 1"
            title="Pastga"
            @click="move(s, i, 1)"
          >↓</button>
          <button class="btn-icon danger" title="Seriyadan olib tashlash" @click="s.parts.splice(i, 1)">✕</button>
        </li>
        <li v-for="q in s.queued" :key="q.topic" class="parts__item parts__item--queued">
          <span class="parts__num">{{ q.position }}</span>
          <span class="parts__title">{{ q.title || q.topic }}</span>
          <span class="chip chip--queue">⏳ AI navbatida</span>
        </li>
      </ol>

      <div class="series__add">
        <select v-model="s.addId" class="input">
          <option value="">Maqola qo'shish…</option>
          <option
            v-for="a in candidates(s)"
            :key="a.id"
            :value="a.id"
          >
            {{ a.title }}{{ a.status === "published" ? "" : " (qoralama)" }}
          </option>
        </select>
        <button class="btn btn--outline" :disabled="!s.addId" @click="add(s)">
          Qo'shish
        </button>
        <button class="btn btn--primary" :disabled="busy" @click="save(s)">
          💾 Saqlash
        </button>
      </div>

      <!-- AI reja -->
      <div class="plan">
        <div class="plan__row">
          <strong>🤖 AI seriya rejasi</strong>
          <select v-model.number="s.planCount" class="input plan__count">
            <option v-for="n in [3, 4, 5, 6]" :key="n" :value="n">{{ n }} qism</option>
          </select>
          <button class="btn btn--outline" :disabled="s.planning" @click="plan(s)">
            {{ s.planning ? "⏳ AI o'ylayapti…" : s.plan ? "🔄 Qayta tuzish" : "Reja tuzish" }}
          </button>
        </div>
        <p class="plan__hint">
          AI qismlarni rejalashtiradi; "Navbatga qo'shish" bosilsa, ular kunlik AI
          qoralama navbatiga tushadi va har kuni bittadan yozilib, avtomatik shu
          seriyaga biriktiriladi. Qoralamalarni o'qib, chop etish o'zingizda.
        </p>
        <ul v-if="s.plan" class="plan__list">
          <li v-for="(p, i) in s.plan" :key="i">
            <label :class="{ 'is-missing': !p.found }">
              <input v-model="p.use" type="checkbox" :disabled="!p.found" />
              <span>
                <strong>{{ p.title }}</strong>
                <small>Wikipedia: {{ p.topic }}{{ p.found ? "" : " — topilmadi" }}</small>
              </span>
            </label>
          </li>
        </ul>
        <button
          v-if="s.plan"
          class="btn btn--primary"
          :disabled="busy || !s.plan.some((p: PlanPart) => p.use)"
          @click="enqueue(s)"
        >
          ➕ Navbatga qo'shish ({{ s.plan.filter((p: PlanPart) => p.use).length }})
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";

definePageMeta({ middleware: "admin", layout: "admin" });

interface PlanPart {
  title: string;
  topic: string;
  found: boolean;
  use?: boolean;
}

const adminStore = useAdminStore();
const list = ref<any[]>([]);
const loading = ref(true);
const busy = ref(false);
const form = reactive({ title: "", description: "" });

const decorate = (s: any) => ({
  ...s,
  description: s.description ?? "",
  addId: "",
  planCount: 4,
  plan: null as PlanPart[] | null,
  planning: false,
});

const load = async () => {
  const res = await adminStore.seriesApi("GET");
  if (res.success) list.value = (res.data ?? []).map(decorate);
  else ElMessage({ type: "error", message: res.message });
  loading.value = false;
};

// Maqola faqat bitta seriyada bo'ladi — boshqa seriyadagilarni ham tanlasa
// bo'ladi (saqlanganda shu seriyaga ko'chadi), lekin shu seriyadagilar chiqmaydi
const candidates = (s: any) => {
  const inThis = new Set(s.parts.map((p: any) => p.id));
  return (adminStore.articles ?? []).filter((a: any) => !inThis.has(a.id));
};

const create = async () => {
  busy.value = true;
  const res = await adminStore.seriesApi("POST", "", { ...form });
  busy.value = false;
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  form.title = "";
  form.description = "";
  ElMessage({ type: "success", message: "📚 Seriya yaratildi" });
  await load();
};

const add = (s: any) => {
  const a = (adminStore.articles ?? []).find((x: any) => x.id === s.addId);
  if (a) s.parts.push({ id: a.id, title: a.title, status: a.status });
  s.addId = "";
};

const move = (s: any, i: number, d: number) => {
  const [p] = s.parts.splice(i, 1);
  s.parts.splice(i + d, 0, p);
};

const save = async (s: any) => {
  busy.value = true;
  const res = await adminStore.seriesApi("PUT", `/${s.id}`, {
    title: s.title,
    description: s.description,
    articleIds: s.parts.map((p: any) => p.id),
  });
  busy.value = false;
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  ElMessage({ type: "success", message: "💾 Saqlandi" });
  await load();
};

const remove = async (s: any) => {
  try {
    await ElMessageBox.confirm(
      `«${s.title}» seriyasi o'chirilsinmi? Maqolalar o'chmaydi — faqat seriyadan chiqadi.`,
      "Seriyani o'chirish",
      { confirmButtonText: "O'chirish", cancelButtonText: "Bekor", type: "warning" },
    );
  } catch {
    return;
  }
  const res = await adminStore.seriesApi("DELETE", `/${s.id}`);
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  await load();
};

const plan = async (s: any) => {
  s.planning = true;
  const res = await adminStore.seriesApi("POST", `/${s.id}/plan`, {
    parts: s.planCount,
  });
  s.planning = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 8000 });
  s.plan = (res.data?.parts ?? []).map((p: PlanPart) => ({ ...p, use: p.found }));
};

const enqueue = async (s: any) => {
  busy.value = true;
  const parts = s.plan.filter((p: PlanPart) => p.use);
  const res = await adminStore.seriesApi("POST", `/${s.id}/enqueue`, { parts });
  busy.value = false;
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  ElMessage({
    type: "success",
    message: `⏳ ${parts.length} ta qism kunlik AI navbatiga qo'shildi`,
  });
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

.admin-series {
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
    padding: 1rem 0;
  }
}

.card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.input {
  width: 100%;
  padding: 0.65rem 0.85rem;
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

.new-series {
  display: grid;
  grid-template-columns: auto 1fr 1.4fr auto;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

.series {
  &__head {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  &__names {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__title {
    font-weight: 800;
    font-size: 1.05rem;
  }

  &__slug {
    font-size: 0.8rem;
    color: $primary;
  }

  &__add {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;

    .input {
      flex: 1;
    }

    @media (max-width: $tablet) {
      flex-direction: column;
    }
  }
}

.parts {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    background: $bg-secondary;

    &--queued {
      border-style: dashed;
      opacity: 0.85;
    }
  }

  &__num {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    flex: 1;
    min-width: 0;
    font-size: 0.9rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.chip {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: $border-radius-pill;

  &--ok {
    background: rgba(67, 217, 139, 0.14);
    color: var(--c-success-strong);
  }
  &--draft {
    background: rgba(var(--c-muted-rgb), 0.15);
    color: $text-secondary;
  }
  &--queue {
    background: rgba(var(--c-primary-rgb), 0.12);
    color: $primary;
  }
}

.btn-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: $border-radius-sm;
  border: 1px solid $border-color;
  background: $bg-primary;
  color: $text-secondary;

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &.danger:hover:not(:disabled) {
    color: $danger;
    border-color: $danger;
  }
}

.plan {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px dashed $border-color;

  &__row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__count {
    width: auto;
  }

  &__hint {
    font-size: 0.82rem;
    color: $text-muted;
    margin: 0.6rem 0 0.75rem;
    line-height: 1.5;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.9rem;

    label {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
      cursor: pointer;

      span {
        display: flex;
        flex-direction: column;
      }

      small {
        color: $text-muted;
      }

      &.is-missing {
        opacity: 0.55;
        cursor: default;
      }
    }
  }
}
</style>
