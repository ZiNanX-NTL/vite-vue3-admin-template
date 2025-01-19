import { computed, effectScope, nextTick, onScopeDispose, ref, unref, watch } from 'vue';
import * as echarts from 'echarts/core';
import {
  BarChart,
  GaugeChart,
  LineChart,
  MapChart,
  PictorialBarChart,
  PieChart,
  RadarChart,
  ScatterChart
} from 'echarts/charts';
import type {
  BarSeriesOption,
  GaugeSeriesOption,
  LineSeriesOption,
  MapSeriesOption,
  PictorialBarSeriesOption,
  PieSeriesOption,
  RadarSeriesOption,
  ScatterSeriesOption
} from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components';
import type {
  DataZoomComponentOption,
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TimelineComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { router } from '@/router';
import { useThemeStore } from '@/store';
import { useRender } from '../common';

export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | ScatterSeriesOption
  | PictorialBarSeriesOption
  | RadarSeriesOption
  | GaugeSeriesOption
  | MapSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | ToolboxComponentOption
  | DatasetComponentOption
  | DataZoomComponentOption
  | TimelineComponentOption
>;

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  DataZoomComponent,
  TimelineComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  PictorialBarChart,
  RadarChart,
  GaugeChart,
  MapChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

interface ChartHooks {
  onRender?: (chart: echarts.ECharts) => void | Promise<void>;
  onUpdated?: (chart: echarts.ECharts) => void | Promise<void>;
  onDestroy?: (chart: echarts.ECharts) => void | Promise<void>;
}

interface OtherOptions {
  /** clear chart before update */
  clear?: boolean;
}

/**
 * use echarts
 *
 * @param optionsFactory echarts options factory function
 * @param darkMode dark mode
 */
export function useEcharts<T extends ECOption>(
  optionsFactory: () => T,
  hooks: ChartHooks = {},
  oOptions: OtherOptions = {}
) {
  const scope = effectScope();

  const themeStore = useThemeStore();
  const darkMode = computed(() => themeStore.darkMode);

  const domRef = ref<HTMLElement | null>(null);

  const chartOptions: T = optionsFactory();

  const route = unref(router.currentRoute);
  const isKeepAlive = route.meta.keepAlive;

  const otherOptions: OtherOptions = {
    clear: true,
    ...oOptions
  };

  const showLoading = (instance: echarts.ECharts | null) => {
    const textColor = darkMode.value ? 'rgb(224, 224, 224)' : 'rgb(31, 31, 31)';
    const maskColor = darkMode.value ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)';

    if (!instance) return;
    instance.showLoading({
      color: themeStore.colorScheme[0],
      textColor,
      fontSize: 14,
      maskColor
    });
  };

  const hideLoading = (instance: echarts.ECharts | null) => {
    if (!instance) return;
    instance.hideLoading();
  };

  const { onRender, onUpdated, onDestroy } = hooks;

  const {
    instance: chartInstance,
    isRendered,
    render,
    destroy
  } = useRender(domRef, {
    async render() {
      const chartTheme = darkMode.value ? 'dark' : undefined;

      await nextTick();

      const chart = echarts.init(domRef.value, chartTheme, { locale: 'ZH' });

      showLoading(chart);
      await onRender?.(chart);

      chart.setOption({ ...chartOptions, backgroundColor: 'transparent' });

      return chart;
    },
    resize(instance) {
      instance?.value?.resize();
    },
    async destroy(instance, isForce = false) {
      if (!instance?.value) return;
      await onDestroy?.(instance?.value);
      if (!isKeepAlive || isForce) {
        instance?.value?.dispose();
        instance.value = null;
      }
    }
  });

  // 定义更新操作的接口
  interface UpdateOperation {
    callback: (opts: T, optsFactory: () => T) => ECOption;
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
        const updatedOpts = callback(chartOptions, optionsFactory);

        Object.assign(chartOptions, updatedOpts);

        chartInstance.value?.setOption({ ...updatedOpts, backgroundColor: 'transparent' });

        hideLoading(chartInstance.value!);
        // eslint-disable-next-line no-await-in-loop
        await onUpdated?.(chartInstance.value!);
        resolve();
      } catch (error) {
        operation.reject(error);
      }
    }
  };

  /**
   * 更新图表配置
   *
   * @param callback 更新回调函数
   * @returns Promise
   */
  async function updateOptions(callback: (opts: T, optsFactory: () => T) => ECOption = () => chartOptions) {
    if (isRendered() && otherOptions.clear) {
      chartInstance.value?.clear();
    }
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

  function setOptions(options: T) {
    chartInstance.value?.setOption(options);
  }

  /** change chart theme */
  async function changeTheme() {
    await destroy(chartInstance, true);
    if (!chartInstance.value) {
      const tmp = await render();
      if (!chartInstance.value) {
        chartInstance.value = tmp;
      }
    }
    hideLoading(chartInstance.value!);
    await onUpdated?.(chartInstance.value!);
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

  scope.run(() => {
    watch(darkMode, () => {
      changeTheme();
    });
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    domRef,
    updateOptions,
    setOptions,
    instance: chartInstance,
    showLoading,
    hideLoading
  };
}
