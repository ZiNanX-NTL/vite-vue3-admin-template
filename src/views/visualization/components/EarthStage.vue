<script setup lang="ts">
import type { TresRendererSetupContext } from '@tresjs/core';
import type { EarthViewKey, EarthViewState } from '../config/earthViews';
import type { ProjectMarkerConfig } from '../config/projectMarkers';
import { OrbitControls } from '@tresjs/cientos';
import { TresCanvas } from '@tresjs/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as THREE from 'three/webgpu';
import { Pane } from 'tweakpane';
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toValue, watch } from 'vue';
import { gsap } from '@/plugins';
import { useThemeStore } from '@/store';
import { createEarth } from '../../demo/particle-earth/components/Earth';
import { createFlyline } from '../../demo/particle-earth/components/Flyline';
import PostProcessing from '../../demo/particle-earth/components/PostProcessing.vue';
import { earthViewPresets, resolveEarthViewPreset } from '../config/earthViews';
import {
  projectMarkers,
  validateProjectMarkers
} from '../config/projectMarkers';
import ProjectMarkers from './ProjectMarkers.vue';

type EarthViewDriver = 'direct' | 'scroll';

interface ScrollTransitionOptions {
  transparentStart?: boolean;
  fromHeroProgress?: number;
}

const props = withDefaults(defineProps<{
  view: EarthViewKey;
  heroProgress?: number;
  viewDriver?: EarthViewDriver;
}>(), {
  viewDriver: 'direct'
});

const emit = defineEmits<{
  select: [marker: ProjectMarkerConfig];
}>();

const themeStore = useThemeStore();
const paneContainer = ref<HTMLElement | null>(null);
const sceneRoot = shallowRef<THREE.Group>();
const sceneTransform = reactive({
  rotationX: 0.18,
  rotationY: -1.72,
  rotationZ: 0,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  scale: 1
});
const stageEffects = reactive({
  opacity: 1,
  markersOpacity: 1,
  scrimOpacity: 0
});
const projectMarkerItems = validateProjectMarkers(projectMarkers);
const isInteractive = ref(true);
const isMobile = ref(false);
const reduceMotion = ref(false);
const markerRotation = computed<[number, number, number]>(() => [
  sceneTransform.rotationX,
  sceneTransform.rotationY,
  sceneTransform.rotationZ
]);
const isPaneVisible = computed(() => props.view === 'hero' && props.viewDriver === 'direct');

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

const earthUrl = new URL('../../demo/particle-earth/heroSection/particleEarth/texture/earth.jpg', import.meta.url).href;
const boundaryUrl = new URL('../../demo/particle-earth/heroSection/particleEarth/texture/boundary.jpg', import.meta.url).href;

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
let mediaMatcher: ReturnType<typeof gsap.matchMedia> | null = null;
let disposed = false;
let lastScrollTransition: {
  fromView: EarthViewKey;
  toView: EarthViewKey;
  progress: number;
  options: ScrollTransitionOptions;
} | null = null;

function resolveViewState(view: EarthViewKey, heroProgress = props.heroProgress ?? 0) {
  const preset = resolveEarthViewPreset(view, isMobile.value);

  if (view !== 'hero')
    return preset;

  const progress = gsap.utils.clamp(0, 1, heroProgress);

  return {
    ...preset,
    rotation: [preset.rotation[0] + progress * 0.5, preset.rotation[1], preset.rotation[2]] as [number, number, number],
    markersOpacity: preset.markersOpacity * (1 - progress),
    ringsOpacity: preset.ringsOpacity * (1 - progress)
  };
}

function applyView(view: EarthViewKey, immediate = false) {
  const preset = resolveViewState(view);
  const transition = earthViewPresets[view].earthTransition;
  const duration = immediate || reduceMotion.value
    ? 0
    : transition?.mode === 'enter'
      ? transition.duration ?? 0.8
      : 0.8;
  const ease = transition?.mode === 'enter' ? transition.ease ?? 'power2.out' : 'power2.out';

  lastScrollTransition = null;

  isInteractive.value = preset.interactive;

  gsap.to(sceneTransform, {
    rotationX: preset.rotation[0],
    rotationY: preset.rotation[1],
    rotationZ: preset.rotation[2],
    positionX: preset.position[0],
    positionY: preset.position[1],
    positionZ: preset.position[2],
    scale: preset.scale,
    duration,
    ease,
    overwrite: 'auto'
  });
  gsap.to(stageEffects, {
    opacity: preset.opacity,
    markersOpacity: preset.markersOpacity,
    scrimOpacity: preset.scrimOpacity,
    duration,
    ease,
    overwrite: 'auto'
  });
  gsap.to(magicRingsState, {
    opacity: preset.ringsOpacity,
    duration,
    ease,
    overwrite: 'auto'
  });
}

