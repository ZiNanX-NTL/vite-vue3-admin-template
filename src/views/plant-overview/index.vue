<template>
  <div>
    <!-- <div class="h-full bg-red overflow-hidden"> -->
    <div v-if="isLoading" class="color-primary_10">测试</div>
    <div v-else>asdfasdfasdf</div>
    <n-button @click="handleLoading">aasdfas</n-button>
    <n-button type="primary" @click="handlere">aasdfas</n-button>

    <div>{{ app.reloadFlag }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <n-tabs type="line">
      <n-tab name="幸福">寂寞围绕着电视</n-tab>
      <n-tab name="的">垂死坚持</n-tab>
      <n-tab name="旁边">在两点半消失</n-tab>
    </n-tabs>
    <!-- <AppLoading></AppLoading> -->
  </div>
  <!-- </div> -->
</template>

<script setup>
import { useAppStore } from '@/store';
import { useGlobalLoading } from '@/hooks';

const { start, end, isLoading } = useGlobalLoading();

function handleLoading() {
  start();
  setTimeout(() => {
    end();
  }, 3000);
}

const app = useAppStore();
function handlere() {
  app.reloadPage(3000);
}
watch(app.reloadFlag, nv => {
  console.log(nv);
});
</script>

<style lang="scss" scoped></style>
