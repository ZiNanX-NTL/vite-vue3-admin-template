<template>
  <transition name="fade">
    <AppLoading v-if="app.loadingVisible" :add-theme-to-body="false" class="z-10000 bg-[rgba(0,0,0,.5)]">
      <h2 class="text-28px font-500 text-#e8e8e8">{{ app.loadingTitle }}</h2>
    </AppLoading>
  </transition>
</template>

<script setup>
import { useAppStore } from '@/store';

defineOptions({ name: 'GlobalLoading' });

const app = useAppStore();
</script>

<style lang="scss" scoped></style>
