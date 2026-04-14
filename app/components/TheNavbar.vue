<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="navbar__inner container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar__logo">
        <img
          src="https://res.cloudinary.com/dne7ddv2a/image/upload/f_auto/c_scale,w_1000/v1776068517/Logo_no_text_transparent_uytuse.png"
          class="navbar__logo-icon"
          alt="Bilim Manba"
          loading="lazy"
        />
        <span class="navbar__logo-text">Bilim Manba</span>
      </NuxtLink>

      <!-- Nav links -->
      <nav class="navbar__nav">
        <NuxtLink to="/categories" class="navbar__link">Kategoriyalar</NuxtLink>
        <NuxtLink to="/articles" class="navbar__link">Maqolalar</NuxtLink>
        <NuxtLink to="/premium" class="navbar__link">
          Premium
          <span class="navbar__new-badge">Yangi</span>
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="navbar__actions">
        <template v-if="authStore.isLoggedIn">
          <!-- Premium badge -->
          <span v-if="authStore.isPremium" class="badge badge--premium">
            ⭐ Premium
          </span>

          <div class="navbar__user" @click="toggleDropdown">
            <div class="navbar__avatar">
              {{ authStore.user?.email?.[0]?.toUpperCase() }}
            </div>

            <!-- Dropdown -->
            <div v-if="showDropdown" class="navbar__dropdown">
              <NuxtLink to="/profile" class="navbar__dropdown-item">
                Profil
              </NuxtLink>
              <button
                class="navbar__dropdown-item navbar__dropdown-item--danger"
                @click="handleLogout"
              >
                Chiqish
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <NuxtLink to="/login" class="navbar__link">Kirish</NuxtLink>
          <NuxtLink to="/register" class="btn btn--primary">
            Ro'yxatdan o'tish
          </NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const isScrolled = ref(false);
const showDropdown = ref(false);

onMounted(() => {
  window.addEventListener("scroll", () => {
    isScrolled.value = window.scrollY > 20;
  });
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  authStore.logout();
  navigateTo("/");
};
</script>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(#fff, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $border-color;
  transition: box-shadow 0.2s;

  &--scrolled {
    box-shadow: $shadow-md;
  }

  &__inner {
    display: flex;
    align-items: center;
    height: 64px;
    gap: 2rem;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.1rem;
    flex-shrink: 0;

    &-icon {
      width: 50px;
      font-size: 1.3rem;
    }
    &-text {
      color: $text-primary;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.85rem;
    border-radius: $border-radius-pill;
    font-size: 0.9rem;
    font-weight: 500;
    color: $text-secondary;
    transition: all 0.15s;

    &:hover,
    &.router-link-active {
      color: $primary;
      background: $primary-light;
    }
  }

  &__new-badge {
    background: $secondary;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.4rem;
    border-radius: $border-radius-pill;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
  }

  &__user {
    position: relative;
    cursor: pointer;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: #fff;
    border: 1px solid $border-color;
    border-radius: $border-radius;
    box-shadow: $shadow-lg;
    min-width: 160px;
    overflow: hidden;
  }

  &__dropdown-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    text-align: left;
    transition: background 0.15s;
    cursor: pointer;

    &:hover {
      background: $bg-secondary;
    }

    &--danger {
      color: $danger;
      &:hover {
        background: rgba($danger, 0.05);
      }
    }
  }
}
</style>
