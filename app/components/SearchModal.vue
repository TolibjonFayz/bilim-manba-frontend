<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="open" class="search-modal" @click.self="close">
        <div class="search-modal__box">
          <!-- Input -->
          <div class="search-modal__input-row">
            <Icon
              name="lucide:search"
              size="1.2em"
              mode="css"
              class="search-modal__icon"
            />
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              placeholder="Maqola qidirish..."
              class="search-modal__input"
              @input="onInput"
              @keydown.esc="close"
              @keydown.down.prevent="moveDown"
              @keydown.up.prevent="moveUp"
              @keydown.enter.prevent="openSelected"
            />
            <kbd class="search-modal__kbd">ESC</kbd>
            <button class="search-modal__close" @click="close">
              <Icon name="lucide:x" size="1.1em" mode="css" />
            </button>
          </div>

          <!-- Results -->
          <div ref="resultsEl" class="search-modal__results">
            <!-- Loading -->
            <div v-if="loading" class="search-modal__state">
              <span class="search-modal__spinner" />
              Qidirilmoqda...
            </div>

            <!-- 1 harf -->
            <div v-else-if="query.length === 1" class="search-modal__state">
              <span class="search-modal__state-emoji">✍️</span>
              Yana kamida 1 ta harf yozing
            </div>

            <!-- Natija yo'q -->
            <div
              v-else-if="query.length >= 2 && !results.length"
              class="search-modal__state"
            >
              <span class="search-modal__state-emoji">🔍</span>
              "{{ query }}" bo'yicha hech narsa topilmadi
            </div>

            <!-- Bo'sh holat — recent searches -->
            <template v-else-if="!query.length">
              <div v-if="recentSearches.length" class="search-modal__recent">
                <div class="search-modal__recent-head">
                  <span>So'nggi qidiruvlar</span>
                  <button
                    class="search-modal__recent-clear"
                    @click="clearRecent"
                  >
                    Tozalash
                  </button>
                </div>
                <button
                  v-for="(term, i) in recentSearches"
                  :key="i"
                  class="search-modal__recent-item"
                  @click="applyRecent(term)"
                >
                  <Icon name="lucide:clock" size="0.95em" mode="css" />
                  <span>{{ term }}</span>
                  <Icon
                    name="lucide:arrow-up-left"
                    size="0.9em"
                    mode="css"
                    class="search-modal__recent-arrow"
                  />
                </button>
              </div>
              <div v-else class="search-modal__state">
                <span class="search-modal__state-emoji">⌨️</span>
                Qidirish uchun yozishni boshlang
              </div>
            </template>

            <!-- Natijalar -->
            <NuxtLink
              v-for="(item, i) in results"
              :key="item.id"
              :ref="(el) => setItemRef(el, i)"
              :to="`/articles/${item.slug}`"
              class="search-result"
              :class="{ 'search-result--active': i === activeIndex }"
              @click="onResultClick"
              @mouseenter="activeIndex = i"
            >
              <div class="search-result__cover">
                <img
                  v-if="item.coverImage"
                  :src="item.coverImage"
                  :alt="item.title"
                />
                <div v-else class="search-result__cover-ph">📄</div>
              </div>
              <div class="search-result__info">
                <span class="search-result__cat">{{
                  item.category?.name
                }}</span>
                <h4
                  class="search-result__title"
                  v-html="highlight(item.title)"
                />
                <p
                  class="search-result__excerpt"
                  v-html="highlight(item.excerpt)"
                />
              </div>
              <Icon
                name="lucide:corner-down-left"
                size="0.9em"
                mode="css"
                class="search-result__enter"
              />
            </NuxtLink>
          </div>

          <!-- Footer -->
          <div class="search-modal__footer">
            <template v-if="results.length">
              <span
                ><strong>{{ results.length }}</strong> ta natija</span
              >
              <span class="search-modal__hints">
                <kbd>↑</kbd><kbd>↓</kbd> tanlash <kbd>↵</kbd> ochish
              </span>
            </template>
            <span v-else class="search-modal__hints">
              <kbd>Ctrl</kbd>+<kbd>K</kbd> qidiruvni ochish
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>();
const emit = defineEmits(["close"]);

