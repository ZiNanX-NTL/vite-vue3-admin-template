<template>
  <n-breadcrumb class="px-12px">
    <template v-for="breadcrumb in breadcrumbs" :key="breadcrumb.key">
      <n-breadcrumb-item>
        <n-dropdown v-if="breadcrumb.hasChildren" :options="breadcrumb.options" @select="dropdownSelect">
          <span>
            <component
              :is="breadcrumb.icon"
              v-if="theme.header.crumb.showIcon"
              class="mr-4px inline-block align-text-bottom text-16px"
            />
            <span>{{ breadcrumb.label }}</span>
          </span>
        </n-dropdown>
        <template v-else>
          <component
            :is="breadcrumb.icon"
            v-if="theme.header.crumb.showIcon"
            class="mr-4px inline-block align-text-bottom text-16px"
            :class="{ 'text-#BBBBBB': theme.header.inverted }"
          />
          <span :class="{ 'text-#BBBBBB': theme.header.inverted }">
            {{ breadcrumb.label }}
          </span>
        </template>
      </n-breadcrumb-item>
    </template>
  </n-breadcrumb>
</template>

<script setup>
import { transformRouteNameToRoutePath } from '@/router';
import { useRouteStore, useThemeStore } from '@/store';
import { getBreadcrumbByRouteKey, useRouterPush } from '@/utils';

defineOptions({ name: 'GlobalBreadcrumb' });

const route = useRoute();
const theme = useThemeStore();
const routeStore = useRouteStore();
const { routerPush } = useRouterPush();

const breadcrumbs = computed(() =>
  getBreadcrumbByRouteKey(route.name, routeStore.menus, transformRouteNameToRoutePath('root'))
);

function dropdownSelect(key) {
  routerPush({ name: key });
}
</script>

<style scoped></style>
