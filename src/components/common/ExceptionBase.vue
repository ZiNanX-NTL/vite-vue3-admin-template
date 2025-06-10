<script setup>
defineOptions({ name: 'ExceptionBase' });

defineProps({
  type: {
    validator(value) {
      return ['403', '404', '500'].includes(value);
    },
    required: true
  }
});
</script>

<template>
  <div class="wrap-class flex-vertical-center gap-24px size-full min-h-520px overflow-hidden">
    <div class="wrap-class text-400px text-primary flex">
      <icon-local-no-permission v-if="type === '403'" />
      <icon-local-not-found v-if="type === '404'" />
      <icon-local-service-error v-if="type === '500'" />
    </div>
    <RouterLink :to="{ name: 'root' }">
      <NButton type="primary">回到首页</NButton>
    </RouterLink>
  </div>
</template>

<style scoped></style>
