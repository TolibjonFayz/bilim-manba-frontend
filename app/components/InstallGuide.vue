<template>
  <ClientOnly>
    <!-- Pastdagi taklif: telefonda, o'rnatilmagan bo'lsa, saytda biroz vaqt o'tgach -->
    <Transition name="install-bar">
      <div
        v-if="barOpen"
        class="install-bar"
        role="region"
        aria-label="Ilovani o'rnatish"
      >
        <img src="/icon-192.png" alt="" width="40" height="40" />
        <div class="install-bar__text">
          <strong>Bilim Manba ilovasi</strong>
          <span>Bosh ekrandan bir bosishda oching</span>
        </div>
        <button
          type="button"
          class="btn btn--primary install-bar__go"
          @click="onInstall"
        >
          O'rnatish
        </button>
        <button
          type="button"
          class="install-bar__close"
          aria-label="Yopish"
          @click="dismiss"
        >
          ✕
        </button>
      </div>
    </Transition>

    <!-- Brauzer o'rnatish oynasini bermasa — qadamlar -->
    <Teleport to="body">
      <div
        v-if="guideOpen"
        class="guide"
        role="dialog"
        aria-modal="true"
        @click.self="guideOpen = false"
      >
        <div class="guide__card">
          <img
            src="/icon-192.png"
            alt=""
            width="56"
            height="56"
            class="guide__icon"
          />
          <strong class="guide__title"
            >📱 Bilim Manba'ni ilova qilib o'rnating</strong
          >
          <ol class="guide__steps">
            <li v-for="(s, i) in steps" :key="i" v-html="s" />
          </ol>
          <p v-if="platform === 'android-other'" class="guide__note">
            Ilova ichidagi brauzerda (Telegram, Instagram) o'rnatib bo'lmaydi —
            saytni Chrome yoki Edge'da oching.
          </p>
          <button
            type="button"
            class="btn btn--primary"
            @click="guideOpen = false"
          >
            Tushunarli
          </button>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * Ilova o'rnatish: pastdagi taklif paneli va brauzerga mos yo'riqnoma.
 * Panel: telefonda, 25 soniyadan keyin; yopilsa — 14 kun ko'rinmaydi.
 */
const { canInstall, installed, platform, guideOpen, install } = usePwa();
const route = useRoute();

const KEY = "pwa_bar_dismissed";
const HIDE_DAYS = 14;
const barOpen = ref(false);

const STEPS: Record<string, string[]> = {
  "android-chrome": [
    "Chrome'ning yuqori o'ngidagi <b>⋮</b> menyusini bosing.",
    '<b>"Ilovani o\'rnatish"</b> yoki <b>"Bosh ekranga qo\'shish"</b> ni tanlang.',
    "<b>O'rnatish</b> ni bosing — Bilim Manba belgisi bosh ekranda paydo bo'ladi.",
  ],
  "android-edge": [
    "Edge'ning pastidagi <b>⋯</b> menyusini bosing.",
    '<b>"Telefonga qo\'shish"</b> (Add to phone) ni tanlang.',
    "<b>O'rnatish</b> ni bosing — Bilim Manba belgisi bosh ekranda paydo bo'ladi.",
  ],
  "android-samsung": [
    "Pastdagi <b>☰</b> menyusini bosing.",
    '<b>"Sahifani qo\'shish"</b> → <b>"Bosh ekran"</b> ni tanlang.',
    "<b>Qo'shish</b> ni bosing.",
  ],
  ios: [
    "Safari pastidagi <b>Ulashish</b> tugmasini bosing (⬆️ belgili kvadrat).",
    '<b>"Bosh ekranga qo\'shish"</b> (Add to Home Screen) ni tanlang.',
    "<b>Qo'shish</b> ni bosing — ilova belgisi bosh ekranda paydo bo'ladi.",
  ],
};
const steps = computed(() => STEPS[platform.value] ?? STEPS["android-chrome"]);

const dismissedRecently = () => {
  try {
    const t = Number(localStorage.getItem(KEY) || 0);
    return Date.now() - t < HIDE_DAYS * 86400e3;
  } catch {
    return false;
  }
};

const dismiss = () => {
  barOpen.value = false;
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {}
};

const onInstall = async () => {
  barOpen.value = false;
  await install();
};

let timer: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
  if (platform.value === "desktop" || installed.value || dismissedRecently())
    return;
  timer = setTimeout(() => {
    // Admin panelda va kirish sahifalarida chiqmasin
    if (canInstall.value && !/^\/(admin|login|register)/.test(route.path))
      barOpen.value = true;
  }, 25000);
});
onBeforeUnmount(() => timer && clearTimeout(timer));
watch(installed, (v) => v && (barOpen.value = false));
</script>

<style lang="scss" scoped>
.install-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 2500;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.7rem 0.65rem 0.75rem;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  max-width: 520px;
  margin: 0 auto;

  img {
    border-radius: 10px;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    strong {
      font-size: 0.92rem;
    }

    span {
      font-size: 0.78rem;
      color: $text-secondary;
    }
  }

  &__go {
    padding: 0.5rem 0.95rem;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  &__close {
    background: none;
    color: $text-muted;
    font-size: 0.95rem;
    padding: 0.35rem;
    flex-shrink: 0;
  }
}

.install-bar-enter-active,
.install-bar-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.install-bar-enter-from,
.install-bar-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

.guide {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;

  &__card {
    width: 100%;
    max-width: 440px;
    background: $bg-primary;
    color: $text-primary;
    border-radius: 18px;
    padding: 1.4rem 1.25rem 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  &__icon {
    border-radius: 14px;
    align-self: center;
  }

  &__title {
    font-size: 1.05rem;
    text-align: center;
  }

  &__steps {
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.93rem;
    line-height: 1.5;
    color: $text-secondary;

    :deep(b) {
      color: $text-primary;
    }
  }

  &__note {
    font-size: 0.82rem;
    color: var(--c-warning-text);
    line-height: 1.5;
  }
}
</style>
