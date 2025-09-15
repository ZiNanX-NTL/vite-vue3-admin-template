<script setup>
defineOptions({
  name: 'LookForward'
});
</script>

<template>
  <div>
    <div class="flex-vertical-center gap-24px size-full min-h-520px overflow-hidden">
      <div class="text-400px text-primary flex">
        <SvgIcon local-icon="expectation" />
      </div>
      <slot>
        <h3 class="text-28px text-primary font-500">
          敬请期待
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped></style>
