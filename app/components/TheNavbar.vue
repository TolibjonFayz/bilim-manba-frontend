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
        <ClientOnly>
          <template #default>
            <template v-if="authStore.isLoggedIn">
              <button
                class="navbar__search-btn"
                @click="searchOpen = true"
                title="Qidirish"
              >
                <Icon name="lucide:search" size="1.1em" mode="css" />
              </button>

              <div class="navbar__notif" @click.stop="toggleNotifications">
                <button class="navbar__notif-btn" title="Bildirishnomalar">
                  <Icon name="lucide:bell" size="1.2em" mode="css" />
                  <span
                    v-if="notificationStore.unreadCount > 0"
                    class="navbar__notif-badge"
                  >
                    {{
                      notificationStore.unreadCount > 9
                        ? "9+"
                        : notificationStore.unreadCount
                    }}
                  </span>
                </button>

                <!-- Dropdown -->
                <div
                  v-if="showNotifications"
                  class="notif-dropdown"
                  @click.stop
                >
                  <div class="notif-dropdown__header">
                    <span>Bildirishnomalar</span>
                    <button
                      v-if="notificationStore.unreadCount > 0"
                      class="notif-dropdown__mark-all"
                      @click="notificationStore.markAllAsRead()"
                    >
                      Hammasini o'qilgan
                    </button>
                  </div>

                  <div class="notif-dropdown__list">
                    <div
                      v-for="n in notificationStore.notifications"
                      :key="n.id"
                      class="notif-item"
                      :class="{ 'notif-item--unread': !n.isRead }"
                      @click="handleNotificationClick(n)"
                    >
                      <div class="notif-item__dot" v-if="!n.isRead" />
                      <div class="notif-item__content">
                        <span class="notif-item__title">{{ n.title }}</span>
                        <span class="notif-item__msg">{{ n.message }}</span>
                        <span class="notif-item__time">{{
                          notifTimeFormat(n.createdAt)
                        }}</span>
                      </div>
                    </div>

                    <div
                      v-if="!notificationStore.notifications.length"
                      class="notif-empty"
                    >
                      <span>🔔</span>
                      <p>Bildirishnomalar yo'q</p>
                    </div>
                  </div>
                </div>
              </div>

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
                        {{
                          userStore.oneUserInfo?.fullName ??
                          authStore.user?.email
                        }}
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
              <button
                class="navbar__search-btn"
                @click="searchOpen = true"
                title="Qidirish"
              >
                <Icon name="lucide:search" size="1.1em" mode="css" />
              </button>
              <NuxtLink to="/login" class="navbar__link">Kirish</NuxtLink>
              <NuxtLink to="/register" class="btn btn--primary">
                Ro'yxatdan o'tish
              </NuxtLink>
            </template>
          </template>

          <!-- SSR da hech narsa ko'rinmaydi -->
          <template #fallback>
            <div style="width: 130px; height: 36px" />
          </template>
        </ClientOnly>
      </div>

      <button
        class="navbar__search-btn navbar__search-btn--mobile"
        @click="searchOpen = true"
        title="Qidirish"
      >
        <Icon name="lucide:search" size="1.2em" mode="css" />
      </button>

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
    <div
      class="navbar__mobile-menu"
      :class="{ 'navbar__mobile-menu--open': menuOpen }"
    >
      <nav class="navbar__mobile-nav">
        <NuxtLink
          to="/categories"
          class="navbar__mobile-link"
          @click="menuOpen = false"
        >
          📂 Kategoriyalar
        </NuxtLink>
        <NuxtLink
          to="/articles"
          class="navbar__mobile-link"
          @click="menuOpen = false"
        >
          📄 Maqolalar
        </NuxtLink>
      </nav>

      <div class="navbar__mobile-divider" />

      <div class="navbar__mobile-actions">
        <ClientOnly>
          <template #default>
            <template v-if="authStore.isLoggedIn">
              <div class="navbar__mobile-user-info">
                <div class="navbar__mobile-avatar">
                  {{ authStore.user?.email?.[0]?.toUpperCase() }}
                </div>
                <span class="navbar__mobile-email">
                  {{ userStore.oneUserInfo?.fullName ?? authStore.user?.email }}
                </span>
              </div>
              <NuxtLink
                to="/profile"
                class="navbar__mobile-link"
                @click="menuOpen = false"
              >
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
              <NuxtLink
                to="/login"
                class="navbar__mobile-link"
                @click="menuOpen = false"
              >
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
          </template>

          <template #fallback>
            <div style="height: 40px" />
          </template>
        </ClientOnly>
      </div>
    </div>
    <SearchModal :open="searchOpen" @close="searchOpen = false" />
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();

const openSearch = () => {
  searchOpen.value = true;
};
const showDropdown = ref(false);
const isScrolled = ref(false);
const searchOpen = ref(false);
const menuOpen = ref(false);
const notificationStore = useNotificationStore();
const showNotifications = ref(false);

const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".navbar__user")) showDropdown.value = false;
  if (!target.closest(".navbar__notif")) showNotifications.value = false;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  authStore.logout();
  userStore.oneUserInfo = null;
  menuOpen.value = false;
  navigateTo("/");
};

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    await notificationStore.getNotifications();
  }
};

const handleNotificationClick = async (n: any) => {
  await notificationStore.markAsRead(n.id);
  showNotifications.value = false;
  if (n.link) navigateTo(n.link);
};

const notifTimeFormat = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", () => {
    isScrolled.value = window.scrollY > 20;
  });

  if (authStore.isLoggedIn) {
    notificationStore.getUnreadCount();
    const token = localStorage.getItem("access_token");
    if (token) {
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1] as string));
      await userStore.getOneUserInfo(payload.sub);
    }
  }
});

onMounted(() => {
  window.addEventListener("open-search", openSearch);
});

onUnmounted(() => {
  window.removeEventListener("open-search", openSearch);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.navbar__notif {
  position: relative;

  &-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1.5px solid var(--color-border);
    background: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }

  &-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 100px;
    background: var(--color-danger);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-bg);
  }
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 340px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: $border-radius;
  box-shadow: var(--color-shadow-lg);
  overflow: hidden;
  z-index: 100;

  @media (max-width: $mobile) {
    width: calc(100vw - 2rem);
    right: -1rem;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.1rem;
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-text-primary);
  }

  &__mark-all {
    font-size: 0.72rem;
    color: var(--color-primary);
    font-weight: 600;
    background: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__list {
    max-height: 380px;
    overflow-y: auto;
  }
}

.notif-item {
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--color-bg-secondary);
  }

  &--unread {
    background: rgba(99, 102, 241, 0.04);
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-primary);
    flex-shrink: 0;
    margin-top: 0.4rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  &__title {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__msg {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__time {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin-top: 0.1rem;
  }
}

.notif-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--color-text-muted);

  span {
    font-size: 1.75rem;
    display: block;
    margin-bottom: 0.4rem;
  }
  p {
    font-size: 0.85rem;
  }
}

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

  &__search-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid var(--color-border);
    background: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    &--mobile {
      display: none;
      width: 40px;
      height: 40px;
      margin-left: auto;
      margin-right: 0.5rem;

      @media (max-width: $tablet) {
        display: flex;
      }
    }
  }

  &__inner {
    display: flex;
    align-items: center;
    height: 64px;
    gap: 2rem;

    @media (max-width: $tablet) {
      gap: 0;
    }
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

  &__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 0.5rem;
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
