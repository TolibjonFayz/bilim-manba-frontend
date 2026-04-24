<template>
  <div class="admin-categories">
    <div class="admin-page__header">
      <h1 class="admin-page__title">Kategoriyalar</h1>
      <button class="btn btn--primary" @click="showForm = true">
        + Yangi kategoriya
      </button>
    </div>

    <!-- Create/Edit form -->
    <div v-if="showForm" class="admin-form-card" style="margin-bottom: 1.5rem">
      <h3 style="font-weight: 700; margin-bottom: 1.25rem">
        {{ editingId ? "Kategoriyani tahrirlash" : "Yangi kategoriya" }}
      </h3>

      <div v-if="error" class="alert alert--danger">⚠️ {{ error }}</div>

      <div class="admin-form">
        <div class="form-group">
          <label>Nomi *</label>
          <div class="form-input-wrap">
            <input
              v-model="form.name"
              type="text"
              placeholder="Kategoriya nomi"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Slug *</label>
          <div class="form-input-wrap">
            <input
              v-model="form.slug"
              type="text"
              placeholder="kategoriya-slug"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Icon (emoji)</label>
          <div class="form-input-wrap">
            <input v-model="form.icon" type="text" placeholder="📚" />
          </div>
        </div>

        <div class="admin-form__btns">
          <button
            class="btn btn--primary"
            :disabled="loading"
            @click="handleSubmit"
          >
            {{
              loading ? "Saqlanmoqda..." : editingId ? "Saqlash" : "Qo'shish"
            }}
          </button>
          <button class="btn btn--outline" @click="resetForm">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="admin-table-wrap" v-loading="loading">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Nomi</th>
            <th>Slug</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in adminStore.categories" :key="cat.id">
            <td style="font-size: 1.5rem">{{ cat.icon ?? "📚" }}</td>
            <td>
              <strong>{{ cat.name }}</strong>
            </td>
            <td>
              <span class="admin-table__slug">{{ cat.slug }}</span>
            </td>
            <td>
              <div class="admin-table__actions">
                <button
                  class="admin-table__btn admin-table__btn--edit"
                  @click="startEdit(cat)"
                >
                  ✏️
                </button>
                <button
                  class="admin-table__btn admin-table__btn--delete"
                  @click="handleDelete(cat.id, cat.name)"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from "element-plus";

definePageMeta({ middleware: "admin", layout: "admin" });

const adminStore = useAdminStore();
const loading = ref(false);
const showForm = ref(false);
const editingId = ref<number | null>(null);
const error = ref("");

const form = reactive({
  name: "",
  slug: "",
  icon: "",
});

watch(
  () => form.name,
  (val) => {
    if (val && !editingId.value) {
      form.slug = val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  },
);

onMounted(async () => {
  loading.value = true;
  await adminStore.getCategories();
  loading.value = false;
});

const startEdit = (cat: any) => {
  editingId.value = cat.id;
  form.name = cat.name;
  form.slug = cat.slug;
  form.icon = cat.icon ?? "";
  showForm.value = true;
};

const resetForm = () => {
  editingId.value = null;
  showForm.value = false;
  error.value = "";
  Object.assign(form, { name: "", slug: "", description: "", icon: "" });
};

const handleSubmit = async () => {
  error.value = "";

  if (!form.name.trim()) {
    error.value = "Nom kiriting";
    return;
  }
  if (!form.slug.trim()) {
    error.value = "Slug kiriting";
    return;
  }

  loading.value = true;

  let res;
  if (editingId.value) {
    res = await adminStore.updateCategory(editingId.value, form);
  } else {
    res = await adminStore.createCategory(form);
  }

  loading.value = false;

  if (res.success) {
    ElMessage({
      type: "success",
      message: editingId.value ? "Yangilandi!" : "Qo'shildi!",
    });
    resetForm();
    await adminStore.getCategories();
  } else {
    error.value = res.message;
  }
};

const handleDelete = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(
      `"${name}" kategoriyasini o'chirishni tasdiqlaysizmi?`,
      "O'chirish",
      {
        confirmButtonText: "Ha, o'chir",
        cancelButtonText: "Bekor",
        type: "warning",
      },
    );
    const res = await adminStore.deleteCategory(id);
    if (res.success) {
      ElMessage({ type: "success", message: "Kategoriya o'chirildi!" });
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

.admin-form-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 1.75rem;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__btns {
    display: flex;
    gap: 0.75rem;
  }
}

.admin-table-wrap {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
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
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background: $bg-secondary;
  }

  &__slug {
    font-size: 0.8rem;
    color: $text-muted;
    font-family: monospace;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
  }
}

.form-input-wrap {
  display: flex;
  border: 1.5px solid $border-color;
  border-radius: $border-radius-sm;
  background: #fff;
  transition: all 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.12);
  }

  input,
  select {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: transparent;
    color: $text-primary;
    font-family: $font-primary;

    &::placeholder {
      color: $text-muted;
    }
  }
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;
  margin-bottom: 1rem;

  &--danger {
    background: rgba($danger, 0.08);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
  }
}
</style>
