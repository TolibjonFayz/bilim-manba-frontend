<!-- app/pages/profile.vue -->
<template>
  <div class="profile-page" v-loading="loading">
    <!-- PROFILE HEADER -->
    <section class="profile-header">
      <div class="container">
        <div class="profile-header__inner">
          <div class="profile-header__left">
            <div class="profile-header__avatar">
              <Icon name="mdi:user" size="1em" mode="css" />
            </div>
            <div class="profile-header__info">
              <div class="profile-header__name-row">
                <h1 class="profile-header__name">
                  {{ userStore?.oneUserInfo?.fullName }}
                </h1>
              </div>
              <p class="profile-header__email">
                {{ userStore?.oneUserInfo?.email }}
              </p>
            </div>
          </div>
          <button
            class="profile-header__edit-btn"
            @click="activeTab = 'settings'"
          >
            ✏️ Profilni tahrirlash
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN -->
    <section class="profile-main">
      <div class="container">
        <div class="profile-main__grid">
          <!-- CHAP: Sidebar -->
          <aside class="profile-sidebar">
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">Tezkor statistika</h3>
              <div class="stats-list">
                <div class="stats-item">
                  <div class="stats-item__icon stats-item__icon--blue">📚</div>
                  <div class="stats-item__info">
                    <span class="stats-item__label">O'QILGAN MAQOLALAR</span>
                    <span class="stats-item__value"
                      >{{ stats?.readCount ?? 0 }} ta</span
                    >
                  </div>
                </div>
                <div class="stats-item">
                  <div class="stats-item__icon stats-item__icon--coral">🕐</div>
                  <div class="stats-item__info">
                    <span class="stats-item__label">UMUMIY VAQT</span>
                    <span class="stats-item__value"
                      >{{ stats?.totalTime ?? 0 }} soat</span
                    >
                  </div>
                </div>
                <div class="stats-item">
                  <div class="stats-item__icon stats-item__icon--pink">❤️</div>
                  <div class="stats-item__info">
                    <span class="stats-item__label">SAQLANGAN</span>
                    <span class="stats-item__value"
                      >{{ stats?.savedCount ?? 0 }} ta</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- O'NG: Asosiy kontent -->
          <div class="profile-content">
            <!-- Tab bar -->
            <div class="tab-bar">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="tab-bar__item"
                :class="{ 'tab-bar__item--active': activeTab === tab.key }"
                @click="activeTab = tab.key"
              >
                {{ tab?.label }}
              </button>
            </div>

            <!-- FAOLIYAT TAB -->
            <div v-if="activeTab === 'activity'">
              <div class="content-section">
                <div class="content-section__header">
                  <h2 class="content-section__title">So'nggi o'qilganlar</h2>
                </div>
                <div v-if="recentArticles?.length" class="recent-grid">
                  <div
                    v-for="a in getLatestByArticleId(recentArticles)"
                    :key="a?.article?.id"
                    class="recent-card-wrapper"
                  >
                    <NuxtLink
                      :to="`/articles/${a?.article?.slug}`"
                      class="recent-card"
                    >
                      <img :src="a?.article?.coverImage" alt="image" />
                      <div class="recent-card__body">
                        <h4 class="recent-card__title">
                          {{ a?.article?.title }}
                        </h4>
                        <p class="recent-card__excerpt">
                          {{ a?.article?.excerpt }}
                        </p>
                        <div class="recent-card__meta">
                          <span>📅 {{ a?.date }}</span>
                        </div>
                      </div>
                    </NuxtLink>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <span class="empty-state__emoji">📚</span>
                  <h3 class="empty-state__title">Hali o'qilgan maqola yo'q</h3>
                  <p class="empty-state__desc">
                    Maqolalarni o'qiy boshlang va bu yerda ular ko'rinadi
                  </p>
                  <NuxtLink to="/articles" class="empty-state__link"
                    >Maqolalarni ko'rish →</NuxtLink
                  >
                </div>
              </div>

              <!-- O'qish statistikasi -->
              <div class="content-section">
                <h2 class="content-section__title">O'qish statistikasi</h2>
                <div class="chart-card">
                  <div class="chart-card__header">
                    <div>
                      <span class="chart-card__label">HAFTALIK FAOLLIK</span>
                      <h3 class="chart-card__subtitle">
                        Bu hafta {{ weeklyTotal }} ta maqola o'qidingiz
                      </h3>
                    </div>
                    <span class="chart-card__range">{{ weekRange }}</span>
                  </div>
                  <div class="chart-scroll">
                    <div class="bar-chart">
                      <div class="bar-chart__y-labels">
                        <span
                          v-for="y in [
                            maxValue,
                            Math.round(maxValue * 0.75),
                            Math.round(maxValue * 0.5),
                            Math.round(maxValue * 0.25),
                            0,
                          ]"
                          :key="y"
                        >
                          {{ y }}
                        </span>
                      </div>
                      <div class="bar-chart__bars">
                        <div
                          v-for="(day, i) in weeklyData"
                          :key="day.label"
                          class="bar-chart__col"
                        >
                          <div class="bar-chart__bar-wrap">
                            <div
                              class="bar-chart__bar"
                              :class="{
                                'bar-chart__bar--active': i === todayIndex,
                              }"
                              :style="{
                                height: `${maxValue > 0 ? (day.value / maxValue) * 100 : 0}%`,
                              }"
                            >
                              <span
                                v-if="day.value > 0"
                                class="bar-chart__tooltip"
                                >{{ day.value }}</span
                              >
                            </div>
                          </div>
                          <span class="bar-chart__label">
                            {{ day.label }}
                            <span class="bar-chart__label-date">
                              {{ day.date ? formatChartDate(day.date) : "" }}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SAQLANGAN TAB -->
            <div v-else-if="activeTab === 'saved'">
              <div class="content-section">
                <h2 class="content-section__title">Saqlangan maqolalar</h2>
                <div v-if="likeStore?.userLikes?.length" class="saved-grid">
                  <div
                    v-for="a in likeStore?.userLikes"
                    :key="a.articleId"
                    class="saved-card-wrapper"
                  >
                    <NuxtLink
                      :to="`/articles/${a.article.slug}`"
                      class="saved-card"
                    >
                      <img :src="a?.article?.coverImage" alt="image" />
                      <div class="saved-card__body">
                        <h4 class="saved-card__title">{{ a.article.title }}</h4>
                        <p class="saved-card__excerpt">
                          {{ a.article.excerpt }}
                        </p>
                        <div class="saved-card__meta">
                          <span
                            >📅
                            {{
                              a?.createdAt
                                ? new Date(a?.createdAt).toLocaleDateString(
                                    "uz-UZ",
                                  )
                                : ""
                            }}</span
                          >
                        </div>
                      </div>
                    </NuxtLink>
                    <button
                      class="saved-card__like-btn saved-card__like-btn--liked"
                      @click.prevent="handleToggleLike(a.articleId)"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <span class="empty-state__emoji">📚</span>
                  <h3 class="empty-state__title">Hali saqlangan maqola yo'q</h3>
                  <p class="empty-state__desc">
                    Yoqtirgan maqolalaringizni saqlang va keyinroq o'qing
                  </p>
                  <NuxtLink to="/articles" class="empty-state__link"
                    >Maqolalarni ko'rish →</NuxtLink
                  >
                </div>
              </div>
            </div>

            <!-- SOZLAMALAR TAB -->
            <div v-else-if="activeTab === 'settings'">
              <div class="settings-card">
                <h3 class="settings-card__title">Shaxsiy ma'lumotlar</h3>
                <div v-if="settingsSuccess" class="alert alert--success">
                  ✅ {{ settingsSuccess }}
                </div>
                <div v-if="settingsError" class="alert alert--danger">
                  ⚠️ {{ settingsError }}
                </div>
                <div class="settings-form">
                  <div class="form-group">
                    <label>To'liq ism</label>
                    <div class="form-input-wrap">
                      <input
                        v-model="settingsForm.fullName"
                        type="text"
                        :placeholder="userStore?.oneUserInfo?.fullName"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label
                      >Email
                      <span class="form-group__note"
                        >(o'zgartirib bo'lmaydi)</span
                      ></label
                    >
                    <div class="form-input-wrap form-input-wrap--disabled">
                      <input
                        :value="userStore?.oneUserInfo?.email"
                        type="email"
                        disabled
                      />
                    </div>
                  </div>
                  <button
                    class="btn btn--primary settings-save-btn"
                    :disabled="settingsLoading"
                    @click="handleSaveProfile"
                  >
                    {{ settingsLoading ? "Saqlanmoqda..." : "Saqlash" }}
                  </button>
                </div>
              </div>

              <div class="settings-divider" />

              <div class="settings-card">
                <h3 class="settings-card__title">Parolni o'zgartirish</h3>
                <div v-if="passwordSuccess" class="alert alert--success">
                  ✅ {{ passwordSuccess }}
                </div>
                <div v-if="passwordError" class="alert alert--danger">
                  ⚠️ {{ passwordError }}
                </div>
                <div class="settings-form">
                  <div class="form-group">
                    <label>Joriy parol</label>
                    <div class="form-input-wrap">
                      <input
                        v-model="passwordForm.current"
                        :type="showCurrent ? 'text' : 'password'"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        class="form-input-toggle"
                        @click="showCurrent = !showCurrent"
                      >
                        {{ showCurrent ? "🙈" : "👁️" }}
                      </button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Yangi parol</label>
                    <div class="form-input-wrap">
                      <input
                        v-model="passwordForm.new"
                        :type="showNew ? 'text' : 'password'"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        class="form-input-toggle"
                        @click="showNew = !showNew"
                      >
                        {{ showNew ? "🙈" : "👁️" }}
                      </button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Tasdiqlash yangi parol</label>
                    <div class="form-input-wrap">
                      <input
                        v-model="passwordForm.confirm"
                        :type="showConfirm ? 'text' : 'password'"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        class="form-input-toggle"
                        @click="showConfirm = !showConfirm"
                      >
                        {{ showConfirm ? "🙈" : "👁️" }}
                      </button>
                    </div>
                  </div>
                  <button
                    class="btn btn--primary settings-save-btn"
                    :disabled="passwordLoading"
                    @click="handleUpdatePassword"
                  >
                    {{
                      passwordLoading
                        ? "O'zgartirilmoqda..."
                        : "Parolni o'zgartirish"
                    }}
                  </button>
                </div>
              </div>

              <div class="settings-divider" />

              <div class="settings-card settings-card--danger">
                <h3 class="settings-card__title settings-card__title--danger">
                  Xavfli zona
                </h3>
                <p class="settings-card__desc">
                  Akkauntni o'chirishdan oldin bu qaror qaytarib bo'lmasligini
                  unutmang.
                </p>
                <button class="settings-danger-btn">
                  🗑️ Akkauntni o'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const likeStore = useLikeStore();
