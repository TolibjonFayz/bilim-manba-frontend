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
                class="navbar__icon-btn"
                @click="searchOpen = true"
                title="Qidirish"
              >
                <Icon name="lucide:search" size="1.1em" mode="css" />
              </button>

              <!-- Desktop notification btn -->
              <button
                class="navbar__icon-btn navbar__notif-trigger"
                @click.stop="toggleNotifications"
                title="Bildirishnomalar"
              >
                <Icon name="lucide:bell" size="1.15em" mode="css" />
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

              <!-- User dropdown -->
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
                  <NuxtLink to="/profile" class="navbar__dropdown-item"
                    >👤 Profil</NuxtLink
                  >
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
                class="navbar__icon-btn"
                @click="searchOpen = true"
                title="Qidirish"
              >
                <Icon name="lucide:search" size="1.1em" mode="css" />
              </button>
              <NuxtLink to="/login" class="navbar__link">Kirish</NuxtLink>
              <NuxtLink to="/register" class="btn btn--primary"
                >Ro'yxatdan o'tish</NuxtLink
              >
            </template>
          </template>
          <template #fallback>
            <div style="width: 130px; height: 36px" />
          </template>
        </ClientOnly>
      </div>

      <!-- Mobile search btn -->
      <button
        class="navbar__icon-btn navbar__icon-btn--mobile"
        @click="searchOpen = true"
        title="Qidirish"
      >
        <Icon name="lucide:search" size="1.2em" mode="css" />
      </button>

      <!-- Mobile notification btn (faqat login bo'lgan holda) -->
      <ClientOnly>
        <button
          v-if="authStore.isLoggedIn"
          class="navbar__icon-btn navbar__notif-mobile navbar__notif-trigger"
          @click.stop="toggleNotifications"
          title="Bildirishnomalar"
        >
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
      </ClientOnly>

      <!-- Hamburger -->
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
          >📂 Kategoriyalar</NuxtLink
        >
        <NuxtLink
          to="/articles"
          class="navbar__mobile-link"
          @click="menuOpen = false"
          >📄 Maqolalar</NuxtLink
        >
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
                <span class="navbar__mobile-email">{{
                  userStore.oneUserInfo?.fullName ?? authStore.user?.email
                }}</span>
              </div>
              <NuxtLink
                to="/profile"
                class="navbar__mobile-link"
                @click="menuOpen = false"
                >👤 Profil</NuxtLink
              >
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
                >Kirish</NuxtLink
              >
              <NuxtLink
                to="/register"
                class="btn btn--primary navbar__mobile-register"
                @click="menuOpen = false"
                >Ro'yxatdan o'tish</NuxtLink
              >
            </template>
          </template>
          <template #fallback><div style="height: 40px" /></template>
        </ClientOnly>
      </div>
    </div>

    <SearchModal :open="searchOpen" @close="searchOpen = false" />
  </header>

  <!-- Notification Dropdown — Teleport (bitta, desktop+mobil) -->
  <Teleport to="body">
    <Transition name="notif-drop">
      <div v-if="showNotifications" class="notif-dropdown" @click.stop>
        <div class="notif-dropdown__header">
          <span class="notif-dropdown__title">🔔 Bildirishnomalar</span>
          <button
            v-if="notificationStore.unreadCount > 0"
            class="notif-dropdown__mark-all"
            @click="handleMarkAll"
          >
            Hammasini o'qilgan
          </button>
        </div>

        <div class="notif-dropdown__list">
          <!-- Loading -->
          <div v-if="notifLoading" class="notif-loading">
            <div class="notif-loading__skeleton" v-for="i in 3" :key="i">
              <div class="notif-loading__dot" />
              <div class="notif-loading__lines">
                <div class="notif-loading__line notif-loading__line--title" />
                <div class="notif-loading__line notif-loading__line--msg" />
                <div class="notif-loading__line notif-loading__line--time" />
              </div>
            </div>
          </div>

          <!-- Natijalar -->
          <template v-else-if="notificationStore.notifications.length">
            <div
              v-for="n in notificationStore.notifications"
              :key="n.id"
              class="notif-item"
              :class="{ 'notif-item--unread': !n.isRead }"
              @click="handleNotificationClick(n)"
            >
              <div v-if="!n.isRead" class="notif-item__dot" />
              <div class="notif-item__body">
                <span class="notif-item__title">{{ n.title }}</span>
                <span class="notif-item__msg">{{ n.message }}</span>
                <span class="notif-item__time">{{
                  notifTimeFormat(n.createdAt)
                }}</span>
              </div>
            </div>
          </template>

          <!-- Bo'sh -->
          <div v-else class="notif-empty">
            <span>🔔</span>
            <p>Bildirishnomalar yo'q</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const showDropdown = ref(false);
const showNotifications = ref(false);
const isScrolled = ref(false);
const searchOpen = ref(false);
const menuOpen = ref(false);
const notifLoading = ref(false);
const notifBtnRef = ref<HTMLElement | null>(null);

// Dropdown pozitsiyasini trigger button'ga qarab hisoblash
const dropdownStyle = ref({ top: "70px", right: "1rem" });

const updateDropdownPosition = () => {
  const trigger = document.querySelector(
    ".navbar__notif-trigger",
  ) as HTMLElement;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + 12}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
};

