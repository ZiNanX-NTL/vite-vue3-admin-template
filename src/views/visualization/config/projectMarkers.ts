import * as THREE from 'three';
import { useThemeStore } from '@/store';

const themeStore = useThemeStore();

export type ProjectMarkerTarget
  = | {
    type: 'route';
    path?: string;
    name?: string;
    query?: Record<string, string | number | boolean>;
    params?: Record<string, string | number>;
  }
  | {
    type: 'url';
    href: string;
    target?: '_blank' | '_self';
  };

export interface ProjectMarkerConfig {
  id: string;
  name: string;
  description?: string;
  lng: number;
  lat: number;
  pointColor?: string;
  labelColor?: string;
  labelOffset?: [number, number, number];
  target?: ProjectMarkerTarget;
}

export const projectMarkers: ProjectMarkerConfig[] = [
  {
    id: 'plant-overview',
    name: '种植概况',
    description: '查看种植区域与生产数据',
    lng: 116.4074,
    lat: 39.9042,
    pointColor: themeStore.colorScheme[0],
    labelColor: themeStore.colorScheme[2],
    labelOffset: [4, 0.28, 0.12],
    target: {
      type: 'route',
      path: '/plant-overview'
    }
  },
  {
    id: 'visualization',
    name: '公司大屏',
    description: '查看公司可视化大屏',
    lng: 121.4737,
    lat: 31.2304,
    pointColor: themeStore.colorScheme[0],
    labelColor: themeStore.colorScheme[2],
    labelOffset: [-4, 0.32, 0.08],
    target: {
      type: 'route',
      path: '/visualization'
    }
  }
];

export function lngLatToEarthPosition(lng: number, lat: number, radius = 1) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng);

  return new THREE.Vector3(
    Math.sin(phi) * Math.sin(theta) * radius,
    Math.cos(phi) * radius,
    Math.sin(phi) * Math.cos(theta) * radius
  );
}

export function validateProjectMarkers(markers: ProjectMarkerConfig[]) {
  const ids = new Set<string>();

  markers.forEach(marker => {
    if (!marker.id) {
      console.warn('[project-markers] missing id');
    }

    if (ids.has(marker.id)) {
      console.warn(`[project-markers] duplicate id: ${marker.id}`);
    }
    ids.add(marker.id);

    if (
      !Number.isFinite(marker.lng)
      || !Number.isFinite(marker.lat)
      || marker.lng < -180
      || marker.lng > 180
      || marker.lat < -90
      || marker.lat > 90
    ) {
      console.warn(`[project-markers] invalid coordinates: ${marker.id}`);
    }

    if (!marker.target) {
      console.warn(`[project-markers] missing navigation target: ${marker.id}`);
    } else if (marker.target.type === 'url' && !marker.target.href.trim()) {
      console.warn(`[project-markers] empty URL target: ${marker.id}`);
    } else if (
      marker.target.type === 'route'
      && !marker.target.path
      && !marker.target.name
    ) {
      console.warn(`[project-markers] route target requires path or name: ${marker.id}`);
    }
  });

  return markers;
}
