import { computed, effectScope, nextTick, onScopeDispose, ref, unref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, GaugeChart, LineChart, PictorialBarChart, PieChart, RadarChart, ScatterChart } from 'echarts/charts';
import type {
  BarSeriesOption,
  GaugeSeriesOption,
  LineSeriesOption,
  PictorialBarSeriesOption,
  PieSeriesOption,
  RadarSeriesOption,
  ScatterSeriesOption
} from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components';
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
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
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | ToolboxComponentOption
  | DatasetComponentOption
>;

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  PictorialBarChart,
  RadarChart,
  GaugeChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

interface ChartHooks {
  onRender?: (chart: echarts.ECharts) => void | Promise<void>;
  onUpdated?: (chart: echarts.ECharts) => void | Promise<void>;
  onDestroy?: (chart: echarts.ECharts) => void | Promise<void>;
}

/**
 * use echarts
 *
 * @param optionsFactory echarts options factory function
 * @param darkMode dark mode
 */
export function useEcharts<T extends ECOption>(optionsFactory: () => T, hooks: ChartHooks = {}) {
  const scope = effectScope();

  const themeStore = useThemeStore();
  const darkMode = computed(() => themeStore.darkMode);

  const domRef = ref<HTMLElement | null>(null);

  const chartOptions: T = optionsFactory();

  const route = unref(router.currentRoute);
  const isKeepAlive = route.meta.keepAlive;

  const showLoading = (instance: echarts.ECharts) => {
    const textColor = darkMode.value ? 'rgb(224, 224, 224)' : 'rgb(31, 31, 31)';
    const maskColor = darkMode.value ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)';

    instance.showLoading({
      color: themeStore.themeColor,
      textColor,
      fontSize: 14,
      maskColor
    });
  };
  const hideLoading = (instance: echarts.ECharts) => {
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

      const chart = echarts.init(domRef.value, chartTheme);

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

  /**
   * update chart options
   *
   * @param callback callback function
   */
  async function updateOptions(callback: (opts: T, optsFactory: () => T) => ECOption = () => chartOptions) {
    if (!isRendered()) return;

    const updatedOpts = callback(chartOptions, optionsFactory);

    Object.assign(chartOptions, updatedOpts);

    if (isRendered()) {
      chartInstance.value?.clear();
    }

    chartInstance.value?.setOption({ ...updatedOpts, backgroundColor: 'transparent' });

    hideLoading(chartInstance.value!);
    await onUpdated?.(chartInstance.value!);
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
    setOptions
  };
}
