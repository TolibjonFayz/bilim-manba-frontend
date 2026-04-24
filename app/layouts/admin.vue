<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside
      class="admin-sidebar"
      :class="{ 'admin-sidebar--open': sidebarOpen }"
    >
      <div class="admin-sidebar__logo">
        <NuxtLink to="/" class="admin-sidebar__logo-link">
          <img
            src="https://res.cloudinary.com/dne7ddv2a/image/upload/f_auto/c_scale,w_1000/v1776068517/Logo_no_text_transparent_uytuse.png"
            alt="Bilim Manba"
            width="36"
          />
          <span>Bilim Manba</span>
        </NuxtLink>
      </div>

      <nav class="admin-sidebar__nav">
        <NuxtLink to="/admin" class="admin-sidebar__link" exact>
          📊 Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/articles" class="admin-sidebar__link">
          📝 Maqolalar
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="admin-sidebar__link">
          📂 Kategoriyalar
        </NuxtLink>
        <NuxtLink to="/admin/users" class="admin-sidebar__link">
          👥 Foydalanuvchilar
        </NuxtLink>
      </nav>

      <div class="admin-sidebar__footer">
        <NuxtLink to="/" class="admin-sidebar__link">
          🌐 Saytga o'tish
        </NuxtLink>
        <button
          class="admin-sidebar__link admin-sidebar__link--danger"
          @click="handleLogout"
        >
          🚪 Chiqish
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="admin-main">
      <!-- Topbar -->
      <header class="admin-topbar">
        <button
          class="admin-topbar__burger"
          @click="sidebarOpen = !sidebarOpen"
        >
          ☰
        </button>
        <div class="admin-topbar__right">
          <span class="admin-topbar__user">
            👤 {{ authStore.user?.email }}
          </span>
        </div>
      </header>

      <!-- Page content -->
      <div class="admin-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();
const sidebarOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  userStore.oneUserInfo = null;
  navigateTo("/login");
};
</script>

<style lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6fa;
}

.admin-sidebar {
  width: 240px;
  background: #1e1e2d;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: $tablet) {
    position: fixed;
    left: -240px;
    top: 0;
    z-index: 200;
    transition: left 0.3s;

    &--open {
      left: 0;
    }
  }

  &__logo {
    padding: 1.5rem 1.25rem;
    border-bottom: 1px solid rgba(#fff, 0.08);

    &-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
    }
  }

  &__nav {
    flex: 1;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(#fff, 0.65);
    transition: all 0.15s;
    cursor: pointer;
    background: none;
    border: none;
    font-family: $font-primary;
    text-align: left;
    width: 100%;

    &:hover {
      color: #fff;
      background: rgba(#fff, 0.08);
    }

    &.router-link-active {
      color: #fff;
      background: $primary;
    }

    &--danger {
      color: rgba(#ff6b6b, 0.8);
      &:hover {
        color: #ff6b6b;
        background: rgba(#ff6b6b, 0.1);
      }
    }
  }

  &__footer {
    padding: 0.75rem;
    border-top: 1px solid rgba(#fff, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  background: #fff;
  border-bottom: 1px solid $border-color;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;

  &__burger {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    display: none;
    color: $text-primary;

    @media (max-width: $tablet) {
      display: block;
    }
  }

  &__right {
    margin-left: auto;
  }

  &__user {
    font-size: 0.875rem;
    color: $text-secondary;
    font-weight: 500;
  }
}

.admin-content {
  padding: 2rem;
  flex: 1;

  @media (max-width: $mobile) {
    padding: 1rem;
  }
}
</style>
