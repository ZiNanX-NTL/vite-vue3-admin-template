<script setup lang="ts">
import { useTresContext } from '@tresjs/core';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { float, length, pass, smoothstep, uniform, uv, vec2, vec4 } from 'three/tsl';
import * as THREE from 'three/webgpu';
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
  settings: {
    exposure: number;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    vignetteStrength: number;
    vignetteStart: number;
    vignetteEnd: number;
  };
}>();

const { scene, camera, renderer } = useTresContext();

let postProcessing: any = null;
let bloomPass: any = null;
let envTexture: any = null;
const environmentUrl = new URL('../heroSection/particleEarth/hdr/rogland_clear_night_1k.hdr', import.meta.url).href;

const vignetteStrength = uniform(props.settings.vignetteStrength);
const vignetteStart = uniform(props.settings.vignetteStart);
const vignetteEnd = uniform(props.settings.vignetteEnd);

function setupEnvironment() {
  const loader = new RGBELoader();
  loader.load(environmentUrl, texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    envTexture = texture;
    scene.value.environment = texture;
    scene.value.background = null;
    scene.value.environmentIntensity = 0.7;
  });
}

function setupPipeline() {
  const activeCamera = camera.activeCamera.value;
  if (!activeCamera || postProcessing) {
    return;
  }

  renderer.instance.setClearColor(0x000000, 0);
  renderer.instance.setClearAlpha(0);
  renderer.instance.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.instance.toneMappingExposure = props.settings.exposure;

  const scenePass = pass(scene.value, activeCamera);
  const sceneColor = scenePass.getTextureNode('output');
  bloomPass = bloom(
    sceneColor,
    props.settings.bloomStrength,
    props.settings.bloomRadius,
    props.settings.bloomThreshold
  );

  const composited = sceneColor.add(bloomPass);
  const distanceToCenter = length(uv().sub(vec2(0.5)));
  const vignetteMask = smoothstep(vignetteStart, vignetteEnd, distanceToCenter);
  const vignette = float(1).sub(vignetteMask.mul(vignetteStrength));
  const output = vec4(composited.rgb.mul(vignette), sceneColor.a);

  postProcessing = new THREE.PostProcessing(renderer.instance as any, output);
  postProcessing._quadMesh.material.transparent = true;
  postProcessing._quadMesh.material.depthWrite = false;
  renderer.replaceRenderFunction(notifyFrameRendered => {
    postProcessing?.render();
    notifyFrameRendered();
  });
}

watch(
  () => camera.activeCamera.value,
  () => setupPipeline(),
  { immediate: true }
);

watch(
  () => ({ ...props.settings }),
  settings => {
    renderer.instance.toneMappingExposure = settings.exposure;
    if (bloomPass) {
      bloomPass.strength.value = settings.bloomStrength;
      bloomPass.radius.value = settings.bloomRadius;
      bloomPass.threshold.value = settings.bloomThreshold;
    }
    vignetteStrength.value = settings.vignetteStrength;
    vignetteStart.value = settings.vignetteStart;
    vignetteEnd.value = settings.vignetteEnd;
  },
  { deep: true }
);

setupEnvironment();

onBeforeUnmount(() => {
  renderer.replaceRenderFunction(notifyFrameRendered => {
    const activeCamera = camera.activeCamera.value;
    if (activeCamera) {
      renderer.instance.render(scene.value, activeCamera);
    }
    notifyFrameRendered();
  });

  if (envTexture) {
    envTexture.dispose();
    envTexture = null;
  }
  postProcessing?.dispose?.();
  postProcessing = null;
  bloomPass = null;
});
</script>

<template>
  <TresGroup />
</template>