const userStore = useUserStore();
const activeTab = ref("activity");

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const tabs = [
  { key: "activity", label: "Faoliyat" },
  { key: "saved", label: "Saqlangan" },
  { key: "settings", label: "Sozlamalar" },
];

const settingsForm = reactive({
  fullName: userStore.oneUserInfo?.fullName ?? "",
});

const passwordForm = reactive({
  current: "",
  new: "",
  confirm: "",
});

const loading = ref(false);
const settingsLoading = ref(false);
const passwordLoading = ref(false);
const settingsSuccess = ref("");
const settingsError = ref("");
const passwordSuccess = ref("");
const passwordError = ref("");

const handleSaveProfile = async () => {
  if (!settingsForm.fullName.trim()) {
    settingsError.value = "Ism bo'sh bo'lishi mumkin emas";
    return;
  }
  settingsLoading.value = true;
  settingsError.value = "";
  settingsSuccess.value = "";
  try {
    await userStore.UpdateOneUserInfo(Number(localStorage.getItem("userid")), {
      fullName: settingsForm.fullName,
    });
    settingsSuccess.value = "Ma'lumot muvaffaqiyatli yangilandi!";
  } catch (e: any) {
    settingsError.value = e.message;
  } finally {
    settingsLoading.value = false;
  }
};

