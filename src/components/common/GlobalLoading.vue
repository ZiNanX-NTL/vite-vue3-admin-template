<script setup>
import { useAppStore } from '@/store';

defineOptions({ name: 'GlobalLoading' });

const app = useAppStore();
</script>

<template>
  <Transition name="fade">
    <AppLoading v-if="app.loadingVisible" :add-theme-to-body="false" class="bg-[rgba(0,0,0,.5)] z-10000">
      <h2 class="text-28px text-#e8e8e8 font-500">
        {{ app.loadingTitle }}
      </h2>
    </AppLoading>
  </Transition>
</template>

<style lang="scss" scoped></style>
