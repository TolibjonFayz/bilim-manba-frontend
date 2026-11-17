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
        {{ st.lastNewsletter.total - (st.lastNewsletter.invalid ?? 0) }} ta xat
        ketdi<template v-if="st.lastNewsletter.failed"
          >, {{ st.lastNewsletter.failed }} ta xato</template
        ><template v-if="st.lastNewsletter.invalid"
          >. {{ st.lastNewsletter.invalid }} ta manzil noto'g'ri yozilgan —
          o'tkazib yuborildi</template
        >
      </p>
      <button
        v-if="st.ok && st.lastNewsletter && st.lastNewsletter.failed > 0"
        class="btn btn--outline cq__send cq__resend"
        :disabled="busy"
        @click="resendLatest"
      >
        {{ busy ? "⏳ Yuborilmoqda…" : "🔁 Oxirgi maqolani obunachilarga qayta yuborish" }}
      </button>
      <p v-if="!st.ok && st.error" class="cq__warn">⚠️ {{ st.error }}</p>
      <p
        v-else-if="st.lastNewsletter?.error && st.lastNewsletter.failed"
        class="cq__warn"
      >
        ⚠️ Oxirgi tarqatmadagi xato: {{ st.lastNewsletter.error }}
      </p>
      <details v-if="!st.ok" class="cq__help">
        <summary>Qanday tuzatiladi?</summary>
        <p>
          Xat <b>Resend</b> orqali ketadi (bepul, kuniga 100 ta). Render
          oddiy pochta (SMTP) portlarini yopgani uchun Resend'ning HTTP API'si
          ishlatiladi:
        </p>
        <ol>
          <li>resend.com → Domains → bilimmanba.uz (DNS yozuvlari Vercel'da) → Verified bo'lsin.</li>
          <li>API Keys → yangi kalit ("Sending access").</li>
          <li>
            Render → backend → Environment:
            <code>MAIL_HOST=smtp.resend.com</code>,
            <code>MAIL_PASS=</code>&lt;re_... kalit&gt;,
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
    invalid?: number;
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

const resendLatest = async () => {
  busy.value = true;
  const res = await adminStore.adminApi("POST", "/mail/resend-latest");
  busy.value = false;
  if (!res.success)
    return ElMessage({ type: "error", message: res.message, duration: 10000 });
  const r = res.data;
  ElMessage({
    type: r.sent ? "success" : "error",
    message: `«${r.title}» — ${r.sent} / ${r.total} ta xat ketdi${r.failed ? `, ${r.failed} ta xato: ${r.error}` : ""}`,
    duration: 8000,
  });
  await load();
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

.cq__resend {
  margin: 0.75rem 0 0;
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
