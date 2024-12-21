import { ref } from 'vue';
import { useScriptTag } from '@vueuse/core';
import L from 'leaflet';
import '@/plugins/leaflet/leaflet-marker.js';
import 'leaflet-easybutton';
import { ESRI_LEAFLET_CDN } from '@/config';
import { router } from '@/router';
import { useRender } from '../common';

interface MapHooks {
  onRender?: (map: L.Map) => void | Promise<void>;
  onUpdated?: (map: L.Map) => void | Promise<void>;
  onDestroy?: (map: L.Map) => void | Promise<void>;
}

export function useLeaflet(options: L.MapOptions = {}, hooks: MapHooks = {}) {
  const { load: loadEsriLeaflet } = useScriptTag(ESRI_LEAFLET_CDN);

  const domRef = ref<HTMLElement | null>(null);

  const route = unref(router.currentRoute);
  const isKeepAlive = route.meta.keepAlive;

  const { onRender, onUpdated, onDestroy } = hooks;

  const { instance: mapInstance, isRendered } = useRender(domRef, {
    async render() {
      await loadEsriLeaflet(true);

      const southWest = L.latLng(-90, -180);
      const northEast = L.latLng(90, 180);
      const bounds = L.latLngBounds(southWest, northEast);

      const map = L.map(domRef.value as HTMLElement, {
        crs: L.CRS.EPSG4326,
        maxBounds: bounds,
        minZoom: 1,
        attributionControl: false,
        zoomControl: false,
        ...options
      }).setView([48.19, 131.55], 6);
      await onRender?.(map);

      return map;
    },
    resize(instance) {
      instance?.value?.invalidateSize();
    },
    async destroy(instance, isForce = false) {
      if (!instance?.value) return;

      await onDestroy?.(instance?.value);
      if (!isKeepAlive || isForce) {
        instance?.value?.off();
        instance?.value?.remove();
        if (!instance.value) return;
        instance.value = null;
      }
    }
  });

  /**
   * update map
   *
   * @param callback callback function
   */
  async function updateMap(callback: (map: L.Map) => void = () => {}) {
    if (!isRendered()) return;

    callback(mapInstance.value!);

    await onUpdated?.(mapInstance.value!);
  }

  return {
    domRef,
    updateMap
  };
}
