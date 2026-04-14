<template>
  <div class="layout">
    <TheNavbar />
    <main class="layout__main">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
  }
}
</style>
