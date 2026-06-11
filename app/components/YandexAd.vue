<template>
  <div class="yandex-ad">
    <div id="yandex_rtb_R-A-19425390-1"></div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  if (process.client && window.yaContextCb) {
    window.yaContextCb.push(() => {
      Ya.Context.AdvManager.render({
        blockId: "R-A-19425390-1",
        renderTo: "yandex_rtb_R-A-19425390-1",
      });
    });
  }
});
</script>

<style scoped>
.yandex-ad {
  margin: 2rem 0;
  text-align: center;
  min-height: 100px;
}
</style>
