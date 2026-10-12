<template>
  <div class="bar-chart">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      role="img"
      :aria-label="ariaLabel"
      class="bar-chart__svg"
    >
      <!-- Yordamchi chiziqlar -->
      <g class="bar-chart__grid">
        <line v-for="g in grid" :key="g.y" x1="0" :x2="W" :y1="g.y" :y2="g.y" />
      </g>
      <g>
        <rect
          v-for="(p, i) in bars"
          :key="i"
          :x="p.x"
          :y="p.y"
          :width="p.w"
          :height="p.h"
          rx="3"
          :class="[
            'bar-chart__bar',
            { 'is-last': i === bars.length - 1, 'is-zero': !p.value },
          ]"
        >
          <title>{{ p.label }}: {{ format(p.value) }}</title>
        </rect>
      </g>
    </svg>
    <div class="bar-chart__axis">
      <span class="bar-chart__max">{{ format(max) }}</span>
    </div>
    <div class="bar-chart__labels">
      <span
        v-for="(p, i) in points"
        :key="i"
        :style="{ visibility: showLabel(i) ? 'visible' : 'hidden' }"
        >{{ p.label }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
// Qaramliksiz oddiy ustunli grafik (SVG). Har ustun ustiga sichqoncha
// olib borilsa — aniq qiymat ko'rinadi.
const props = withDefaults(
  defineProps<{
    points: { label: string; value: number }[];
    ariaLabel?: string;
    decimals?: number;
  }>(),
  { ariaLabel: "Grafik", decimals: 0 },
);

const W = 600;
const H = 180;
const PAD_TOP = 8;

const max = computed(() =>
  Math.max(1, ...props.points.map((p) => p.value || 0)),
);

const bars = computed(() => {
  const n = props.points.length || 1;
  const slot = W / n;
  const w = Math.max(2, slot * 0.68);
  return props.points.map((p, i) => {
    const h = ((p.value || 0) / max.value) * (H - PAD_TOP);
    return {
      ...p,
      x: i * slot + (slot - w) / 2,
      w,
      // nol qiymat ham ko'rinsin — ingichka chiziq
      h: Math.max(h, 2),
      y: H - Math.max(h, 2),
    };
  });
});

const grid = computed(() =>
  [0.25, 0.5, 0.75].map((f) => ({ y: PAD_TOP + (H - PAD_TOP) * f })),
);

// Ko'p ustunda yorliqlar bir-biriga minmasin
const showLabel = (i: number) => {
  const n = props.points.length;
  const step = n > 20 ? 5 : n > 12 ? 2 : 1;
  return i === n - 1 || (n - 1 - i) % step === 0;
};

const format = (v: number) =>
  Number(v || 0).toLocaleString("uz-UZ", {
    maximumFractionDigits: props.decimals,
  });
</script>

<style lang="scss" scoped>
.bar-chart {
  position: relative;

  &__svg {
    width: 100%;
    height: 180px;
    display: block;
  }

  &__grid line {
    stroke: $border-color;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  &__bar {
    fill: rgba($primary, 0.45);
    transition: fill 0.15s;

    &:hover {
      fill: $primary-dark;
    }

    &.is-last {
      fill: $primary;
    }

    &.is-zero {
      fill: $border-color;
    }
  }

  &__axis {
    position: absolute;
    top: -2px;
    left: 0;
    font-size: 0.7rem;
    color: $text-muted;
    background: rgba(#fff, 0.85);
    padding: 0 0.25rem;
    border-radius: 4px;
  }

  &__labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.35rem;

    span {
      flex: 1;
      text-align: center;
      font-size: 0.68rem;
      color: $text-muted;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}
</style>