const handleUpdatePassword = async () => {
  passwordError.value = "";
  passwordSuccess.value = "";
  if (!passwordForm.current) {
    passwordError.value = "Joriy parolni kiriting";
    return;
  }
  if (passwordForm.new.length < 6) {
    passwordError.value = "Yangi parol kamida 6 ta belgi";
    return;
  }
  if (passwordForm.new !== passwordForm.confirm) {
    passwordError.value = "Yangi parollar mos kelmaydi";
    return;
  }
  passwordLoading.value = true;
  try {
    const res = await userStore.updatePassword(
      Number(localStorage.getItem("userid")),
      passwordForm,
    );
    if (!res.success) throw new Error(res.message);
    passwordSuccess.value = "Parol muvaffaqiyatli o'zgartirildi!";
    passwordForm.current = "";
    passwordForm.new = "";
    passwordForm.confirm = "";
  } catch (e: any) {
    passwordError.value = e.message;
  } finally {
    passwordLoading.value = false;
  }
};

const handleToggleLike = async (articleId: number) => {
  try {
    const result = await likeStore.toggle(articleId);
    if (result?.data?.isLiked === false) {
      likeStore.userLikes = likeStore.userLikes.filter(
        (like: any) => like.articleId !== articleId,
      );
    }
  } catch (e: any) {
    console.error("Like toggle error:", e.message);
  }
};

