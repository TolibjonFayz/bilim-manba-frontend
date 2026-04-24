<template>
  <div class="admin-dashboard">
    <h1 class="admin-page__title">Dashboard</h1>

    <!-- Stats -->
    <div v-loading="loading" class="admin-stats">
      <div class="admin-stat-card">
        <div class="admin-stat-card__icon admin-stat-card__icon--blue">👥</div>
        <div class="admin-stat-card__info">
          <span class="admin-stat-card__label">Foydalanuvchilar</span>
          <span class="admin-stat-card__value">{{
            stats?.userCount ?? 0
          }}</span>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="admin-stat-card__icon admin-stat-card__icon--purple">
          📝
        </div>
        <div class="admin-stat-card__info">
          <span class="admin-stat-card__label">Maqolalar</span>
          <span class="admin-stat-card__value">{{
            stats?.articleCount ?? 0
          }}</span>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="admin-stat-card__icon admin-stat-card__icon--coral">👁</div>
        <div class="admin-stat-card__info">
          <span class="admin-stat-card__label">O'qishlar</span>
          <span class="admin-stat-card__value">{{
            stats?.viewCount ?? 0
          }}</span>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="admin-stat-card__icon admin-stat-card__icon--pink">❤️</div>
        <div class="admin-stat-card__info">
          <span class="admin-stat-card__label">Like lar</span>
          <span class="admin-stat-card__value">{{
            stats?.likeCount ?? 0
          }}</span>
        </div>
      </div>
    </div>

    <!-- Quick links -->
    <div class="admin-quick">
      <h2 class="admin-quick__title">Tezkor harakatlar</h2>
      <div class="admin-quick__grid">
        <NuxtLink to="/admin/articles/create" class="admin-quick__card">
          <span class="admin-quick__card-icon">✏️</span>
          <span>Yangi maqola</span>
        </NuxtLink>
        <NuxtLink to="/admin/articles" class="admin-quick__card">
          <span class="admin-quick__card-icon">📝</span>
          <span>Maqolalar</span>
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="admin-quick__card">
          <span class="admin-quick__card-icon">📂</span>
          <span>Kategoriyalar</span>
        </NuxtLink>
        <NuxtLink to="/admin/users" class="admin-quick__card">
          <span class="admin-quick__card-icon">👥</span>
          <span>Foydalanuvchilar</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const adminStore = useAdminStore();
const loading = ref(false);
const stats = computed(() => adminStore.stats);

onMounted(async () => {
  loading.value = true;
  await adminStore.getStats();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;

  @media (max-width: $desktop) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
  }
}

.admin-stat-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;

    &--blue {
      background: rgba($primary, 0.1);
    }
    &--purple {
      background: rgba(#764ba2, 0.1);
    }
    &--coral {
      background: rgba($secondary, 0.1);
    }
    &--pink {
      background: rgba(#ff9a9e, 0.15);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__label {
    font-size: 0.8rem;
    color: $text-muted;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__value {
    font-size: 1.75rem;
    font-weight: 800;
    color: $text-primary;
    line-height: 1;
  }
}

.admin-quick {
  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: $desktop) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $mobile) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    background: #fff;
    border: 1.5px solid $border-color;
    border-radius: $border-radius;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: $text-primary;
    transition: all 0.2s;
    text-align: center;

    &:hover {
      border-color: $primary;
      color: $primary;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }

  &__card-icon {
    font-size: 1.75rem;
  }
}
</style>
