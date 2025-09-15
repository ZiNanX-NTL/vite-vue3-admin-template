<script setup>
import { useLoading } from '@/hooks';
import { useRouteStore } from '@/store';

defineOptions({ name: 'ReloadButton' });

const { reCacheRoute } = useRouteStore();
const route = useRoute();
const { loading, startLoading, endLoading } = useLoading();

async function handleRefresh() {
  startLoading();

  await reCacheRoute(route.name);

  setTimeout(() => {
    endLoading();
  }, 1000);
}
</script>

<template>
  <HoverContainer class="h-full w-64px" tooltip-content="重新加载" placement="bottom" @click="handleRefresh">
    <icon-mdi-refresh class="text-22px" :class="{ 'animate-spin': loading }" />
  </HoverContainer>
</template>

<style scoped></style>