const articleStore = useArticleStore();
const query = ref("");
const results = ref<any[]>([]);
const loading = ref(false);
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const resultsEl = ref<HTMLElement | null>(null);
const itemRefs = ref<any[]>([]);
const recentSearches = ref<string[]>([]);
let debounceTimer: any = null;

const RECENT_KEY = "bilimmanba_recent_searches";

// ── Recent searches ──
const loadRecent = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    recentSearches.value = raw ? JSON.parse(raw) : [];
  } catch {
    recentSearches.value = [];
  }
};

const saveRecent = (term: string) => {
  const t = term.trim();
  if (t.length < 2) return;
  let list = recentSearches.value.filter(
    (x) => x.toLowerCase() !== t.toLowerCase(),
  );
  list.unshift(t);
  list = list.slice(0, 5); // oxirgi 5 ta
  recentSearches.value = list;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
};

const clearRecent = () => {
  recentSearches.value = [];
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
};

const applyRecent = (term: string) => {
  query.value = term;
  onInput();
};

// ── Match highlight ──
const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlight = (text: string) => {
  if (!text) return "";
  const safe = escapeHtml(text);
  const q = query.value.trim();
  if (q.length < 2) return safe;
  // regex special belgilarni escape
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  return safe.replace(re, '<mark class="search-hl">$1</mark>');
};

// ── Search ──
const onInput = () => {
  clearTimeout(debounceTimer);
  activeIndex.value = 0;
  if (query.value.trim().length < 2) {
    results.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  debounceTimer = setTimeout(async () => {
    const res = await articleStore.searchArticles(query.value);
    if (res.success) results.value = res.data;
    loading.value = false;
  }, 350);
};

// ── Keyboard navigatsiya ──
const moveDown = () => {
  if (!results.value.length) return;
  activeIndex.value = (activeIndex.value + 1) % results.value.length;
  scrollToActive();
};

const moveUp = () => {
  if (!results.value.length) return;
  activeIndex.value =
    (activeIndex.value - 1 + results.value.length) % results.value.length;
  scrollToActive();
};

const openSelected = () => {
  const item = results.value[activeIndex.value];
  if (item) {
    saveRecent(query.value);
    navigateTo(`/articles/${item.slug}`);
    close();
  }
};

const scrollToActive = () => {
  nextTick(() => {
    const el =
      itemRefs.value[activeIndex.value]?.$el ??
      itemRefs.value[activeIndex.value];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
};

const setItemRef = (el: any, i: number) => {
  if (el) itemRefs.value[i] = el;
};

const onResultClick = () => {
  saveRecent(query.value);
  close();
};

// ── Close ──
const close = () => {
  emit("close");
  query.value = "";
  results.value = [];
  activeIndex.value = 0;
};

// ── Ctrl+K / Cmd+K global shortcut ──
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (!props.open) {
      // ota komponentga ochish signali — open prop o'zgarishi kerak
      window.dispatchEvent(new CustomEvent("open-search"));
    }
  }
};

watch(
  () => props.open,
  (val) => {
    if (val) {
      loadRecent();
      activeIndex.value = 0;
      nextTick(() => inputEl.value?.focus());
    }
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  clearTimeout(debounceTimer);
});
</script>

<style lang="scss" scoped>
.search-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  padding-top: 10vh;

  @media (max-width: $mobile) {
    padding-top: 0;
  }

  &__box {
    width: 100%;
    max-width: 600px;
    height: fit-content;
    max-height: 70vh;
    background: #ffffff;
    border: 1px solid #eeedf5;
    border-radius: $border-radius-lg;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 0 1rem;
    position: relative;
    z-index: 1;

    @media (max-width: $mobile) {
      max-width: 100%;
      max-height: 100%;
      height: 100%;
      border-radius: 0;
      margin: 0;
    }
  }

  &__input-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);

    @media (max-width: $mobile) {
      padding: 1rem;
      padding-top: max(1rem, env(safe-area-inset-top));
    }
  }

  &__icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 1rem;
    color: var(--color-text-primary);
    font-family: $font-primary;

    @media (max-width: $mobile) {
      font-size: 16px;
    }
    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &__kbd {
    flex-shrink: 0;
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--color-text-muted);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 5px;
    padding: 0.15rem 0.4rem;
    font-family: $font-mono;

    @media (max-width: $mobile) {
      display: none;
    }
  }

  &__close {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    background: var(--color-bg-secondary);
    transition: all 0.2s;

    &:hover {
      color: var(--color-danger);
    }
  }

  &__results {
    overflow-y: auto;
    flex: 1;
    -webkit-overflow-scrolling: touch;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem 2rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    text-align: center;
  }

  &__state-emoji {
    font-size: 2.25rem;
  }

  &__spinner {
    width: 24px;
    height: 24px;
    border: 2.5px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  // Recent searches
  &__recent {
    padding: 0.75rem 0;
  }

  &__recent-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1.25rem;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }

  &__recent-clear {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-primary);
    text-transform: none;
    letter-spacing: 0;
    background: none;
    &:hover {
      text-decoration: underline;
    }
  }

  &__recent-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.65rem 1.25rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    background: none;
    text-align: left;
    transition: background 0.15s;
    font-family: $font-primary;

    &:hover {
      background: var(--color-bg-secondary);
    }

    span {
      flex: 1;
      min-width: 0;
    }
  }

  &__recent-arrow {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1.25rem;
    border-top: 1px solid var(--color-border);
    font-size: 0.78rem;
    color: var(--color-text-muted);

    strong {
      color: var(--color-text-secondary);
    }
  }

  &__hints {
    display: flex;
    align-items: center;
    gap: 0.3rem;

    kbd {
      font-size: 0.65rem;
      font-weight: 600;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 0.1rem 0.35rem;
      font-family: $font-mono;
    }

    @media (max-width: $mobile) {
      display: none;
    }
  }
}

