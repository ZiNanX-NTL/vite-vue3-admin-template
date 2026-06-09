import { useScriptTag } from '@vueuse/core';
// import L from 'leaflet';
import { effectScope, onScopeDispose, ref } from 'vue';
import { ESRI_LEAFLET_CDN, LEAFLET_CDN, LEAFLET_CSS_CDN, TIANDITU_KEY } from '@/config';
import { router } from '@/router';
import { useRender } from '../common';
// 使用vite8 leaflet-marker 必须在 leaflet 之前引入，确保 L.Marker 已经定义,否则会导致打包后找不到 L
import '@/plugins/leaflet/leaflet-marker.js';
import 'leaflet-easybutton';

interface MapHooks {
  onRender?: (map: L.Map) => void | Promise<void>;
  onUpdated?: (map: L.Map) => void | Promise<void>;
  onDestroy?: (map: L.Map) => void | Promise<void>;
}

export function useLeaflet(options: L.MapOptions = {}, hooks: MapHooks = {}) {
  const scope = effectScope();

  const loading = ref(false);

  function loadLeafletCss(): Promise<void> {
    return new Promise((resolve, reject) => {
      const LEAFLET_CSS_ID = 'fg-leaflet-css';
      if (document.getElementById(LEAFLET_CSS_ID))
        return resolve();
      const link = document.createElement('link');
      link.id = LEAFLET_CSS_ID;
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_CDN;

      // 加载成功
      link.onload = () => {
        resolve();
      };

      // 加载失败
      link.onerror = () => {
        reject(new Error('LEAFLET CSS 加载失败'));
      };

      document.head.appendChild(link);
    });
  }

  const { load: loadEsriLeaflet } = useScriptTag(ESRI_LEAFLET_CDN, () => {}, {
    immediate: false,
    manual: true
  });
  const { load: loadLeaflet } = useScriptTag(LEAFLET_CDN, () => {}, {
    immediate: false,
    manual: true
  });

  const domRef = ref<HTMLElement | null>(null);

  const route = unref(router.currentRoute);
  const isKeepAlive = route.meta.keepAlive;

  const { onRender, onUpdated, onDestroy } = hooks;

  const { instance: mapInstance, isRendered } = useRender(domRef, {
    async render() {
      loading.value = true;
      await Promise.all([
        loadLeafletCss(),
        loadLeaflet(true)
      ]);
      await loadEsriLeaflet(true);
      loading.value = false;

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
      if (!instance?.value)
        return;

      await onDestroy?.(instance?.value);
      if (!isKeepAlive || isForce) {
        instance?.value?.off();
        instance?.value?.remove();
        if (!instance.value)
          return;
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
    if (!isRendered() || updateQueue.value.length === 0)
      return;

    while (updateQueue.value.length > 0) {
      const operation = updateQueue.value.shift();

      if (!operation)
        continue;

      try {
        const { callback, resolve } = operation;

        callback(mapInstance.value!);

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
    updateMap,
    loading
  };
}