const stats = computed(() => userStore?.stats);

const recentArticles = computed(() =>
  (userStore.recentReads ?? []).map((a: any, i: number) => ({
    ...a,
    date: a.createdAt ? new Date(a.createdAt).toLocaleDateString("uz-UZ") : "",
  })),
);

function getLatestByArticleId(data: any[]) {
  const map = new Map();
  for (const item of data) {
    const key = item.articleId;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);
      if (new Date(item.createdAt) > new Date(existing.createdAt)) {
        map.set(key, item);
      }
    }
  }
  return Array.from(map.values());
}

const formatChartDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const weeklyData = computed(() =>
  (userStore.weeklyActivity?.days ?? []).length
    ? userStore.weeklyActivity.days
    : [
        { label: "Du", value: 0 },
        { label: "Se", value: 0 },
        { label: "Ch", value: 0 },
        { label: "Pa", value: 0 },
        { label: "Ju", value: 0 },
        { label: "Sh", value: 0 },
        { label: "Ya", value: 0 },
      ],
);

const todayIndex = computed(() => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
});

const maxValue = computed(() => {
  const values = weeklyData.value?.map((d: any) => d.value) ?? [0];
  return Math.max(...values, 4);
});

const weekRange = computed(() => {
  const days = userStore.weeklyActivity?.days;
  if (!days?.length) return "";
  const first = new Date(days[0].date).toLocaleDateString("uz-UZ");
  const last = new Date(days[days.length - 1].date).toLocaleDateString("uz-UZ");
  return `${first} — ${last}`;
});

const weeklyTotal = computed(
  () => userStore.weeklyActivity?.totalThisWeek ?? 0,
);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    userStore.getOneUserInfo(Number(localStorage.getItem("userid"))),
    likeStore.getUserLikes(),
    userStore.getStats(),
    userStore.getRecentReads(),
    userStore.getWeeklyActivity(),
  ]);
  settingsForm.fullName = userStore.oneUserInfo?.fullName ?? "";
  loading.value = false;
});
</script>

<style lang="scss" scoped>
/* ─────────────────────────────────────
   PROFILE HEADER
───────────────────────────────────── */
.profile-header {
  background: $bg-secondary;
  border-bottom: 1px solid $border-color;
  padding: 1.75rem 0;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
    flex: 1;
  }

  &__avatar {
    width: 64px;
    height: 64px;
    min-width: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  &__info {
    min-width: 0;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.25rem;
  }

  &__name {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: $mobile) {
      font-size: 1.1rem;
    }
  }

  &__email {
    font-size: 0.875rem;
    color: $text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__edit-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    border: 1.5px solid $border-color;
    border-radius: $border-radius-pill;
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-secondary;
    background: #fff;
    cursor: pointer;
    font-family: $font-primary;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    @media (max-width: $mobile) {
      width: 100%;
      justify-content: center;
    }
  }
}

