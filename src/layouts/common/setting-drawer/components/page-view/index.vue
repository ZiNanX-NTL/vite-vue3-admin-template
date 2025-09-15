<script setup>
import { useThemeStore } from '@/store';
import SettingMenu from '../setting-menu/index.vue';

defineOptions({ name: 'PageView' });

const theme = useThemeStore();
</script>

<template>
  <NDivider title-placement="center">
    界面显示
  </NDivider>
  <NSpace vertical size="large">
    <SettingMenu label="面包屑">
      <NSwitch :value="theme.header.crumb.visible" @update:value="theme.setHeaderCrumbVisible" />
    </SettingMenu>
    <SettingMenu label="面包屑图标">
      <NSwitch :value="theme.header.crumb.showIcon" @update:value="theme.setHeaderCrumbIconVisible" />
    </SettingMenu>
    <SettingMenu label="顶部菜单位置">
      <NSelect
        class="w-120px"
        size="small"
        :value="theme.headerMenu.horizontalPosition"
        :options="theme.headerMenu.horizontalPositionList"
        @update:value="theme.setHorizontalMenuPosition"
      />
    </SettingMenu>
    <SettingMenu label="顶部菜单溢出">
      <NSelect
        class="w-120px"
        size="small"
        :value="theme.headerMenu.overflowMode"
        :options="theme.headerMenu.overflowModeList"
        @update:value="theme.setHorizontalMenuOverflowMode"
      />
    </SettingMenu>
    <SettingMenu label="多页签">
      <NSwitch :value="theme.tab.visible" @update:value="theme.setTabVisible" />
    </SettingMenu>
    <SettingMenu label="多页签溢出">
      <NSelect
        class="w-120px"
        size="small"
        :value="theme.tab.scrollMode"
        :options="theme.tab.scrollModeList"
        @update:value="theme.setTabMode"
      />
    </SettingMenu>
    <SettingMenu label="页面切换动画">
      <NSwitch :value="theme.page.animate" @update:value="theme.setPageIsAnimate" />
    </SettingMenu>
    <SettingMenu label="页面切换动画类型">
      <NSelect
        class="w-120px"
        size="small"
        :value="theme.page.animateMode"
        :options="theme.page.animateModeList"
        @update:value="theme.setPageAnimateMode"
      />
    </SettingMenu>
    <SettingMenu label="菜单折叠方式">
      <NSelect
        class="w-120px"
        size="small"
        :value="theme.sider.showTrigger"
        :options="theme.sider.showTriggerList"
        @update:value="theme.setSiderShowTrigger"
      />
    </SettingMenu>
  </NSpace>
</template>

<style scoped></style>
