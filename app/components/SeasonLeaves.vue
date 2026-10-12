<template>
  <!-- Bezak: ekran o'quvchilar uchun ahamiyatsiz, bosishga xalaqit bermaydi -->
  <div class="leaves" aria-hidden="true">
    <span
      v-for="(l, i) in LEAVES"
      :key="i"
      class="leaves__leaf"
      :style="{
        '--x': `${l.x}%`,
        '--y': `${l.y}%`,
        '--size': `${Math.round(l.size * 1.2)}px`,
        '--dur': `${l.dur}s`,
        '--delay': `${l.delay}s`,
        '--drift': `${l.drift}px`,
        '--spin': `${l.spin}deg`,
      }"
    >
      <svg viewBox="0 0 24 24" :style="{ color: l.color }">
        <path v-if="l.kind === 'maple'" :d="MAPLE" fill="currentColor" />
        <template v-else>
          <path :d="OAK" fill="currentColor" />
          <path
            d="M12 4.5v16"
            stroke="rgba(0,0,0,.18)"
            stroke-width=".8"
            fill="none"
          />
        </template>
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
// Kuzgi barglar: faqat CSS animatsiya (transform), JS yo'q. Barglar chetlarda
// tushadi — markazdagi matnni yopmaydi. "Harakatni kamaytirish" yoqilgan
// qurilmalarda barglar qimirlamay turadi.
const MAPLE =
  "M12 1.8l1.7 3.7 3.1-1.2-.8 3.5 3.8.2-2.6 2.6 2.9 2-3.6 1.1 1 3.4-3.2-1.6L12 22.2l-2.3-6.7-3.2 1.6 1-3.4-3.6-1.1 2.9-2-2.6-2.6 3.8-.2-.8-3.5 3.1 1.2z";
const OAK =
  "M12 2c-4.6 3.6-6.6 8.4-5.3 13.1.9 3.3 3.2 5.5 5.3 6.4 2.1-.9 4.4-3.1 5.3-6.4C18.6 10.4 16.6 5.6 12 2z";

const C = {
  gold: "#f2a93b",
  amber: "#d97706",
  maple: "#c2410c",
  rust: "#9a3412",
  wine: "#9f1239",
  olive: "#a16207",
};

// x — chapdan %, y — harakatsiz holatdagi joy, dur/delay — soniya
const LEAVES = [
  {
    kind: "maple",
    x: 3,
    y: 18,
    size: 30,
    dur: 16,
    delay: -2,
    drift: 40,
    spin: 220,
    color: C.maple,
  },
  {
    kind: "oak",
    x: 9,
    y: 62,
    size: 22,
    dur: 19,
    delay: -11,
    drift: -30,
    spin: -180,
    color: C.gold,
  },
  {
    kind: "maple",
    x: 15,
    y: 35,
    size: 18,
    dur: 14,
    delay: -6,
    drift: 25,
    spin: 260,
    color: C.wine,
  },
  {
    kind: "oak",
    x: 21,
    y: 80,
    size: 16,
    dur: 17,
    delay: -14,
    drift: 35,
    spin: 200,
    color: C.amber,
  },
  {
    kind: "maple",
    x: 79,
    y: 22,
    size: 26,
    dur: 18,
    delay: -4,
    drift: -40,
    spin: -240,
    color: C.amber,
  },
  {
    kind: "oak",
    x: 86,
    y: 55,
    size: 20,
    dur: 15,
    delay: -9,
    drift: 30,
    spin: 190,
    color: C.rust,
  },
  {
    kind: "maple",
    x: 92,
    y: 12,
    size: 34,
    dur: 20,
    delay: -16,
    drift: -25,
    spin: -200,
    color: C.gold,
  },
  {
    kind: "maple",
    x: 96,
    y: 72,
    size: 18,
    dur: 13,
    delay: -7,
    drift: 20,
    spin: 280,
    color: C.maple,
  },
  {
    kind: "oak",
    x: 30,
    y: 8,
    size: 14,
    dur: 21,
    delay: -18,
    drift: -20,
    spin: 160,
    color: C.olive,
  },
  {
    kind: "maple",
    x: 70,
    y: 88,
    size: 15,
    dur: 22,
    delay: -12,
    drift: 25,
    spin: -180,
    color: C.wine,
  },
] as const;
</script>

<style lang="scss" scoped>
.leaves {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
  // Barg tushish masofasi — konteyner balandligi (cqh)
  container-type: size;
}

.leaves__leaf {
  position: absolute;
  top: 0;
  left: var(--x);
  width: var(--size);
  height: var(--size);
  opacity: 0.85;
  animation: leaf-fall var(--dur) linear var(--delay) infinite;
  will-change: transform;

  svg {
    width: 100%;
    height: 100%;
    display: block;
    filter: drop-shadow(0 2px 3px rgba(154, 52, 18, 0.15));
    animation: leaf-sway calc(var(--dur) / 4) ease-in-out var(--delay) infinite
      alternate;
  }

  // Telefonda barglar kamroq va kichikroq
  @media (max-width: 768px) {
    width: calc(var(--size) * 0.75);
    height: calc(var(--size) * 0.75);

    &:nth-child(n + 7) {
      display: none;
    }
  }
}

@keyframes leaf-fall {
  0% {
    transform: translate3d(0, -60px, 0) rotate(0deg);
    opacity: 0;
  }
  8% {
    opacity: 0.85;
  }
  85% {
    opacity: 0.85;
  }
  100% {
    transform: translate3d(var(--drift), calc(100cqh + 40px), 0)
      rotate(var(--spin));
    opacity: 0;
  }
}

@keyframes leaf-sway {
  from {
    transform: translateX(-10px) rotate(-14deg);
  }
  to {
    transform: translateX(10px) rotate(14deg);
  }
}

// Harakatni kamaytirish so'ralgan bo'lsa — barglar o'z joyida, qimirlamaydi
@media (prefers-reduced-motion: reduce) {
  .leaves__leaf,
  .leaves__leaf svg {
    animation: none;
  }

  .leaves__leaf {
    top: var(--y);
    transform: rotate(var(--spin));
    opacity: 0.7;
  }
}
</style>
