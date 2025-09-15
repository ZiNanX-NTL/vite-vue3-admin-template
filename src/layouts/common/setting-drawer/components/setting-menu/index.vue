<script setup>
defineOptions({ name: 'SettingMenu' });

defineProps({
  label: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="flex-y-center justify-between">
    <span>{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped></style>
