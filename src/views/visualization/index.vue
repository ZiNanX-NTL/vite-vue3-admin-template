<script setup lang="ts">
import type { TresRendererSetupContext } from '@tresjs/core';
import type { ProjectMarkerConfig } from './config/projectMarkers';
import { OrbitControls } from '@tresjs/cientos';
import { TresCanvas } from '@tresjs/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as THREE from 'three/webgpu';
import { Pane } from 'tweakpane';
import { inject, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toValue } from 'vue';
import { useRouter } from 'vue-router';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { useThemeStore } from '@/store';
import { createEarth } from '../demo/particle-earth/components/Earth';
import { createFlyline } from '../demo/particle-earth/components/Flyline';
import PostProcessing from '../demo/particle-earth/components/PostProcessing.vue';
import OverviewSection from './components/OverviewSection.vue';
import ProjectMarkers from './components/ProjectMarkers.vue';
import ScrollShowcase from './components/ScrollShowcase.vue';
import {
  projectMarkers,
  validateProjectMarkers
} from './config/projectMarkers';

const themeStore = useThemeStore();
const router = useRouter();
const bigScroll = inject(bigScrollKey);
const scrollbarRef = ref();
const paneContainer = ref<HTMLElement | null>(null);
const sceneRoot = shallowRef<THREE.Group>();
const sceneRotation = reactive({ x: 0.18, y: -1.72, z: 0 });
const projectMarkerItems = validateProjectMarkers(projectMarkers);
const scrollEffects = reactive({
  rotationSpeed: 0.12,
  opacity: 1
});

const magicRingsState = reactive({
  color: themeStore.colorScheme[0] ?? '#7cff67',
  colorTwo: '#42fcff',
  ringCount: 6,
  speed: 1,
  attenuation: 10,
  lineThickness: 2,
  baseRadius: 0.35,
  radiusStep: 0.1,
  scaleRate: 0.1,
  opacity: 0.3,
  blur: 0,
  noiseAmount: 0.1,
  rotation: 0,
  ringGap: 1.5,
  fadeIn: 0.7,
  fadeOut: 0.5,
  followMouse: false,
  mouseInfluence: 0.2,
  hoverScale: 1.2,
  parallax: 0.05,
  clickBurst: false
});

const state = reactive({
  // windowSize: true,
  alpha: true,
  antialias: true,
  clearAlpha: 0
});

const params = reactive({
  rotationSpeed: 0,

  landColor: '#6d96cc',
  landDotScale: 1,
  landTwinkleIntensity: 2.0,
  borderColor: '#00dfff',
  borderDotScale: 1,
  borderTwinkleIntensity: 2.5,

  shieldColor: '#689ee5',
  shieldNoiseColor: '#14a7ff',
  shieldRadius: 1,
  shieldLife: 1,
  shieldOpacity: 0.93,
  shieldFresnelPower: 1,
  shieldFresnelStrength: 0.35,
  shieldHexScale: 12,
  shieldEdgeWidth: 0.06,
  shieldHexOpacity: 0.14,
  shieldFlashSpeed: 0.5,
  shieldFlashIntensity: 0.11,
  shieldFlowScale: 4,
  shieldFlowSpeed: 1.5,
  shieldFlowIntensity: 4,
  shieldReveal: 0,
  shieldNoiseScale: 1.65,
  shieldNoiseEdgeWidth: 0.02,
  shieldNoiseEdgeIntensity: 9.8,
  shieldNoiseEdgeSmoothness: 0.5,
  shieldFadeStart: 0.17,

  flylineColor: '#4e87df',
  flylineWidth: 0.005,
  flylineIntensity: 0.9,
  flylineFlowSpeed: 0.1,

  exposure: 1.27,
  bloomStrength: 0.62,
  bloomRadius: 0.55,
  bloomThreshold: 0.2,
  vignetteStrength: 0.48,
  vignetteStart: 0.45,
  vignetteEnd: 0.95
});

const earthUrl = new URL('../demo/particle-earth/heroSection/particleEarth/texture/earth.jpg', import.meta.url).href;
const boundaryUrl = new URL('../demo/particle-earth/heroSection/particleEarth/texture/boundary.jpg', import.meta.url).href;

let earthController: {
  update: (delta: number) => void;
  updateParams: (nextParams: typeof params) => void;
  dispose: () => void;
} | null = null;
let flylineController: {
  update: (delta: number) => void;
  updateParams: (nextParams: typeof params) => void;
  dispose: () => void;
} | null = null;
let pane: Pane | null = null;
let fpsGraph: { begin: () => void; end: () => void } | null = null;
let disposed = false;