function interpolateNumber(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function resolveScrollState(
  fromView: EarthViewKey,
  toView: EarthViewKey,
  progress: number,
  options: ScrollTransitionOptions
): EarthViewState {
  const fromPreset = resolveViewState(
    fromView,
    fromView === 'hero' ? options.fromHeroProgress ?? 1 : undefined
  );
  const toPreset = resolveViewState(toView);
  const startPreset = options.transparentStart
    ? {
        ...fromPreset,
        opacity: 0,
        markersOpacity: 0,
        ringsOpacity: 0
      }
    : fromPreset;

  return {
    rotation: startPreset.rotation.map((value, index) => (
      interpolateNumber(value, toPreset.rotation[index], progress)
    )) as EarthViewState['rotation'],
    position: startPreset.position.map((value, index) => (
      interpolateNumber(value, toPreset.position[index], progress)
    )) as EarthViewState['position'],
    scale: interpolateNumber(startPreset.scale, toPreset.scale, progress),
    opacity: interpolateNumber(startPreset.opacity, toPreset.opacity, progress),
    markersOpacity: interpolateNumber(startPreset.markersOpacity, toPreset.markersOpacity, progress),
    ringsOpacity: interpolateNumber(startPreset.ringsOpacity, toPreset.ringsOpacity, progress),
    scrimOpacity: interpolateNumber(startPreset.scrimOpacity, toPreset.scrimOpacity, progress),
    interactive: toPreset.interactive
  };
}

function applyStateImmediately(state: EarthViewState) {
  Object.assign(sceneTransform, {
    rotationX: state.rotation[0],
    rotationY: state.rotation[1],
    rotationZ: state.rotation[2],
    positionX: state.position[0],
    positionY: state.position[1],
    positionZ: state.position[2],
    scale: state.scale
  });
  Object.assign(stageEffects, {
    opacity: state.opacity,
    markersOpacity: state.markersOpacity,
    scrimOpacity: state.scrimOpacity
  });
  magicRingsState.opacity = state.ringsOpacity;
  isInteractive.value = state.interactive;
}

function setScrollTransition(
  fromView: EarthViewKey,
  toView: EarthViewKey,
  progress: number,
  options: ScrollTransitionOptions = {}
) {
  const normalizedProgress = gsap.utils.clamp(0, 1, progress);
  const isNewTransition = !lastScrollTransition
    || lastScrollTransition.fromView !== fromView
    || lastScrollTransition.toView !== toView;

  if (isNewTransition)
    gsap.killTweensOf([sceneTransform, stageEffects, magicRingsState]);

  lastScrollTransition = {
    fromView,
    toView,
    progress: normalizedProgress,
    options
  };

  applyStateImmediately(resolveScrollState(fromView, toView, normalizedProgress, options));
}

function applyHeroProgress() {
  if (props.view !== 'hero' || props.viewDriver === 'scroll')
    return;

  const preset = resolveViewState('hero');
  gsap.killTweensOf([sceneTransform, stageEffects, magicRingsState]);
  lastScrollTransition = null;

  Object.assign(sceneTransform, {
    rotationX: preset.rotation[0],
    rotationY: preset.rotation[1],
    rotationZ: preset.rotation[2],
    positionX: preset.position[0],
    positionY: preset.position[1],
    positionZ: preset.position[2],
    scale: preset.scale
  });
  Object.assign(stageEffects, {
    opacity: preset.opacity,
    markersOpacity: preset.markersOpacity,
    scrimOpacity: preset.scrimOpacity
  });
  magicRingsState.opacity = preset.ringsOpacity;
  isInteractive.value = preset.interactive;
}

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
  mediaMatcher = gsap.matchMedia();
  mediaMatcher.add(
    {
      isMobile: '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    context => {
      isMobile.value = Boolean(context.conditions?.isMobile);
      reduceMotion.value = Boolean(context.conditions?.reduceMotion);
      if (lastScrollTransition) {
        gsap.killTweensOf([sceneTransform, stageEffects, magicRingsState]);
        applyStateImmediately(
          resolveScrollState(
            lastScrollTransition.fromView,
            lastScrollTransition.toView,
            lastScrollTransition.progress,
            lastScrollTransition.options
          )
        );
      } else if (props.view === 'hero') {
        applyHeroProgress();
      } else if (props.viewDriver === 'direct') {
        applyView(props.view, true);
      }
    }
  );

  const root = new THREE.Group();
  root.rotation.set(sceneTransform.rotationX, sceneTransform.rotationY, sceneTransform.rotationZ);
  root.position.set(sceneTransform.positionX, sceneTransform.positionY, sceneTransform.positionZ);
  root.scale.setScalar(sceneTransform.scale);

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
    sceneTransform.rotationY += delta * params.rotationSpeed;
    sceneRoot.value.rotation.set(sceneTransform.rotationX, sceneTransform.rotationY, sceneTransform.rotationZ);
    sceneRoot.value.position.set(sceneTransform.positionX, sceneTransform.positionY, sceneTransform.positionZ);
    sceneRoot.value.scale.setScalar(sceneTransform.scale);
  }
  earthController?.update(delta);
  flylineController?.update(delta);
  fpsGraph?.end();
}

