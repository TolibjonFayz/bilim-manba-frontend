<!--
  "🎧 Maqolani tinglang" — maqola ovozi (Gemini TTS, MP3 R2'da).
  Fayl faqat tugma bosilganda yuklanadi (preload="none") — sahifa og'irlashmaydi.
  Tezlik: 1× → 1.25× → 1.5× → 0.75×. Telefon qulf ekranida ham boshqariladi.
-->
<template>
  <div class="aud" :class="{ 'is-open': started }" data-track-area="audio">
    <button
      type="button"
      class="aud__play"
      :aria-label="playing ? 'Pauza' : 'Maqolani tinglash'"
      @click="toggle"
    >
      <span v-if="loading" class="aud__spin" aria-hidden="true" />
      <svg v-else-if="playing" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
      </svg>
    </button>

    <div class="aud__body">
      <div class="aud__top">
        <span class="aud__title">🎧 Maqolani tinglang</span>
        <span class="aud__time">
          <template v-if="started">{{ fmt(current) }} / </template>{{ fmt(total) }}
        </span>
      </div>
      <input
        v-if="started"
        class="aud__bar"
        type="range"
        min="0"
        :max="total || 1"
        step="1"
        :value="current"
        :style="{ '--p': `${total ? (current / total) * 100 : 0}%` }"
        aria-label="Audio holati"
        @input="seek"
      />
      <span v-else class="aud__hint">Yo'lda, ishda yoki dam olayotib — quloq soling</span>
    </div>

    <button
      v-if="started"
      type="button"
      class="aud__speed"
      aria-label="Tezlik"
      @click="nextSpeed"
    >
      {{ speed }}×
    </button>

    <audio
      ref="el"
      :src="audio.url"
      preload="none"
      @play="onPlay"
      @pause="playing = false"
      @waiting="loading = true"
      @playing="loading = false"
      @timeupdate="onTime"
      @loadedmetadata="onMeta"
      @ended="onEnded"
      @error="onError"
    />
    <p v-if="error" class="aud__error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  audio: { url: string; seconds: number };
  title: string;
  slug: string;
  cover?: string | null;
}>();

const SPEEDS = [1, 1.25, 1.5, 0.75];
const el = ref<HTMLAudioElement | null>(null);
const started = ref(false);
const playing = ref(false);
const loading = ref(false);
const current = ref(0);
const total = ref(props.audio.seconds || 0);
const speed = ref(1);
const error = ref("");
const marks = new Set<number>();

const fmt = (s: number) => {
  const n = Math.max(0, Math.round(s || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
};

const toggle = async () => {
  const a = el.value;
  if (!a) return;
  error.value = "";
  if (!a.paused) return a.pause();
  if (!started.value) {
    started.value = true;
    loading.value = true;
    track("audio_play", { slug: props.slug });
  }
  try {
    await a.play();
  } catch {
    loading.value = false;
  }
};

const onPlay = () => {
  playing.value = true;
  // Telefon qulf ekrani / bildirishnoma panelida nom va rasm
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: props.title,
      artist: "Bilim Manba",
      artwork: props.cover ? [{ src: props.cover, sizes: "512x512" }] : [],
    });
  }
};

const onMeta = () => {
  const d = el.value?.duration;
  if (d && Number.isFinite(d)) total.value = d;
};

const onTime = () => {
  const a = el.value;
  if (!a) return;
  current.value = a.currentTime;
  // Qancha qismi tinglangani: 25/50/75%
  const p = total.value ? (a.currentTime / total.value) * 100 : 0;
  for (const m of [25, 50, 75]) {
    if (p >= m && !marks.has(m)) {
      marks.add(m);
      track("audio_progress", { slug: props.slug, p: m });
    }
  }
};

const onEnded = () => {
  playing.value = false;
  track("audio_complete", { slug: props.slug });
};

const onError = () => {
  if (!started.value) return;
  loading.value = false;
  playing.value = false;
  error.value = "Audio yuklanmadi — internetni tekshirib, qayta bosing.";
};

const seek = (e: Event) => {
  const v = Number((e.target as HTMLInputElement).value);
  if (el.value) el.value.currentTime = v;
  current.value = v;
};

const nextSpeed = () => {
  const i = SPEEDS.indexOf(speed.value);
  speed.value = SPEEDS[(i + 1) % SPEEDS.length]!;
  if (el.value) el.value.playbackRate = speed.value;
};
</script>

<style lang="scss" scoped>
.aud {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
  padding: 0.85rem 1rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background: $bg-primary;
  position: relative;
  flex-wrap: wrap;

  &__play {
    flex-shrink: 0;
    width: 2.9rem;
    height: 2.9rem;
    border-radius: 50%;
    border: none;
    background: var(--c-primary-solid, #{$primary});
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.06);
    }

    svg {
      width: 1.35rem;
      height: 1.35rem;
      fill: currentColor;
    }
  }

  &__spin {
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: aud-spin 0.8s linear infinite;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__title {
    font-weight: 700;
    font-size: 0.95rem;
    color: $text-primary;
  }

  &__time {
    font-size: 0.8rem;
    color: $text-secondary;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__hint {
    display: block;
    font-size: 0.82rem;
    color: $text-secondary;
    margin-top: 0.15rem;
  }

  &__bar {
    width: 100%;
    margin-top: 0.45rem;
    appearance: none;
    height: 5px;
    border-radius: 999px;
    background: linear-gradient(
      to right,
      $primary var(--p),
      rgba(var(--c-primary-rgb), 0.18) var(--p)
    );
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: $primary;
    }
    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border: none;
      border-radius: 50%;
      background: $primary;
    }
  }

  &__speed {
    flex-shrink: 0;
    min-width: 3.2rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid $border-color;
    border-radius: 999px;
    background: $bg-secondary;
    color: $text-primary;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
  }

  &__error {
    flex-basis: 100%;
    margin: 0;
    font-size: 0.82rem;
    color: var(--c-danger-text);
  }
}

@keyframes aud-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
