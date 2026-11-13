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

      <!-- Havola noto'g'ri -->
      <template v-if="!tokenValid">
        <div class="auth-card__icon">⚠️</div>
        <h1 class="auth-card__title">Havola yaroqsiz</h1>
        <p class="auth-card__desc">
          Parolni tiklash havolasi noto'g'ri yoki to'liq nusxalanmagan. Yangi
          havola so'rab ko'ring.
        </p>
        <NuxtLink to="/forgot-password" class="btn btn--primary auth-card__btn">
          Yangi havola olish
        </NuxtLink>
      </template>

      <!-- Tayyor -->
      <template v-else-if="done">
        <div class="auth-card__icon">✅</div>
        <h1 class="auth-card__title">Parol yangilandi!</h1>
        <p class="auth-card__desc">
          Endi yangi parolingiz bilan tizimga kirishingiz mumkin. Xavfsizlik
          uchun boshqa qurilmalardagi eski kirishlar bekor qilindi.
        </p>
        <NuxtLink to="/login" class="btn btn--primary auth-card__btn">
          Tizimga kirish
        </NuxtLink>
      </template>

      <!-- Forma -->
      <template v-else>
        <h1 class="auth-card__title">Yangi parol o'rnatish</h1>
        <p class="auth-card__desc">
          Yangi parolni kiriting — kamida 6 ta belgi.
        </p>

        <div v-if="error" class="auth-alert auth-alert--danger">
          ⚠️ {{ error }}
        </div>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="new-password">Yangi parol</label>
            <div class="form-input-wrap">
              <input
                id="new-password"
                v-model="form.password"
                :type="show ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Kamida 6 ta belgi"
                maxlength="128"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="confirm-password">Parolni takrorlang</label>
            <div class="form-input-wrap">
              <input
                id="confirm-password"
                v-model="form.confirm"
                :type="show ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Yana bir marta"
                maxlength="128"
              />
            </div>
          </div>

          <label class="auth-form__show">
            <input v-model="show" type="checkbox" />
            Parolni ko'rsatish
          </label>

          <button
            type="submit"
            class="btn btn--primary auth-card__btn"
            :disabled="loading || !form.password || !form.confirm"
          >
            {{ loading ? "Saqlanmoqda..." : "Parolni saqlash" }}
          </button>
        </form>

        <div v-if="expired" class="auth-card__footer">
          <NuxtLink to="/forgot-password" class="auth-card__link">
            Yangi havola olish →
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// Emaildagi "Parolni tiklash" havolasi shu sahifaga olib keladi:
// /reset-password?token=<64 belgili kod>
useHead({
  title: "Yangi parol o'rnatish — Bilim Manba",
  meta: [
    { name: "robots", content: "noindex, nofollow" },
    // Koddagi havola boshqa saytlarga (Referer orqali) sizib chiqmasin
    { name: "referrer", content: "no-referrer" },
  ],
});

const route = useRoute();
const token = computed(() => String(route.query.token ?? ""));
const tokenValid = computed(() => /^[a-f0-9]{64}$/.test(token.value));

const form = reactive({ password: "", confirm: "" });
const show = ref(false);
const loading = ref(false);
const error = ref("");
const done = ref(false);
const expired = ref(false);

const handleSubmit = async () => {
  error.value = "";
  if (form.password.length < 6) {
    error.value = "Parol kamida 6 ta belgidan iborat bo'lsin";
    return;
  }
  if (form.password !== form.confirm) {
    error.value = "Parollar bir xil emas";
    return;
  }

  loading.value = true;
  try {
    await $fetch("/auth/reset-password", {
      method: "POST",
      baseURL: useRuntimeConfig().public.apiBase,
      body: { token: token.value, newPassword: form.password },
    });
    done.value = true;
    // Eski sessiya qolgan bo'lsa tozalaymiz — yangi parol bilan kiradi
    useAuthStore().logout();
  } catch (e: any) {
    const msg = e?.data?.message;
    error.value =
      (Array.isArray(msg) ? msg[0] : msg) ||
      "Xato yuz berdi. Birozdan so'ng qayta urinib ko'ring.";
    if (e?.status === 400) expired.value = true;
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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;

  &__show {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: $text-secondary;
    cursor: pointer;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
  }
}

.form-input-wrap {
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: $bg-primary;
  transition: all 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--c-primary-rgb), 0.12);
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    color: $text-primary;
    font-family: $font-primary;

    &::placeholder {
      color: $text-muted;
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
