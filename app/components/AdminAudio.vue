<!--
  Admin bosh sahifa: audio maqolalar (Gemini TTS). Avval ovoz namunasini
  tinglab tanlanadi, keyin yoqiladi — maqolalar kuniga bir nechtadan
  ovozlashtiriladi (yangilari birinchi, keyin eng ko'p o'qilganlar).
-->
<template>
  <section class="cq">
    <div class="cq__head">
      <div>
        <h2 class="cq__title">🎧 Audio maqolalar</h2>
        <p class="cq__sub">
          Maqola sahifasida "Maqolani tinglang" pleyeri chiqadi. Ovozni Gemini
          yaratadi (o'zbekcha). Avval ovozni tanlab, namunasini tinglang.
        </p>
      </div>
      <label v-if="st" class="switch" :class="{ 'is-on': st.enabled }">
        <input
          type="checkbox"
          :checked="st.enabled"
          :disabled="busy || !st.configured"
          @change="update({ enabled: !st.enabled })"
        />
        <span class="switch__track"><span class="switch__dot" /></span>
        <span>{{ st.enabled ? "Yoqilgan" : "O'chirilgan" }}</span>
      </label>
    </div>

    <p v-if="!st" class="cq__last">⏳ Yuklanmoqda…</p>
    <template v-else>
      <p v-if="!st.configured" class="cq__warn">
        GEMINI_API_KEY sozlanmagan — ovoz yaratib bo'lmaydi.
      </p>

      <div class="cq__row">
        <label class="cq__field">
          Ovoz
          <select
            class="input aud-select"
            :value="st.voice"
            :disabled="busy"
            @change="update({ voice: ($event.target as HTMLSelectElement).value })"
          >
            <option v-for="v in st.voices" :key="v.id" :value="v.id">
              {{ v.label }}
            </option>
          </select>
        </label>
        <button
          class="btn btn--outline cq__send"
          :disabled="sampling || !st.configured"
          @click="sample"
        >
          {{ sampling ? "⏳ Ovoz yaratilmoqda (≈20 s)…" : "▶️ Namunani tinglash" }}
        </button>
      </div>

      <audio v-if="sampleUrl" :src="sampleUrl" controls autoplay class="aud-sample" />
      <p v-if="sampleInfo" class="cq__last">{{ sampleInfo }}</p>

      <div class="cq__row">
        <div class="cq__stat">
          <span>Ovozlashtirilgan</span>
          <strong>{{ st.done }} / {{ st.total }}</strong>
        </div>
        <div class="cq__stat">
          <span>Bugun</span>
          <strong>{{ st.today }} / {{ st.dailyMax }}</strong>
        </div>
        <div class="cq__stat">
          <span>Jami audio</span>
          <strong>{{ st.minutes }} daq</strong>
        </div>
        <label
          v-if="st.telegramConfigured"
          class="switch"
          :class="{ 'is-on': st.telegram }"
        >
          <input
            type="checkbox"
            :checked="st.telegram"
            :disabled="busy"
            @change="update({ telegram: !st.telegram })"
          />
          <span class="switch__track"><span class="switch__dot" /></span>
          <span>Yangi maqola audiosi kanalga</span>
        </label>
      </div>
      <p class="cq__last">
        Podkast lentasi:
        <a href="https://bilimmanba.uz/podcast.xml" target="_blank" rel="noopener"
          >bilimmanba.uz/podcast.xml</a
        >
        — Spotify / Apple Podcasts'ga shu manzil beriladi. Hammaga ochiq ro'yxat:
        <NuxtLink to="/audio" target="_blank">/audio</NuxtLink>
      </p>

      <div class="cq__row aud-run">
        <p class="cq__last">
          <template v-if="st.running">⏳ Hozir ovozlashtiryapti…</template>
          <template v-else-if="st.lastTick">
            Oxirgi tekshiruv: {{ fmt(st.lastTick.at) }} —
            <b>{{ RESULT[st.lastTick.result] ?? st.lastTick.result }}</b>
            ({{ st.lastTick.reason }}<template v-if="st.lastTick.articleId">,
              maqola #{{ st.lastTick.articleId }}</template>)
          </template>
          <template v-else>Server yaqinda qayta ishga tushdi — birinchi tekshiruv bir necha daqiqada.</template>
          <template v-if="st.nextCheckAt && !st.running">
            · keyingisi {{ fmt(st.nextCheckAt) }}</template>
        </p>
        <button
          class="btn btn--outline cq__send"
          :disabled="busy || st.running || !st.enabled"
          @click="runNow"
        >
          ▶ Hozir urinish
        </button>
      </div>
      <p v-if="st.freshPending" class="cq__last">
        🆕 Navbatda {{ st.freshPending }} ta yangi maqola — ular kunlik limitga
        kirmaydi, 20 daqiqa ichida ovozlashtiriladi.
      </p>
      <p v-if="st.skipped" class="cq__warn">
        {{ st.skipped }} ta maqola 3 marta ovozlashtirilmadi va o'tkazib
        yuborildi (xatosi pastda). Audioni o'chirib-yoqsangiz qayta urinadi.
      </p>
      <p v-if="st.pausedUntil" class="cq__warn">
        ⏸ Gemini bepul limiti tugadi — {{ fmt(st.pausedUntil) }} gacha kutiladi.
      </p>
      <p v-if="st.lastError" class="cq__warn">
        ⚠️ Oxirgi xato ({{ fmt(st.lastError.at) }}, maqola #{{ st.lastError.articleId }}):
        {{ st.lastError.message }}
      </p>
      <p v-if="st.enabled && st.done < st.total && !st.pausedUntil" class="cq__last">
        Navbat har 20 daqiqada tekshiriladi. Yangi maqolalar darhol, eski
        maqolalar — kuniga {{ st.dailyMax }} tagacha.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

interface Status {
  configured: boolean;
  enabled: boolean;
  voice: string;
  voices: { id: string; label: string }[];
  dailyMax: number;
  telegram: boolean;
  telegramConfigured: boolean;
  freshPending: number;
  skipped: number;
  running: boolean;
  lastTick: { at: string; result: string; reason: string; articleId?: number } | null;
  nextCheckAt: string | null;
  today: number;
  pausedUntil: string | null;
  lastError: { at: string; articleId: number; message: string } | null;
  done: number;
  total: number;
  minutes: number;
}

const adminStore = useAdminStore();
const st = ref<Status | null>(null);
const busy = ref(false);
const sampling = ref(false);
const sampleUrl = ref("");
const sampleInfo = ref("");

const fmt = (iso: string) => formatDateTime(iso);
const RESULT: Record<string, string> = {
  done: "✅ audio tayyor",
  skipped: "o'tkazildi",
  failed: "⚠️ xato",
  idle: "navbat bo'sh",
};

// Pauza/limitga qaramay bitta maqolani hozir ovozlashtirish (1–5 daqiqa)
const runNow = async () => {
  busy.value = true;
  const res = await adminStore.adminApi("POST", "/audio/run");
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 8000 });
  ElMessage({
    type: res.data.started ? "success" : "warning",
    message: res.data.started
      ? "Boshlandi — 1–5 daqiqadan keyin natija shu kartada chiqadi"
      : res.data.reason,
    duration: 6000,
  });
  // Natijani kuzatish: har 20 s, 6 daqiqagacha
  let n = 0;
  const t = setInterval(async () => {
    await load();
    if (++n >= 18 || (st.value && !st.value.running && n > 1)) clearInterval(t);
  }, 20000);
};

const load = async () => {
  const res = await adminStore.adminApi("GET", "/audio");
  if (res.success) st.value = res.data;
};

const update = async (body: {
  enabled?: boolean;
  voice?: string;
  telegram?: boolean;
}) => {
  busy.value = true;
  const res = await adminStore.adminApi("PUT", "/audio", body);
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 8000 });
  st.value = res.data;
  if (body.voice) sampleUrl.value = "";
};

const sample = async () => {
  if (!st.value) return;
  sampling.value = true;
  sampleInfo.value = "";
  const res = await adminStore.adminApi("POST", "/audio/sample", {
    voice: st.value.voice,
  });
  sampling.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 12000 });
  sampleUrl.value = res.data.audio;
  sampleInfo.value = `Ovoz: ${res.data.voice} · ${res.data.seconds} s · model: ${res.data.model}`;
};

onMounted(load);
</script>

<style lang="scss" scoped>
@use "~/assets/scss/admin-card" as *;

.cq__last a {
  color: $primary;
  font-weight: 600;
}

.aud-select {
  width: auto !important;
  min-width: 260px;
}

.aud-sample {
  width: 100%;
  max-width: 480px;
  margin-top: 0.75rem;
}
</style>
