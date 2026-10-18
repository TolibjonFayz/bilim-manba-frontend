<template>
  <section v-if="st" class="cq">
    <div class="cq__head">
      <div>
        <h2 class="cq__title">🧠 Kun savoli — Telegram kanal</h2>
        <p class="cq__sub">
          Har kuni kanalga maqolalar testidan bitta savol Telegram
          quiz-so'rovnomasi bo'lib chiqadi, tagida "Javobini maqolada o'qing"
          tugmasi bo'ladi.
        </p>
      </div>
      <label class="switch" :class="{ 'is-on': st.enabled }">
        <input
          type="checkbox"
          :checked="st.enabled"
          :disabled="busy || !st.configured"
          @change="update({ enabled: !st.enabled })"
        />
        <span class="switch__track"><span class="switch__dot" /></span>
        <span>{{ st.enabled ? "Yoqilgan" : "O'chirilgan" }}</span>
      </label>
    </div>

    <p v-if="!st.configured" class="cq__warn">
      Telegram kanal sozlanmagan (Render'da TELEGRAM_BOT_TOKEN va
      TELEGRAM_CHANNEL_ID).
    </p>

    <template v-else>
      <div class="cq__row">
        <label class="cq__field">
          <span>Yuborish vaqti</span>
          <select
            class="input"
            :value="st.hour"
            :disabled="busy || !st.enabled"
            @change="
              update({
                hour: Number(($event.target as HTMLSelectElement).value),
              })
            "
          >
            <option v-for="h in 24" :key="h - 1" :value="h - 1">
              {{ String(h - 1).padStart(2, "0") }}:00
            </option>
          </select>
        </label>
        <div class="cq__stat">
          <span>Testli maqolalar</span>
          <strong>{{ st.withQuiz }}</strong>
        </div>
        <div class="cq__stat">
          <span>Kanalga chiqqan</span>
          <strong>{{ st.used }}</strong>
        </div>
        <button
          class="btn btn--outline cq__send"
          :disabled="busy"
          @click="sendNow"
        >
          {{ busy ? "⏳ Yuborilmoqda…" : "📤 Hozir yuborish" }}
        </button>
      </div>

      <p v-if="st.lastPost" class="cq__last">
        <span>Oxirgi savol ({{ fmt(st.lastPost.at) }}):</span>
        «{{ st.lastPost.question }}» —
        <a :href="`/articles/${st.lastPost.slug}`" target="_blank">{{
          st.lastPost.title
        }}</a>
      </p>
      <p v-else class="cq__last">Hali savol yuborilmagan.</p>
      <p v-if="st.lastError" class="cq__warn">
        ⚠️ Oxirgi xato: {{ st.lastError }}
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";

interface Status {
  configured: boolean;
  enabled: boolean;
  hour: number;
  lastDay: string | null;
  lastError: string | null;
  lastPost: {
    at: string;
    title: string;
    slug: string;
    question: string;
  } | null;
  withQuiz: number;
  used: number;
}

const adminStore = useAdminStore();
const st = ref<Status | null>(null);
const busy = ref(false);

// Brauzerlarda "uz-UZ" oylari "M10" bo'lib chiqadi — o'zimiz yozamiz (Toshkent vaqti)
const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];
const fmt = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 5 * 3600e3);
  const hm = d.toISOString().slice(11, 16);
  return `${d.getUTCDate()}-${MONTHS[d.getUTCMonth()]}, ${hm}`;
};

const load = async () => {
  const res = await adminStore.channelQuizApi("GET");
  if (res.success) st.value = res.data;
};

const update = async (patch: Record<string, unknown>) => {
  busy.value = true;
  const res = await adminStore.channelQuizApi("PUT", "", patch);
  busy.value = false;
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  st.value = res.data;
  ElMessage({ type: "success", message: "💾 Saqlandi" });
};

const sendNow = async () => {
  try {
    await ElMessageBox.confirm(
      "Kanalga hozir bitta savol yuboriladi. Bugungi savol shu hisoblanadi — kechqurun yana yuborilmaydi.",
      "Kun savoli",
      {
        confirmButtonText: "Yuborish",
        cancelButtonText: "Bekor",
        type: "info",
      },
    );
  } catch {
    return;
  }
  busy.value = true;
  const res = await adminStore.channelQuizApi("POST", "/send");
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 8000 });
  ElMessage({
    type: "success",
    message: `📤 Kanalga yuborildi: «${res.data.question}»`,
    duration: 6000,
  });
  await load();
};

onMounted(load);
</script>

<style lang="scss" scoped>
.cq {
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
    max-width: 640px;
  }

  &__row {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: $text-muted;
    font-weight: 600;

    .input {
      width: 110px;
    }
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.78rem;
    color: $text-muted;
    font-weight: 600;

    strong {
      font-size: 1.35rem;
      color: $text-primary;
    }
  }

  &__send {
    margin-left: auto;
    border: 1.5px solid $border-color;

    &:hover:not(:disabled) {
      border-color: $primary;
    }

    @media (max-width: $tablet) {
      margin-left: 0;
      width: 100%;
    }
  }

  &__last {
    margin-top: 1rem;
    font-size: 0.86rem;
    color: $text-secondary;
    line-height: 1.5;

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
