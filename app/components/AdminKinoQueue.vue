<template>
  <section v-if="st" class="kq">
    <div class="kq__head">
      <div>
        <h2 class="kq__title">🎬 Kino maqolalari</h2>
        <p class="kq__sub">
          Navbatdagi filmlar haqida AI har kuni bittadan maqola yozadi va u
          soat {{ pad(st.publishHour) }}:00 da saytga, Telegram va Instagram'ga
          o'zi chiqadi (yozilgach sizga Telegram'da xabar keladi — xohlasangiz
          tahrirlaysiz yoki bekor qilasiz). Navbat bo'sh bo'lsa — har
          {{ st.everyDays }} kunda kamida bitta kino maqola AI o'zi tanlagan
          film haqida.
        </p>
      </div>
      <label class="switch" :class="{ 'is-on': st.daily }">
        <input
          type="checkbox"
          :checked="st.daily"
          :disabled="busy"
          @change="save({ daily: !st.daily })"
        />
        <span class="switch__track"><span class="switch__dot" /></span>
        <span>{{ st.daily ? "Yoqilgan" : "O'chirilgan" }}</span>
      </label>
    </div>

    <p v-if="!st.hasCategory" class="kq__warn">
      "Kino" nomli kategoriya topilmadi — avval uni yarating.
    </p>

    <ol v-if="st.queue.length" class="kq__queue">
      <li v-for="(t, i) in st.queue" :key="t + i">
        <span class="kq__num">{{ i === 0 ? "Navbatda" : `${i + 1}-kun` }}</span>
        <span class="kq__name">{{ filmName(t) }}</span>
        <button class="kq__x" :disabled="busy" title="Navbatdan olib tashlash" @click="remove(i)">✕</button>
      </li>
    </ol>
    <p v-else class="kq__empty">
      Navbat bo'sh — haftasiga bitta kino maqolani AI o'zi tanlaydi.
    </p>

    <form class="kq__add" @submit.prevent="add">
      <input
        v-model="newFilm"
        class="input"
        placeholder="Film nomi (inglizcha) yoki Wikipedia havolasi"
        :disabled="busy"
      />
      <button class="btn btn--outline" :disabled="busy || !newFilm.trim()">
        Qo'shish
      </button>
      <button
        type="button"
        class="btn btn--primary"
        :disabled="busy || st.running"
        @click="runNow"
      >
        {{ st.running ? "Yozilmoqda…" : "Navbatdagisini hozir yozish" }}
      </button>
    </form>

    <p v-if="st.lastKino" class="kq__last">
      <span>Oxirgi kino maqola:</span>
      <NuxtLink :to="`/admin/articles/${st.lastKino.id}/preview`">{{ st.lastKino.title }}</NuxtLink>
      — {{ statusText(st.lastKino) }}
    </p>
    <p v-if="st.lastError" class="kq__warn">⚠️ Oxirgi xato: {{ st.lastError }}</p>
    <p v-if="msg" class="kq__ok">{{ msg }}</p>
  </section>
</template>

<script setup lang="ts">
// Kino navbati: admin kiritgan filmlar har kuni bittadan avtomatik chop etiladi
const adminStore = useAdminStore();
const st = ref<any>(null);
const busy = ref(false);
const newFilm = ref("");
const msg = ref("");

const load = async () => {
  const res = await adminStore.kinoApi("GET");
  if (res.success) st.value = res.data;
};

const save = async (body: Record<string, unknown>) => {
  busy.value = true;
  msg.value = "";
  const res = await adminStore.kinoApi("PUT", "", body);
  busy.value = false;
  if (res.success) st.value = res.data;
  else msg.value = `⚠️ ${res.message}`;
};

const add = () => {
  const t = newFilm.value.trim();
  if (!t) return;
  newFilm.value = "";
  save({ queue: [...st.value.queue, t] });
};
const remove = (i: number) => {
  const q = [...st.value.queue];
  q.splice(i, 1);
  save({ queue: q });
};

const runNow = async () => {
  busy.value = true;
  msg.value = "";
  const res = await adminStore.kinoApi("POST", "/run");
  busy.value = false;
  if (res.success) {
    msg.value =
      "✍️ Yozish boshlandi — 5–15 daqiqada tayyor bo'ladi, Telegram'ga xabar keladi.";
    st.value.running = true;
  } else msg.value = `⚠️ ${res.message}`;
};

const pad = (n: number) => String(n).padStart(2, "0");
// Wikipedia havolasidan o'qiladigan nom: .../The_Odyssey_(2026_film) → The Odyssey (2026 film)
const filmName = (t: string) => {
  const m = t.match(/wikipedia\.org\/wiki\/(.+)$/);
  if (!m) return t;
  try {
    return decodeURIComponent(m[1]!).replace(/_/g, " ");
  } catch {
    return m[1]!.replace(/_/g, " ");
  }
};
const statusText = (a: any) => {
  if (a.status === "published") return "chop etilgan";
  if (a.scheduledAt) {
    const d = new Date(new Date(a.scheduledAt).getTime() + 5 * 3600 * 1000);
    return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)} soat ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} da chiqadi`;
  }
  return "qoralama";
};

onMounted(load);
</script>

<style lang="scss" scoped>
.kq {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.5rem;
  margin-bottom: 2rem;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;

    @media (max-width: $tablet) {
      flex-direction: column;
    }
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
  }

  &__sub {
    color: $text-secondary;
    font-size: 0.88rem;
    line-height: 1.5;
    max-width: 680px;
  }

  &__queue {
    list-style: none;
    margin: 0 0 1rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      background: $bg-secondary;
    }
  }

  &__num {
    font-size: 0.72rem;
    font-weight: 700;
    color: $primary;
    width: 4.5rem;
    flex: none;
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: 0.9rem;
    font-weight: 600;
    word-break: break-word;
  }

  &__x {
    border: none;
    background: none;
    color: $text-muted;
    cursor: pointer;
    font-size: 0.9rem;

    &:hover:not(:disabled) {
      color: var(--c-danger-text);
    }
  }

  &__empty {
    font-size: 0.88rem;
    color: $text-secondary;
    margin-bottom: 1rem;
  }

  &__add {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;

    .input {
      flex: 1;
      min-width: 220px;
    }

    .btn--outline {
      border: 1.5px solid $border-color;
    }
  }

  &__last {
    margin-top: 1rem;
    font-size: 0.86rem;
    color: $text-secondary;

    span {
      color: $text-muted;
    }

    a {
      color: $primary;
      font-weight: 600;
    }
  }

  &__warn {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--c-warning-text);
  }

  &__ok {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--c-success-text);
  }
}

.input {
  padding: 0.55rem 0.75rem;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: $bg-secondary;
  color: $text-primary;
  font-size: 0.9rem;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__track {
    width: 42px;
    height: 24px;
    border-radius: 12px;
    background: var(--c-toggle-off);
    position: relative;
    transition: background 0.2s;
  }

  &__dot {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }

  &.is-on &__track {
    background: var(--c-primary-solid);
  }

  &.is-on &__dot {
    transform: translateX(18px);
  }
}
</style>
