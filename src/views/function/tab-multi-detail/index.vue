<template>
  <n-space :vertical="true" :size="16">
    <n-card title="Tab Detail" :bordered="false" size="small" class="rounded-8px shadow-sm">
      <n-space :vertical="true" :size="12">
        <div>当前路由的描述数据(meta)：</div>
        <div>{{ route.meta }}</div>
        <div>当前路由的查询数据(query)：</div>
        <div>{{ route.query }}</div>
        <n-button @click="handleToTab">返回Tab</n-button>
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup>
import { useRouterPush } from '@/utils';

const route = useRoute();
const { routerPush } = useRouterPush();

function handleToTab() {
  routerPush({ name: 'function_tab' });
}
</script>

<style scoped></style>