.search-result {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  transition: all 0.18s ease;
  position: relative;

  // Hover + keyboard active — bir xil ko'rinish
  &:hover,
  &--active {
    background: var(--color-bg-secondary);
    padding-left: 1.6rem; // 👈 chapga silliq suriladi

    .search-result__enter {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &--active {
    box-shadow: inset 3px 0 0 var(--color-primary); // 👈 chap chiziq
  }

  @media (max-width: $mobile) {
    padding: 1rem;
  }

  &__cover {
    width: 56px;
    height: 56px;
    border-radius: $border-radius-sm;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--color-bg-secondary);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__cover-ph {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__cat {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.3;
    margin: 0.15rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__excerpt {
    font-size: 0.78rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__enter {
    color: var(--color-primary);
    opacity: 0;
    transform: translateX(-6px);
    transition: all 0.18s ease;
    flex-shrink: 0;

    @media (max-width: $mobile) {
      display: none;
    }
  }
}

.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ── Highlight (global — v-html ichidagi mark uchun) ──
:deep(.search-hl) {
  background: rgba(99, 102, 241, 0.18);
  color: var(--color-primary);
  font-weight: 700;
  border-radius: 3px;
  padding: 0 1px;
}

// ── Dark mode ──
:global(.dark) .search-modal__box {
  background: #1a1a2e;
  border-color: #2d2d44;
}
:global(.dark) .search-modal__input {
  color: #f1f5f9;
}
:global(.dark) .search-result__title {
  color: #f1f5f9;
}
:global(.dark) .search-result:hover,
:global(.dark) .search-result--active {
  background: #0f0f1a;
}
</style>
