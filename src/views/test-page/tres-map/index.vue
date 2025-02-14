<script setup lang="ts">
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { CameraControls, Stars, useProgress } from '@tresjs/cientos';
import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { setLightness } from '@/utils';
import { useThemeStore } from '@/store';
import DigitalGround from './components/DigitalGround.vue';
import DigitalGround1 from './components/DigitalGround1.vue';
import ReflectorGround from './components/ReflectorGround.vue';
import HeiLongJiangMapMesh from './components/HeiLongJiangMapMesh.vue';

const { colorScheme } = useThemeStore();
const { hasFinishLoading, progress } = await useProgress();
const { onBeforeLoop, onAfterLoop } = useRenderLoop();

const state = reactive({
  clearColor: '#000'
});

const controlsState = reactive({
  minPolarAngle: Math.PI / 6,
  maxPolarAngle: Math.PI * (5 / 6),
  minAzimuthAngle: -Math.PI / 6,
  maxAzimuthAngle: Math.PI / 6
});

const directionalLightPositions = [
  [100, 100, 100],
  [-100, 100, 100],
  [100, -100, 100],
  [-100, -100, 100]
] as [number, number, number][];

const digitalState = reactive({
  color: setLightness(colorScheme[0], 100),
  speed: 3,
  size: 100
});

const reflectorState = reactive({
  reflectivity: 0.1,
  showGridHelper: false,
  size: [100, 100],
  scale: 1.5
});

/** 创建一个Tweakpane窗格 */
function createPane() {
  // 添加面板控制
  const pane = new Pane({
    title: '参数',
    expanded: true,
    container: document.getElementById('pane-container') as HTMLElement
  });
  pane.registerPlugin(EssentialsPlugin);
  const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: '渲染帧率',
    rows: 2
  }) as any;
  onBeforeLoop(() => {
    fpsGraph.begin();
  });
  onAfterLoop(() => {
    fpsGraph.end();
  });

  const ground = pane.addFolder({
    title: '场地参数',
    expanded: true
  });
  ground.addBinding(digitalState, 'color', { label: '颜色' });
  ground.addBinding(digitalState, 'speed', { label: '动画速度' });
  ground.addBinding(digitalState, 'size', { label: '纹理大小' });

  // const mapPane = pane.addFolder({
  //   title: '地图参数',
  //   expanded: true
  // });
}

onMounted(() => {
  createPane();
});
</script>

<template>
  <div>
    <div class="relative size-full">
      <div id="pane-container" class="absolute right-8px top-8px z-1 w-256px"></div>
      <Transition name="fade">
        <div
          v-show="!hasFinishLoading"
          class="absolute left-0 top-0 z-20 h-full w-full flex items-center justify-center bg-gray-600 text-white font-mono"
        >
          <div class="w-200px">Loading... {{ progress }} %</div>
        </div>
      </Transition>

      <TresCanvas v-bind="state">
        <!-- 相机 -->
        <TresPerspectiveCamera :position="[0, 0, 150]" :fov="45" :near="0.1" :far="5000" :look-at="[0, 0, 0]" />
        <CameraControls v-bind="controlsState" />
        <!-- 灯光 -->
        <!-- <TresAmbientLight :intensity="1" /> -->
        <TresDirectionalLight
          v-for="(position, index) in directionalLightPositions"
          :key="index"
          :position="position"
          :intensity="6"
        />
        <!-- 数字地面 -->
        <Stars />
        <Suspense>
          <DigitalGround v-bind="digitalState" />
        </Suspense>
        <Suspense>
          <DigitalGround1 v-bind="digitalState" />
        </Suspense>

        <!-- 反射地面 -->
        <!--
 <Suspense>
          <ReflectorGround :position="[0, 0, -0.05]" v-bind="reflectorState" />
        </Suspense>
        -->

        <Suspense>
          <HeiLongJiangMapMesh :position="[0, 0, 0.05]" />
        </Suspense>

        <!-- TODO: 统计标签 -->
      </TresCanvas>
    </div>
  </div>
</template>

<style scoped></style>
