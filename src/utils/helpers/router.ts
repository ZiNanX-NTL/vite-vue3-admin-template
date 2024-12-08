import { useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import { router as globalRouter } from '@/router';
import { useTabStore } from '@/store';

/**
 * 路由跳转
 * @param inSetup - 是否在vue页面/组件的setup里面调用，在axios里面无法使用useRouter和useRoute
 */

export function useRouterPush(inSetup = true) {
  const { removeTabOnly } = useTabStore();
  const router = inSetup ? useRouter() : globalRouter;
  const route = router.currentRoute;

  /**
   * 路由跳转
   * @param to - 需要跳转的路由
   * @param newTab - 是否在新的浏览器Tab标签打开
   */
  function routerPush(to: RouteLocationRaw, newTab = false) {
    if (newTab) {
      const routerData = router.resolve(to);
      window.open(routerData.href, '_blank');
      return Promise.resolve();
    }
    return router.push(to);
  }

  /** 返回上一级路由 */
  function routerBack() {
    router.go(-1);
  }

  /** 替换路由 */
  function routerReplace(to: RouteLocationRaw) {
    removeTabOnly(route.value.fullPath);
    router.replace(to);
  }

  /**
   * 跳转首页
   * @param newTab - 在新的浏览器标签打开
   */
  function toHome(newTab = false) {
    routerPush({ name: 'root' }, newTab);
  }

  /**
   * 跳转登录页面
   * @param loginModule - 展示的登录模块
   * @param redirectUrl - 重定向地址(登录成功后跳转的地址),默认undefined表示取当前地址为重定向地址
   */
  function toLogin(loginModule?: UnionKey.LoginModule, redirectUrl?: string) {
    const module: UnionKey.LoginModule = loginModule || 'pwd-login';
    const routeLocation: RouteLocationRaw = {
      name: 'login',
      params: { module }
    };
    const redirect = redirectUrl || route.value.fullPath;
    routeLocation.query = {
      redirect
    };
    routerPush(routeLocation);
  }

  /**
   * 登录页切换其他模块
   * @param module - 切换后的登录模块
   */
  function toLoginModule(module: UnionKey.LoginModule) {
    const { query } = route.value;
    routerPush({ name: 'login', params: { module }, query });
  }

  /**
   * 登录成功后跳转重定向的地址
   */
  function toLoginRedirect() {
    const { query } = route.value;
    if (query?.redirect) {
      routerPush(query.redirect as string);
    } else {
      toHome();
    }
  }

  return {
    router,
    route,
    routerPush,
    routerBack,
    routerReplace,
    toHome,
    toLogin,
    toLoginModule,
    toLoginRedirect
  };
}
