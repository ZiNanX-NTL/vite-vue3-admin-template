import { ref, nextTick, watch, onScopeDispose, effectScope } from 'vue';
import { useScriptTag, useElementSize } from '@vueuse/core';
import L from 'leaflet';
import { ESRI_LEAFLET_CDN } from '@/config';

interface MapHooks {
  onRender?: (map: L.Map) => void | Promise<void>;
  onUpdated?: (map: L.Map) => void | Promise<void>;
  onDestroy?: (map: L.Map) => void | Promise<void>;
}

export function useLeaflet(options: L.MapOptions = {}, hooks: MapHooks = {}) {
  const scope = effectScope();

  const { load: loadEsriLeaflet } = useScriptTag(ESRI_LEAFLET_CDN);

  const domRef = ref<HTMLElement | null>(null);
  const initialSize = { width: 0, height: 0 };
  const { width, height } = useElementSize(domRef, initialSize);

  let map: L.Map | null = null;

  const { onRender, onUpdated, onDestroy } = hooks;

  /**
   * whether can render map
   *
   * when domRef is ready and initialSize is valid
   */
  function canRender() {
    return domRef.value && initialSize.width > 0 && initialSize.height > 0;
  }

  /** is map rendered */
  function isRendered() {
    return Boolean(domRef.value && map);
  }

  /**
   * update map
   *
   * @param callback callback function
   */
  async function updateMap(callback: (map: L.Map) => void = () => {}) {
    if (!isRendered()) return;

    callback(map!);

    await onUpdated?.(map!);
  }

  /** render map */
  async function render() {
    if (!isRendered()) {
      await nextTick();
      await loadEsriLeaflet(true);

      const southWest = L.latLng(-90, -180);
      const northEast = L.latLng(90, 180);
      const bounds = L.latLngBounds(southWest, northEast);

      // 初始化
      if (!map) {
        map = L.map(domRef.value as HTMLElement, {
          crs: L.CRS.EPSG4326,
          maxBounds: bounds,
          minZoom: 1,
          attributionControl: false,
          zoomControl: false,
          ...options
        }).setView([48.19, 131.55], 6);
        await onRender?.(map);
      }
    }
  }

  /** resize map */
  function resize() {
    map!.invalidateSize();
  }

  /** destroy map */
  async function destroy() {
    if (!map) return;
    await onDestroy?.(map);
    map.off();
    map.remove();
    if (!map) return;
    map = null;
  }

  /**
   * render map by size
   *
   * @param w width
   * @param h height
   */
  async function renderMapBySize(w: number, h: number) {
    initialSize.width = w;
    initialSize.height = h;

    // size is abnormal, destroy map
    if (!canRender()) {
      await destroy();

      return;
    }

    // resize map
    if (isRendered()) {
      resize();
    }

    // render map
    await render();
  }

  scope.run(() => {
    watch([width, height], ([newWidth, newHeight]) => {
      renderMapBySize(newWidth, newHeight);
    });
  });

  onScopeDispose(() => {
    destroy();
    scope.stop();
  });

  return {
    domRef,
    updateMap
  };
}
