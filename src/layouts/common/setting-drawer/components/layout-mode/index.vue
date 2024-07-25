<template>
  <n-divider title-placement="center">布局模式</n-divider>
  <n-space justify="space-around" :wrap="true" :size="24" class="px-12px">
    <layout-card
      v-for="item in theme.layout.modeList"
      :key="item.value"
      :mode="item.value"
      :label="item.label"
      :checked="item.value === theme.layout.mode"
      @click="theme.setLayoutMode(item.value)"
    >
      <template v-if="item.value === 'vertical'">
        <div class="h-full w-18px rd-4px bg-primary:50"></div>
        <div class="flex-vertical flex-1 gap-6px">
          <div class="h-16px rd-4px bg-primary"></div>
          <div class="flex-1 rd-4px bg-primary:25"></div>
        </div>
      </template>
      <template v-if="item.value === 'horizontal'">
        <div class="h-16px rd-4px bg-primary"></div>
        <div class="flex flex-1 gap-6px">
          <div class="flex-1 rd-4px bg-primary:25"></div>
        </div>
      </template>
      <template v-if="item.value === 'vertical-mix'">
        <div class="h-16px rd-4px bg-primary"></div>
        <div class="flex flex-1 gap-6px">
          <div class="w-18px rd-4px bg-primary:50"></div>
          <div class="flex-1 rd-4px bg-primary:25"></div>
        </div>
      </template>
    </layout-card>
  </n-space>
  <n-space v-if="mode === 'vertical' || mode === 'vertical-mix'" vertical size="large" class="mt-12px">
    <setting-menu label="菜单左上分离">
      <n-switch :value="theme.layout.isMenuSeparation" @update:value="theme.setMenuSeparation" />
    </setting-menu>
    <setting-menu v-if="theme.layout.isMenuSeparation" label="菜单左上反转">
      <n-switch :value="theme.layout.isMenuInverted" @update:value="theme.setMenuInverted" />
    </setting-menu>
  </n-space>
</template>

<script setup>
import { useThemeStore } from '@/store';
import { useBasicLayout } from '@/utils';
import SettingMenu from '../setting-menu/index.vue';
import { LayoutCard } from './components';

defineOptions({ name: 'LayoutMode' });

const theme = useThemeStore();
const { mode } = useBasicLayout();
</script>

<style scoped>
.layout-card__shadow {
  box-shadow: 0 1px 2.5px rgba(0, 0, 0, 0.18);
}
</style>
