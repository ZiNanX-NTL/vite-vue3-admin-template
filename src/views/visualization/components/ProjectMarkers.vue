<script setup lang="ts">
import type { Vector3 } from 'three';
import type { ProjectMarkerConfig } from '../config/projectMarkers';
import { Html } from '@tresjs/cientos';
import { useThemeStore } from '@/store';
import { addColorAlpha, getColorPalette } from '@/utils';
import { lngLatToEarthPosition } from '../config/projectMarkers';

const props = withDefaults(defineProps<{
  markers: ProjectMarkerConfig[];
  radius?: number;
  rotation?: [number, number, number];
  opacity?: number;
}>(), {
  radius: 1,
  rotation: () => [0, 0, 0],
  opacity: 1
});

const emit = defineEmits<{
  select: [marker: ProjectMarkerConfig, position: Vector3];
}>();

const themeStore = useThemeStore();

function getMarkerPosition(marker: ProjectMarkerConfig) {
  return lngLatToEarthPosition(marker.lng, marker.lat, props.radius);
}

function handleSelect(marker: ProjectMarkerConfig) {
  emit('select', marker, getMarkerPosition(marker));
}

function getLeaderStyle(marker: ProjectMarkerConfig) {
  const offset = marker.labelOffset ?? [0.35, 0.2, 0];
  const scale = 130;
  const offsetX = offset[0] * scale;
  const offsetY = -offset[1] * scale;
  const length = Math.max(28, Math.hypot(offsetX, offsetY));
  const angle = Math.atan2(-offset[1], offset[0]) * (180 / Math.PI);

  const lineLengthOffset = offset[0] < 0 ? 120 : 137;

  return {
    '--project-marker-line-length': `${length - lineLengthOffset}px`,
    '--project-marker-line-angle': `${angle}deg`,
    '--project-marker-label-x': `${offsetX}px`,
    '--project-marker-label-y': `${offsetY}px`,
    '--project-marker-color': marker.labelColor ?? '#7c4dff',
    '--project-marker-gradient-start': addColorAlpha(getColorPalette(themeStore.themeColor, 5), 0.82),
    '--project-marker-gradient-end': addColorAlpha(getColorPalette(themeStore.themeColor, 7), 0.68)
  };
}
</script>

<template>
  <TresGroup :rotation="rotation">
    <TresGroup v-for="marker in markers" :key="marker.id">
      <TresMesh :position="getMarkerPosition(marker)">
        <TresSphereGeometry :args="[0.028, 12, 8]" />
        <TresMeshBasicMaterial
          :color="marker.pointColor ?? '#72f6b5'"
          :opacity="opacity"
          :transparent="opacity < 1"
        />
      </TresMesh>

      <Html
        :position="getMarkerPosition(marker)"
        :distance-factor="2"
        pointer-events="auto"
        wrapper-class="project-marker-html"
      >
        <div class="project-marker-overlay" :style="{ ...getLeaderStyle(marker), opacity }">
          <span class="project-marker-leader" aria-hidden="true" />
          <div class="project-marker-label parallelogram">
            <span>{{ marker.name }}</span>
            <div v-if="marker.description" class="contentDiv">
              {{ marker.description }}
            </div>
          </div>
          <!-- <button
            type="button"
            class="project-marker-label"
            :style="{ '--project-marker-color': marker.labelColor ?? '#7c4dff' }"
            @click.stop="handleSelect(marker)"
          >
            <strong>{{ marker.name }}</strong>
            <span v-if="marker.description">{{ marker.description }}</span>
          </button> -->
        </div>
      </Html>
    </TresGroup>
  </TresGroup>
</template>

<style scoped>
:global(.project-marker-html) {
  position: relative;
  display: block;
}

:global(.project-marker-overlay) {
  position: relative;
  width: 0;
  height: 0;
}

.project-marker-label {
  position: absolute;
  top: var(--project-marker-label-y);
  left: var(--project-marker-label-x);
  transition: transform 160ms ease, filter 160ms ease;
  transform: translate(-50%, -50%);
}

.project-marker-leader {
  position: absolute;
  top: 50%;
  left: 0;
  width: var(--project-marker-line-length);
  height: 2px;
  background: var(--project-marker-color);
  box-shadow: 0 0 8px var(--project-marker-color);
  pointer-events: none;
  transform: translate(0, -50%) rotate(var(--project-marker-line-angle));
  transform-origin: 0 50%;
}

.parallelogram {
  width: 260px;
  height: 30px;
  color: white;
  text-align: right;
  font-size: 20px;
}

.parallelogram span {
  position: relative;
  right: 18px;
  top: -14px;
  font-weight: bolder;
  /* 可选描边效果
  -webkit-text-stroke: 1px #424242;
  text-stroke: 1px #424242;
  */
}

.parallelogram .contentDiv {
  text-align: left;
  font-size: 16px;
  display: block;
  margin-top: -5px;
}

/* 利用伪元素before创建平行四边形 */
.parallelogram::before {
  content: '';
  transform: skew(-45deg);
  background: linear-gradient(
    45deg,
    var(--project-marker-gradient-start),
    var(--project-marker-gradient-end)
  );
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
