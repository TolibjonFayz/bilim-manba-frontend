<template>
  <div class="admin-articles">
    <div class="admin-page__header">
      <h1 class="admin-page__title">Maqolalar</h1>
      <NuxtLink to="/admin/articles/create" class="btn btn--primary">
        + Yangi maqola
      </NuxtLink>
    </div>

    <div class="admin-table-wrap" v-loading="loading">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sarlavha</th>
            <th>Kategoriya</th>
            <th>Ko'rishlar</th>
            <th>Like</th>
            <th>Sana</th>
            <th>Amal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in adminStore.articles" :key="article.id">
            <td>
              <div class="admin-table__title">{{ article.title }}</div>
              <div class="admin-table__slug">{{ article.slug }}</div>
            </td>
            <td>
              <span class="admin-table__badge">
                {{ article.category?.name ?? "—" }}
              </span>
            </td>
            <td>👁 {{ article.viewCount }}</td>
            <td>❤️ {{ article.likeCount }}</td>
            <td>
              {{
                article.createdAt
                  ? new Date(article.createdAt).toLocaleDateString("uz-UZ")
                  : "—"
              }}
            </td>
            <td>
              <div class="admin-table__actions">
                <NuxtLink
                  :to="`/admin/articles/${article.id}/edit`"
                  class="admin-table__btn admin-table__btn--edit"
                >
                  ✏️
                </NuxtLink>
                <button
                  class="admin-table__btn admin-table__btn--delete"
                  @click="handleDelete(article.id, article.title)"
                >
                  🗑️
                </button>
              </div>
            </td>
            <td>
              <button
                class="status-badge"
                :class="
                  article.status === 'published'
                    ? 'status-badge--published'
                    : 'status-badge--draft'
                "
                @click="handleToggleStatus(article)"
              >
                {{
                  article.status === "published"
                    ? "✅ Chop etilgan"
                    : "📝 Qoralama"
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!adminStore.articles.length && !loading" class="admin-empty">
        <span>📝</span>
        <p>Hali maqola yo'q</p>
        <NuxtLink to="/admin/articles/create" class="btn btn--primary">
          Birinchi maqolani qo'shing
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({ middleware: "admin", layout: "admin" });

const adminStore = useAdminStore();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await adminStore.getArticles();
  loading.value = false;
});

const handleToggleStatus = async (article: any) => {
  const newStatus = article.status === "published" ? "draft" : "published";
  const res = await adminStore.updateArticle(article.id, { status: newStatus });
  if (res.success) {
    article.status = newStatus;
    ElMessage({
      type: "success",
      message:
        newStatus === "published"
          ? "✅ Chop etildi!"
          : "📝 Qoralamaga o'tkazildi!",
    });
  }
};

const handleDelete = async (id: number, title: string) => {
  try {
    await ElMessageBox.confirm(
      `"${title}" maqolasini o'chirishni tasdiqlaysizmi?`,
      "O'chirish",
      {
        confirmButtonText: "Ha, o'chir",
        cancelButtonText: "Bekor",
        type: "warning",
      },
    );
    const res = await adminStore.deleteArticle(id);
    if (res.success) {
      ElMessage({ type: "success", message: "Maqola o'chirildi!" });
    }
  } catch {}
};
</script>

<style lang="scss" scoped>
.admin-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
}

.admin-table-wrap {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: $font-primary;
  transition: all 0.2s;
  white-space: nowrap;

  &--published {
    background: rgba(#43d98b, 0.12);
    color: #1a9e5e;
    &:hover {
      background: rgba(#43d98b, 0.2);
    }
  }

  &--draft {
    background: rgba($text-muted, 0.12);
    color: $text-muted;
    &:hover {
      background: rgba($text-muted, 0.2);
    }
  }
}

.admin-table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: $bg-secondary;
    padding: 0.875rem 1rem;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid $border-color;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid $border-color;
    font-size: 0.875rem;
    color: $text-primary;
    vertical-align: middle;

    &:last-child {
      border-bottom: none;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background: $bg-secondary;
  }

  &__title {
    font-weight: 600;
    margin-bottom: 0.2rem;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__slug {
    font-size: 0.75rem;
    color: $text-muted;
  }

  &__badge {
    background: rgba($primary, 0.1);
    color: $primary;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
    font-size: 0.75rem;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  &__btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    transition: all 0.15s;

    &--edit {
      background: rgba($primary, 0.1);
      &:hover {
        background: rgba($primary, 0.2);
      }
    }

    &--delete {
      background: rgba($danger, 0.1);
      &:hover {
        background: rgba($danger, 0.2);
      }
    }
  }
}

.admin-empty {
  padding: 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 3rem;

  p {
    font-size: 1rem;
    color: $text-secondary;
  }
}
</style>
