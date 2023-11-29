<template>
  <icon-local-logo-fill v-if="fill" />
  <icon-local-logo v-else />
</template>

<script setup>
defineOptions({ name: 'SystemLogo' });

defineProps({
  fill: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped></style>
