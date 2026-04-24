<template>
  <div class="admin-users">
    <h1 class="admin-page__title">Foydalanuvchilar</h1>

    <div class="admin-table-wrap" v-loading="loading">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ism</th>
            <th>Email</th>
            <th>Role</th>
            <th>Plan</th>
            <th>Sana</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, i) in adminStore.users" :key="user.id">
            <td>{{ i + 1 }}</td>
            <td>
              <strong>{{ user.fullName }}</strong>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span
                class="admin-table__badge"
                :class="
                  user.role === 'admin' ? 'admin-table__badge--admin' : ''
                "
              >
                {{ user.role }}
              </span>
            </td>
            <td>
              <span
                class="admin-table__badge"
                :class="
                  user.plan === 'premium' ? 'admin-table__badge--premium' : ''
                "
              >
                {{ user.plan }}
              </span>
            </td>
            <td>
              {{
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("uz-UZ")
                  : "—"
              }}
            </td>
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

onMounted(async () => {
  loading.value = true;
  await adminStore.getUsers();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.admin-page__title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
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

  &__badge {
    background: rgba($primary, 0.1);
    color: $primary;
    padding: 0.2rem 0.6rem;
    border-radius: $border-radius-pill;
    font-size: 0.75rem;
    font-weight: 600;

    &--admin {
      background: rgba(#764ba2, 0.1);
      color: #764ba2;
    }

    &--premium {
      background: linear-gradient(135deg, #ffb347, #ff6584);
      color: #fff;
    }
  }
}
</style>
