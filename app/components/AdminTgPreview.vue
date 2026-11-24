<!--
  Kanal posti qanday ko'rinishini sinash: eng so'nggi maqola posti kanalga
  emas, adminning shaxsiy Telegram chatiga yuboriladi. Instant View
  ("⚡ INSTANT VIEW" tugmasi) Telegram ichida ochilishini shu yerda tekshirasiz.
-->
<template>
  <section class="cq">
    <div class="cq__head">
      <div>
        <h2 class="cq__title">📣 Kanal posti sinovi</h2>
        <p class="cq__sub">
          Yangi maqola kanalga shu ko'rinishda chiqadi: tepada katta rasm va
          "⚡ INSTANT VIEW" — maqola Telegram'ning o'zida ochiladi. Pastda
          "Saytda o'qish" tugmasi. Sinov posti kanalga emas, sizning shaxsiy
          chatingizga keladi.
        </p>
      </div>
      <button class="btn btn--outline cq__send" :disabled="busy" @click="send">
        {{ busy ? "⏳ Yuborilmoqda…" : "📨 O'zimga yuborish" }}
      </button>
    </div>
    <p v-if="result" class="cq__last">{{ result }}</p>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

const adminStore = useAdminStore();
const busy = ref(false);
const result = ref("");

const send = async () => {
  busy.value = true;
  result.value = "";
  const res = await adminStore.adminApi("POST", "/telegram/preview");
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 10000 });
  result.value = res.data.instantView
    ? "✅ Yuborildi — Telegram'dagi botingiz chatini oching va postdagi ⚡ INSTANT VIEW tugmasini bosib ko'ring."
    : "✅ Yuborildi. Diqqat: Instant View o'chiq (TELEGRAM_IV_RHASH yo'q) — post oddiy rasm ko'rinishida.";
};
</script>

<style lang="scss" scoped>
@use "~/assets/scss/admin-card" as *;
</style>
