<script setup lang="ts">
import type { TresRendererSetupContext } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import * as THREE from 'three/webgpu';
import { Pane } from 'tweakpane';
import { onBeforeUnmount, onMounted, reactive, shallowRef, toValue } from 'vue';
import { createEarth } from '../components/particleEarth/Earth';
import { createFlyline } from '../components/particleEarth/Flyline';
import PostProcessing from '../components/particleEarth/PostProcessing.vue';

function createWebGPURenderer(ctx: TresRendererSetupContext) {
  return new THREE.WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true
  });
}

const state = reactive({
  windowSize: true,
  alpha: true,
  antialias: true,
  clearAlpha: 0,
  renderMode: 'always'
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
  flylineFlowSpeed: 2.0,

  exposure: 1.27,
  bloomStrength: 0.62,
  bloomRadius: 0.55,
  bloomThreshold: 0.2,
  vignetteStrength: 0.48,
  vignetteStart: 0.45,
  vignetteEnd: 0.95
});

const sceneRoot = shallowRef<THREE.Group>();

let earthController: { update: (delta: number) => void; updateParams: (params: any) => void; dispose: () => void } | null = null;
let flylineController: { update: (delta: number) => void; updateParams: (params: any) => void; dispose: () => void } | null = null;
let pane: Pane | null = null;

onMounted(async () => {
  const root = new THREE.Group();
  root.rotation.x = 0.18;
  root.rotation.y = -1.72;

  const earth = await createEarth({ params });
  const flyline = createFlyline({ params });

  earthController = earth;
  flylineController = flyline;

  root.add(earth.object, flyline.object);
  sceneRoot.value = root;

  pane = createPane();
});

function onLoop({ delta }) {
  if (sceneRoot.value) {
    sceneRoot.value.rotation.y += delta * params.rotationSpeed;
  }
  earthController?.update(delta);
  flylineController?.update(delta);
}

onBeforeUnmount(() => {
  earthController?.dispose();
  flylineController?.dispose();
  pane?.dispose();
  pane = null;
});

function createPane() {
  const panel = new Pane({ title: 'Particle Earth' });

  panel.addBinding(params, 'rotationSpeed', { label: 'rotation', min: 0, max: 0.2, step: 0.005 });

  const earthFolder = panel.addFolder({ title: 'Earth' });
  earthFolder.addBinding(params, 'landColor', { label: 'land', view: 'color' }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'landDotScale', { label: 'land size', min: 0.4, max: 2.0, step: 0.01 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'landTwinkleIntensity', { label: 'land twinkle', min: 0, max: 4, step: 0.05 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderColor', { label: 'border', view: 'color' }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderDotScale', { label: 'border size', min: 0.4, max: 2.0, step: 0.01 }).on('change', applyEarthParams);
  earthFolder.addBinding(params, 'borderTwinkleIntensity', { label: 'border twinkle', min: 0, max: 5, step: 0.05 }).on('change', applyEarthParams);

  const shieldFolder = panel.addFolder({ title: 'Shield' });
  shieldFolder.addBinding(params, 'shieldColor', { label: 'color', view: 'color' }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldNoiseColor', { label: 'edge', view: 'color' }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldRadius', { label: 'radius', min: 0.96, max: 1.15, step: 0.001 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldLife', { label: 'life', min: 0, max: 1, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldOpacity', { label: 'opacity', min: 0, max: 2, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFresnelPower', { label: 'f power', min: 0.1, max: 8, step: 0.05 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFresnelStrength', { label: 'fresnel', min: 0, max: 2, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldHexScale', { label: 'hex scale', min: 1, max: 20, step: 0.1 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldEdgeWidth', { label: 'hex edge', min: 0.005, max: 0.3, step: 0.005 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldHexOpacity', { label: 'hex alpha', min: 0, max: 1, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFlashSpeed', { label: 'flash spd', min: 0, max: 5, step: 0.05 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFlashIntensity', { label: 'flash pow', min: 0, max: 1, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFlowScale', { label: 'flow scale', min: 0.1, max: 10, step: 0.05 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFlowSpeed', { label: 'flow spd', min: 0, max: 4, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFlowIntensity', { label: 'flow pow', min: 0, max: 8, step: 0.05 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldReveal', { label: 'reveal', min: 0, max: 1, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldNoiseScale', { label: 'noise scale', min: 0.1, max: 5, step: 0.05 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldNoiseEdgeWidth', { label: 'edge width', min: 0.001, max: 0.2, step: 0.001 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldNoiseEdgeIntensity', { label: 'edge glow', min: 0, max: 20, step: 0.1 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldNoiseEdgeSmoothness', { label: 'edge soft', min: 0, max: 1, step: 0.01 }).on('change', applyEarthParams);
  shieldFolder.addBinding(params, 'shieldFadeStart', { label: 'bottom fade', min: -1, max: 1, step: 0.01 }).on('change', applyEarthParams);

  const flylineFolder = panel.addFolder({ title: 'Flyline' });
  flylineFolder.addBinding(params, 'flylineColor', { label: 'color', view: 'color' }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineWidth', { label: 'width', min: 0.001, max: 0.02, step: 0.001 }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineIntensity', { label: 'intensity', min: 0, max: 4, step: 0.05 }).on('change', applyFlylineParams);
  flylineFolder.addBinding(params, 'flylineFlowSpeed', { label: 'flow', min: 0, max: 4, step: 0.05 }).on('change', applyFlylineParams);

  const postFolder = panel.addFolder({ title: 'Post' });
  postFolder.addBinding(params, 'exposure', { min: 0.1, max: 3, step: 0.01 });
  postFolder.addBinding(params, 'bloomStrength', { label: 'bloom', min: 0, max: 3, step: 0.01 });
  postFolder.addBinding(params, 'bloomRadius', { label: 'radius', min: 0, max: 1.5, step: 0.01 });
  postFolder.addBinding(params, 'bloomThreshold', { label: 'threshold', min: 0, max: 2, step: 0.01 });
  postFolder.addBinding(params, 'vignetteStrength', { label: 'vignette', min: 0, max: 1, step: 0.01 });

  return panel;
}

function applyEarthParams() {
  earthController?.updateParams?.(params);
}

function applyFlylineParams() {
  flylineController?.updateParams(params);
}
</script>

<template>
  <div class="particle-earth-page">
    <TresCanvas clear-color="#020611" v-bind="state" :renderer="createWebGPURenderer" @loop="onLoop">
      <TresPerspectiveCamera :position="[0, 0.12, 2.9]" :fov="40" :near="0.1" :far="100" />
      <OrbitControls make-default :enable-damping="true" :enable-pan="false" :min-distance="2.2" :max-distance="5.2" />

      <TresAmbientLight :intensity="0.1" color="#8844ff" />
      <PostProcessing :settings="params" />
      <primitive v-if="sceneRoot" :object="sceneRoot" />
    </TresCanvas>
  </div>
</template>

<style scoped>
.particle-earth-page {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background:
        radial-gradient(circle at 50% 48%, rgba(48, 128, 210, 0.22), rgba(1, 5, 14, 0.45) 34%, #000 72%),
        url('/plugins/heroSection/particleEarth/hdr/2k_stars_milky_way.jpg') center / cover no-repeat;
}
</style>