// ── Click outside ──
const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".navbar__user")) showDropdown.value = false;
  if (
    !target.closest(".navbar__notif-trigger") &&
    !target.closest(".notif-dropdown")
  ) {
    showNotifications.value = false;
  }
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

// ── Notifications ──
const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    await nextTick();
    updateDropdownPosition();
    notifLoading.value = true;
    await notificationStore.getNotifications();
    notifLoading.value = false;
  }
};

const handleNotificationClick = async (n: any) => {
  await notificationStore.markAsRead(n.id);
  showNotifications.value = false;
  if (n.link) navigateTo(n.link);
};

const handleMarkAll = async () => {
  await notificationStore.markAllAsRead();
};

const notifTimeFormat = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
};

const openSearch = () => {
  searchOpen.value = true;
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchOpen.value = true;
    }
  });
  window.addEventListener("scroll", () => {
    isScrolled.value = window.scrollY > 20;
  });
  window.addEventListener("resize", () => {
    if (showNotifications.value) updateDropdownPosition();
  });
  window.addEventListener("open-search", openSearch);

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

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("open-search", openSearch);
});
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
    gap: 0.6rem;
    margin-left: auto;
    @media (max-width: $tablet) {
      display: none;
    }
  }

  // ── Universal icon button ──
  &__icon-btn {
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
    position: relative;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    // Mobile search — faqat tablet da ko'rinadi
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

  // Mobile notif — faqat tablet da ko'rinadi
  &__notif-mobile {
    display: none;
    width: 40px;
    height: 40px;
    margin-right: 0.35rem;
    @media (max-width: $tablet) {
      display: flex;
    }
  }

  // Notification badge
  &__notif-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 100px;
    background: #ef4444;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
    animation: notif-pulse 2s ease-in-out infinite;
  }

  // ── User ──
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
    z-index: 200;
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

  // ── Hamburger ──
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

  // ── Mobile menu ──
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
    padding: 0.75rem;
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

// ─────────────────────────────────────
// NOTIFICATION DROPDOWN (Teleport — global)
// ─────────────────────────────────────
.notif-drop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.notif-drop-leave-active {
  transition: all 0.15s ease;
}
.notif-drop-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
.notif-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes notif-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }
}

