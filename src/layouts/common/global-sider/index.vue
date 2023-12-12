<template>
  <dark-mode-container
    class="flex-col-stretch h-full shadow-[2px_0_8px_0_rgba(29,35,41,0.05)] z-20"
    :inverted="theme.sider.inverted"
  >
    <global-logo
      v-if="showLogo"
      :show-title="showTitle"
      class="overflow-hidden transition-base"
      :style="{
        width: app.siderCollapse ? collapsedWidth + 'px' : theme.sider.width + 'px',
        height: theme.header.height + 'px'
      }"
    />
    <n-layout-sider
      class="flex-1 h-0"
      :show-trigger="theme.sider.showTrigger !== 'headerIcon' && theme.sider.showTrigger"
      collapse-mode="width"
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
const { isMobile } = useBasicLayout();

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

// 折叠后的宽度
const collapsedWidth = computed(() => (isMobile ? 0 : theme.sider.collapsedWidth));

watch(
  () => route.name,
  () => {
    expandedKeys.value = getActiveKeyPathsOfMenus(activeKey.value, routeStore.menus);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped></style>