/* ─────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────── */
.profile-main {
  padding: 2.5rem 0 4rem;

  @media (max-width: $mobile) {
    padding: 1.5rem 0 3rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1.75rem;
    align-items: start;

    @media (max-width: $desktop) {
      grid-template-columns: 1fr;
    }
  }
}

/* ─────────────────────────────────────
   SIDEBAR
───────────────────────────────────── */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 80px;

  @media (max-width: $desktop) {
    position: static;
  }
}

.sidebar-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.25rem;

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  @media (max-width: $desktop) {
    // Horizontal stats on tablet+
    .stats-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
  }

  @media (max-width: $mobile) {
    .stats-list {
      grid-template-columns: 1fr;
    }
  }
}

/* ─────────────────────────────────────
   STATS
───────────────────────────────────── */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;

  &__icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;

    &--blue {
      background: rgba($primary, 0.1);
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
    gap: 0.1rem;
    min-width: 0;
  }

  &__label {
    font-size: 0.68rem;
    font-weight: 700;
    color: $text-muted;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__value {
    font-size: 1.1rem;
    font-weight: 700;
    color: $text-primary;
  }
}

/* ─────────────────────────────────────
   TAB BAR
───────────────────────────────────── */
.tab-bar {
  display: flex;
  border-bottom: 2px solid $border-color;
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  &__item {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: $text-secondary;
    background: none;
    border: none;
    cursor: pointer;
    font-family: $font-primary;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      color: $primary;
    }
    &--active {
      color: $primary;
      border-bottom-color: $primary;
    }

    @media (max-width: $mobile) {
      padding: 0.65rem 1rem;
      font-size: 0.85rem;
      flex: 1;
      text-align: center;
    }
  }
}

/* ─────────────────────────────────────
   CONTENT SECTION
───────────────────────────────────── */
.content-section {
  margin-bottom: 2.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
  }

  &__link {
    font-size: 0.875rem;
    color: $primary;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}

/* ─────────────────────────────────────
   RECENT GRID
───────────────────────────────────── */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: $desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
  }
}

.recent-card-wrapper {
  position: relative;
}

.recent-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
    border-color: rgba($primary, 0.3);

    img {
      transform: scale(1.05);
    }
  }

  img {
    width: 100%;
    height: 110px;
    object-fit: cover;
    transition: transform 0.3s ease;
    display: block;
    flex-shrink: 0;
  }

  &__body {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  &__title {
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: $text-primary;
  }

  &__excerpt {
    font-size: 0.72rem;
    color: $text-secondary;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: $text-muted;
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid rgba($border-color, 0.5);
  }
}

/* ─────────────────────────────────────
   CHART
───────────────────────────────────── */
.chart-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.5rem;

  @media (max-width: $mobile) {
    padding: 1rem;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 0.72rem;
    font-weight: 700;
    color: $text-muted;
    letter-spacing: 0.08em;
    display: block;
    margin-bottom: 0.25rem;
  }

  &__subtitle {
    font-size: 0.95rem;
    font-weight: 700;
  }

  &__range {
    font-size: 0.8rem;
    color: $primary;
    font-weight: 600;
    white-space: nowrap;
  }
}

