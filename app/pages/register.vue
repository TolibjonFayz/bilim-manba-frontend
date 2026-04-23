<template>
  <div class="auth-card">
    <div class="auth-card__header">
      <h2 class="auth-card__title">Ro'yxatdan o'tish</h2>
      <p class="auth-card__subtitle">
        Ma'lumotlaringizni kiriting va bilim olishni boshlang
      </p>
    </div>

    <form class="auth-form" @submit.prevent="handleRegister">
      <!-- To'liq ism -->
      <div class="form-group" :class="{ 'form-group--error': errors.fullName }">
        <label>To'liq ism-sharifingiz</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">👤</span>
          <input
            v-model="form.fullName"
            type="text"
            placeholder="Masalan: Aziz Rahimov"
            autocomplete="name"
          />
        </div>
        <span v-if="errors.fullName" class="form-error">{{
          errors.fullName
        }}</span>
      </div>

      <!-- Email -->
      <div class="form-group" :class="{ 'form-group--error': errors.email }">
        <label>Elektron pochta</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">✉️</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="misol@manba.uz"
            autocomplete="email"
          />
        </div>
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <!-- Parol -->
      <div class="form-group" :class="{ 'form-group--error': errors.password }">
        <label>Parol yaratish</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">🔒</span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="new-password"
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

      <!-- Parolni tasdiqlash -->
      <div
        class="form-group"
        :class="{ 'form-group--error': errors.confirmPassword }"
      >
        <label>Parolni tasdiqlash</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">🛡️</span>
          <input
            v-model="form.confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="form-input-toggle"
            @click="showConfirm = !showConfirm"
          >
            {{ showConfirm ? "🙈" : "👁️" }}
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="form-error">{{
          errors.confirmPassword
        }}</span>
      </div>

      <!-- Terms -->
      <div
        class="form-group form-group--checkbox"
        :class="{ 'form-group--error': errors.terms }"
      >
        <label class="form-checkbox">
          <input v-model="form.terms" type="checkbox" />
          <span class="form-checkbox__box" />
          <span>
            Foydalanish
            <NuxtLink to="/terms" target="_blank" class="form-checkbox__link"
              >shartlariga</NuxtLink
            >
            roziman
          </span>
        </label>
        <span v-if="errors.terms" class="form-error">{{ errors.terms }}</span>
      </div>

      <!-- Server xato -->
      <div v-if="serverError" class="auth-alert">⚠️ {{ serverError }}</div>

      <!-- Submit -->
      <button
        type="submit"
        class="btn btn--primary auth-btn"
        :disabled="loading"
      >
        <span v-if="loading" class="auth-btn__spinner" />
        {{ loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish →" }}
      </button>
    </form>

    <p class="auth-card__footer">
      Akkauntingiz bormi?
      <NuxtLink to="/login">Kiring</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth", middleware: "guest" });

const userStore = useUserStore();
const authStore = useAuthStore();

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
});

const errors = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: "",
});

const serverError = ref("");
const loading = ref(false);
const showPassword = ref(false);
const showConfirm = ref(false);

const validate = () => {
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ""));
  let valid = true;

  if (!form.fullName.trim()) {
    errors.fullName = "Ism-sharif kiritish majburiy";
    valid = false;
  }

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
    errors.password = "Parol kamida 6 ta belgi bo'lishi kerak";
    valid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Parolni tasdiqlang";
    valid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Parollar mos kelmaydi";
    valid = false;
  }

  if (!form.terms) {
    errors.terms = "Foydalanish shartlarini qabul qiling";
    valid = false;
  }

  return valid;
};

const handleRegister = async () => {
  if (!validate()) return;
  loading.value = true;
  serverError.value = "";

  const res = await userStore.register({
    fullName: form.fullName,
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
    margin-bottom: 1.75rem;
  }

  &__title {
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    color: $text-secondary;
    font-size: 0.875rem;
    margin-top: 0.3rem;
    line-height: 1.5;
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
  gap: 1rem;
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

  &--error .form-input-wrap {
    border-color: $danger;
    box-shadow: 0 0 0 3px rgba($danger, 0.1);
  }

  &--checkbox label {
    font-weight: 400;
  }
}

.form-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: #fff;
  transition: all 0.2s;

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
  background: none;
  border: none;
  flex-shrink: 0;
}

.form-error {
  font-size: 0.78rem;
  color: $danger;
  font-weight: 500;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: $text-secondary;

  input[type="checkbox"] {
    display: none;
  }

  &__box {
    width: 18px;
    height: 18px;
    border: 1.5px solid $border-color;
    border-radius: 4px;
    flex-shrink: 0;
    transition: all 0.2s;
    position: relative;

    input:checked + & {
      background: $primary;
      border-color: $primary;

      &::after {
        content: "✓";
        position: absolute;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  &__link {
    color: $primary;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
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
  margin-top: 0.25rem;

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(#fff, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
