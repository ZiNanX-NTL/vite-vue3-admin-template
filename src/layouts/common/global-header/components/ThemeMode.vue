<script setup>
import { useThemeStore } from '@/store';

defineOptions({ name: 'ThemeMode' });

const theme = useThemeStore();
</script>

<template>
  <HoverContainer class="w-40px" :inverted="theme.header.inverted" tooltip-content="主题模式">
    <DarkModeSwitch :dark="theme.darkMode" class="size-full" @update:dark="theme.setDarkMode" />
  </HoverContainer>
</template>

<style scoped></style>
