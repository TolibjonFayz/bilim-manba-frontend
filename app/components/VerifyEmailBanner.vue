<!--
  Profil: email hali tasdiqlanmagan bo'lsa — eslatma va "xatni qayta yuborish".
  Tasdiqlanganlarga har dushanba haftalik dayjest yuboriladi.
-->
<template>
  <div v-if="show" class="vbanner" role="status">
    <div class="vbanner__text">
      <strong>📧 Emailingizni tasdiqlang</strong>
      <span>
        <b>{{ email }}</b> manziliga xat yubordik. Tasdiqlasangiz — har dushanba
        haftaning eng yaxshi maqolalarini olasiz.
      </span>
      <span v-if="message" class="vbanner__msg" :class="{ 'is-error': failed }">
        {{ message }}
      </span>
    </div>
    <button
      type="button"
      class="btn btn--outline vbanner__btn"
      :disabled="sending || sent"
      @click="resend"
    >
      {{ sent ? "✓ Yuborildi" : sending ? "Yuborilmoqda..." : "Xatni qayta yuborish" }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  email?: string | null;
  verifiedAt?: string | null;
  /** Profil ma'lumoti yuklangan (aks holda bo'sh qiymat "tasdiqlanmagan" degani emas) */
  loaded: boolean;
}>();

const authStore = useAuthStore();
const sending = ref(false);
const sent = ref(false);
const failed = ref(false);
const message = ref("");

const show = computed(
  () => props.loaded && !!props.email && props.verifiedAt === null,
);

const resend = async () => {
  sending.value = true;
  failed.value = false;
  message.value = "";
  try {
    const res = await $fetch<any>("/auth/resend-verification", {
      method: "POST",
      baseURL: useRuntimeConfig().public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    sent.value = true;
    message.value = res?.already
      ? "Email allaqachon tasdiqlangan — sahifani yangilang."
      : "Pochtangizni tekshiring (Spam papkasini ham).";
  } catch (e: any) {
    const m = e?.data?.message;
    failed.value = true;
    message.value =
      (Array.isArray(m) ? m[0] : m) || "Xat yuborilmadi, keyinroq urinib ko'ring.";
  } finally {
    sending.value = false;
  }
};
</script>

<style lang="scss" scoped>
.vbanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 0.9rem 1.1rem;
  border-radius: $border-radius-sm;
  border: 1px solid rgba(var(--c-primary-rgb), 0.25);
  background: rgba(var(--c-primary-rgb), 0.07);

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.88rem;
    line-height: 1.5;
    color: $text-secondary;
    min-width: 0;
    overflow-wrap: anywhere;

    strong {
      color: $text-primary;
      font-size: 0.95rem;
    }
  }

  &__msg {
    color: var(--c-success-text);
    font-weight: 600;

    &.is-error {
      color: var(--c-danger-text);
    }
  }

  &__btn {
    flex-shrink: 0;
    white-space: nowrap;
  }
}
</style>
