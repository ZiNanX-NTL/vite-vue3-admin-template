<script setup lang="tsx">
import type { ThreeEvent } from '@tresjs/core';
import * as THREE from 'three';
import { geoMercator } from 'd3';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import { gsap } from 'gsap';
import { useThrottleFn } from '@vueuse/core';
import { instantiatedComponent, loadGeojson } from '@/utils';
import { useThemeStore } from '@/store';

interface Parent {
  adcode: number;
}

interface Properties {
  adcode: number;
  name: string;
  center: number[];
  centroid: number[];
  childrenNum: number;
  level: string;
  parent: Parent;
  subFeatureIndex: number;
  acroutes: number[];
}

interface Geometry {
  type: string;
  coordinates: [number, number][][][];
}

type FeaturesType = {
  type: string;
  id: number;
  bbox: number[];
  properties: Properties;
  geometry: Geometry;
}[];

interface AreaListType {
  type: 'shape' | 'Line';
  shape?: THREE.Shape;
  properties: Properties;
  [key: string]: any;
}

defineOptions({
  inheritAttrs: false
});
const { extrudeSettings } = defineProps<{
  // 地图参数
  extrudeSettings: Record<string, any>;
}>();

const { colorScheme } = useThemeStore();

const initMeshBvh = () => {
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
};
initMeshBvh();

// 墨卡托投影转换
const projection = geoMercator().center([127.84, 47.44]).scale(250).translate([0, 0]);

const areaJson: FeaturesType = await loadGeojson('/src/assets/json/HLJZone.json');

const areaList = [] as AreaListType[];
function makeAreaPrimary() {
  areaJson.forEach(elem => {
    const { coordinates, type } = elem.geometry;

    function handlePolygon(coordinate: [number, number][]) {
      // 制作区域块
      const shape = new THREE.Shape();
      coordinate.forEach((item, idx) => {
        const [x, y] = projection(item) as [number, number];
        if (idx === 0) shape.moveTo(x, -y);
        else shape.lineTo(x, -y);
      });
      areaList.push({ type: 'shape', shape, properties: elem.properties });

      // 制作边界线
      const points = [] as number[];
      coordinate.forEach(item => {
        const [x, y] = projection(item) as [number, number];
        points.push(x, -y, 0);
      });
      areaList.push({ type: 'Line', points: new Float32Array(points), properties: elem.properties });
    }
    coordinates.forEach(coordinate => {
      if (type === 'MultiPolygon') coordinate.forEach(item => handlePolygon(item));
      if (type === 'Polygon') handlePolygon(coordinate as unknown as [number, number][]);
    });
  });
}

makeAreaPrimary();

// 创建tooltip组件
const name = ref('地区');
const TooltipComponent = defineComponent({
  name: 'TooltipComponent',
  setup() {
    return () => (
      <div class="pointer-events-none invisible absolute z-10 block rounded-5px bg-[rgba(25,25,25,0.5)] px-10px py-5px text-16px text-#fff transition-all -translate-x-1/2 -translate-y-[calc(100%+10px)]">
        {name.value}
      </div>
    );
  }
});
const tooltip = instantiatedComponent(TooltipComponent).el as HTMLElement;
document.body.appendChild(tooltip);

const lineLoopRefs = shallowRef<AreaListType>();
function pEnter(intersection: ThreeEvent<MouseEvent>) {
  intersection.stopPropagation();
  const object = intersection.object as any;
  if (object) {
    object.material[0].color.set(0xff0000);
    // 添加地块动效
    gsap.to(object.position, {
      z: 1,
      duration: 0.3,
      ease: 'power1.inOut'
    });
    const edgeRef = lineLoopRefs.value!.find((item: AreaListType) => item.name === object.name);
    if (edgeRef) {
      gsap.to(edgeRef.position, {
        z: extrudeSettings.depth + 0.01 + 1,
        duration: 0.3,
        ease: 'power1.inOut'
      });
    }
  }
  // tooltip.textContent = object.name;
  name.value = object.name;
  tooltip.style.visibility = 'visible';
}
function pLeave(intersection: ThreeEvent<MouseEvent>) {
  intersection.eventObject.material[0].color.set(colorScheme[0]);
  const object = intersection.eventObject as any;
  if (object) {
    // 添加地块动效
    gsap.to(object.position, {
      z: 0,
      duration: 0.3,
      ease: 'power1.inOut'
    });
    const edgeRef = lineLoopRefs.value!.find((item: AreaListType) => item.name === object.name);
    if (edgeRef) {
      gsap.to(edgeRef.position, {
        z: extrudeSettings.depth + 0.01,
        duration: 0.3,
        ease: 'power1.inOut'
      });
    }
  }
  tooltip.style.visibility = 'hidden';
}
function pointerMove(intersection: ThreeEvent<MouseEvent>) {
  tooltip.style.left = `${intersection.clientX}px`;
  tooltip.style.top = `${intersection.clientY}px`;
}
const pMove = useThrottleFn(pointerMove, 10, true);
</script>

<template>
  <TresGroup v-bind="$attrs">
    <template v-for="(item, index) in areaList" :key="`${index}`">
      <!-- 区域块 -->
      <TresMesh
        v-if="item.type === 'shape'"
        :name="item.properties.name"
        :user-data="item.properties"
        :render-order="index"
        @pointer-enter="pEnter"
        @pointer-leave="pLeave"
        @pointer-move="pMove"
      >
        <TresExtrudeGeometry :args="[item.shape, { ...extrudeSettings }]" />
        <TresMeshStandardMaterial :metalness="1" :roughness="0.5" :color="colorScheme[0]" attach="material-0" />
        <TresMeshStandardMaterial :metalness="1" :roughness="1" :color="colorScheme[0]" attach="material-1" />
      </TresMesh>
    </template>
  </TresGroup>
  <TresGroup v-bind="$attrs">
    <template v-for="(item, index) in areaList" :key="`${index}`">
      <!-- 边界线 -->
      <TresLineLoop
        v-if="item.type === 'Line'"
        ref="lineLoopRefs"
        :name="item.properties.name"
        :render-order="index"
        :position-z="extrudeSettings.depth + 0.01"
      >
        <TresBufferGeometry :position="[item.points, 3]" />
        <TresLineBasicMaterial :color="0xffffff" :linewidth="1" />
      </TresLineLoop>
    </template>
  </TresGroup>
</template>

<style scoped></style>
