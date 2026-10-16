<template>
  <div class="admin-users">
    <div class="page-head">
      <div>
        <h1 class="admin-page__title">👥 Foydalanuvchilar</h1>
        <p class="page-head__sub">
          Saytda ro'yxatdan o'tganlar. <strong>Faollik</strong> — o'qigan
          maqolalari, like, izoh va saqlaganlari;
          <strong>oxirgi faollik</strong> — oxirgi marta o'qigan, like yoki izoh
          qoldirgan vaqti.
        </p>
      </div>
    </div>

    <!-- Qisqa xulosa -->
    <div class="summary">
      <div class="summary__item">
        <span>Jami</span><strong>{{ users.length }}</strong>
      </div>
      <div class="summary__item">
        <span>So'nggi 7 kunda qo'shilgan</span
        ><strong>{{ newThisWeek }}</strong>
      </div>
      <div class="summary__item">
        <span>Faol (30 kun ichida)</span><strong>{{ activeCount }}</strong>
      </div>
      <div class="summary__item">
        <span>⭐ Premium</span><strong>{{ premiumCount }}</strong>
      </div>
    </div>

    <!-- Qidiruv va filtr -->
    <div class="toolbar">
      <input
        v-model="search"
        class="toolbar__search"
        type="search"
        placeholder="Ism yoki email bo'yicha qidirish…"
        aria-label="Foydalanuvchi qidirish"
      />
      <div class="chips">
        <button
          v-for="f in FILTERS"
          :key="f.key"
          class="chips__btn"
          :class="{ 'is-active': filter === f.key }"
          @click="filter = f.key"
        >
          {{ f.label }} <small>{{ counts[f.key] }}</small>
        </button>
      </div>
    </div>

    <div v-loading="loading" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Foydalanuvchi</th>
            <th>Tarif</th>
            <th>Faollik</th>
            <th>Oxirgi faollik</th>
            <th>Ro'yxatdan o'tgan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in filtered"
            :key="u.id"
            :class="{ 'is-blocked': u.isActive === false }"
          >
            <td>
              <div class="person">
                <span
                  class="person__avatar"
                  :style="{ background: avatarColor(u.id) }"
                  >{{ initials(u.fullName) }}</span
                >
                <div class="person__info">
                  <strong>
                    {{ u.fullName }}
                    <span v-if="u.role === 'admin'" class="tag tag--admin"
                      >Admin</span
                    >
                    <span v-if="u.isActive === false" class="tag tag--bad"
                      >Bloklangan</span
                    >
                  </strong>
                  <small>{{ u.email }}</small>
                </div>
              </div>
            </td>
            <td>
              <span v-if="u.plan === 'premium'" class="tag tag--premium"
                >⭐ Premium</span
              >
              <span v-else class="tag">Bepul</span>
              <small
                v-if="u.plan === 'premium' && u.premiumExpiresAt"
                class="muted-line"
              >
                {{ formatDate(u.premiumExpiresAt) }} gacha
              </small>
            </td>
            <td>
              <div
                class="activity"
                :title="`${u.reads} ta o'qish, ${u.likes} like, ${u.comments} izoh, ${u.bookmarks} saqlangan`"
              >
                <span>📖 {{ u.reads }}</span>
                <span>❤️ {{ u.likes }}</span>
                <span>💬 {{ u.comments }}</span>
                <span>🔖 {{ u.bookmarks }}</span>
              </div>
            </td>
            <td>
              <span :class="activityClass(u.lastActiveAt)">{{
                u.lastActiveAt ? timeAgo(u.lastActiveAt) : "Hali faollik yo'q"
              }}</span>
            </td>
            <td>
              {{ formatDate(u.createdAt) }}
              <small class="muted-line">{{ timeAgo(u.createdAt) }}</small>
            </td>
          </tr>
          <tr v-if="!loading && !filtered.length">
            <td colspan="5" class="empty">Hech kim topilmadi.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const adminStore = useAdminStore();
const loading = ref(false);
const search = ref("");
const filter = ref<"all" | "active" | "inactive" | "premium" | "admin">("all");

const FILTERS = [
  { key: "all", label: "Hammasi" },
  { key: "active", label: "Faol" },
  { key: "inactive", label: "Faol emas" },
  { key: "premium", label: "Premium" },
  { key: "admin", label: "Adminlar" },
] as const;

onMounted(async () => {
  loading.value = true;
  await adminStore.getUsers();
  loading.value = false;
});

