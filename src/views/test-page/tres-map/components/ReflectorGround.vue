<script lang="ts" setup>
import type * as THREE from 'three';
import { useTexture } from '@tresjs/core';
import { GridHelper, Mesh, PlaneGeometry, RepeatWrapping } from 'three';
import { Reflector } from '../plugins/Reflector';
import { ReflectorDudvMaterial } from '../plugins/ReflectorDudvMaterial';

const props = withDefaults(
  defineProps<{
    reflectivity?: number;
    showGridHelper?: boolean;
    scale?: number;
    ignoreObjects?: THREE.Object3D[];
    size?: number[];
    mapUrl?: string;
  }>(),
  {
    reflectivity: 0.8,
    scale: 1.0,
    showGridHelper: true,
    ignoreObjects: () => [],
    size: () => [10, 10],
    mapUrl: new URL('@/assets/images/floor/waterdudv.jpg', import.meta.url).href
  }
);

const reflector = new Reflector();
defineExpose({
  reflector
});

const gridHelp = new GridHelper(props.size[0] - 0.5, props.size[1]);
gridHelp.visible = props.showGridHelper;

const { map } = await useTexture({ map: props.mapUrl });
map.wrapS = RepeatWrapping;
map.wrapT = RepeatWrapping;
map.repeat.set(6, 3);
const material = new ReflectorDudvMaterial({
  map: map as any,
  reflectivity: props.reflectivity as any
});
material.uniforms.tReflect = { value: reflector.renderTarget.texture };
material.uniforms.tReflectBlur = reflector.renderTargetUniform;
material.uniforms.uMatrix = reflector.textureMatrixUniform;

const mirror = new Mesh(new PlaneGeometry(props.size[0], props.size[1]), material);
// mirror.rotation.x = -Math.PI / 2;
mirror.add(reflector);

mirror.onBeforeRender = (rendererSelf: any, sceneSelf: any, cameraSelf: any) => {
  mirror.visible = false;
  props.ignoreObjects.forEach((child: any) => {
    if (child.isMesh) {
      child.visible = false;
    }
    if (child.value && child.value.isMesh) {
      child.value.visible = false;
    }
  });
  reflector.update(rendererSelf, sceneSelf, cameraSelf);
  props.ignoreObjects.forEach((child: any) => {
    if (child.isMesh) {
      child.visible = true;
    }
    if (child.value && child.value.isMesh) {
      child.value.visible = true;
    }
  });
  mirror.visible = true;
};
watchEffect(() => {
  if (props.reflectivity) {
    material.uniforms.uReflectivity.value = props.reflectivity;
  }
});

watch(
  () => props.showGridHelper,
  newVal => {
    gridHelp.visible = newVal;
  }
);
</script>

<template>
  <TresGroup :scale="props.scale">
    <primitive :object="mirror" :position-y="-0.01" />
    <primitive :object="gridHelp" />
  </TresGroup>
</template>
