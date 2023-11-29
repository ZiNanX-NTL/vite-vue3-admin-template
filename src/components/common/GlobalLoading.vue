<template>
  <transition name="fade">
    <AppLoading
      v-if="app.loadingVisible"
      title="加载中..."
      :add-theme-to-body="false"
      class="bg-#00000050 z-10000"
    ></AppLoading>
  </transition>
</template>

<script setup>
import { useAppStore } from '@/store';

const app = useAppStore();
</script>

<style lang="scss" scoped></style>
