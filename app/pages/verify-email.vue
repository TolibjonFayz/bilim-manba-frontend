<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-card__logo">
        <NuxtLink to="/">
          <img
            src="https://res.cloudinary.com/dne7ddv2a/image/upload/f_auto/c_scale,w_200/v1776068517/Logo_no_text_transparent_uytuse.png"
            alt="Bilim Manba"
            width="52"
          />
        </NuxtLink>
      </div>

      <template v-if="state === 'loading'">
        <div class="auth-card__icon">⏳</div>
        <h1 class="auth-card__title">Tekshirilmoqda...</h1>
      </template>

      <template v-else-if="state === 'ok'">
        <div class="auth-card__icon">✅</div>
        <h1 class="auth-card__title">Email tasdiqlandi!</h1>
        <p class="auth-card__desc">
          Rahmat! Endi har dushanba haftaning eng yaxshi maqolalarini sizga
          yuborib turamiz. Maqolalar oxiridagi testlarni yechib, ball to'plang
          va reytingga chiqing.
        </p>
        <NuxtLink to="/articles" class="btn btn--primary auth-card__btn">
          Maqolalarni o'qish →
        </NuxtLink>
        <div class="auth-card__footer">
          <NuxtLink to="/reyting" class="auth-card__link">🏆 Reyting</NuxtLink>
        </div>
      </template>

      <template v-else>
        <div class="auth-card__icon">⚠️</div>
        <h1 class="auth-card__title">Havola ishlamadi</h1>
        <p class="auth-card__desc">
          {{ error }}
        </p>
        <NuxtLink to="/profile" class="btn btn--primary auth-card__btn">
          Profilga o'tish
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// Xatdagi havola: /verify-email?token=<userId>.<muddat>.<imzo> (imzo serverda)
useHead({
  title: "Emailni tasdiqlash — Bilim Manba",
  meta: [
    { name: "robots", content: "noindex, nofollow" },
    { name: "referrer", content: "no-referrer" },
  ],
});

const route = useRoute();
const state = ref<"loading" | "ok" | "error">("loading");
const error = ref("");

onMounted(async () => {
  const token = String(route.query.token ?? "");
  if (!/^\d+\.\d+\.[a-f0-9]{40}$/.test(token)) {
    state.value = "error";
    error.value =
      "Havola to'liq emas. Xatdagi tugmani bosing yoki profilingizdan yangi xat so'rang.";
    return;
  }
  try {
    await $fetch("/auth/verify-email", {
      method: "POST",
      baseURL: useRuntimeConfig().public.apiBase,
      body: { token },
    });
    state.value = "ok";
    track("email_verified");
  } catch (e: any) {
    const msg = e?.data?.message;
    state.value = "error";
    error.value =
      (Array.isArray(msg) ? msg[0] : msg) ||
      "Xato yuz berdi. Birozdan so'ng qayta urinib ko'ring.";
  }
});
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--color-bg-secondary);
}

.auth-card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: $shadow-md;

  @media (max-width: $mobile) {
    padding: 2rem 1.25rem;
  }

  &__logo {
    margin-bottom: 1.5rem;
  }

  &__icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 0.75rem;
  }

  &__desc {
    font-size: 0.9rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  &__btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  &__footer {
    margin-top: 1.5rem;
  }

  &__link {
    font-size: 0.875rem;
    color: $primary;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
