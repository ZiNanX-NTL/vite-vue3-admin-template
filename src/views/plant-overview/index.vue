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
</script>

<template>
  <div>
    <!-- <div class="h-full bg-red overflow-hidden"> -->
    <div class="color-primary_10">测试</div>
    <NButton @click="handleLoading">aasdfas</NButton>
    <NButton type="primary" @click="handlere">aasdfas</NButton>

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
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <div>{{ isLoading }}</div>
    <NTabs type="line">
      <NTab name="幸福">寂寞围绕着电视</NTab>
      <NTab name="的">垂死坚持</NTab>
      <NTab name="旁边">在两点半消失</NTab>
    </NTabs>
    <!-- <AppLoading></AppLoading> -->
    <!-- </div> -->
  </div>
</template>

<style lang="scss" scoped></style>