const users = computed<any[]>(() => adminStore.users ?? []);
const DAY = 86400000;
const isActive = (u: any) =>
  u.lastActiveAt && Date.now() - new Date(u.lastActiveAt).getTime() < 30 * DAY;

const matchers: Record<string, (u: any) => boolean> = {
  all: () => true,
  active: (u) => Boolean(isActive(u)),
  inactive: (u) => !isActive(u),
  premium: (u) => u.plan === "premium",
  admin: (u) => u.role === "admin",
};

const counts = computed<Record<string, number>>(() =>
  Object.fromEntries(
    FILTERS.map((f) => [f.key, users.value.filter(matchers[f.key]!).length]),
  ),
);
const newThisWeek = computed(
  () =>
    users.value.filter(
      (u) => Date.now() - new Date(u.createdAt).getTime() < 7 * DAY,
    ).length,
);
const activeCount = computed(() => counts.value.active);
const premiumCount = computed(() => counts.value.premium);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return users.value.filter(
    (u) =>
      matchers[filter.value]!(u) &&
      (!q ||
        String(u.fullName).toLowerCase().includes(q) ||
        String(u.email).toLowerCase().includes(q)),
  );
});

const initials = (name: string) =>
  String(name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const COLORS = [
  "#5850ec",
  "#ff6584",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];
const avatarColor = (id: number) => COLORS[id % COLORS.length];

const activityClass = (d: string | null) => {
  if (!d) return "muted";
  const days = (Date.now() - new Date(d).getTime()) / DAY;
  return days < 7 ? "fresh" : days < 30 ? "" : "muted";
};
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 1.25rem;

  &__sub {
    font-size: 0.85rem;
    color: $text-secondary;
    margin-top: 0.35rem;
    line-height: 1.55;
    max-width: 760px;
  }
}

.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  &__item {
    background: $bg-primary;
    border: 1px solid $border-color;
    border-radius: $border-radius;
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    span {
      font-size: 0.78rem;
      color: $text-secondary;
    }

    strong {
      font-size: 1.5rem;
      font-weight: 800;
    }
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;

  &__search {
    flex: 1 1 260px;
    max-width: 380px;
    padding: 0.55rem 0.85rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-pill;
    font-family: $font-primary;
    font-size: 0.88rem;
    background: $bg-primary;

    &:focus {
      outline: 2px solid rgba(var(--c-primary-rgb), 0.3);
      border-color: $primary;
    }
  }
}

.chips {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;

  &__btn {
    border: 1px solid $border-color;
    background: $bg-primary;
    border-radius: $border-radius-pill;
    padding: 0.35rem 0.8rem;
    font-family: $font-primary;
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-secondary;
    cursor: pointer;

    small {
      color: $text-muted;
      font-weight: 500;
      margin-left: 0.15rem;
    }

    &.is-active {
      border-color: $primary;
      background: rgba(var(--c-primary-rgb), 0.08);
      color: $primary;
    }
  }
}

.table-wrap {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow-x: auto;
  min-height: 120px;
}

.table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: $bg-secondary;
    padding: 0.8rem 0.9rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid $border-color;
    white-space: nowrap;
  }

  td {
    padding: 0.8rem 0.9rem;
    border-bottom: 1px solid $border-color;
    font-size: 0.85rem;
    vertical-align: middle;
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: $bg-secondary;
  }

  tr.is-blocked td {
    opacity: 0.6;
  }
}

.person {
  display: flex;
  align-items: center;
  gap: 0.7rem;

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;

    strong {
      font-size: 0.88rem;
    }

    small {
      color: $text-muted;
      font-size: 0.76rem;
    }
  }
}

.activity {
  display: flex;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: $text-secondary;
}

.tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: $border-radius-pill;
  background: $bg-secondary;
  color: $text-secondary;
  vertical-align: middle;

  &--admin {
    background: rgba(#764ba2, 0.1);
    color: #764ba2;
    margin-left: 0.3rem;
  }

  &--premium {
    background: linear-gradient(135deg, #ffb347, #ff6584);
    color: #fff;
  }

  &--bad {
    background: rgba($danger, 0.1);
    color: #b91c1c;
    margin-left: 0.3rem;
  }
}

.muted-line {
  display: block;
  font-size: 0.74rem;
  color: $text-muted;
  margin-top: 0.15rem;
}

.fresh {
  color: #15803d;
  font-weight: 600;
}

.muted {
  color: $text-muted;
}

.empty {
  text-align: center;
  color: $text-muted;
  padding: 2rem !important;
}
</style>
