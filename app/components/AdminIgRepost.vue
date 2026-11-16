<!-- Admin bosh sahifa: Instagram postlari → Telegram kanal (har N kunda) -->
<template>
  <section v-if="st" class="cq">
    <div class="cq__head">
      <div>
        <h2 class="cq__title">📷 Instagram → Telegram kanal</h2>
        <p class="cq__sub">
          Instagram'dagi postlar kanalga ham chiqadi: har {{ st.days }} kunda
          bittadan, eng eskisidan boshlab. Rasm — rasm, video — video, karusel —
          albom bo'lib; tagida Instagram'dagi postga havola.
        </p>
      </div>
      <label class="switch" :class="{ 'is-on': st.enabled }">
        <input
          type="checkbox"
          :checked="st.enabled"
          :disabled="busy || !ready"
          @change="update({ enabled: !st.enabled })"
        />
        <span class="switch__track"><span class="switch__dot" /></span>
        <span>{{ st.enabled ? "Yoqilgan" : "O'chirilgan" }}</span>
      </label>
    </div>

    <p v-if="!st.telegram" class="cq__warn">Telegram kanal sozlanmagan.</p>
    <p v-else-if="!st.instagram" class="cq__warn">
      Instagram ulanmagan (INSTAGRAM_ACCESS_TOKEN).
    </p>

    <template v-else>
      <div class="cq__row">
        <label class="cq__field">
          <span>Har necha kunda</span>
          <select
            class="input"
            :value="st.days"
            :disabled="busy"
            @change="
              update({ days: Number(($event.target as HTMLSelectElement).value) })
            "
          >
            <option v-for="d in [1, 2, 3, 4, 5, 7, 10, 14]" :key="d" :value="d">
              {{ d }} kun
            </option>
          </select>
        </label>
        <label class="cq__field">
          <span>Soat</span>
          <select
            class="input"
            :value="st.hour"
            :disabled="busy"
            @change="
              update({ hour: Number(($event.target as HTMLSelectElement).value) })
            "
          >
            <option v-for="h in 24" :key="h - 1" :value="h - 1">
              {{ String(h - 1).padStart(2, "0") }}:00
            </option>
          </select>
        </label>
        <div class="cq__stat">
          <span>Kanalga chiqqan</span>
          <strong>{{ st.sentCount }}</strong>
        </div>
        <div class="cq__stat">
          <span>Navbatda</span>
          <strong>{{ st.pending ?? "—" }}</strong>
        </div>
        <button
          class="btn btn--outline cq__send"
          :disabled="busy || !st.pending"
          @click="sendNow"
        >
          {{ busy ? "⏳ Yuborilmoqda…" : "📤 Hozir yuborish" }}
        </button>
      </div>

      <p v-if="st.next" class="cq__last">
        <span>Navbatdagi ({{ typeLabel(st.next.type) }}, Instagram'da
          {{ formatDate(st.next.at) }}):</span>
        «{{ st.next.caption || "tavsifsiz" }}»
      </p>
      <p v-if="st.lastPost" class="cq__last">
        <span>Oxirgi ({{ formatDateTime(st.lastPost.at) }}):</span>
        «{{ st.lastPost.caption || "tavsifsiz" }}»
        <a v-if="st.lastPost.permalink" :href="st.lastPost.permalink" target="_blank" rel="noopener">Instagram</a>
      </p>
      <p v-if="st.enabled && st.nextRunAfter" class="cq__last">
        <span>Keyingisi:</span> {{ formatDate(st.nextRunAfter) }},
        {{ String(st.hour).padStart(2, "0") }}:00 dan keyin
      </p>
      <p v-if="st.error" class="cq__warn">⚠️ Oxirgi xato: {{ st.error }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";

interface Status {
  enabled: boolean;
  days: number;
  hour: number;
  telegram: boolean;
  instagram: boolean;
  sentCount: number;
  pending: number | null;
  next: { id: string; caption: string; type: string; at: string } | null;
  lastPost: { at: string; caption: string; permalink: string | null } | null;
  nextRunAfter: string | null;
  error: string | null;
}

const adminStore = useAdminStore();
const st = ref<Status | null>(null);
const busy = ref(false);
const ready = computed(() => Boolean(st.value?.telegram && st.value?.instagram));

const typeLabel = (t: string) =>
  t === "VIDEO" ? "video" : t === "CAROUSEL_ALBUM" ? "albom" : "rasm";

const load = async () => {
  const res = await adminStore.adminApi("GET", "/ig-repost");
  if (res.success) st.value = res.data;
};

const update = async (patch: Record<string, unknown>) => {
  busy.value = true;
  const res = await adminStore.adminApi("PUT", "/ig-repost", patch);
  busy.value = false;
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  st.value = res.data;
  ElMessage({ type: "success", message: "💾 Saqlandi" });
};

const sendNow = async () => {
  try {
    await ElMessageBox.confirm(
      "Navbatdagi Instagram posti kanalga hozir yuboriladi.",
      "Instagram → Telegram",
      { confirmButtonText: "Yuborish", cancelButtonText: "Bekor", type: "info" },
    );
  } catch {
    return;
  }
  busy.value = true;
  const res = await adminStore.adminApi("POST", "/ig-repost/send");
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 8000 });
  ElMessage({
    type: "success",
    message: res.data.sent ? "📤 Kanalga yuborildi" : "Navbat bo'sh",
  });
  await load();
};

onMounted(load);
</script>

<style lang="scss" scoped>
@use "~/assets/scss/admin-card" as *;
</style>
