<script setup lang="ts">
import RealTime from './RealTime.vue';
import Weather from './Weather.vue';

defineOptions({
  name: 'HeadBar'
});

// 标题
const title = '植保数字化系统';
</script>

<template>
  <div class="bg-[length:100%_100%] bg-[url('@/assets/images/visualization/header-bg.png')] bg-no-repeat">
    <div class="header-line-left bg-[length:100%_100%] bg-[url('@/assets/images/visualization/head_line.svg')] h-[57px] w-[45%] translate-x-[-26px] left-[5%] top-[13px] absolute" />
    <div class="header-line-right bg-[length:100%_100%] bg-[url('@/assets/images/visualization/head_line.svg')] h-[57px] w-[45%] scale-x-[-1] right-[5%] top-[13px] absolute" />
    <!-- 中间植保大脑点击(单独加入隐藏的按钮) -->
    <div
      class="h-full w-400px cursor-pointer transform left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2"
    >
      <div
        class="text-4xl text-transparent line-height-75px tracking-[20px] font-semibold text-center bg-[linear-gradient(to_bottom,#c4f3fe,white)] w-full bg-clip-text"
      >
        {{ title }}
      </div>
    </div>
    <div
      class="bottom-10px left-16px absolute"
    >
      <Weather />
    </div>
    <div
      class="bottom-10px right-16px absolute"
    >
      <RealTime />
      <!-- <div class="exitIco" title="退出登录" @click="logout" /> -->
    </div>
  </div>
</template>

<style scoped></style>
