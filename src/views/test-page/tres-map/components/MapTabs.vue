<script setup lang="ts">
import { Html } from '@tresjs/cientos';
import { geoMercator } from 'd3';
import { gsap } from 'gsap';
import mapTitleBg from '@/assets/images/map_title_bg.png';
import { useThemeStore } from '@/store';
import pointList from '../data/pointList.json';

const { htmlState } = defineProps<{
  // html 标签状态
  htmlState: Record<string, any>;
}>();

const theme = useThemeStore();

// 标签定位动效
// 墨卡托投影转换
const projection = geoMercator().center([127.84, 47.44]).scale(250).translate([0, 0]);
const htmlRefs = shallowRef<any[]>();

// 添加标签入场动画
watch(
  () => htmlRefs.value,
  nvl => {
    if (nvl && nvl.length) {
      const positions = nvl.map(item => item.instance.position);
      // 添加标签入场动画
      nextTick(() => {
        gsap.from('.wrapper .title-item', {
          opacity: 0,
          duration: 1,
          stagger: 0.05,
          ease: 'power1.inOut'
        });
      });
      gsap.to(positions, {
        x: (index, _target, _targets) => {
          const { pointX, pointY } = nvl[index].instance.userData;
          const [x, _y] = projection([pointX, pointY]) || [0, 0];
          return x;
        },
        y: (index, _target, _targets) => {
          const { pointX, pointY } = nvl[index].instance.userData;
          const [_x, y] = projection([pointX, pointY]) || [0, 0];
          return -y;
        },
        duration: 1,
        stagger: 0.05,
        ease: 'power1.inOut'
      });
    }
  }
);
</script>

<template>
  <TresGroup>
    <Html v-for="item in pointList" ref="htmlRefs" :key="item.zcode" v-bind="htmlState" :user-data="item">
      <!--
 <NConfigProvider
              :theme="theme.naiveTheme"
              :theme-overrides="theme.naiveThemeOverrides"
              :locale="zhCN"
              :date-locale="dateZhCN"
              abstract
            >
              <NCard size="small" :bordered="false">{{ item.mc }}</NCard>
            </NConfigProvider>
-->
      <div
        class="title-item text-16px text-#fff leading-4vh px-10px text-center rounded-0.463vh bg-[rgba(25,25,25,0.5)] h-4vh pointer-events-none"
        :style="{ background: `url(${mapTitleBg}) no-repeat center/100% 100%` }"
      >
        <span>{{ item.mc }}:</span>
        <span class="text-20px" :style="`color: ${theme.colorScheme[0]}`">
          {{ `${item.area} ` }}
        </span>
        <span>万亩</span>
      </div>
    </Html>
  </TresGroup>
</template>

<style scoped></style>
