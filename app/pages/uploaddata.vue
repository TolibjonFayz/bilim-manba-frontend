<template>
  <div class="upload-data">
    <h1 class="upload-data__title">Ma'lumot yuklash</h1>
    <form @submit.prevent="handleSubmit" class="upload-data__form">
      <div class="upload-data__form-group">
        <label for="content" class="upload-data__form-label">
          Maqola matni:
        </label>
        <textarea
          id="content"
          v-model="form.content"
          required
          class="upload-data__form-textarea"
        ></textarea>
      </div>
      <button type="submit" class="upload-data__form-button">Yuklash</button>

      <div>Natija: {{ result }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const form = ref({
  content: "",
});

const result = ref("");

const handleSubmit = async () => {
  const res = await axios.post(
    "https://climavent-back-production.up.railway.app/api/r2/r2-upload",
    {
      data: form.value.content,
    },
  );
  result.value = res.data.url;
};
</script>

<style lang="scss" scoped>
.upload-data {
  &__title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  &__form {
    display: flex;
    flex-direction: column;

    &-group {
      margin-bottom: 12px;

      &-label {
        margin-bottom: 4px;
        font-weight: bold;
      }

      &-input,
      &-textarea {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px;
        font-size: 14px;

        &:focus {
          border-color: #007bff;
          outline: none;
        }
      }

      &-textarea {
        min-height: 100px;
      }
    }

    &-button {
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 12px 16px;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        background-color: darken(#007bff, 5%);
      }
    }
  }
}
</style>
