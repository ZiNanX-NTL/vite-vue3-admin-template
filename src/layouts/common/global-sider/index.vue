<script setup lang="ts">
import type { MenuOption } from 'naive-ui';
import { getActiveKeyPathsOfMenus } from '@/router';
import { useAppStore, useRouteStore, useThemeStore } from '@/store';
import { useBasicLayout, useIsMobile } from '@/utils';
import { useMenu, useMixMenuContext } from '../../context';
import GlobalLogo from '../global-logo/index.vue';

defineOptions({ name: 'GlobalSider' });
defineProps<{
  showLogo: boolean;
}>();

const route = useRoute();
const app = useAppStore();
const routeStore = useRouteStore();
const theme = useThemeStore();
const { mode } = useBasicLayout();
const isMobile = useIsMobile();

const {
  firstLevelMenus,
  childLevelMenus,
  activeFirstLevelMenuKey,
  setActiveFirstLevelMenuKey,
  isActiveFirstLevelMenuHasChildren
} = useMixMenuContext();
const { activeKey, handleUpdateMenu } = useMenu();

const expandedKeys = ref<string[]>([]);

/** 更新选中菜单分离混合路由菜单 */
function handleUpdateMixMenu(key: string, item: MenuOption) {
  if (theme.layout.isMenuInverted) {
    handleUpdateMenu(key, item);
  } else {
    setActiveFirstLevelMenuKey(key);

    if (!isActiveFirstLevelMenuHasChildren.value) {
      handleUpdateMenu(key, item);
    } else {
      // 默认选中子菜单的第一个
      handleUpdateMenu(childLevelMenus.value[0].key, childLevelMenus.value[0]);
    }
  }
}

const showTitle = computed(() => !app.siderCollapse);

/** 折叠后的宽度 */
const collapsedWidth = computed(() => {
  const width = isMobile.value || theme.sider.showTrigger === 'bar' ? 0 : theme.sider.collapsedWidth;
  if (!(theme.layout.isMenuSeparation && theme.layout.isMenuInverted))
    return width;
  if (childLevelMenus.value.length)
    return width;
  return 0;
});
/** sider的宽度 */
const siderWidth = computed(() => {
  if (!(theme.layout.isMenuSeparation && theme.layout.isMenuInverted))
    return theme.sider.width;
  if (childLevelMenus.value.length)
    return theme.sider.width;
  return 0;
});
/** logo的宽度 */
const logoWidth = computed(() => {
  if (theme.logo.isCustomizeWidth && mode.value !== 'vertical') {
    return `${theme.logo.width}px`;
  }
  return app.siderCollapse ? `${collapsedWidth.value}px` : `${siderWidth.value}px`;
});

watch(
  () => route.name,
  () => {
    expandedKeys.value = getActiveKeyPathsOfMenus(activeKey.value, routeStore.menus);
  },
  { immediate: true }
);
</script>

<template>
  <DarkModeContainer
    class="flex-vertical-stretch h-full shadow-[2px_0_8px_0_rgba(29,35,41,0.05)] z-20 !transition-base"
    :class="theme.sider.inverted ? 'bg-invert' : ''"
    :inverted="theme.sider.inverted"
  >
    <GlobalLogo
      v-if="showLogo"
      :show-title="showTitle"
      class="transition-base overflow-hidden"
      :style="{
        width: logoWidth,
        height: `${theme.header.height}px`,
      }"
    />
    <NLayoutSider
      class="flex-1 h-0"
      :show-trigger="theme.sider.showTrigger !== 'headerIcon' && theme.sider.showTrigger"
      :trigger-style="theme.sider.showTrigger === 'arrow-circle' ? 'top: 240px' : ''"
      :collapsed-trigger-style="theme.sider.showTrigger === 'arrow-circle' ? 'top: 240px' : ''"
      :collapse-mode="theme.sider.showTrigger === 'bar' ? 'transform' : 'width'"
      :collapsed="app.siderCollapse"
      :collapsed-width="collapsedWidth"
      :width="siderWidth"
      :native-scrollbar="false"
      :inverted="!theme.darkMode && theme.sider.inverted"
      @collapse="app.setSiderCollapse(true)"
      @expand="app.setSiderCollapse(false)"
    >
      <NMenu
        v-if="!theme.layout.isMenuSeparation"
        v-model:expanded-keys="expandedKeys"
        :value="activeKey"
        :inverted="!theme.darkMode && theme.sider.inverted"
        :collapsed="app.siderCollapse"
        :collapsed-width="collapsedWidth"
        :collapsed-icon-size="22"
        :options="routeStore.menus"
        @update:value="handleUpdateMenu"
      />
      <NMenu
        v-else
        v-model:expanded-keys="expandedKeys"
        :value="theme.layout.isMenuInverted ? activeKey : activeFirstLevelMenuKey"
        :inverted="!theme.darkMode && theme.sider.inverted"
        :collapsed="app.siderCollapse"
        :collapsed-width="collapsedWidth"
        :collapsed-icon-size="22"
        :options="theme.layout.isMenuInverted ? childLevelMenus : firstLevelMenus"
        @update:value="handleUpdateMixMenu"
      />
    </NLayoutSider>
    <!-- siderBar 遮罩 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isMobile && !app.siderCollapse"
          class="sider-mask bg-[rgba(0,0,0,.2)] size-full absolute-lt z-200"
          @click="app.setSiderCollapse(true)"
        />
      </Transition>
    </Teleport>
  </DarkModeContainer>
</template>

<style lang="scss" scoped></style>
