<template>
  <div class="auth-card">
    <div class="auth-card__header">
      <h2 class="auth-card__title">Kirish</h2>
      <p class="auth-card__subtitle">Akkauntingizga kiring</p>
    </div>

    <form class="auth-form" @submit.prevent="handleLogin">
      <!-- Email -->
      <div class="form-group" :class="{ 'form-group--error': errors.email }">
        <label>Email</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">✉️</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="example@mail.com"
            autocomplete="email"
          />
        </div>
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <!-- Parol -->
      <div class="form-group" :class="{ 'form-group--error': errors.password }">
        <div class="form-group__label-row">
          <label>Parol</label>
          <a href="#" class="form-group__forgot">Parolni unutdingizmi?</a>
        </div>
        <div class="form-input-wrap">
          <span class="form-input-icon">🔒</span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="form-input-toggle"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "🙈" : "👁️" }}
          </button>
        </div>
        <span v-if="errors.password" class="form-error">{{
          errors.password
        }}</span>
      </div>

      <!-- Server xato — email yoki parol noto'g'ri -->
      <div v-if="serverError" class="auth-alert">⚠️ {{ serverError }}</div>

      <button
        type="submit"
        class="btn btn--primary auth-btn"
        :disabled="loading"
      >
        <span v-if="loading" class="auth-btn__spinner" />
        {{ loading ? "Kirilmoqda..." : "Kirish →" }}
      </button>
    </form>

    <p class="auth-card__footer">
      Akkauntingiz yo'qmi?
      <NuxtLink to="/register">Ro'yxatdan o'ting</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth", middleware: "guest" });

const authStore = useAuthStore();
const userStore = useUserStore();

const form = reactive({ email: "", password: "" });
const errors = reactive({ email: "", password: "" });
const serverError = ref("");
const loading = ref(false);
const showPassword = ref(false);

const validate = () => {
  errors.email = "";
  errors.password = "";
  let valid = true;

  if (!form.email) {
    errors.email = "Email kiritish majburiy";
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Email noto'g'ri formatda";
    valid = false;
  }

  if (!form.password) {
    errors.password = "Parol kiritish majburiy";
    valid = false;
  } else if (form.password.length < 6) {
    errors.password = "Parol kamida 6 ta belgi";
    valid = false;
  }

  return valid;
};

const handleLogin = async () => {
  if (!validate()) return;

  loading.value = true;
  serverError.value = "";

  const res = await userStore.login({
    email: form.email,
    password: form.password,
  });

  loading.value = false;

  if (res.success) {
    authStore.setAuth(res.data);
    navigateTo("/");
  } else {
    serverError.value = res.message;
  }
};
</script>

<style lang="scss" scoped>
.auth-card {
  background: #fff;
  border-radius: $border-radius-lg;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: $shadow-lg;

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: $text-primary;
  }

  &__subtitle {
    color: $text-secondary;
    font-size: 0.9rem;
    margin-top: 0.3rem;
  }

  &__footer {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: $text-secondary;

    a {
      color: $primary;
      font-weight: 700;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  @media (max-width: $mobile) {
    padding: 1.75rem 1.25rem;
    border-radius: $border-radius;
    box-shadow: $shadow-md;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
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

  &__label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__forgot {
    font-size: 0.8rem;
    color: $primary;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }

  &--error {
    .form-input-wrap {
      border-color: $danger;
      box-shadow: 0 0 0 3px rgba($danger, 0.1);
    }
  }
}

.form-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: #fff;
  transition: all 0.2s;
  overflow: hidden;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.12);
  }

  input {
    flex: 1;
    padding: 0.75rem 0.5rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    color: $text-primary;

    &::placeholder {
      color: $text-muted;
    }
  }
}

.form-input-icon {
  padding: 0 0.6rem 0 0.85rem;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.form-input-toggle {
  padding: 0 0.85rem;
  font-size: 0.9rem;
  cursor: pointer;
  flex-shrink: 0;
  background: none;
  border: none;
}

.form-error {
  font-size: 0.78rem;
  color: $danger;
  font-weight: 500;
}

.auth-alert {
  background: rgba($danger, 0.08);
  border: 1px solid rgba($danger, 0.2);
  border-radius: $border-radius-sm;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  color: $danger;
}

.auth-btn {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
  gap: 0.5rem;
  margin-top: 0.5rem;

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(#fff, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: $text-muted;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: $border-color;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
