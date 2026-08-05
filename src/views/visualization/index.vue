<script setup lang="ts">
import type { TresRendererSetupContext } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import { TresCanvas } from '@tresjs/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as THREE from 'three/webgpu';
import { Pane } from 'tweakpane';
import { inject, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toValue } from 'vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { useThemeStore } from '@/store';
import { createEarth } from '../demo/particle-earth/components/Earth';
import { createFlyline } from '../demo/particle-earth/components/Flyline';
import PostProcessing from '../demo/particle-earth/components/PostProcessing.vue';

const themeStore = useThemeStore();
const bigScroll = inject(bigScrollKey);
const scrollbarRef = ref();
const paneContainer = ref<HTMLElement | null>(null);
const sceneRoot = shallowRef<THREE.Group>();

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
  rotationSpeed: 0.04,

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
  shieldFlashSpeed: 2.9,
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
  root.rotation.x = 0.18;
  root.rotation.y = -1.72;

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
    sceneRoot.value.rotation.y += delta * params.rotationSpeed;
  }
  earthController?.update(delta);
  flylineController?.update(delta);
  fpsGraph?.end();
}

function createPane() {
  if (!paneContainer.value) {
    return null;
  }

  const panel = new Pane({
    title: 'Particle Earth',
    expanded: false,
    container: paneContainer.value
  });
  // tp-rotv_c设置最高高度
  (panel as any).element.querySelector('.tp-rotv_c').style.maxHeight = '70vh';
  (panel as any).element.querySelector('.tp-rotv_c').style.overflowY = 'auto';

  panel.registerPlugin(EssentialsPlugin);
  fpsGraph = panel.addBlade({
    view: 'fpsgraph',
    label: 'FPS',
    rows: 2
  });

  const magicRingsFolder = panel.addFolder({ title: 'Magic Rings', expanded: false });
  magicRingsFolder.addBinding(magicRingsState, 'color', { label: 'color', view: 'color' });
  magicRingsFolder.addBinding(magicRingsState, 'colorTwo', { label: 'color two', view: 'color' });
  magicRingsFolder.addBinding(magicRingsState, 'ringCount', { label: 'ring count', min: 1, max: 10, step: 1 });
  magicRingsFolder.addBinding(magicRingsState, 'speed', { label: 'speed', min: 0, max: 5, step: 0.05 });
  magicRingsFolder.addBinding(magicRingsState, 'attenuation', { label: 'attenuation', min: 0, max: 30, step: 0.1 });
  magicRingsFolder.addBinding(magicRingsState, 'lineThickness', { label: 'line thickness', min: 0.1, max: 10, step: 0.1 });
  magicRingsFolder.addBinding(magicRingsState, 'baseRadius', { label: 'base radius', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'radiusStep', { label: 'radius step', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'scaleRate', { label: 'scale rate', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'opacity', { label: 'opacity', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'blur', { label: 'blur', min: 0, max: 20, step: 0.5 });
  magicRingsFolder.addBinding(magicRingsState, 'noiseAmount', { label: 'noise', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'rotation', { label: 'rotation', min: -180, max: 180, step: 1 });
  magicRingsFolder.addBinding(magicRingsState, 'ringGap', { label: 'ring gap', min: 0, max: 3, step: 0.05 });
  magicRingsFolder.addBinding(magicRingsState, 'fadeIn', { label: 'fade in', min: 0, max: 2, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'fadeOut', { label: 'fade out', min: 0, max: 2, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'followMouse', { label: 'follow mouse' });
  magicRingsFolder.addBinding(magicRingsState, 'mouseInfluence', { label: 'mouse influence', min: 0, max: 2, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'hoverScale', { label: 'hover scale', min: 1, max: 3, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'parallax', { label: 'parallax', min: 0, max: 1, step: 0.01 });
  magicRingsFolder.addBinding(magicRingsState, 'clickBurst', { label: 'click burst' });

  panel.addBinding(params, 'rotationSpeed', {
    label: 'rotation',
    min: 0,
    max: 0.2,
    step: 0.005
  });

  const earthFolder = panel.addFolder({ title: 'Earth' });
  earthFolder.addBinding(params, 'landColor', { label: 'land', view: 'color' }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'landDotScale', { label: 'land size', min: 0.4, max: 2, step: 0.01 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'landTwinkleIntensity', { label: 'land twinkle', min: 0, max: 4, step: 0.05 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderColor', { label: 'border', view: 'color' }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderDotScale', { label: 'border size', min: 0.4, max: 2, step: 0.01 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderTwinkleIntensity', { label: 'border twinkle', min: 0, max: 5, step: 0.05 }).on('change', applyEarthParams);

  const shieldFolder = panel.addFolder({ title: 'Shield', expanded: false });
  const shieldBindings = [
    ['shieldColor', { label: 'color', view: 'color' }],
    ['shieldNoiseColor', { label: 'edge', view: 'color' }],
    ['shieldRadius', { label: 'radius', min: 0.96, max: 1.15, step: 0.001 }],
    ['shieldLife', { label: 'life', min: 0, max: 1, step: 0.01 }],
    ['shieldOpacity', { label: 'opacity', min: 0, max: 2, step: 0.01 }],
    ['shieldFresnelPower', { label: 'f power', min: 0.1, max: 8, step: 0.05 }],
    ['shieldFresnelStrength', { label: 'fresnel', min: 0, max: 2, step: 0.01 }],
    ['shieldHexScale', { label: 'hex scale', min: 1, max: 20, step: 0.1 }],
    ['shieldEdgeWidth', { label: 'hex edge', min: 0.005, max: 0.3, step: 0.005 }],
    ['shieldHexOpacity', { label: 'hex alpha', min: 0, max: 1, step: 0.01 }],
    ['shieldFlashSpeed', { label: 'flash speed', min: 0, max: 5, step: 0.05 }],
    ['shieldFlashIntensity', { label: 'flash power', min: 0, max: 1, step: 0.01 }],
    ['shieldFlowScale', { label: 'flow scale', min: 0.1, max: 10, step: 0.05 }],
    ['shieldFlowSpeed', { label: 'flow speed', min: 0, max: 4, step: 0.01 }],
    ['shieldFlowIntensity', { label: 'flow power', min: 0, max: 8, step: 0.05 }],
    ['shieldReveal', { label: 'reveal', min: 0, max: 1, step: 0.01 }],
    ['shieldNoiseScale', { label: 'noise scale', min: 0.1, max: 5, step: 0.05 }],
    ['shieldNoiseEdgeWidth', { label: 'edge width', min: 0.001, max: 0.2, step: 0.001 }],
    ['shieldNoiseEdgeIntensity', { label: 'edge glow', min: 0, max: 20, step: 0.1 }],
    ['shieldNoiseEdgeSmoothness', { label: 'edge soft', min: 0, max: 1, step: 0.01 }],
    ['shieldFadeStart', { label: 'bottom fade', min: -1, max: 1, step: 0.01 }]
  ] as const;
  shieldBindings.forEach(([key, options]) => {
    shieldFolder.addBinding(params, key, options).on('change', applyEarthParams);
  });

  const flylineFolder = panel.addFolder({ title: 'Flyline' });
  flylineFolder.addBinding(params, 'flylineColor', { label: 'color', view: 'color' }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineWidth', { label: 'width', min: 0.001, max: 0.02, step: 0.001 }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineIntensity', { label: 'intensity', min: 0, max: 4, step: 0.05 }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineFlowSpeed', { label: 'flow', min: 0, max: 4, step: 0.05 }).on('change', applyFlylineParams);

  const postFolder = panel.addFolder({ title: 'Post Processing' });
  postFolder.addBinding(params, 'exposure', { min: 0.1, max: 3, step: 0.01 });
  postFolder.addBinding(params, 'bloomStrength', { label: 'bloom', min: 0, max: 3, step: 0.01 });
  postFolder.addBinding(params, 'bloomRadius', { label: 'radius', min: 0, max: 1.5, step: 0.01 });
  postFolder.addBinding(params, 'bloomThreshold', { label: 'threshold', min: 0, max: 2, step: 0.01 });
  postFolder.addBinding(params, 'vignetteStrength', { label: 'vignette', min: 0, max: 1, step: 0.01 });

  return panel;
}

function applyEarthParams() {
  earthController?.updateParams(params);
}

function applyFlylineParams() {
  flylineController?.updateParams(params);
}

onBeforeUnmount(() => {
  disposed = true;
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
            <TresPerspectiveCamera :position="[2, 2, 2]" :fov="40" :near="0.1" :far="100" />
            <OrbitControls
              make-default
              :enable-damping="true"
              :enable-pan="false"
              :enable-zoom="false"
            />
            <TresAmbientLight :intensity="0.1" color="#8844ff" />
            <!-- <PostProcessing v-if="sceneRoot" :settings="params" /> -->
            <primitive v-if="sceneRoot" :object="sceneRoot" />
          </TresCanvas>
        </div>
      </div>
    </div>
    <div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
      <div>content</div>
    </div>
  </NScrollbar>
</template>

<style scoped>
</style>
