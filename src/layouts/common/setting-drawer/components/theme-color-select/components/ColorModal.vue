<script setup>
import { traditionColors } from '@/settings';
import { useThemeStore } from '@/store';
import ColorCheckbox from './ColorCheckbox.vue';

defineOptions({ name: 'ColorModal' });

defineProps({
  visible: Boolean
});

const emit = defineEmits(['close']);

const theme = useThemeStore();

function handleClose() {
  emit('close');
}
</script>

<template>
  <NModal :show="visible" preset="card" class="h-480px w-640px" :z-index="10001" @close="handleClose">
    <div class="flex-x-center">
      <NGradientText type="primary" :size="24">中国传统颜色</NGradientText>
    </div>
    <NTabs>
      <NTabPane v-for="item in traditionColors" :key="item.label" :name="item.label" :tab="item.label">
        <NGrid :cols="8" :x-gap="16" :y-gap="8">
          <NGridItem v-for="i in item.data" :key="i.label">
            <ColorCheckbox
              class="!h-36px !w-full !rounded-4px"
              :color="i.color"
              :checked="i.color === theme.themeColor"
              icon-class="text-20px"
              @click="theme.setThemeColor(i.color)"
            />
            <p class="text-center">{{ i.label }}</p>
          </NGridItem>
        </NGrid>
      </NTabPane>
    </NTabs>
  </NModal>
</template>

<style scoped></style>
