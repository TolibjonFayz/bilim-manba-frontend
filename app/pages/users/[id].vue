<template>
  <div class="public-profile" v-loading="loading">
    <div class="container">
      <!-- PRIVATE holat -->
      <div v-if="profile && !profile.isPublic" class="private-state">
        <div class="private-state__icon">🔒</div>
        <h1 class="private-state__title">Bu maxfiy akkaunt</h1>
        <p class="private-state__desc">
          {{ profile.fullName }} o'z profilini maxfiy qilib qo'ygan. Ma'lumotlar
          faqat egasiga ko'rinadi.
        </p>
        <NuxtLink to="/" class="btn btn--primary"
          >Bosh sahifaga qaytish</NuxtLink
        >
      </div>

      <!-- PUBLIC holat -->
      <div v-else-if="profile && profile.isPublic" class="public-card">
        <div class="public-card__header">
          <div class="public-card__avatar">
            {{ profile.fullName?.[0]?.toUpperCase() }}
          </div>
          <h1 class="public-card__name">{{ profile.fullName }}</h1>
          <p class="public-card__joined">
            📅 {{ formatJoined(profile.createdAt) }} dan beri a'zo
          </p>
        </div>

        <div class="public-card__stats">
          <div class="stat-box">
            <span class="stat-box__value">{{
              profile.stats?.readCount ?? 0
            }}</span>
            <span class="stat-box__label">O'qilgan maqola</span>
          </div>
          <div class="stat-box">
            <span class="stat-box__value">{{
              profile.stats?.savedCount ?? 0
            }}</span>
            <span class="stat-box__label">Yoqtirilgan</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const profile = computed(() => userStore.publicProfile);

const formatJoined = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
  });
};

useHead({
  title: () => `${profile.value?.fullName ?? "Profil"} — Bilim Manba`,
});

onMounted(async () => {
  loading.value = true;
  await userStore.getPublicProfile(Number(route.params.id));
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.public-profile {
  padding: 3rem 0 5rem;
  min-height: 60vh;
}

.private-state {
  text-align: center;
  padding: 4rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 480px;
  margin: 0 auto;

  &__icon {
    font-size: 4rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: 0.95rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
}

.public-card {
  max-width: 540px;
  margin: 0 auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: var(--color-shadow-md);

  &__header {
    background: var(--color-bg-secondary);
    padding: 2.5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  &__avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, 99, 102, 241, $c-secondary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.25rem;
    font-weight: 800;
  }

  &__name {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text-primary);
  }

  &__joined {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--color-border);
  }
}

.stat-box {
  background: var(--color-bg);
  padding: 1.75rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &__value {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--color-primary);
  }

  &__label {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    font-weight: 600;
  }
}
</style>
