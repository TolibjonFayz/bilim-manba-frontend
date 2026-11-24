<template>
  <section class="quiz" aria-labelledby="quiz-title">
    <header class="quiz__head">
      <span class="quiz__badge">🧠 O'zingizni sinang</span>
      <h2 id="quiz-title" class="quiz__title">
        Maqolani qanchalik tushundingiz?
      </h2>
      <p class="quiz__sub">
        {{ questions.length }} ta savol · javobni tanlang, darhol bilib olasiz
      </p>
    </header>

    <ol class="quiz__list">
      <li v-for="(q, i) in questions" :key="`${round}-${i}`" class="quiz__item">
        <p class="quiz__q">
          <span class="quiz__num">{{ i + 1 }}</span>{{ q.q }}
        </p>
        <div class="quiz__options" role="group" :aria-label="`${i + 1}-savol javoblari`">
          <button
            v-for="(opt, j) in q.options"
            :key="j"
            type="button"
            class="quiz__opt"
            :class="optionClass(i, j)"
            :disabled="picked[i] !== null || checking[i]"
            :aria-busy="checking[i] && pendingChoice[i] === j"
            @click="pick(i, j)"
          >
            <span class="quiz__letter">{{ LETTERS[j] }}</span>
            <span>{{ opt }}</span>
          </button>
        </div>
        <p
          v-if="results[i]"
          class="quiz__explain"
          :class="results[i]!.correct ? 'is-right' : 'is-wrong'"
          role="status"
        >
          <strong>{{
            results[i]!.correct
              ? "✅ To'g'ri!"
              : `❌ To'g'ri javob: ${LETTERS[results[i]!.answer]}.`
          }}</strong>
          {{ results[i]!.explain }}
        </p>
        <p v-else-if="errors[i]" class="quiz__explain is-wrong" role="alert">
          ⚠️ Javobni tekshirib bo'lmadi — internetni tekshirib, qayta bosing.
        </p>
      </li>
    </ol>

    <div v-if="done" class="quiz__result" role="status">
      <div class="quiz__score">{{ score }}/{{ questions.length }}</div>
      <p class="quiz__verdict">{{ verdict }}</p>
      <!-- Ball: har o'quvchiga (mehmonga ham) har test uchun bir marta -->
      <ClientOnly>
        <p v-if="reward?.awarded" class="quiz__points">
          🏆 <strong>+{{ reward.points }} ball!</strong>
          <template v-if="reward.week?.rank">
            Haftalik reytingda <b>{{ reward.week.rank }}-o'rin</b>dasiz.</template
          >
          <NuxtLink to="/reyting">Reyting →</NuxtLink>
        </p>
        <p v-else-if="reward && reward.awarded === false" class="quiz__points is-muted">
          Bu test uchun ball avval olingan.
          <NuxtLink to="/reyting">Reyting →</NuxtLink>
        </p>

        <p v-if="merged" class="quiz__points">
          ✅ Ballaringiz profilingizga saqlandi.
        </p>
        <!-- Mehmon: reytingda taxallus bilan; ism bilan chiqish uchun — ro'yxatdan o'tish -->
        <div v-else-if="!authStore.isLoggedIn" class="quiz__claim">
          <p v-if="guestName" class="quiz__claim-title">
            Reytingda siz — <strong>{{ guestName }}</strong>
          </p>
          <p class="quiz__claim-text">
            O'z ismingiz bilan chiqing va ballaringiz hech qachon yo'qolmasin —
            hammasi profilingizga o'tadi. Bir bosishda:
          </p>
          <GoogleSignIn source="register" :next="returnPath" bare />
          <p class="quiz__claim-alt">
            yoki
            <NuxtLink :to="`/register?next=${encodeURIComponent(returnPath)}`"
              >email bilan ro'yxatdan o'ting</NuxtLink
            >
            ·
            <NuxtLink :to="`/login?next=${encodeURIComponent(returnPath)}`"
              >kirish</NuxtLink
            >
          </p>
        </div>
      </ClientOnly>
      <button type="button" class="btn btn--outline quiz__retry" @click="reset">
        🔄 Qayta urinish
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Maqola oxiridagi 3 savollik test (AI maqola matnidan tuzgan). To'g'ri
 * javob sahifaga oldindan berilmaydi: har bosishda server tekshiradi
 * (POST /quiz/check) va javob + izohni qaytaradi. Kirgan foydalanuvchining
 * birinchi tanlovlari serverda yoziladi — ball shundan hisoblanadi.
 * Mehmon ham ball oladi va reytingda taxallus bilan chiqadi (brauzer ID —
 * utils/quizGuest.ts); kirsa — ballari akkauntga ko'chadi
 * (plugins/quiz-merge.client.ts).
 */
