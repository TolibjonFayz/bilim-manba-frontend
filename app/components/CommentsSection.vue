<template>
  <div class="comments">
    <h2 class="comments__title">
      💬 Izohlar
      <span class="comments__count">{{ totalCount }}</span>
    </h2>

    <!-- Yangi izoh forma -->
    <div v-if="authStore.isLoggedIn" class="comment-form">
      <div class="comment-form__avatar">
        {{ authStore.user?.email?.[0]?.toUpperCase() }}
      </div>
      <div class="comment-form__body">
        <textarea
          v-model="newComment"
          class="comment-form__input"
          placeholder="Fikringizni yozing..."
          rows="3"
          maxlength="1000"
        />
        <div class="comment-form__actions">
          <span class="comment-form__counter"
            >{{ newComment.length }}/1000</span
          >
          <button
            class="btn btn--primary comment-form__submit"
            :disabled="!newComment.trim() || posting"
            @click="submitComment()"
          >
            {{ posting ? "Yuborilmoqda..." : "Izoh qoldirish" }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="comment-login-prompt">
      Izoh qoldirish uchun
      <NuxtLink to="/login" class="comment-login-prompt__link">kiring</NuxtLink>
    </div>

    <!-- Izohlar ro'yxati -->
    <div v-if="commentStore.comments.length" class="comment-list">
      <div v-for="c in commentStore.comments" :key="c.id" class="comment">
        <div class="comment__avatar">
          {{ c.user?.fullName?.[0]?.toUpperCase() }}
        </div>
        <div class="comment__body">
          <div class="comment__header">
            <span class="comment__author">
              {{ c.user?.fullName }}
              <span v-if="c.user?.role === 'admin'" class="comment__badge"
                >Admin</span
              >
            </span>
            <span class="comment__date">{{ formatDate(c.createdAt) }}</span>
          </div>
          <p class="comment__content">{{ c.content }}</p>
          <div class="comment__footer">
            <button class="comment__action" @click="toggleReply(c.id)">
              Javob berish
            </button>
            <button
              v-if="canDelete(c)"
              class="comment__action comment__action--danger"
              :disabled="deletingId === c.id"
              @click="removeComment(c.id)"
            >
              <span v-if="deletingId === c.id" class="comment__spinner" />
              {{ deletingId === c.id ? "O'chirilmoqda..." : "O'chirish" }}
            </button>
          </div>

          <!-- Reply forma -->
          <div
            v-if="replyTo === c.id && authStore.isLoggedIn"
            class="reply-form"
          >
            <textarea
              v-model="replyContent"
              class="comment-form__input"
              placeholder="Javobingizni yozing..."
              rows="2"
              maxlength="1000"
            />
            <div class="comment-form__actions">
              <button class="comment__action" @click="replyTo = null">
                Bekor
              </button>
              <button
                class="btn btn--primary comment-form__submit"
                :disabled="!replyContent.trim() || replyPosting"
                @click="submitComment(c.id)"
              >
                {{ replyPosting ? "Yuborilmoqda..." : "Yuborish" }}
              </button>
            </div>
          </div>

          <!-- Javoblar -->
          <div v-if="c.replies?.length" class="comment-replies">
            <div
              v-for="r in c.replies"
              :key="r.id"
              class="comment comment--reply"
            >
              <div class="comment__avatar comment__avatar--sm">
                {{ r.user?.fullName?.[0]?.toUpperCase() }}
              </div>
              <div class="comment__body">
                <div class="comment__header">
                  <span class="comment__author">
                    {{ r.user?.fullName }}
                    <span v-if="r.user?.role === 'admin'" class="comment__badge"
                      >Admin</span
                    >
                  </span>
                  <span class="comment__date">{{
                    formatDate(r.createdAt)
                  }}</span>
                </div>
                <p class="comment__content">{{ r.content }}</p>
                <div class="comment__footer">
                  <button
                    v-if="canDelete(r)"
                    class="comment__action comment__action--danger"
                    :disabled="deletingId === r.id"
                    @click="removeComment(r.id)"
                  >
                    <span v-if="deletingId === r.id" class="comment__spinner" />
                    {{ deletingId === r.id ? "O'chirilmoqda..." : "O'chirish" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="comments__empty">
      <span>💭</span>
      <p>Hali izoh yo'q. Birinchi bo'lib fikr bildiring!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";

const props = defineProps<{ articleId: number }>();

const commentStore = useCommentStore();
const authStore = useAuthStore();
const userStore = useUserStore();

const newComment = ref("");
const replyContent = ref("");
const replyTo = ref<number | null>(null);
const posting = ref(false);
const replyPosting = ref(false);
const deletingId = ref<number | null>(null);

const totalCount = computed(() => {
  let count = commentStore.comments.length;
  commentStore.comments.forEach((c: any) => {
    count += c.replies?.length ?? 0;
  });
  return count;
});

const currentUserId = computed(() => {
  try {
    return Number(localStorage.getItem("userid"));
  } catch {
    return null;
  }
});

const canDelete = (comment: any) => {
  return (
    comment.userId === currentUserId.value || authStore.user?.role === "admin"
  );
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`;
  return d.toLocaleDateString("uz-UZ");
};

const toggleReply = (id: number) => {
  if (!authStore.isLoggedIn) {
    navigateTo("/login");
    return;
  }
  replyTo.value = replyTo.value === id ? null : id;
  replyContent.value = "";
};

const submitComment = async (parentId?: number) => {
  const content = parentId ? replyContent.value : newComment.value;
  if (!content.trim()) return;

  // Reply bo'lsa replyPosting, aks holda posting
  if (parentId) {
    replyPosting.value = true;
  } else {
    posting.value = true;
  }

  const res = await commentStore.addComment(props.articleId, content, parentId);

  if (parentId) {
    replyPosting.value = false;
  } else {
    posting.value = false;
  }

  if (res.success) {
    newComment.value = "";
    replyContent.value = "";
    replyTo.value = null;
    await commentStore.getComments(props.articleId);
  } else {
    ElNotification({ title: "Xato", message: res.message, type: "error" });
  }
};

const removeComment = async (id: number) => {
  deletingId.value = id;
  const res = await commentStore.deleteComment(id);
  if (res.success) {
    await commentStore.getComments(props.articleId);
  } else {
    ElNotification({ title: "Xato", message: res.message, type: "error" });
  }
  deletingId.value = null;
};

onMounted(() => {
  commentStore.getComments(props.articleId);
});
</script>

<style lang="scss" scoped>
.comments {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: $border-radius;
  padding: 2rem;
  margin-bottom: 2rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  &__count {
    font-size: 0.85rem;
    background: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    padding: 0.15rem 0.6rem;
    border-radius: $border-radius-pill;
    font-weight: 600;
  }

  &__empty {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--color-text-muted);

    span {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 0.9rem;
    }
  }
}

.comment-form {
  display: flex;
  gap: 0.85rem;
  margin-bottom: 2rem;
  padding: 1.25rem;
  background: #f8f7ff;
  border: 1px solid #eeedf5;
  border-radius: $border-radius;

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #f59e0b);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__input {
    width: 100%;
    border: 1.5px solid #d9d8e8;
    border-radius: $border-radius-sm;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-family: $font-primary;
    color: #1a1a2e;
    background: #ffffff;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #6366f1;
    }
    &::placeholder {
      color: #9ca3af;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  &__counter {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-right: auto;
  }

  &__submit {
    padding: 0.5rem 1.25rem;
    font-size: 0.85rem;
  }
}

.comment-login-prompt {
  background: #f8f7ff;
  border: 1px solid #eeedf5;
  border-radius: $border-radius-sm;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 2rem;

  &__link {
    color: #6366f1;
    font-weight: 700;
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem;
  background: #ffffff;
  border: 1px solid #e5e4ef;
  border-radius: $border-radius;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &--reply {
    background: #f8f7ff;
    border-color: #e5e4ef;
    margin-top: 0;
    padding: 0.85rem;
    gap: 0.65rem;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #6366f1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;

    &--sm {
      width: 32px;
      height: 32px;
      font-size: 0.85rem;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
  }

  &__author {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__badge {
    font-size: 0.65rem;
    background: #6366f1;
    color: #fff;
    padding: 0.1rem 0.45rem;
    border-radius: $border-radius-pill;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__date {
    font-size: 0.65rem;
    color: #9ca3af;
  }

  &__content {
    font-size: 0.80rem;
    color: #4a5568;
    line-height: 1.6;
    word-break: break-word;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.65rem;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    background: #f4f3fb;
    border: 1px solid #e5e4ef;
    border-radius: $border-radius-pill;
    padding: 0.3rem 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: $font-primary;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &__spinner {
      width: 11px;
      height: 11px;
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-top-color: #ef4444;
      border-radius: 50%;
      animation: comment-spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    &:hover {
      background: #eef2ff;
      border-color: #6366f1;
      color: #6366f1;
    }

    &--danger {
      color: #ef4444;

      &:hover {
        background: rgba(239, 68, 68, 0.08);
        border-color: #ef4444;
        color: #ef4444;
      }
    }
  }
}

.reply-form {
  margin-top: 0.85rem;
}

.comment-replies {
  margin-top: 0.85rem;
  padding-left: 0.85rem;
  border-left: 2px solid #e5e4ef;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

/* ─────────────────────────────────────
   DARK MODE
───────────────────────────────────── */
:global(.dark) .comment-form {
  background: #1a1a2e;
  border-color: #2d2d44;
}
:global(.dark) .comment-form__input {
  background: #0f0f1a;
  border-color: #2d2d44;
  color: #f1f5f9;
}
:global(.dark) .comment-login-prompt {
  background: #1a1a2e;
  border-color: #2d2d44;
  color: #a0aec0;
}
:global(.dark) .comment {
  background: #1a1a2e;
  border-color: #2d2d44;
  box-shadow: none;
}
:global(.dark) .comment--reply {
  background: #0f0f1a;
}
:global(.dark) .comment__author {
  color: #f1f5f9;
}
:global(.dark) .comment__content {
  color: #a0aec0;
}
:global(.dark) .comment-replies {
  border-left-color: #2d2d44;
}
:global(.dark) .comment__action {
  background: #252538;
  border-color: #2d2d44;
  color: #a0aec0;

  &:hover {
    background: #2d2d44;
    border-color: #818cf8;
    color: #818cf8;
  }
}

/* ─────────────────────────────────────
   RESPONSIVE — mobile (576px)
───────────────────────────────────── */
@media (max-width: $mobile) {
  .comments {
    padding: 1.25rem;

    &__title {
      font-size: 1.1rem;
    }
  }

  .comment-form {
    padding: 1rem;
    gap: 0.6rem;

    &__avatar {
      width: 34px;
      height: 34px;
      font-size: 0.85rem;
    }

    &__actions {
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    &__counter {
      font-size: 0.7rem;
    }

    &__submit {
      flex: 1;
      justify-content: center;
    }
  }

  .comment {
    padding: 0.9rem;
    gap: 0.6rem;

    &__avatar {
      width: 34px;
      height: 34px;
      font-size: 0.85rem;

      &--sm {
        width: 28px;
        height: 28px;
        font-size: 0.75rem;
      }
    }

    &__header {
      gap: 0.4rem;
    }
    &__author {
      font-size: 0.85rem;
    }
    &__content {
      font-size: 0.85rem;
    }
    &__footer {
      gap: 0.5rem;
    }
  }

  .comment-replies {
    padding-left: 0.6rem;
  }
}

/* ─────────────────────────────────────
   RESPONSIVE — 360px va kichik
───────────────────────────────────── */
@media (max-width: 360px) {
  .comments {
    padding: 1rem;

    &__title {
      font-size: 1rem;
      gap: 0.35rem;
    }

    &__count {
      font-size: 0.78rem;
      padding: 0.1rem 0.5rem;
    }
  }

  .comment-form {
    padding: 0.85rem;
    gap: 0;

    &__avatar {
      display: none;
    }

    &__input {
      padding: 0.65rem 0.8rem;
      font-size: 16px;
    }

    &__actions {
      margin-top: 0.6rem;
    }

    &__submit {
      width: 100%;
      padding: 0.55rem 1rem;
      font-size: 0.8rem;
    }
  }

  .comment-login-prompt {
    padding: 0.85rem;
    font-size: 0.82rem;
  }

  .comment {
    padding: 0.75rem;
    gap: 0.5rem;

    &__avatar {
      width: 30px;
      height: 30px;
      font-size: 0.78rem;

      &--sm {
        width: 26px;
        height: 26px;
        font-size: 0.7rem;
      }
    }

    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.15rem;
    }

    &__author {
      font-size: 0.82rem;
    }
    &__badge {
      font-size: 0.6rem;
      padding: 0.08rem 0.4rem;
    }
    &__date {
      font-size: 0.7rem;
    }
    &__content {
      font-size: 0.82rem;
      line-height: 1.5;
    }

    &__footer {
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    &__action {
      font-size: 0.72rem;
      padding: 0.28rem 0.65rem;
    }
  }

  .comment-replies {
    padding-left: 0.5rem;
    margin-top: 0.6rem;
  }

  .reply-form {
    .comment-form__input {
      font-size: 16px;
      padding: 0.6rem 0.75rem;
    }
  }

  .comments__empty {
    padding: 2rem 0.75rem;

    span {
      font-size: 1.5rem;
    }
    p {
      font-size: 0.82rem;
    }
  }
}

@keyframes comment-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
