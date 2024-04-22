import { useThemeStore } from '@/store';
import { useLoading, useRender } from '../../common';
import { ThreeMap } from './threeCustom';

export function useThreeMap(mapData: any) {
  const domRef = ref<HTMLElement | null>(null);

  const { loading, startLoading, endLoading } = useLoading(true);

  const theme = useThemeStore();

  const { instance, isRendered } = useRender(domRef, {
    render: () => {
      const ins = new ThreeMap(domRef.value, {
        mapData,
        themeColor: theme.themeColor,
        taskLoadStart: startLoading,
        taskLoadEnd: endLoading
      });
      ins.render();
      return ins;
    }
  });
  /**
   * update
   *
   * @param callback callback function
   */
  async function update(callback: (instance: ThreeMap | null) => void = () => {}) {
    if (!isRendered()) return;

    callback(instance.value);
  }

  return {
    domRef,
    loading,
    ThreeMap,
    instance,
    update
  };
}