.chart-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.bar-chart {
  display: flex;
  gap: 0.75rem;
  height: 160px;
  min-width: 280px; // mobile da scroll bo'ladi

  &__y-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.72rem;
    color: $text-muted;
    padding-bottom: 1.5rem;
    flex-shrink: 0;
    min-width: 20px;
  }

  &__bars {
    display: flex;
    gap: 0.5rem;
    flex: 1;
    align-items: flex-end;
    min-width: 0;
  }

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    height: 100%;
    min-width: 28px;
  }

  &__bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    position: relative;
  }

  &__bar {
    width: 100%;
    background: rgba($primary, 0.2);
    border-radius: 6px 6px 0 0;
    transition: height 0.3s ease;
    position: relative;
    min-height: 4px;

    &--active {
      background: $primary;
    }

    &:hover .bar-chart__tooltip {
      opacity: 1;
    }
  }

  &__tooltip {
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    background: $text-primary;
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  &__label {
    font-size: 0.72rem;
    color: $text-muted;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    text-align: center;

    &-date {
      font-size: 0.62rem;
      opacity: 0.7;
    }
  }
}

/* ─────────────────────────────────────
   SAVED GRID
───────────────────────────────────── */
.saved-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: $desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
  }
}

.saved-card-wrapper {
  position: relative;
}

.saved-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
    border-color: rgba($primary, 0.3);

    img {
      transform: scale(1.05);
    }
  }

  img {
    width: 100%;
    height: 110px;
    object-fit: cover;
    transition: transform 0.3s ease;
    display: block;
    flex-shrink: 0;
  }

  &__body {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  &__title {
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: $text-primary;
  }

  &__excerpt {
    font-size: 0.72rem;
    color: $text-secondary;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: $text-muted;
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid rgba($border-color, 0.5);
  }

  &__like-btn {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(#fff, 0.95);
    border: 1px solid rgba($border-color, 0.6);
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: scale(1.1);
      background: #fff;
    }

    &:active {
      transform: scale(0.95);
    }

    &--liked {
      animation: heart-bounce 0.4s ease;
    }
  }
}

/* ─────────────────────────────────────
   EMPTY STATE
───────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  &__emoji {
    font-size: 3rem;
  }
  &__title {
    font-size: 1.05rem;
    font-weight: 700;
  }
  &__desc {
    font-size: 0.875rem;
    color: $text-secondary;
  }
  &__link {
    color: $primary;
    font-weight: 600;
    font-size: 0.9rem;
  }
}

/* ─────────────────────────────────────
   SETTINGS
───────────────────────────────────── */
.settings-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.75rem;
  margin-bottom: 1rem;

  @media (max-width: $mobile) {
    padding: 1.25rem;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    &--danger {
      color: $danger;
    }
  }

  &__desc {
    font-size: 0.875rem;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  &--danger {
    border-color: rgba($danger, 0.2);
    background: rgba($danger, 0.02);
  }
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.settings-save-btn {
  align-self: flex-start;
  padding: 0.65rem 1.75rem;

  @media (max-width: $mobile) {
    width: 100%;
    justify-content: center;
  }
}

.settings-divider {
  height: 1px;
  background: $border-color;
  margin: 0.5rem 0 1.5rem;
}

.settings-danger-btn {
  padding: 0.65rem 1.25rem;
  border: 1.5px solid $danger;
  border-radius: $border-radius-pill;
  color: $danger;
  font-weight: 600;
  font-size: 0.875rem;
  font-family: $font-primary;
  cursor: pointer;
  background: transparent;
  transition: all 0.2s;

  &:hover {
    background: rgba($danger, 0.05);
  }
}

/* ─────────────────────────────────────
   FORM
───────────────────────────────────── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__note {
    font-size: 0.75rem;
    color: $text-muted;
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

  &--disabled {
    background: $bg-secondary;
  }

  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    color: $text-primary;
    font-family: $font-primary;
    min-width: 0;

    &:disabled {
      color: $text-muted;
      cursor: not-allowed;
    }
    &::placeholder {
      color: $text-muted;
    }
  }
}

.form-input-toggle {
  padding: 0 0.85rem;
  font-size: 0.9rem;
  cursor: pointer;
  background: none;
  border: none;
  flex-shrink: 0;
  font-family: $font-primary;
}

/* ─────────────────────────────────────
   ALERTS
───────────────────────────────────── */
.alert {
  padding: 0.65rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;
  margin-bottom: 1rem;

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

/* ─────────────────────────────────────
   ANIMATIONS
───────────────────────────────────── */
@keyframes heart-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
