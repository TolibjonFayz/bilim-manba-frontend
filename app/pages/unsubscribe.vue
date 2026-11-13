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

      <!-- Havola to'liq emas -->
      <template v-if="!linkValid">
        <div class="auth-card__icon">⚠️</div>
        <h1 class="auth-card__title">Havola yaroqsiz</h1>
        <p class="auth-card__desc">
          Obunani bekor qilish havolasi to'liq emas yoki eskirgan. Bizdan kelgan
          eng so'nggi xatning pastidagi "Obunani bekor qilish" havolasini bosing.
        </p>
        <NuxtLink to="/" class="btn btn--primary auth-card__btn">
          Bosh sahifaga
        </NuxtLink>
      </template>

      <!-- Bekor qilindi -->
      <template v-else-if="done">
        <div class="auth-card__icon">👋</div>
        <h1 class="auth-card__title">Obuna bekor qilindi</h1>
        <p class="auth-card__desc">
          <strong>{{ email }}</strong> manziliga endi yangi maqolalar haqida xat
          yubormaymiz. Fikringiz o'zgarsa — sayt pastidagi formadan qayta obuna
          bo'lishingiz mumkin.
        </p>
        <NuxtLink to="/" class="btn btn--primary auth-card__btn">
          Bosh sahifaga
        </NuxtLink>
      </template>

      <!-- Tasdiqlash -->
      <template v-else>
        <div class="auth-card__icon">📭</div>
        <h1 class="auth-card__title">Obunani bekor qilasizmi?</h1>
        <p class="auth-card__desc">
          <strong>{{ email }}</strong> manziliga yangi maqolalar haqidagi xatlar
          kelmay qo'yadi.
        </p>

        <div v-if="error" class="auth-alert auth-alert--danger">
          ⚠️ {{ error }}
        </div>

        <button
          class="btn btn--primary auth-card__btn"
          :disabled="loading"
          @click="confirm"
        >
          {{ loading ? "Bekor qilinmoqda..." : "Ha, obunani bekor qilish" }}
        </button>
        <div class="auth-card__footer">
          <NuxtLink to="/" class="auth-card__link">Yo'q, obuna qolsin</NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// Xatdagi havola: /unsubscribe?email=...&token=<imzo>. Imzo serverda yasaladi,
// shuning uchun birovning emailini yozib, uning obunasini o'chirib bo'lmaydi.
// Sahifa ochilishi bilan emas, tugma bosilganda bekor qilinadi — pochta
// dasturlari havolalarni o'zi "ko'zdan kechirganda" obuna o'chib ketmasin.
useHead({
  title: "Obunani bekor qilish — Bilim Manba",
  meta: [
    { name: "robots", content: "noindex, nofollow" },
    { name: "referrer", content: "no-referrer" },
  ],
});

const route = useRoute();
const email = computed(() => String(route.query.email ?? "").trim());
const token = computed(() => String(route.query.token ?? ""));
const linkValid = computed(
  () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) && token.value.length >= 20,
);

const loading = ref(false);
const error = ref("");
const done = ref(false);

const confirm = async () => {
  error.value = "";
  loading.value = true;
  try {
    await $fetch("/subscribers/unsubscribe", {
      method: "GET",
      baseURL: useRuntimeConfig().public.apiBase,
      query: { email: email.value, token: token.value },
    });
    done.value = true;
  } catch (e: any) {
    const msg = e?.data?.message;
    error.value =
      (Array.isArray(msg) ? msg[0] : msg) ||
      "Xato yuz berdi. Birozdan so'ng qayta urinib ko'ring.";
  } finally {
    loading.value = false;
  }
};
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
    overflow-wrap: anywhere;
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

.auth-alert {
  padding: 0.65rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: left;

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
  }
}
</style>
