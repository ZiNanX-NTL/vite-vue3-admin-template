<script setup>
import { useRouterPush } from '@/utils';

const route = useRoute();
const { routerPush } = useRouterPush();

function handleToTab() {
  routerPush({ name: 'function_tab' });
}
</script>

<template>
  <NSpace :vertical="true" :size="16">
    <NCard title="Tab Detail" :bordered="false" size="small" class="rounded-8px shadow-sm">
      <NSpace :vertical="true" :size="12">
        <div>当前路由的描述数据(meta)：</div>
        <div>{{ route.meta }}</div>
        <div>当前路由的查询数据(query)：</div>
        <div>{{ route.query }}</div>
        <NButton @click="handleToTab">返回Tab</NButton>
      </NSpace>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