interface QuizQuestion {
  q: string;
  options: string[];
}
interface CheckResult {
  correct: boolean;
  answer: number;
  explain: string;
}

const props = defineProps<{ questions: QuizQuestion[]; slug: string }>();

const LETTERS = ["A", "B", "C", "D"];
const authStore = useAuthStore();
const route = useRoute();
const apiBase = useRuntimeConfig().public.apiBase;
const reward = ref<{
  awarded?: boolean;
  points?: number;
  week?: { rank: number | null; points: number; name?: string };
} | null>(null);
const merged = ref(false);
const round = ref(0);
function fill<T>(v: T): T[] {
  return props.questions.map(() => v);
}
const picked = ref<(number | null)[]>(fill<number | null>(null));
const results = ref<(CheckResult | null)[]>(fill<CheckResult | null>(null));
const checking = ref<boolean[]>(fill(false));
const pendingChoice = ref<(number | null)[]>(fill<number | null>(null));
const errors = ref<boolean[]>(fill(false));
let reported = false;

const returnPath = computed(() => route.path);
const done = computed(() => results.value.every((r) => r !== null));
const score = computed(() => results.value.filter((r) => r?.correct).length);
const guestName = computed(() => reward.value?.week?.name ?? "");
const verdict = computed(() => {
  const n = props.questions.length;
  if (score.value === n) return "Ajoyib! Maqolani a'lo darajada tushunibsiz 🎉";
  if (score.value >= n - 1) return "Yaxshi natija! Deyarli hammasi to'g'ri 👍";
  if (score.value > 0)
    return "Yomon emas — maqolani yana bir ko'zdan kechirib chiqing 📖";
  return "Qayta o'qib, yana urinib ko'ring — albatta uddalaysiz 💪";
});

const optionClass = (i: number, j: number) => {
  const r = results.value[i];
  if (!r)
    return checking.value[i] && pendingChoice.value[i] === j ? "is-busy" : "";
  if (j === r.answer) return "is-right";
  if (j === picked.value[i]) return "is-wrong";
  return "is-dim";
};

const authHeaders = () =>
  authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined;
// Kirmagan o'quvchi — mehmon ID bilan (ball va reyting uchun)
const guest = () => (authStore.isLoggedIn ? undefined : quizGuestId());

const pick = async (i: number, j: number) => {
  if (picked.value[i] !== null || checking.value[i]) return;
  checking.value[i] = true;
  pendingChoice.value[i] = j;
  errors.value[i] = false;
  try {
    const res = await $fetch<CheckResult>(
      `/quiz/check/${encodeURIComponent(props.slug)}`,
      {
        method: "POST",
        baseURL: apiBase,
        headers: authHeaders(),
        body: { i, choice: j, guest: guest() },
      },
    );
    picked.value[i] = j;
    results.value[i] = res;
  } catch {
    errors.value[i] = true;
  } finally {
    checking.value[i] = false;
  }
  if (done.value && !reported) report();
};

