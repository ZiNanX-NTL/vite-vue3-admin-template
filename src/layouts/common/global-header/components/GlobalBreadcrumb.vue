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

<template>
  <NBreadcrumb class="px-12px">
    <template v-for="breadcrumb in breadcrumbs" :key="breadcrumb.key">
      <NBreadcrumbItem>
        <NDropdown v-if="breadcrumb.hasChildren" :options="breadcrumb.options" @select="dropdownSelect">
          <span>
            <component
              :is="breadcrumb.icon"
              v-if="theme.header.crumb.showIcon"
              class="text-16px mr-4px align-text-bottom inline-block"
            />
            <span>{{ breadcrumb.label }}</span>
          </span>
        </NDropdown>
        <template v-else>
          <component
            :is="breadcrumb.icon"
            v-if="theme.header.crumb.showIcon"
            class="text-16px mr-4px align-text-bottom inline-block"
            :class="{ 'text-#BBBBBB': theme.header.inverted }"
          />
          <span :class="{ 'text-#BBBBBB': theme.header.inverted }">
            {{ breadcrumb.label }}
          </span>
        </template>
      </NBreadcrumbItem>
    </template>
  </NBreadcrumb>
</template>

<style scoped></style>
