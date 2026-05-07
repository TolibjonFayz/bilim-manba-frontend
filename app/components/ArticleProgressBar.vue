<template>
  <div class="progress-bar" :style="{ width: progress + '%' }" />
</template>

<script setup lang="ts">
const progress = ref(0);

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progress.value =
    docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
};

onMounted(() => window.addEventListener("scroll", updateProgress));
onUnmounted(() => window.removeEventListener("scroll", updateProgress));
</script>

<style lang="scss" scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: $primary;
  z-index: 9999;
  transition: width 0.1s ease;
  border-radius: 0 2px 2px 0;
}
</style>
