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

      <!-- Yuborildi holat -->
      <template v-if="sent">
        <div class="auth-card__icon">📬</div>
        <h1 class="auth-card__title">Email yuborildi!</h1>
        <p class="auth-card__desc">
          <strong>{{ form.email }}</strong> manziliga parol tiklash havolasi
          yuborildi. Pochta qutingizni tekshiring.
        </p>
        <p class="auth-card__note">Xat kelmasa — spam papkasini ham ko'ring.</p>
        <NuxtLink to="/login" class="btn btn--primary auth-card__btn">
          Loginga qaytish
        </NuxtLink>
      </template>

      <!-- Forma holat -->
      <template v-else>
        <h1 class="auth-card__title">Parolni tiklash</h1>
        <p class="auth-card__desc">
          Email manzilingizni kiriting — tiklash havolasini yuboramiz.
        </p>

        <div v-if="error" class="auth-alert auth-alert--danger">
          ⚠️ {{ error }}
        </div>

        <div class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <div class="form-input-wrap">
              <input
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                @keyup.enter="handleSubmit"
                @blur="validateEmail"
              />
            </div>
          </div>

          <button
            class="btn btn--primary auth-card__btn"
            :disabled="
              loading || !form.email.trim() || !emailRegex.test(form.email)
            "
            @click="handleSubmit"
          >
            {{ loading ? "Yuborilmoqda..." : "Havola yuborish" }}
          </button>
        </div>

        <div class="auth-card__footer">
          <NuxtLink to="/login" class="auth-card__link">
            ← Loginga qaytish
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "guest" });

useHead({ title: "Parolni tiklash — Bilim Manba" });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const form = reactive({ email: "" });
const loading = ref(false);
const error = ref("");
const sent = ref(false);

const handleSubmit = async () => {
  error.value = "";

  if (!form.email.trim()) {
    error.value = "Email kiritish majburiy";
    return;
  }
  if (!emailRegex.test(form.email.trim())) {
    error.value = "To'g'ri email manzil kiriting (masalan: user@gmail.com)";
    return;
  }

  loading.value = true;
  try {
    await $fetch("/auth/forgot-password", {
      method: "POST",
      baseURL: useRuntimeConfig().public.apiBase,
      body: { email: form.email.trim() },
    });
    sent.value = true;
  } catch (e: any) {
    error.value = e?.data?.message || "Xato yuz berdi";
  } finally {
    loading.value = false;
  }
};

const validateEmail = () => {
  if (form.email && !emailRegex.test(form.email.trim())) {
    error.value = "To'g'ri email manzil kiriting";
  } else {
    error.value = "";
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
  background: #fff;
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

  &__note {
    font-size: 0.8rem;
    color: $text-muted;
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
  background: #fff;
  transition: all 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.12);
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
