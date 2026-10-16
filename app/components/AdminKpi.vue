<template>
  <div class="kpi">
    <div class="kpi__head">
      <span class="kpi__icon">{{ icon }}</span>
      <span class="kpi__label">{{ label }}</span>
    </div>
    <div class="kpi__value">{{ formatted }}{{ suffix }}</div>
    <div
      v-if="previous !== undefined"
      class="kpi__delta"
      :class="deltaClass"
      :title="`Oldingi davrda: ${previous}`"
    >
      {{ deltaText }}
    </div>
    <div v-if="hint" class="kpi__hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
// Ko'rsatkich kartasi: qiymat va oldingi davrga nisbatan o'zgarish
const props = withDefaults(
  defineProps<{
    icon: string;
    label: string;
    value: number;
    previous?: number;
    suffix?: string;
    decimals?: number;
    /** O'rtacha o'rin kabi — kamaygani yaxshi */
    lowerIsBetter?: boolean;
    hint?: string;
  }>(),
  { suffix: "", decimals: 0, lowerIsBetter: false },
);

const formatted = computed(() =>
  Number(props.value || 0).toLocaleString("uz-UZ", {
    maximumFractionDigits: props.decimals,
  }),
);

const change = computed(() => {
  if (props.previous === undefined) return null;
  const prev = Number(props.previous) || 0;
  const cur = Number(props.value) || 0;
  if (prev === 0) return cur === 0 ? 0 : null; // null — "yangi"
  return ((cur - prev) / prev) * 100;
});

const deltaText = computed(() => {
  const c = change.value;
  if (c === null) return "▲ yangi";
  if (Math.abs(c) < 0.5) return "— o'zgarmadi";
  return `${c > 0 ? "▲" : "▼"} ${Math.abs(c).toFixed(Math.abs(c) < 10 ? 1 : 0)}%`;
});

const deltaClass = computed(() => {
  const c = change.value;
  if (c !== null && Math.abs(c) < 0.5) return "is-flat";
  const up = c === null || c > 0;
  return up !== props.lowerIsBetter ? "is-good" : "is-bad";
});
</script>

<style lang="scss" scoped>
.kpi {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;

  &__head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  &__icon {
    font-size: 1rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-secondary;
  }

  &__value {
    font-size: clamp(1.25rem, 4.5vw, 1.6rem);
    font-weight: 800;
    color: $text-primary;
    line-height: 1.15;
  }

  &__delta {
    font-size: 0.72rem;
    font-weight: 600;

    &.is-good {
      color: var(--c-success-text);
    }
    &.is-bad {
      color: var(--c-danger-text);
    }
    &.is-flat {
      color: $text-muted;
    }
  }

  &__hint {
    font-size: 0.7rem;
    color: $text-muted;
  }
}
</style>
