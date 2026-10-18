<template>
  <section v-if="st && st.state !== 'none'" class="fc" :class="`is-${tone}`">
    <header class="fc__head">
      <strong class="fc__title">
        <template v-if="st.state === 'running'"
          >⏳ AI faktlarni tekshiryapti…</template
        >
        <template v-else-if="st.state === 'failed'"
          >⚠️ Fakt-tekshiruv bajarilmadi</template
        >
        <template v-else-if="st.issues.length"
          >🔍 Fakt-tekshiruv: {{ st.issues.length }} ta shubhali joy</template
        >
        <template v-else>✅ Fakt-tekshiruv: shubhali joy topilmadi</template>
      </strong>
      <button
        v-if="st.canRecheck"
        type="button"
        class="btn btn--outline fc__btn"
        :disabled="st.state === 'running'"
        @click="recheck"
      >
        🔄 Qayta tekshirish
      </button>
    </header>
    <p class="fc__hint">
      <template v-if="st.state === 'failed'">{{ st.error }}</template>
      <template v-else-if="st.issues.length">
        AI maqolani manbalar bilan solishtirdi. Quyidagi joylar matnda
        <mark>sariq</mark> bilan belgilangan — "Tahrirlash"da tuzating yoki
        to'g'ri bo'lsa, shunday qoldiring. Tuzatgach "Qayta tekshirish"ni
        bosing.
      </template>
      <template v-else-if="st.state === 'done'">
        Raqamlar, sanalar va ismlar manbalarga mos. Baribir bir ko'z yugurtirib
        chiqing.
      </template>
    </p>
    <ol v-if="st.issues.length" class="fc__list">
      <li v-for="(it, i) in st.issues" :key="i" class="fc__item">
        <button
          type="button"
          class="fc__quote"
          @click="$emit('focus', it.quote)"
        >
          <span class="fc__tag" :class="`is-${it.type}`">{{
            it.type === "zid" ? "Manbaga zid" : "Manbada yo'q"
          }}</span>
          «{{ it.quote }}»
        </button>
        <p class="fc__note">{{ it.note }}</p>
        <p v-if="it.fix" class="fc__fix">✏️ Manbaga ko'ra: {{ it.fix }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

/**
 * Admin ko'rish sahifasi: AI fakt-tekshiruvi natijasi. Qayta tekshirish fonda
 * ishlaydi — natija kelguncha har 4 soniyada so'raladi.
 */
export interface FactIssue {
  quote: string;
  type: "zid" | "tasdiqlanmagan";
  note: string;
  fix?: string;
}
interface Status {
  state: "none" | "running" | "done" | "failed";
  issues: FactIssue[];
  error?: string | null;
  canRecheck: boolean;
}

const props = defineProps<{ articleId: number }>();
const emit = defineEmits<{ issues: [FactIssue[]]; focus: [string] }>();
const adminStore = useAdminStore();
const st = ref<Status | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

const tone = computed(() =>
  st.value?.state === "failed"
    ? "warn"
    : st.value?.issues.length
      ? "warn"
      : st.value?.state === "done"
        ? "ok"
        : "info",
);

const load = async () => {
  const res = await adminStore.factCheckApi(props.articleId, "GET");
  if (!res.success) return;
  st.value = res.data;
  emit("issues", res.data?.issues ?? []);
  if (timer) clearTimeout(timer);
  if (res.data?.state === "running") timer = setTimeout(load, 4000);
};

const recheck = async () => {
  const res = await adminStore.factCheckApi(props.articleId, "POST");
  if (!res.success) return ElMessage({ type: "error", message: res.message });
  st.value = res.data;
  emit("issues", []);
  timer = setTimeout(load, 4000);
};

onMounted(load);
onBeforeUnmount(() => timer && clearTimeout(timer));
</script>

<style lang="scss" scoped>
.fc {
  border: 1px solid $border-color;
  border-left-width: 4px;
  border-radius: $border-radius-sm;
  background: $bg-primary;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;

  &.is-warn {
    border-left-color: #f59e0b;
  }
  &.is-ok {
    border-left-color: var(--c-success-strong);
  }
  &.is-info {
    border-left-color: $primary;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 1rem;
  }

  &__btn {
    border: 1.5px solid $border-color;
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
  }

  &__hint {
    margin-top: 0.4rem;
    font-size: 0.86rem;
    color: $text-secondary;
    line-height: 1.55;

    &:empty {
      display: none;
    }
  }

  &__list {
    margin-top: 0.85rem;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__quote {
    text-align: left;
    background: none;
    padding: 0;
    color: $text-primary;
    font-weight: 600;
    font-size: 0.92rem;
    line-height: 1.5;
    cursor: pointer;

    &:hover {
      color: $primary;
    }
  }

  &__tag {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.1rem 0.45rem;
    border-radius: $border-radius-pill;
    margin-right: 0.35rem;
    vertical-align: 0.1em;

    &.is-zid {
      background: rgba(239, 68, 68, 0.14);
      color: var(--c-danger-text);
    }
    &.is-tasdiqlanmagan {
      background: rgba(245, 158, 11, 0.16);
      color: var(--c-warning-text);
    }
  }

  &__note {
    font-size: 0.86rem;
    color: $text-secondary;
    margin-top: 0.2rem;
  }

  &__fix {
    font-size: 0.86rem;
    color: var(--c-success-text);
    margin-top: 0.15rem;
  }

  mark {
    background: rgba(250, 204, 21, 0.45);
    color: inherit;
    padding: 0 0.15em;
    border-radius: 3px;
  }
}
</style>
