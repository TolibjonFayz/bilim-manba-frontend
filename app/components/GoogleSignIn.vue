<!--
  "Google bilan kirish" tugmasi (Google Identity Services). Client ID
  backenddan olinadi (Render: GOOGLE_CLIENT_ID) — sozlanmagan bo'lsa tugma
  umuman ko'rinmaydi. Google bergan ID token backendda tekshiriladi.
-->
<template>
  <div v-show="enabled" class="gsi">
    <div class="gsi__divider"><span>yoki</span></div>
    <div ref="btn" class="gsi__btn" />
    <p v-if="error" class="gsi__error">⚠️ {{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ source: "login" | "register" }>();

const btn = ref<HTMLElement | null>(null);
const enabled = ref(false);
const error = ref("");
const config = useRuntimeConfig();
const authStore = useAuthStore();
const route = useRoute();

declare global {
  interface Window {
    google?: any;
  }
}

const loadScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google skripti yuklanmadi"));
    document.head.appendChild(s);
  });

const onCredential = async (resp: { credential?: string }) => {
  error.value = "";
  if (!resp?.credential) return;
  try {
    const res = await $fetch<any>("/auth/google", {
      method: "POST",
      baseURL: config.public.apiBase,
      body: {
        credential: resp.credential,
        signupSource: `google_${props.source}`,
        signupPath: route.fullPath.slice(0, 300),
      },
    });
    trackEmailSubmit(res.isNew ? "register" : "login", true);
    authStore.setAuth(res);
    navigateTo("/");
  } catch (e: any) {
    const m = e?.data?.message;
    error.value = (Array.isArray(m) ? m[0] : m) || "Google orqali kirib bo'lmadi";
  }
};

onMounted(async () => {
  try {
    const cfg = await $fetch<{ enabled: boolean; clientId: string | null }>(
      "/auth/google/config",
      { baseURL: config.public.apiBase },
    );
    if (!cfg?.enabled || !cfg.clientId) return;
    await loadScript();
    window.google.accounts.id.initialize({
      client_id: cfg.clientId,
      callback: onCredential,
      ux_mode: "popup",
      context: props.source === "register" ? "signup" : "signin",
    });
    const dark = document.documentElement.dataset.theme === "dark";
    enabled.value = true;
    await nextTick();
    window.google.accounts.id.renderButton(btn.value, {
      type: "standard",
      theme: dark ? "filled_black" : "outline",
      size: "large",
      shape: "pill",
      text: props.source === "register" ? "signup_with" : "signin_with",
      locale: "uz",
      width: Math.min(btn.value?.clientWidth || 320, 400),
    });
  } catch {
    // Google ishlamasa — oddiy forma baribir bor
    enabled.value = false;
  }
});
</script>

<style lang="scss" scoped>
.gsi {
  margin-top: 1.25rem;

  &__divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: $text-muted;
    font-size: 0.82rem;
    margin-bottom: 1rem;

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: $border-color;
    }
  }

  &__btn {
    display: flex;
    justify-content: center;
    min-height: 44px;

    // Tungi rejimda sahifa color-scheme: dark, Google iframe esa light —
    // farq bo'lsa brauzer iframe ortiga oq fon chizadi (oq to'rtburchak).
    :deep(iframe) {
      color-scheme: light;
    }
  }

  &__error {
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: $danger;
    text-align: center;
  }
}
</style>
