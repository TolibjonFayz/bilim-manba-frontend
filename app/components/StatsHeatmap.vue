<template>
  <div class="heat">
    <div class="heat__scroll">
      <div class="heat__grid" role="table" aria-label="Hafta kunlari va soatlar bo'yicha tashriflar">
        <span class="heat__corner" />
        <span v-for="h in 24" :key="'h' + h" class="heat__hour">
          {{ (h - 1) % 3 === 0 ? String(h - 1).padStart(2, "0") : "" }}
        </span>
        <template v-for="(d, di) in DAYS" :key="d">
          <span class="heat__day">{{ d }}</span>
          <span
            v-for="h in 24"
            :key="d + h"
            class="heat__cell"
            :style="{ '--a': alpha(di + 1, h - 1) }"
            :class="{ 'is-zero': !value(di + 1, h - 1) }"
            :title="`${DAYS_FULL[di]}, ${String(h - 1).padStart(2, '0')}:00–${String(h - 1).padStart(2, '0')}:59 — ${value(di + 1, h - 1)} ta tashrif`"
          />
        </template>
      </div>
    </div>
    <div class="heat__legend">
      <span>Kam</span>
      <span class="heat__ramp" />
      <span>Ko'p</span>
      <span v-if="peak" class="heat__peak">
        Eng faol vaqt: <strong>{{ peak }}</strong>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Hafta kuni × soat: tashriflar soni (Toshkent vaqti). Bitta rang — och → to'q
const props = defineProps<{ cells: { dow: number; hour: number; n: number }[] }>();

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const DAYS_FULL = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

const map = computed(() => {
  const m = new Map<string, number>();
  for (const c of props.cells) m.set(`${c.dow}-${c.hour}`, c.n);
  return m;
});
const max = computed(() => Math.max(1, ...props.cells.map((c) => c.n)));
const value = (dow: number, hour: number) => map.value.get(`${dow}-${hour}`) ?? 0;
const alpha = (dow: number, hour: number) => {
  const v = value(dow, hour);
  return v ? (0.18 + 0.82 * (v / max.value)).toFixed(2) : "0";
};

const peak = computed(() => {
  if (!props.cells.length) return "";
  const best = [...props.cells].sort((a, b) => b.n - a.n)[0]!;
  return `${DAYS_FULL[best.dow - 1]}, ${String(best.hour).padStart(2, "0")}:00 atrofida`;
});
</script>

<style lang="scss" scoped>
.heat {
  &__scroll {
    overflow-x: auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1.8rem repeat(24, minmax(14px, 1fr));
    gap: 3px;
    min-width: 440px;
  }

  &__hour {
    font-size: 0.62rem;
    color: $text-muted;
    text-align: left;
    height: 1rem;
  }

  &__day {
    font-size: 0.7rem;
    font-weight: 600;
    color: $text-secondary;
    display: flex;
    align-items: center;
  }

  &__cell {
    aspect-ratio: 1;
    min-height: 14px;
    border-radius: 3px;
    background: rgba(var(--c-primary-rgb), var(--a));

    &.is-zero {
      background: $bg-secondary;
    }

    &:hover {
      outline: 2px solid $text-primary;
      outline-offset: 1px;
    }
  }

  &__legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
    font-size: 0.72rem;
    color: $text-muted;
  }

  &__ramp {
    width: 80px;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      rgba(var(--c-primary-rgb), 0.18),
      rgba(var(--c-primary-rgb), 1)
    );
  }

  &__peak {
    margin-left: auto;
    color: $text-secondary;

    strong {
      color: $text-primary;
    }
  }
}
</style>