const report = () => {
  reported = true;
  const answers = picked.value.map((p) => p ?? -1);
  track("quiz_done", {
    slug: props.slug,
    correct: score.value,
    total: props.questions.length,
  });
  if (!authStore.isLoggedIn) track("quiz_guest_done", { slug: props.slug });
  $fetch<any>(`/articles/quiz-result/${encodeURIComponent(props.slug)}`, {
    method: "POST",
    baseURL: apiBase,
    headers: authHeaders(),
    body: { correct: score.value, answers, guest: guest() },
  })
    .then((res) => {
      if (res && "awarded" in res) reward.value = res;
    })
    .catch(() => {});
};

// Shu sahifada turib kirsa (Google tugmasi) — plugin ballarni akkauntga
// ko'chiradi va "quiz-merged" hodisasini yuboradi
const onMerged = () => {
  if (done.value) merged.value = true;
};
onMounted(() => window.addEventListener("quiz-merged", onMerged));
onBeforeUnmount(() => window.removeEventListener("quiz-merged", onMerged));

const reset = () => {
  picked.value = fill<number | null>(null);
  results.value = fill<CheckResult | null>(null);
  errors.value = fill(false);
  pendingChoice.value = fill<number | null>(null);
  round.value++;
};
</script>

<style lang="scss" scoped>
.quiz {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: $mobile) {
    padding: 1.25rem;
  }

  &__head {
    margin-bottom: 1.5rem;
  }

  &__badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: $border-radius-pill;
    background: rgba(var(--c-primary-rgb), 0.1);
    color: $primary;
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    margin-bottom: 0.35rem;
  }

  &__sub {
    color: $text-secondary;
    font-size: 0.9rem;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__q {
    display: flex;
    gap: 0.6rem;
    font-weight: 700;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  &__num {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: $primary-light;
    color: $primary;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.1rem;
  }

  &__options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;

    @media (max-width: $tablet) {
      grid-template-columns: 1fr;
    }
  }

  &__opt {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    text-align: left;
    padding: 0.75rem 0.9rem;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-sm;
    background: $bg-secondary;
    color: $text-primary;
    font-size: 0.92rem;
    line-height: 1.4;
    transition:
      border-color 0.15s,
      background 0.15s,
      opacity 0.15s;

    &:not(:disabled):hover {
      border-color: $primary;
    }

    &:disabled {
      cursor: default;
    }

    &.is-right {
      border-color: var(--c-success-strong);
      background: rgba(67, 217, 139, 0.12);
    }

    &.is-wrong {
      border-color: $danger;
      background: rgba($danger, 0.1);
    }

    &.is-dim {
      opacity: 0.55;
    }

    &.is-busy {
      border-color: $primary;
      opacity: 0.75;
    }
  }

  &__letter {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 6px;
    background: $bg-primary;
    border: 1px solid $border-color;
    color: $text-secondary;
    font-size: 0.78rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__explain {
    margin-top: 0.65rem;
    font-size: 0.88rem;
    line-height: 1.55;
    color: $text-secondary;

    &.is-right strong {
      color: var(--c-success-text);
    }
    &.is-wrong strong {
      color: var(--c-danger-text);
    }
  }

  &__result {
    margin-top: 1.75rem;
    padding: 1.25rem;
    border-radius: $border-radius-sm;
    background: $primary-light;
    text-align: center;
  }

  &__score {
    font-size: 2rem;
    font-weight: 800;
    color: $primary;
  }

  &__verdict {
    margin: 0.25rem 0 1rem;
    font-weight: 600;
  }

  &__points {
    margin: -0.25rem 0 1rem;
    font-size: 0.92rem;
    line-height: 1.5;

    strong {
      color: $primary;
    }

    a {
      color: $primary;
      font-weight: 700;
      margin-left: 0.25rem;
    }

    &.is-muted {
      color: $text-secondary;
    }
  }

  &__claim {
    margin: -0.25rem auto 1rem;
    max-width: 26rem;
  }

  &__claim-title {
    font-size: 1.05rem;
    font-weight: 700;

    strong {
      color: $primary;
    }
  }

  &__claim-text {
    margin: 0.35rem 0 0.25rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 700;
    }
  }

  &__claim-alt {
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 600;
    }
  }
}
</style>