function createWebGPURenderer(ctx: TresRendererSetupContext) {
  const renderer = new THREE.WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true,
    clearAlpha: 0
  });

  renderer.setClearColor(0x000000, 0);
  return renderer;
}

onMounted(async () => {
  disposed = false;
  bigScroll?.registerScrollbar(scrollbarRef.value);

  const root = new THREE.Group();
  root.rotation.set(sceneRotation.x, sceneRotation.y, sceneRotation.z);

  const earth = await createEarth({ earthUrl, boundaryUrl, params });
  const flyline = createFlyline({ params });

  if (disposed) {
    earth.dispose();
    flyline.dispose();
    return;
  }

  earthController = earth;
  flylineController = flyline;
  root.add(earth.object, flyline.object);
  sceneRoot.value = root;

  pane = createPane();
});

function onLoop({ delta }: { delta: number }) {
  fpsGraph?.begin();
  if (sceneRoot.value) {
    sceneRotation.y += delta * params.rotationSpeed;
    sceneRoot.value.rotation.set(sceneRotation.x, sceneRotation.y, sceneRotation.z);
  }
  earthController?.update(delta);
  flylineController?.update(delta);
  fpsGraph?.end();
}

const stopScrollListener = bigScroll?.onScroll(({ scroll }) => {
  const progress = Math.min(Math.max(scroll / (window.innerHeight - 300), 0), 1);

  sceneRotation.x = 0.18 + progress * 0.5;
  magicRingsState.opacity = 0.3 * (1 - progress);
  scrollEffects.opacity = 1 - progress;
});

