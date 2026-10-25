<template>
  <ClientOnly>
    <button
      v-if="canInstall"
      type="button"
      class="install-btn"
      :class="`install-btn--${variant}`"
      @click="install"
    >
      📱 Ilovani o'rnatish
    </button>
  </ClientOnly>
</template>

<script setup lang="ts">
/** "Ilovani o'rnatish" tugmasi (mobil menyu va footer) */
withDefaults(defineProps<{ variant?: "menu" | "footer" }>(), {
  variant: "menu",
});

const { canInstall, install } = usePwa();
</script>

<style lang="scss" scoped>
.install-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  border-radius: $border-radius-pill;
  cursor: pointer;

  &--menu {
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
    background: rgba(var(--c-primary-rgb), 0.1);
    color: $primary;
    font-size: 0.95rem;
  }

  &--footer {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1.5px solid currentColor;
    color: inherit;
    font-size: 0.88rem;
    opacity: 0.9;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
