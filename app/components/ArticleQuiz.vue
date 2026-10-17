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
            :disabled="picked[i] !== null"
            @click="pick(i, j)"
          >
            <span class="quiz__letter">{{ LETTERS[j] }}</span>
            <span>{{ opt }}</span>
          </button>
        </div>
        <p
          v-if="picked[i] !== null"
          class="quiz__explain"
          :class="picked[i] === q.answer ? 'is-right' : 'is-wrong'"
          role="status"
        >
          <strong>{{
            picked[i] === q.answer
              ? "✅ To'g'ri!"
              : `❌ To'g'ri javob: ${LETTERS[q.answer]}.`
          }}</strong>
          {{ q.explain }}
        </p>
      </li>
    </ol>

    <div v-if="done" class="quiz__result" role="status">
      <div class="quiz__score">{{ score }}/{{ questions.length }}</div>
      <p class="quiz__verdict">{{ verdict }}</p>
      <button type="button" class="btn btn--outline quiz__retry" @click="reset">
        🔄 Qayta urinish
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Maqola oxiridagi 3 savollik test (AI maqola matnidan tuzgan). Javob
 * bosilishi bilan to'g'ri/noto'g'ri va izoh ko'rinadi; oxirida natija.
 * Birinchi urinish natijasi serverga yuboriladi (statistika uchun).
 */
interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

const props = defineProps<{ questions: QuizQuestion[]; slug: string }>();

const LETTERS = ["A", "B", "C", "D"];
const round = ref(0);
const picked = ref<(number | null)[]>(props.questions.map(() => null));
let reported = false;

const done = computed(() => picked.value.every((p) => p !== null));
const score = computed(
  () => picked.value.filter((p, i) => p === props.questions[i]?.answer).length,
);
const verdict = computed(() => {
  const n = props.questions.length;
  if (score.value === n) return "Ajoyib! Maqolani a'lo darajada tushunibsiz 🎉";
  if (score.value >= n - 1) return "Yaxshi natija! Deyarli hammasi to'g'ri 👍";
  if (score.value > 0)
    return "Yomon emas — maqolani yana bir ko'zdan kechirib chiqing 📖";
  return "Qayta o'qib, yana urinib ko'ring — albatta uddalaysiz 💪";
});

const optionClass = (i: number, j: number) => {
  const p = picked.value[i];
  if (p === null) return "";
  if (j === props.questions[i]?.answer) return "is-right";
  if (j === p) return "is-wrong";
  return "is-dim";
};

const pick = (i: number, j: number) => {
  if (picked.value[i] !== null) return;
  picked.value[i] = j;
  if (done.value && !reported) {
    reported = true;
    $fetch(`/articles/quiz-result/${encodeURIComponent(props.slug)}`, {
      method: "POST",
      baseURL: useRuntimeConfig().public.apiBase,
      body: { correct: score.value },
    }).catch(() => {});
  }
};

const reset = () => {
  picked.value = props.questions.map(() => null);
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
}
</style>
