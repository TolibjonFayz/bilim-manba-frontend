<template>
  <!-- Ota sahifaning .pub-status__item uslublari ildiz elementga tushadi -->
  <span
    v-if="state !== 'hidden'"
    class="pub-status__item pub-status__item--click"
    :class="state === 'linked' ? 'is-ok' : state === 'waiting' ? '' : 'is-warn'"
    :title="
      state === 'linked'
        ? 'Bosing — sinov xabari yuboriladi'
        : 'AI qoralama tayyor bo\'lganda, xato bo\'lganda va maqola chop etilganda Telegram\'ingizga xabar keladi'
    "
    @click="onClick"
  >
    <template v-if="state === 'linked'">🔔 Shaxsiy xabarlar ulangan</template>
    <template v-else-if="state === 'waiting'"
      >⏳ Telegram'da botga "Start" bosing…</template
    >
    <template v-else>🔕 Shaxsiy xabarlarni ulash</template>
  </span>
</template>

<script setup lang="ts">
/**
 * Adminning o'ziga Telegram xabarlari: ulash (bot havolasi → Start → panel
 * botdan kodni topadi) va sinov xabari.
 */
const adminStore = useAdminStore();
const state = ref<"hidden" | "off" | "waiting" | "linked">("hidden");
let timer: ReturnType<typeof setTimeout> | null = null;

const stop = () => {
  if (timer) clearTimeout(timer);
  timer = null;
};

const poll = async (until: number) => {
  const res = await adminStore.telegramAlerts("check");
  if (res.success && res.data?.linked) {
    state.value = "linked";
    ElMessage({ type: "success", message: "✅ Telegram ulandi — botdan tasdiq xabari keldi" });
    return;
  }
  if (!res.success) {
    state.value = "off";
    ElMessage({ type: "error", message: res.message, duration: 8000 });
    return;
  }
  if (Date.now() > until) {
    state.value = "off";
    ElMessage({
      type: "warning",
      message: "Start bosilmadi — qaytadan urinib ko'ring",
    });
    return;
  }
  timer = setTimeout(() => poll(until), 3000);
};

const onClick = async () => {
  if (state.value === "waiting") return;
  if (state.value === "linked") {
    const res = await adminStore.telegramAlerts("test");
    ElMessage(
      res.success && res.data?.sent
        ? { type: "success", message: "🔔 Sinov xabari Telegram'ingizga yuborildi" }
        : { type: "error", message: res.message || "Xabar yuborilmadi" },
    );
    return;
  }
  // Brauzer yangi oynani bloklamasligi uchun uni bosish paytida ochamiz
  const win = window.open("about:blank", "_blank");
  const res = await adminStore.telegramAlerts("link");
  if (!res.success || !res.data?.url) {
    win?.close();
    ElMessage({ type: "error", message: res.message || "Havola olinmadi", duration: 8000 });
    return;
  }
  if (win) win.location.href = res.data.url;
  else window.location.href = res.data.url;
  state.value = "waiting";
  stop();
  timer = setTimeout(() => poll(Date.now() + 3 * 60 * 1000), 3000);
};

onMounted(async () => {
  const res = await adminStore.telegramAlerts();
  if (res.success && res.data?.botConfigured) {
    state.value = res.data.linked ? "linked" : "off";
  }
});

onBeforeUnmount(stop);
</script>
