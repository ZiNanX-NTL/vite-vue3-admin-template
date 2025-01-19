import { effectScope, onScopeDispose, ref } from 'vue';
import { useScriptTag } from '@vueuse/core';
import L from 'leaflet';
import '@/plugins/leaflet/leaflet-marker.js';
import 'leaflet-easybutton';
import { ESRI_LEAFLET_CDN, TIANDITU_KEY } from '@/config';
import { router } from '@/router';
import { useRender } from '../common';

interface MapHooks {
  onRender?: (map: L.Map) => void | Promise<void>;
  onUpdated?: (map: L.Map) => void | Promise<void>;
  onDestroy?: (map: L.Map) => void | Promise<void>;
}

export function useLeaflet(options: L.MapOptions = {}, hooks: MapHooks = {}) {
  const scope = effectScope();

  const { load: loadEsriLeaflet } = useScriptTag(ESRI_LEAFLET_CDN);

  const domRef = ref<HTMLElement | null>(null);

  const route = unref(router.currentRoute);
  const isKeepAlive = route.meta.keepAlive;

  const { onRender, onUpdated, onDestroy } = hooks;

  const { instance: mapInstance, isRendered } = useRender(domRef, {
    async render() {
      await loadEsriLeaflet(true);

      await nextTick();

      const southWest = L.latLng(-90, -180);
      const northEast = L.latLng(90, 180);
      const bounds = L.latLngBounds(southWest, northEast);
      const { layers = [], ...resOptions } = options;

      const map = L.map(domRef.value as HTMLElement, {
        crs: L.CRS.EPSG4326,
        maxBounds: bounds,
        minZoom: 1,
        attributionControl: false,
        zoomControl: false,
        layers: [
          L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=img_c&X={x}&Y={y}&L={z}&tk=${TIANDITU_KEY}`, {
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            zoomOffset: 1
          }),
          // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
          ...layers
        ],
        ...resOptions
      }).setView([48.0, 128.5], 6);
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

  // 定义更新操作的接口
  interface UpdateOperation {
    callback: (map: L.Map) => void;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
  }

  // 添加更新操作队列
  const updateQueue = ref<UpdateOperation[]>([]);

  // 处理队列中的更新操作
  const processQueue = async () => {
    if (!isRendered() || updateQueue.value.length === 0) return;

    while (updateQueue.value.length > 0) {
      const operation = updateQueue.value.shift();
      // eslint-disable-next-line no-continue
      if (!operation) continue;

      try {
        const { callback, resolve } = operation;

        callback(mapInstance.value!);
        // eslint-disable-next-line no-await-in-loop
        await onUpdated?.(mapInstance.value!);
        resolve();
      } catch (error) {
        operation.reject(error);
      }
    }
  };

  /**
   * update map
   *
   * @param callback callback function
   */
  async function updateMap(callback: (map: L.Map) => void = () => {}) {
    return new Promise<void>((resolve, reject) => {
      // 将更新操作添加到队列
      updateQueue.value.push({
        callback,
        resolve,
        reject
      });

      // 如果已经渲染完成，立即处理队列
      if (isRendered()) {
        processQueue();
      }
    });
  }

  // 监听渲染状态
  scope.run(() => {
    watch(
      () => isRendered(),
      async newValue => {
        if (newValue) {
          await processQueue();
        }
      }
    );
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    domRef,
    mapInstance,
    updateMap
  };
}
