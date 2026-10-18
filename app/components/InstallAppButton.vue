<template>
  <ClientOnly>
    <button
      v-if="canInstall"
      type="button"
      class="install-btn"
      :class="`install-btn--${variant}`"
      @click="onClick"
    >
      📱 Ilovani o'rnatish
    </button>

    <Teleport to="body">
      <div
        v-if="iosHint"
        class="ios-hint"
        role="dialog"
        aria-modal="true"
        @click.self="iosHint = false"
      >
        <div class="ios-hint__card">
          <strong>📱 Bilim Manba'ni bosh ekranga qo'shing</strong>
          <ol>
            <li>
              Safari pastidagi <b>Ulashish</b> tugmasini bosing (⬆️ belgili
              kvadrat).
            </li>
            <li>
              Ro'yxatdan <b>"Bosh ekranga qo'shish"</b> (Add to Home Screen) ni
              tanlang.
            </li>
            <li>
              <b>Qo'shish</b> ni bosing — ilova belgisi bosh ekranda paydo
              bo'ladi.
            </li>
          </ol>
          <button
            type="button"
            class="btn btn--primary"
            @click="iosHint = false"
          >
            Tushunarli
          </button>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
/** "Ilovani o'rnatish" tugmasi: o'rnatsa bo'ladigan brauzerlardagina ko'rinadi */
withDefaults(defineProps<{ variant?: "menu" | "footer" }>(), {
  variant: "menu",
});

const { canInstall, install } = usePwa();
const iosHint = ref(false);

const onClick = async () => {
  const r = await install();
  if (r === "ios") iosHint.value = true;
};
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

.ios-hint {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;

  &__card {
    width: 100%;
    max-width: 420px;
    background: $bg-primary;
    color: $text-primary;
    border-radius: $border-radius;
    padding: 1.25rem 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    ol {
      padding-left: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 0.92rem;
      line-height: 1.5;
      color: $text-secondary;
    }
  }
}
</style>
