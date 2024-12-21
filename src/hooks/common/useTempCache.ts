import { useRouteStore } from '@/store';

/** 临时页面缓存 */
export default function useTempCache(targetPages: string[]) {
  const { addTempCacheRoute, removeTempCacheRoute } = useRouteStore();

  /** 设置路由缓存 */
  const setKeepPage = (toName: string, fromName: string) => {
    // 判断是否进入目标页面
    if (targetPages.includes(toName)) {
      addTempCacheRoute(fromName);
    } else {
      removeTempCacheRoute(fromName);
    }
  };

  /** 设置路由钩子 */
  onBeforeRouteLeave((to, from) => {
    setKeepPage(to.name as string, from.name as string);
  });
}