watch(() => props.heroProgress, applyHeroProgress);
watch(() => [props.view, props.viewDriver] as const, ([view, viewDriver], [previousView]) => {
  if (viewDriver === 'scroll')
    return;

  if (
    lastScrollTransition?.toView === view
    && lastScrollTransition.progress >= 1
  ) {
    lastScrollTransition = null;
    isInteractive.value = resolveViewState(view).interactive;
    return;
  }

  if (view === 'hero') {
    applyHeroProgress();
    return;
  }

  const transition = earthViewPresets[view].earthTransition;
  if (transition?.mode === 'none')
    return;

  if (previousView === 'hero') {
    gsap.set(stageEffects, {
      opacity: 0,
      markersOpacity: 0
    });
  }

  applyView(view);
});

defineExpose({
  setScrollTransition
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

function handleProjectSelect(marker: ProjectMarkerConfig) {
  emit('select', marker);
}

onBeforeUnmount(() => {
  disposed = true;
  mediaMatcher?.revert();
  gsap.killTweensOf([sceneTransform, stageEffects, magicRingsState]);
  earthController?.dispose();
  flylineController?.dispose();
  pane?.dispose();
  earthController = null;
  flylineController = null;
  pane = null;
  fpsGraph = null;
  mediaMatcher = null;
  sceneRoot.value = undefined;
});
</script>

<template>
  <div
    class="earth-stage size-full relative overflow-hidden"
    :class="isInteractive ? 'pointer-events-auto' : 'pointer-events-none'"
  >
    <MagicRings class="inset-0 absolute" v-bind="magicRingsState" />

    <div class="inset-0 absolute" :style="{ opacity: stageEffects.opacity }">
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
          :enabled="isInteractive"
          :enable-damping="true"
          :enable-pan="false"
          :enable-zoom="false"
        />
        <TresAmbientLight :intensity="0.1" color="#8844ff" />
        <PostProcessing v-if="sceneRoot" :settings="params" />
        <primitive v-if="sceneRoot" :object="sceneRoot" />
        <ProjectMarkers
          :markers="projectMarkerItems"
          :opacity="stageEffects.markersOpacity"
          :rotation="markerRotation"
          @select="handleProjectSelect"
        />
      </TresCanvas>
    </div>

    <div
      class="earth-stage-scrim pointer-events-none inset-0 absolute"
      :style="{ opacity: stageEffects.scrimOpacity }"
      aria-hidden="true"
    />

    <div
      v-show="isPaneVisible"
      id="pane-container"
      ref="paneContainer"
      class="pointer-events-auto right-20px top-[calc(75pw+20px)] absolute z-10"
    />
  </div>
</template>

<style scoped>
.earth-stage {
  background: #040d14;
}

.earth-stage-scrim {
  background:
    linear-gradient(90deg, rgb(4 13 20 / 0.7), rgb(4 13 20 / 0.16) 56%, rgb(4 13 20 / 0.42)),
    linear-gradient(180deg, rgb(4 13 20 / 0.16), rgb(4 13 20 / 0.52));
}
</style>
