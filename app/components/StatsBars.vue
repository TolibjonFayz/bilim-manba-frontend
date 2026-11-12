<template>
  <div class="sbars">
    <p v-if="!items.length" class="sbars__empty">{{ empty }}</p>
    <ul v-else class="sbars__list">
      <li v-for="(it, i) in shown" :key="it.label + i" class="sbars__item">
        <div class="sbars__row">
          <span class="sbars__label" :title="it.label">
            <span v-if="it.icon" class="sbars__icon">{{ it.icon }}</span>
            <NuxtLink v-if="it.to" :to="it.to" class="sbars__link">{{ it.label }}</NuxtLink>
            <template v-else>{{ it.label }}</template>
          </span>
          <span class="sbars__value">
            {{ format(it.value) }}
            <small v-if="showShare && total">{{ Math.round((it.value / total) * 100) }}%</small>
          </span>
        </div>
        <div class="sbars__track" :title="`${it.label}: ${format(it.value)}`">
          <span :style="{ width: width(it.value) }" />
        </div>
        <small v-if="it.sub" class="sbars__sub">{{ it.sub }}</small>
      </li>
    </ul>
    <button
      v-if="items.length > limit && !all"
      class="sbars__more"
      @click="all = true"
    >
      Yana {{ items.length - limit }} tasini ko'rsatish
    </button>
  </div>
</template>

<script setup lang="ts">
// Gorizontal ustunlar ro'yxati: bitta rang (kattalik), qiymat matn rangida,
// ulushi foizda. Uzun ro'yxat — "yana ko'rsatish".
const props = withDefaults(
  defineProps<{
    items: { label: string; value: number; sub?: string; icon?: string; to?: string }[];
    format?: (v: number) => string;
    showShare?: boolean;
    limit?: number;
    empty?: string;
  }>(),
  {
    format: (v: number) => Number(v || 0).toLocaleString("uz-UZ"),
    showShare: false,
    limit: 8,
    empty: "Bu davrda ma'lumot yo'q.",
  },
);

const all = ref(false);
const shown = computed(() => (all.value ? props.items : props.items.slice(0, props.limit)));
const max = computed(() => Math.max(1, ...props.items.map((i) => i.value || 0)));
const total = computed(() => props.items.reduce((s, i) => s + (i.value || 0), 0));
const width = (v: number) => `${Math.max(2, ((v || 0) / max.value) * 100)}%`;
</script>

<style lang="scss" scoped>
.sbars {
  &__empty {
    font-size: 0.85rem;
    color: $text-muted;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
  }

  &__label {
    font-size: 0.86rem;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  &__icon {
    margin-right: 0.35rem;
  }

  &__link {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: $primary;
    }
  }

  &__value {
    font-size: 0.86rem;
    font-weight: 700;
    color: $text-primary;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;

    small {
      margin-left: 0.3rem;
      font-weight: 500;
      color: $text-muted;
    }
  }

  &__track {
    height: 8px;
    margin-top: 0.3rem;
    background: $bg-secondary;
    border-radius: 4px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: $primary;
      border-radius: 4px;
    }
  }

  &__sub {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.72rem;
    color: $text-muted;
  }

  &__more {
    margin-top: 0.75rem;
    border: none;
    background: none;
    color: $primary;
    font-family: $font-primary;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
  }
}
</style>
