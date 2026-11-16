<!-- Admin bosh sahifa: email (obunachilarga xat) ishlayaptimi -->
<template>
  <section class="cq">
    <div class="cq__head">
      <div>
        <h2 class="cq__title">✉️ Email obunachilarga</h2>
        <p class="cq__sub">
          Yangi maqola chiqqanda obunachilarga xat ketadi. Bu yerda pochta
          ulanganmi va oxirgi tarqatma natijasi ko'rinadi.
        </p>
      </div>
      <span
        v-if="st"
        class="pill"
        :class="st.ok ? 'pill--ok' : 'pill--bad'"
        >{{ st.ok ? "✅ Ishlayapti" : "⛔ Xat ketmayapti" }}</span
      >
    </div>

    <p v-if="!st" class="cq__last">⏳ Pochta tekshirilmoqda…</p>
    <template v-else>
      <div class="cq__row">
        <div class="cq__stat">
          <span>Obunachilar</span>
          <strong>{{ st.subscribers ?? "—" }}</strong>
        </div>
        <div class="cq__stat">
          <span>Pochta serveri</span>
          <strong class="small">{{ st.host || "yo'q" }}</strong>
        </div>
        <button
          class="btn btn--outline cq__send"
          :disabled="busy || !st.configured"
          @click="sendTest"
        >
          {{ busy ? "⏳ Yuborilmoqda…" : "📨 O'zimga sinov xati" }}
        </button>
      </div>

      <p v-if="st.lastNewsletter" class="cq__last">
        <span>Oxirgi tarqatma ({{ fmt(st.lastNewsletter.at) }}):</span>
        «{{ st.lastNewsletter.title }}» — {{ st.lastNewsletter.sent }} /
        {{ st.lastNewsletter.total }} ta xat ketdi<template
          v-if="st.lastNewsletter.failed"
          >, {{ st.lastNewsletter.failed }} ta xato</template
        >
      </p>
      <p v-if="!st.ok && st.error" class="cq__warn">⚠️ {{ st.error }}</p>
      <details v-if="!st.ok" class="cq__help">
        <summary>Qanday tuzatiladi?</summary>
        <p>
          Outlook/Hotmail pochtasi endi saytlardan xat yuborishga ruxsat
          bermaydi. Bepul <b>Resend</b> xizmatini ulang (kuniga 100 ta xat):
        </p>
        <ol>
          <li>resend.com da ro'yxatdan o'ting → Domains → bilimmanba.uz ni qo'shing va ko'rsatilgan DNS yozuvlarini Cloudflare'ga qo'ying.</li>
          <li>API Keys → yangi kalit yarating.</li>
          <li>
            Render → backend → Environment:
            <code>MAIL_HOST=smtp.resend.com</code>,
            <code>MAIL_PORT=465</code>, <code>MAIL_USER=resend</code>,
            <code>MAIL_PASS=</code>&lt;kalit&gt;,
            <code>MAIL_FROM=noreply@bilimmanba.uz</code>
          </li>
          <li>Shu yerda "O'zimga sinov xati" ni bosing.</li>
        </ol>
      </details>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

interface Status {
  configured: boolean;
  ok: boolean;
  host: string | null;
  from: string | null;
  error: string | null;
  subscribers: number | null;
  lastNewsletter: {
    at: string;
    title: string;
    total: number;
    sent: number;
    failed: number;
    error: string | null;
  } | null;
}

const adminStore = useAdminStore();
const st = ref<Status | null>(null);
const busy = ref(false);

const fmt = (iso: string) => formatDateTime(iso);

const load = async () => {
  const res = await adminStore.adminApi("GET", "/mail");
  if (res.success) st.value = res.data;
};

const sendTest = async () => {
  busy.value = true;
  const res = await adminStore.adminApi("POST", "/mail/test");
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 10000 });
  ElMessage({
    type: "success",
    message: `📨 Sinov xati yuborildi: ${res.data.to}`,
    duration: 6000,
  });
};

onMounted(load);
</script>

<style lang="scss" scoped>
@use "~/assets/scss/admin-card" as *;

.pill {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  white-space: nowrap;

  &--ok {
    background: rgba(16, 185, 129, 0.12);
    color: var(--c-success-text);
  }

  &--bad {
    background: rgba(239, 68, 68, 0.12);
    color: var(--c-danger-text, #dc2626);
  }
}

.small {
  font-size: 0.95rem !important;
}

.cq__help {
  margin-top: 0.75rem;
  font-size: 0.86rem;
  color: $text-secondary;
  line-height: 1.6;

  summary {
    cursor: pointer;
    font-weight: 700;
    color: $primary;
  }

  ol {
    padding-left: 1.25rem;
    margin-top: 0.4rem;
  }

  code {
    font-family: $font-mono;
    background: $bg-secondary;
    padding: 0.05rem 0.3rem;
    border-radius: 4px;
    font-size: 0.82rem;
  }
}
</style>