function createPane() {
  if (!paneContainer.value) {
    return null;
  }

  const panel = new Pane({
    title: '粒子地球',
    expanded: false,
    container: paneContainer.value
  });
  // tp-rotv_c设置最高高度
  (panel as any).element.querySelector('.tp-rotv_c').style.maxHeight = '70vh';
  (panel as any).element.querySelector('.tp-rotv_c').style.overflowY = 'auto';

  panel.registerPlugin(EssentialsPlugin);
  fpsGraph = panel.addBlade({
    view: 'fpsgraph',
    label: '帧率',
    rows: 2
  });

  const magicRingsFolder = panel.addFolder({ title: '魔法光环', expanded: false });
  magicRingsFolder.addBinding(magicRingsState, 'color', { label: '主颜色', view: 'color' });
  magicRingsFolder.addBinding(magicRingsState, 'colorTwo', { label: '次颜色', view: 'color' });
  magicRingsFolder.addBinding(magicRingsState, 'ringCount', { label: '光环数量', min: 1, max: 10, step: 1 });
  magicRingsFolder.addBinding(magicRingsState, 'speed', { label: '动画速度', min: 0, max: 5, step: 0.05 });
  magicRingsFolder.addBinding(magicRingsState, 'attenuation', { label: '衰减强度', min: 0, max: 30, step: 0.1 });
  magicRingsFolder.addBinding(magicRingsState, 'lineThickness', { label: '线条粗细', min: 0.1, max: 10, step: 0.1 });
  magicRingsFolder.addBinding(magicRingsState, 'baseRadius', { label: '基础半径', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'radiusStep', { label: '半径步进', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'scaleRate', { label: '缩放速率', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'opacity', { label: '透明度', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'blur', { label: '模糊程度', min: 0, max: 20, step: 0.5 });
  magicRingsFolder.addBinding(magicRingsState, 'noiseAmount', { label: '噪声强度', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'rotation', { label: '旋转角度', min: -180, max: 180, step: 1 });
  magicRingsFolder.addBinding(magicRingsState, 'ringGap', { label: '光环间距', min: 0, max: 3, step: 0.05 });
  magicRingsFolder.addBinding(magicRingsState, 'fadeIn', { label: '淡入时间', min: 0, max: 2, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'fadeOut', { label: '淡出时间', min: 0, max: 2, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'followMouse', { label: '跟随鼠标' });
  magicRingsFolder.addBinding(magicRingsState, 'mouseInfluence', { label: '鼠标影响', min: 0, max: 2, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'hoverScale', { label: '悬停缩放', min: 1, max: 3, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'parallax', { label: '视差强度', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'clickBurst', { label: '点击爆发' });

  panel.addBinding(params, 'rotationSpeed', {
    label: '旋转速度',
    min: 0,
    max: 0.2,
    step: 0.005
  });

  const earthFolder = panel.addFolder({ title: '地球' });
  earthFolder.addBinding(params, 'landColor', { label: '陆地颜色', view: 'color' }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'landDotScale', { label: '陆地点大小', min: 0.4, max: 2, step: 0.01 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'landTwinkleIntensity', { label: '陆地闪烁', min: 0, max: 4, step: 0.05 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderColor', { label: '边界颜色', view: 'color' }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderDotScale', { label: '边界点大小', min: 0.4, max: 2, step: 0.01 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderTwinkleIntensity', { label: '边界闪烁', min: 0, max: 5, step: 0.05 }).on('change', applyEarthParams);

  const shieldFolder = panel.addFolder({ title: '护盾', expanded: false });
  const shieldBindings = [
    ['shieldColor', { label: '护盾颜色', view: 'color' }],
    ['shieldNoiseColor', { label: '边缘颜色', view: 'color' }],
    ['shieldRadius', { label: '护盾半径', min: 0.96, max: 1.15, step: 0.001 }],
    ['shieldLife', { label: '生命值', min: 0, max: 1, step: 0.01 }],
    ['shieldOpacity', { label: '透明度', min: 0, max: 2, step: 0.01 }],
    ['shieldFresnelPower', { label: '菲涅耳幂', min: 0.1, max: 8, step: 0.05 }],
    ['shieldFresnelStrength', { label: '菲涅耳强度', min: 0, max: 2, step: 0.01 }],
    ['shieldHexScale', { label: '六边形缩放', min: 1, max: 20, step: 0.1 }],
    ['shieldEdgeWidth', { label: '六边形边宽', min: 0.005, max: 0.3, step: 0.005 }],
    ['shieldHexOpacity', { label: '六边形透明度', min: 0, max: 1, step: 0.01 }],
    ['shieldFlashSpeed', { label: '闪烁速度', min: 0, max: 5, step: 0.05 }],
    ['shieldFlashIntensity', { label: '闪烁强度', min: 0, max: 1, step: 0.01 }],
    ['shieldFlowScale', { label: '流动缩放', min: 0.1, max: 10, step: 0.05 }],
    ['shieldFlowSpeed', { label: '流动速度', min: 0, max: 4, step: 0.01 }],
    ['shieldFlowIntensity', { label: '流动强度', min: 0, max: 8, step: 0.05 }],
    ['shieldReveal', { label: '显示进度', min: 0, max: 1, step: 0.01 }],
    ['shieldNoiseScale', { label: '噪声缩放', min: 0.1, max: 5, step: 0.05 }],
    ['shieldNoiseEdgeWidth', { label: '噪声边宽', min: 0.001, max: 0.2, step: 0.001 }],
    ['shieldNoiseEdgeIntensity', { label: '边缘发光', min: 0, max: 20, step: 0.1 }],
    ['shieldNoiseEdgeSmoothness', { label: '边缘柔和度', min: 0, max: 1, step: 0.01 }],
    ['shieldFadeStart', { label: '底部淡出', min: -1, max: 1, step: 0.01 }]
  ] as const;
  shieldBindings.forEach(([key, options]) => {
    shieldFolder.addBinding(params, key, options).on('change', applyEarthParams);
  });

  const flylineFolder = panel.addFolder({ title: '飞线' });
  flylineFolder.addBinding(params, 'flylineColor', { label: '颜色', view: 'color' }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineWidth', { label: '线宽', min: 0.001, max: 0.02, step: 0.001 }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineIntensity', { label: '强度', min: 0, max: 4, step: 0.05 }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineFlowSpeed', { label: '流动速度', min: 0, max: 4, step: 0.05 }).on('change', applyFlylineParams);

  const postFolder = panel.addFolder({ title: '后处理' });
  postFolder.addBinding(params, 'exposure', { label: '曝光', min: 0.1, max: 3, step: 0.01 });
  postFolder.addBinding(params, 'bloomStrength', { label: '泛光强度', min: 0, max: 3, step: 0.01 });
  postFolder.addBinding(params, 'bloomRadius', { label: '泛光半径', min: 0, max: 1.5, step: 0.01 });
  postFolder.addBinding(params, 'bloomThreshold', { label: '泛光阈值', min: 0, max: 2, step: 0.01 });
  postFolder.addBinding(params, 'vignetteStrength', { label: '暗角强度', min: 0, max: 1, step: 0.01 });

  return panel;
}

function applyEarthParams() {
  earthController?.updateParams(params);
}

function applyFlylineParams() {
  flylineController?.updateParams(params);
}

function navigateToProject(target: ProjectMarkerConfig['target']) {
  if (!target) {
    console.warn('[project-markers] missing navigation target');
    return;
  }

  if (target.type === 'route') {
    if (target.name) {
      router.push({ name: target.name, query: target.query, params: target.params }).catch(error => {
        console.warn('[project-markers] route navigation failed', error);
      });
      return;
    }

    if (target.path) {
      router.push({ path: target.path, query: target.query, params: target.params }).catch(error => {
        console.warn('[project-markers] route navigation failed', error);
      });
      return;
    }

    if (!target.name && !target.path) {
      console.warn('[project-markers] route target requires path or name');
    }
    return;
  }

  try {
    const url = new URL(target.href, window.location.origin);
    if (target.target === '_self') {
      window.location.assign(url.href);
      return;
    }

    window.open(url.href, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.warn('[project-markers] invalid URL target', target.href, error);
  }
}

function handleProjectSelect(marker: ProjectMarkerConfig) {
  navigateToProject(marker.target);
}

onBeforeUnmount(() => {
  disposed = true;
  stopScrollListener?.();
  bigScroll?.unregisterScrollbar(scrollbarRef.value);
  earthController?.dispose();
  flylineController?.dispose();
  pane?.dispose();
  earthController = null;
  flylineController = null;
  pane = null;
  fpsGraph = null;
  sceneRoot.value = undefined;
});

const showcaseItems = [
  {
    id: 'overview',
    label: '概览',
    title: '公司与系统',
    description: '公司项目概览.'
  },
  {
    id: 'components',
    label: 'Components',
    title: 'Components',
    description: 'Component content will be added here.'
  },
  {
    id: 'animations',
    label: 'Animations',
    title: 'Animations',
    description: 'Motion experiments will be added here.'
  },
  {
    id: 'backgrounds',
    label: 'Backgrounds',
    title: 'Backgrounds',
    description: 'Background studies will be added here.'
  },
  {
    id: 'showcase',
    label: 'Showcase',
    title: 'Showcase',
    description: 'Final showcase content will be added here.'
  }
];
</script>

<template>
  <NScrollbar ref="scrollbarRef" class="size-full" trigger="none">
    <div class="h-100vh relative">
      <div class="pt-[75pw] h-full">
        <MagicRings
          class="absolute-lt"
          v-bind="magicRingsState"
        />

        <div class="size-full absolute-lt">
          <div id="pane-container" ref="paneContainer" class="right-20px top-[calc(75pw+20px)] absolute z-10" />
          <TresCanvas
            v-bind="state"
            render-mode="always"
            clear-color="#000000"
            :renderer="createWebGPURenderer"
            @loop="onLoop"
          >
            <TresPerspectiveCamera :position="[0.5, 1.5, 3]" :fov="40" :near="0.1" :far="100" />
            <OrbitControls
              make-default
              :enable-damping="true"
              :enable-pan="false"
              :enable-zoom="false"
            />
            <TresAmbientLight :intensity="0.1" color="#8844ff" />
            <PostProcessing v-if="sceneRoot" :settings="params" />
            <primitive v-if="sceneRoot" :object="sceneRoot" />
            <ProjectMarkers
              :markers="projectMarkerItems"
              :opacity="scrollEffects.opacity"
              :rotation="[sceneRotation.x, sceneRotation.y, sceneRotation.z]"
              @select="handleProjectSelect"
            />
          </TresCanvas>
        </div>
      </div>
    </div>
    <ScrollShowcase
      :items="showcaseItems"
    >
      <template #section="{ item }">
        <OverviewSection v-if="item.id === 'overview'" class="w-[min(72vw,1100px)]" />

        <div v-else-if="item.id === 'components'" class="w-full">
          <h2>组件展示</h2>
          <div class="gap-20px grid grid-cols-3">
            <div>按钮组件</div>
            <div>卡片组件</div>
            <div>表格组件</div>
          </div>
        </div>

        <div v-else class="w-full">
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
        </div>
      </template>
    </ScrollShowcase>
  </NScrollbar>
</template>

<style scoped>
</style>
