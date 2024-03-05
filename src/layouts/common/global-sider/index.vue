<template>
  <dark-mode-container
    class="z-20 h-full flex-vertical-stretch shadow-[2px_0_8px_0_rgba(29,35,41,0.05)]"
    :inverted="theme.sider.inverted"
  >
    <global-logo
      v-if="showLogo"
      :show-title="showTitle"
      class="overflow-hidden transition-base"
      :style="{
        width: logoWidth,
        height: theme.header.height + 'px'
      }"
    />
    <n-layout-sider
      class="h-0 flex-1"
      :show-trigger="theme.sider.showTrigger !== 'headerIcon' && theme.sider.showTrigger"
      :trigger-style="theme.sider.showTrigger === 'arrow-circle' ? 'top: 240px' : ''"
      :collapsed-trigger-style="theme.sider.showTrigger === 'arrow-circle' ? 'top: 240px' : ''"
      :collapse-mode="theme.sider.showTrigger === 'bar' ? 'transform' : 'width'"
      :collapsed="app.siderCollapse"
      :collapsed-width="collapsedWidth"
      :width="theme.sider.width"
      :native-scrollbar="false"
      :inverted="!theme.darkMode && theme.sider.inverted"
      @collapse="app.setSiderCollapse(true)"
      @expand="app.setSiderCollapse(false)"
    >
      <n-menu
        :value="activeKey"
        :inverted="!theme.darkMode && theme.sider.inverted"
        :collapsed="app.siderCollapse"
        :collapsed-width="collapsedWidth"
        :collapsed-icon-size="22"
        :options="routeStore.menus"
        :expanded-keys="expandedKeys"
        @update:value="handleUpdateMenu"
        @update:expanded-keys="handleUpdateExpandedKeys"
      />
    </n-layout-sider>
    <!-- siderBar 遮罩 -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isMobile && !app.siderCollapse"
          class="sider-mask absolute-lt z-200 wh-full bg-[rgba(0,0,0,.2)]"
          @click="app.setSiderCollapse(true)"
        ></div>
      </transition>
    </Teleport>
  </dark-mode-container>
</template>

<script setup>
import { getActiveKeyPathsOfMenus } from '@/router';
import { useAppStore, useRouteStore, useThemeStore } from '@/store';
import { useBasicLayout, useRouterPush } from '@/utils';
import GlobalLogo from '../global-logo/index.vue';

defineOptions({ name: 'GlobalSider' });
defineProps({
  showLogo: Boolean
});

const route = useRoute();
const app = useAppStore();
const routeStore = useRouteStore();
const { routerPush } = useRouterPush();
const theme = useThemeStore();
const { isMobile, mode } = useBasicLayout();

const activeKey = computed(() => (route.meta?.activeMenu ? route.meta.activeMenu : route.name));
const expandedKeys = ref([]);

function handleUpdateMenu(_key, item) {
  const menuItem = item;
  routerPush(menuItem.routePath);
}

function handleUpdateExpandedKeys(keys) {
  expandedKeys.value = keys;
}

const showTitle = computed(() => !app.siderCollapse);

/** 折叠后的宽度 */
const collapsedWidth = computed(() =>
  isMobile.value || theme.sider.showTrigger === 'bar' ? 0 : theme.sider.collapsedWidth
);
/** logo的宽度 */
const logoWidth = computed(() => {
  if (theme.logo.isCustomizeWidth && mode.value !== 'vertical') {
    return `${theme.logo.width}px`;
  }
  return app.siderCollapse ? `${collapsedWidth.value}px` : `${theme.sider.width}px`;
});

watch(
  () => route.name,
  () => {
    expandedKeys.value = getActiveKeyPathsOfMenus(activeKey.value, routeStore.menus);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped></style>
