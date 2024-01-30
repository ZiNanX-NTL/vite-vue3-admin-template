<template>
  <div class="wrap-class flex-vertical-center gap-24px min-h-520px wh-full overflow-hidden">
    <div class="wrap-class flex text-400px text-primary">
      <icon-local-no-permission v-if="type === '403'" />
      <icon-local-not-found v-if="type === '404'" />
      <icon-local-service-error v-if="type === '500'" />
    </div>
    <router-link :to="{ name: 'root' }">
      <n-button type="primary">回到首页</n-button>
    </router-link>
  </div>
</template>

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

<style scoped></style>
