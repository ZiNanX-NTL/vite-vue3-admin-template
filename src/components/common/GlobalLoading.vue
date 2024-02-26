<template>
  <transition name="fade">
    <AppLoading v-if="app.loadingVisible" :add-theme-to-body="false" class="bg-[rgba(0,0,0,.5)] z-10000">
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
