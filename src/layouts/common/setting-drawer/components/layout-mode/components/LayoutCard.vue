<script setup>
defineOptions({ name: 'LayoutCard' });

const props = defineProps({
  /** 布局模式 */
  mode: {
    type: String,
    default: ''
  },
  /** 布局模式文本 */
  label: {
    type: String,
    default: ''
  },
  /** 选中状态 */
  checked: Boolean
});

const layoutConfig = {
  vertical: {
    placement: 'bottom',
    headerClass: '',
    menuClass: 'w-1/3 h-full',
    mainClass: 'w-2/3 h-3/4'
  },
  'vertical-mix': {
    placement: 'bottom',
    headerClass: '',
    menuClass: 'w-1/4 h-full',
    mainClass: 'w-2/3 h-3/4'
  },
  horizontal: {
    placement: 'bottom',
    headerClass: '',
    menuClass: 'w-full h-1/4',
    mainClass: 'w-full h-3/4'
  }
};

const activeConfig = computed(() => layoutConfig[props.mode]);
</script>

<template>
  <div
    class="border-2px rounded-6px cursor-pointer hover:border-primary"
    :class="[checked ? 'border-primary' : 'border-transparent']"
  >
    <NTooltip :placement="activeConfig.placement" trigger="hover">
      <template #trigger>
        <div
          class="layout-card__shadow p-6px rd-4px gap-6px h-64px w-96px"
          :class="[mode === 'vertical' ? 'flex' : 'flex-vertical']"
        >
          <slot></slot>
        </div>
      </template>
      <span>{{ label }}</span>
    </NTooltip>
  </div>
</template>

<style scoped>
.layout-card__shadow {
  box-shadow: 0 1px 2.5px rgba(0, 0, 0, 0.18);
}
</style>