@keyframes notif-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes notif-shimmer-slide {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// ─────────────────────────────────────
// DARK MODE
// ─────────────────────────────────────
:global(.dark) {
  .navbar {
    background: rgba(15, 15, 26, 0.95);
    border-color: #2d2d44;
  }
  .navbar__dropdown {
    background: #1a1a2e;
    border-color: #2d2d44;
  }
  .navbar__dropdown-item {
    color: #f1f5f9;
    &:hover {
      background: #0f0f1a;
    }
  }
  .navbar__dropdown-name {
    color: #f1f5f9;
  }
  .navbar__dropdown-divider {
    background: #2d2d44;
  }
  .navbar__mobile-menu {
    background: #1a1a2e;
    border-color: #2d2d44;
  }
  .navbar__mobile-divider {
    background: #2d2d44;
  }
  .navbar__mobile-link {
    color: #f1f5f9;
  }
  .navbar__notif-badge {
    border-color: #0f0f1a;
  }
}
</style>

<style>
/* ── NOTIFICATION DROPDOWN — global (Teleport uchun scoped ishlamaydi) ── */
.notif-dropdown {
  position: fixed;
  top: 70px;
  right: 1rem;
  width: 340px;
  background: #ffffff;
  border: 1px solid #eeedf5;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 9999;
}

@media (max-width: 576px) {
  .notif-dropdown {
    width: calc(100vw - 2rem);
    right: 1rem;
  }
}

.notif-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid #eeedf5;
  background: #f8f7ff;
}

.notif-dropdown__title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1a1a2e;
}

.notif-dropdown__mark-all {
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.7rem;
  border-radius: 100px;
  transition: all 0.15s;
}

.notif-dropdown__mark-all:hover {
  background: rgba(99, 102, 241, 0.1);
}

.notif-dropdown__list {
  max-height: 360px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.notif-loading {
  padding: 0.5rem 0;
}

.notif-loading__skeleton {
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid #f0eff8;
  align-items: flex-start;
}

.notif-loading__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e4ef;
  flex-shrink: 0;
  margin-top: 5px;
  animation: notif-shimmer 1.2s ease-in-out infinite;
}

.notif-loading__lines {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.notif-loading__line {
  border-radius: 4px;
  background: linear-gradient(90deg, #f0eff8 25%, #e5e4ef 50%, #f0eff8 75%);
  background-size: 200% 100%;
  animation: notif-shimmer-slide 1.4s ease-in-out infinite;
}

.notif-loading__line--title {
  height: 11px;
  width: 55%;
}
.notif-loading__line--msg {
  height: 9px;
  width: 85%;
}
.notif-loading__line--time {
  height: 8px;
  width: 35%;
}

.notif-item {
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid #f0eff8;
  cursor: pointer;
  transition: background 0.15s;
  align-items: flex-start;
}

.notif-item:last-child {
  border-bottom: none;
}
.notif-item:hover {
  background: #f8f7ff;
}
.notif-item--unread {
  background: rgba(99, 102, 241, 0.04);
}

.notif-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  flex-shrink: 0;
  margin-top: 5px;
}

.notif-item__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.notif-item__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.3;
}
.notif-item__msg {
  font-size: 0.78rem;
  color: #4a5568;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.notif-item__time {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.notif-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #9ca3af;
}
.notif-empty span {
  font-size: 1.75rem;
  display: block;
  margin-bottom: 0.4rem;
}
.notif-empty p {
  font-size: 0.85rem;
}

/* Dark mode */
.dark .notif-dropdown {
  background: #1a1a2e;
  border-color: #2d2d44;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
.dark .notif-dropdown__header {
  background: #0f0f1a;
  border-color: #2d2d44;
}
.dark .notif-dropdown__title {
  color: #f1f5f9;
}
.dark .notif-loading__skeleton {
  border-color: #2d2d44;
}
.dark .notif-loading__dot {
  background: #2d2d44;
}
.dark .notif-loading__line {
  background: linear-gradient(90deg, #1a1a2e 25%, #2d2d44 50%, #1a1a2e 75%);
  background-size: 200% 100%;
}
.dark .notif-item {
  border-color: #2d2d44;
}
.dark .notif-item:hover {
  background: #0f0f1a;
}
.dark .notif-item--unread {
  background: rgba(99, 102, 241, 0.08);
}
.dark .notif-item__title {
  color: #f1f5f9;
}
.dark .notif-item__msg {
  color: #a0aec0;
}

@keyframes notif-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes notif-shimmer-slide {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.notif-drop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.notif-drop-leave-active {
  transition: all 0.15s ease;
}
.notif-drop-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
.notif-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
