<script setup lang="ts">
import { CameraControls, Stars, useProgress } from '@tresjs/cientos';
// import { dateZhCN, zhCN } from 'naive-ui';
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';
import { useThemeStore } from '@/store';
import { setLightness } from '@/utils';
import DigitalGround1 from './components/DigitalGround1.vue';
import DigitalGround from './components/DigitalGround.vue';
import HeiLongJiangMapMesh from './components/HeiLongJiangMapMesh.vue';
import MapTabs from './components/MapTabs.vue';

const theme = useThemeStore();
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
  color: setLightness(theme.colorScheme[0], 100),
  speed: 3,
  size: 100
});

const reflectorState = reactive({
  reflectivity: 0.1,
  showGridHelper: false,
  size: [100, 100],
  scale: 1.5
});

const mapExtrudeSettings = reactive({
  depth: 4,
  bevelEnabled: true,
  bevelSegments: 0,
  bevelThickness: 0.2
});

const htmlState = reactive({
  wrapperClass: 'wrapper',
  center: true,
  sprite: true,
  prepend: true,
  transform: true,
  distanceFactor: 10
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

  const mapPane = pane.addFolder({
    title: '地图参数',
    expanded: true
  });
  mapPane.addBinding(mapExtrudeSettings, 'depth', { label: '地图厚度' });

  const tabsPane = pane.addFolder({
    title: '标签参数',
    expanded: true
  });
  tabsPane.addBinding(htmlState, 'distanceFactor', { label: '缩放系数' });
}

onMounted(() => {
  createPane();
});
</script>

<template>
  <div>
    <div class="size-full relative">
      <div id="pane-container" class="w-256px right-8px top-8px absolute z-1" />
      <Transition name="fade">
        <div
          v-show="!hasFinishLoading"
          class="text-white font-mono bg-gray-600 flex h-full w-full items-center left-0 top-0 justify-center absolute z-20"
        >
          <div class="w-200px">
            Loading... {{ progress }} %
          </div>
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
          <HeiLongJiangMapMesh :position="[0, 0, 0.05]" :extrude-settings="mapExtrudeSettings" />
        </Suspense>
        <!-- 地图标签 -->
        <MapTabs :position="[0, 0, mapExtrudeSettings.depth + 1]" :html-state="htmlState" />
      </TresCanvas>
    </div>
  </div>
</template>

<style scoped></style>
