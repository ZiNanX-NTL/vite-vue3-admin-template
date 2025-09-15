<script lang="ts" setup>
import { useRenderLoop, useTexture } from '@tresjs/core';
import texture from '@/assets/images/texture.jpg';

const props = withDefaults(
  defineProps<{
    size?: number;
    speed?: number;
    ringWidth?: number;
  }>(),
  {
    size: 10,
    speed: 1,
    ringWidth: 0.075
  }
);

const pTexture = await useTexture([texture]);

const tsmConfig = {
  uniforms: {
    ringWidth: {
      value: props.ringWidth
    },
    innerRadius: {
      value: 0.5
    },
    uTexture: {
      value: pTexture
    }
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float ringWidth;
    uniform float innerRadius;
    uniform sampler2D uTexture;

    void main() {
      float dist = distance(vUv - 0.5, vec2(0.0));
      float patternInner = step(innerRadius, dist*2.0);
      float patternOuter = step(1.0 - (innerRadius + ringWidth), 1.0 - dist*2.0);
      float pattern = patternInner * patternOuter;

      vec4 texture = texture2D(uTexture, vUv);
      gl_FragColor.rgba = vec4(pattern*texture.r*1.0, pattern*texture.g*1.0, pattern*texture.b*1.4, texture.b*pattern);
    }
  `,
  transparent: true
};

watch(
  () => props.ringWidth,
  newVal => {
    tsmConfig.uniforms.ringWidth.value = newVal;
  }
);

const T = Math.PI / 2;
const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  const elapsedTime = elapsed / props.speed;
  const stage = (elapsedTime / T) % 2;
  if (stage < 1)
    tsmConfig.uniforms.innerRadius.value = 1.5 * Math.abs(Math.sin(elapsedTime));
  else tsmConfig.uniforms.innerRadius.value = 0;
});
</script>

<template>
  <TresGroup>
    <TresMesh>
      <TresCircleGeometry :args="[size]" />
      <TresShaderMaterial v-bind="tsmConfig" />
    </TresMesh>
  </TresGroup>
</template>
