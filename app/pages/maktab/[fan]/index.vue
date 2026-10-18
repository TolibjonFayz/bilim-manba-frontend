<template>
  <SchoolPage />
</template>

<script setup lang="ts">
// Fan/sinf o'zgarsa sahifa qayta quriladi (sarlavha, 404 tekshiruvi)
definePageMeta({ key: (route) => route.path });
</script>
