<!-- app/pages/support.vue -->
<template>
  <div class="support-page">
    <div class="container">
      <!-- Header -->
      <div class="support-header">
        <h1 class="support-header__title">Qo'llab-quvvatlash</h1>
        <p class="support-header__subtitle">
          Muammo yuzaga keldimi? Biz yordam berishga tayyormiz!
        </p>
      </div>

      <!-- Cards -->
      <div class="support-cards">
        <a href="mailto:bilimmanba@outlook.com" class="support-card">
          <div class="support-card__icon">✉️</div>
          <h3 class="support-card__title">Email</h3>
          <p class="support-card__desc">
            Savollaringizni email orqali yuboring. 24 soat ichida javob beramiz.
          </p>
          <span class="support-card__link">bilimmanba@outlook.com →</span>
        </a>

        <a href="https://t.me/bilim_manba" target="_blank" class="support-card">
          <div class="support-card__icon">✈️</div>
          <h3 class="support-card__title">Telegram</h3>
          <p class="support-card__desc">
            Telegram orqali tezroq javob oling. Kunlik yangiliklar ham bor!
          </p>
          <span class="support-card__link">@bilim_manba →</span>
        </a>

        <NuxtLink to="/faq" class="support-card">
          <div class="support-card__icon">❓</div>
          <h3 class="support-card__title">FAQ</h3>
          <p class="support-card__desc">
            Ko'p so'raladigan savollarga javoblarni bu yerda topishingiz mumkin.
          </p>
          <span class="support-card__link">FAQ ga o'tish →</span>
        </NuxtLink>
      </div>

      <!-- Form -->
      <div class="support-form-wrap">
        <h2 class="support-form-wrap__title">Xabar yuborish</h2>
        <p class="support-form-wrap__desc">
          Muammoingizni quyidagi forma orqali batafsil yozing.
        </p>

        <div class="support-form">
          <div class="form-group">
            <label>Ismingiz</label>
            <div class="form-input-wrap">
              <input
                v-model="form.name"
                type="text"
                placeholder="Aziz Rahimov"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <div class="form-input-wrap">
              <input
                v-model="form.email"
                type="email"
                placeholder="misol@gmail.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Mavzu</label>
            <div class="form-input-wrap">
              <select v-model="form.subject">
                <option value="">Mavzuni tanlang</option>
                <option value="bug">Xato yoki muammo</option>
                <option value="content">Maqola bo'yicha</option>
                <option value="account">Hisob muammosi</option>
                <option value="suggestion">Taklif</option>
                <option value="other">Boshqa</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Xabar</label>
            <div class="form-input-wrap form-input-wrap--textarea">
              <textarea
                v-model="form.message"
                placeholder="Muammoyingizni batafsil yozing..."
                rows="5"
              />
            </div>
          </div>

          <div v-if="success" class="alert alert--success">
            ✅ Xabaringiz yuborildi! 24 soat ichida javob beramiz.
          </div>
          <div v-if="error" class="alert alert--danger">⚠️ {{ error }}</div>

          <button
            class="btn btn--primary support-form__btn"
            :disabled="loading"
            @click="handleSubmit"
          >
            {{ loading ? "Yuborilmoqda..." : "Xabar yuborish →" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";

useHead({
  title: "Qo'llab-quvvatlash — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Bilim Manba qo'llab-quvvatlash xizmati. Savollaringizni yuboring, 24 soat ichida javob beramiz.",
    },
  ],
});

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const loading = ref(false);
const success = ref(false);
const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  if (!form.name.trim()) {
    error.value = "Ismingizni kiriting";
    return;
  }
  if (!form.email.trim()) {
    error.value = "Emailingizni kiriting";
    return;
  }
  if (!form.subject) {
    error.value = "Mavzuni tanlang";
    return;
  }
  if (!form.message.trim()) {
    error.value = "Xabarni kiriting";
    return;
  }

  loading.value = true;

  try {
    await $fetch("https://hook.us1.make.com/jg594vr5unhwfmmv65sohhi5urvptr5r", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      },
    });

    success.value = true;
    form.name = "";
    form.email = "";
    form.subject = "";
    form.message = "";
  } catch (e: any) {
    error.value = "Xabar yuborishda xato yuz berdi. Qayta urinib ko'ring.";
  } finally {
    loading.value = false;
    ElNotification({
      title: success.value ? "Muvaffaqiyatli" : "Xato",
      message: success.value
        ? "Xabaringiz muvaffaqiyatli yuborildi."
        : error.value,
      type: success.value ? "success" : "error",
    });
  }
};
</script>

<style lang="scss" scoped>
.support-page {
  padding: 3rem 0 5rem;
}

.support-header {
  text-align: center;
  margin-bottom: 3rem;

  &__title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }

  &__subtitle {
    font-size: 1rem;
    color: $text-secondary;
  }
}

.support-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: $tablet) {
    grid-template-columns: 1fr;
  }
}

.support-card {
  background: #fff;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: rgba($primary, 0.4);
    transform: translateY(-3px);
    box-shadow: $shadow-md;
  }

  &__icon {
    font-size: 2rem;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
  }

  &__desc {
    font-size: 0.875rem;
    color: $text-secondary;
    line-height: 1.7;
    flex: 1;
  }

  &__link {
    font-size: 0.875rem;
    color: $primary;
    font-weight: 600;
  }
}

.support-form-wrap {
  max-width: 640px;
  margin: 0 auto;

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  &__desc {
    color: $text-secondary;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
}

.support-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  &__btn {
    align-self: flex-start;
    padding: 0.75rem 2rem;
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

  &--textarea {
    align-items: flex-start;
  }

  input,
  select,
  textarea {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    color: $text-primary;
    font-family: $font-primary;
    resize: none;

    &::placeholder {
      color: $text-muted;
    }
  }

  select {
    cursor: pointer;
  }
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;

  &--success {
    background: rgba(#43d98b, 0.08);
    border: 1px solid rgba(#43d98b, 0.3);
    color: #1a9e5e;
  }

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
  }
}
</style>
