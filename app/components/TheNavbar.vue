<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="navbar__inner container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar__logo" @click="menuOpen = false">
        <img
          src="https://res.cloudinary.com/dne7ddv2a/image/upload/f_auto/c_scale,w_1000/v1776068517/Logo_no_text_transparent_uytuse.png"
          class="navbar__logo-icon"
          alt="Bilim Manba"
          loading="lazy"
        />
        <span class="navbar__logo-text">Bilim Manba</span>
      </NuxtLink>

      <!-- Desktop Nav links -->
      <nav class="navbar__nav">
        <NuxtLink to="/categories" class="navbar__link">Kategoriyalar</NuxtLink>
        <NuxtLink to="/articles" class="navbar__link">Maqolalar</NuxtLink>
      </nav>

      <!-- Desktop Actions -->
      <div class="navbar__actions">
        <template v-if="authStore.isLoggedIn">
          <div class="navbar__user" @click="toggleDropdown">
            <div class="navbar__avatar">
              {{ authStore.user?.email?.[0]?.toUpperCase() }}
            </div>

            <div v-if="showDropdown" class="navbar__dropdown">
              <div class="navbar__dropdown-user">
                <div class="navbar__dropdown-avatar">
                  {{ authStore.user?.email?.[0]?.toUpperCase() }}
                </div>
                <div class="navbar__dropdown-info">
                  <span class="navbar__dropdown-name">
                    {{ authStore.user?.email }}
                  </span>
                </div>
              </div>
              <div class="navbar__dropdown-divider" />
              <NuxtLink to="/profile" class="navbar__dropdown-item">
                👤 Profil
              </NuxtLink>
              <button
                class="navbar__dropdown-item navbar__dropdown-item--danger"
                @click="handleLogout"
              >
                🚪 Chiqish
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

      <!-- Hamburger button (mobile only) -->
      <button
        class="navbar__hamburger"
        :class="{ 'navbar__hamburger--open': menuOpen }"
        @click="menuOpen = !menuOpen"
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <!-- Mobile Menu -->
    <div class="navbar__mobile-menu" :class="{ 'navbar__mobile-menu--open': menuOpen }">
      <nav class="navbar__mobile-nav">
        <NuxtLink to="/categories" class="navbar__mobile-link" @click="menuOpen = false">
          📂 Kategoriyalar
        </NuxtLink>
        <NuxtLink to="/articles" class="navbar__mobile-link" @click="menuOpen = false">
          📄 Maqolalar
        </NuxtLink>
      </nav>

      <div class="navbar__mobile-divider" />

      <div class="navbar__mobile-actions">
        <template v-if="authStore.isLoggedIn">
          <div class="navbar__mobile-user-info">
            <div class="navbar__mobile-avatar">
              {{ authStore.user?.email?.[0]?.toUpperCase() }}
            </div>
            <span class="navbar__mobile-email">{{ authStore.user?.email }}</span>
          </div>
          <NuxtLink to="/profile" class="navbar__mobile-link" @click="menuOpen = false">
            👤 Profil
          </NuxtLink>
          <button
            class="navbar__mobile-link navbar__mobile-link--danger"
            @click="handleLogout"
          >
            🚪 Chiqish
          </button>
        </template>

        <template v-else>
          <NuxtLink to="/login" class="navbar__mobile-link" @click="menuOpen = false">
            Kirish
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="btn btn--primary navbar__mobile-register"
            @click="menuOpen = false"
          >
            Ro'yxatdan o'tish
          </NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();
const isScrolled = ref(false);
const showDropdown = ref(false);
const menuOpen = ref(false);

onMounted(async () => {
  window.addEventListener("scroll", () => {
    isScrolled.value = window.scrollY > 20;
  });

  if (authStore.isLoggedIn) {
    const token = localStorage.getItem("access_token");
    if (token) {
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1] as string));
      await userStore.getOneUserInfo(payload.sub);
    }
  }
});

const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".navbar__user")) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  authStore.logout();
  userStore.oneUserInfo = null;
  menuOpen.value = false;
  navigateTo("/");
};
</script>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(#fff, 0.95);
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

    @media (max-width: $tablet) {
      display: none;
    }
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

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;

    @media (max-width: $tablet) {
      display: none;
    }
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
    min-width: 200px;
    overflow: hidden;
    z-index: 10;
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

  &__dropdown-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
  }

  &__dropdown-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  &__dropdown-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__dropdown-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__dropdown-divider {
    height: 1px;
    background: $border-color;
  }

  // Hamburger button
  &__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 0.5rem;
    margin-left: auto;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: $border-radius-sm;
    transition: background 0.15s;

    &:hover {
      background: $bg-secondary;
    }

    span {
      display: block;
      width: 22px;
      height: 2px;
      background: $text-primary;
      border-radius: 2px;
      transition: all 0.25s ease;
    }

    &--open {
      span:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      span:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
      }
      span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    }

    @media (max-width: $tablet) {
      display: flex;
    }
  }

  // Mobile menu
  &__mobile-menu {
    display: none;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
    background: #fff;
    border-top: 1px solid $border-color;

    &--open {
      max-height: 500px;
    }

    @media (max-width: $tablet) {
      display: block;
    }
  }

  &__mobile-nav {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 1rem;
    gap: 0.15rem;
  }

  &__mobile-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 0.75rem;
    font-size: 0.975rem;
    font-weight: 500;
    color: $text-primary;
    border-radius: $border-radius-sm;
    transition: all 0.15s;
    cursor: pointer;
    background: none;
    border: none;
    font-family: $font-primary;
    text-align: left;

    &:hover {
      color: $primary;
      background: $primary-light;
    }

    &--danger {
      color: $danger;
      &:hover {
        background: rgba($danger, 0.05);
        color: $danger;
      }
    }
  }

  &__mobile-divider {
    height: 1px;
    background: $border-color;
    margin: 0 1rem;
  }

  &__mobile-actions {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 1rem 1.25rem;
    gap: 0.15rem;
  }

  &__mobile-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.25rem;
  }

  &__mobile-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  &__mobile-email {
    font-size: 0.85rem;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  &__mobile-register {
    width: 100%;
    margin-top: 0.5rem;
    justify-content: center;
  }
}
</style>
