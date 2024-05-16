import { BasicLayout, BlankLayout } from '@/layouts';
import { isFunction } from '@/utils';
import { views } from './autoRegister';

/**
 * 获取布局相关方法
 */
export function getLayout() {
  const layoutComponent = {
    basic: BasicLayout,
    blank: BlankLayout
  };
  /**
   * 布局的所有名称
   */
  const layoutTypes = Object.keys(layoutComponent);
  /**
   * 获取布局的vue文件(懒加载的方式)
   * @param layoutType - 布局类型
   */
  function getLayoutComponent(layoutType) {
    return layoutComponent[layoutType];
  }

  return {
    layoutTypes,
    getLayoutComponent
  };
}

/**
 * 获取页面导入的vue文件
 * @param routeKey - 路由key
 */
export function getViewComponent(routeKey) {
  if (!views[routeKey]) {
    throw new Error(`路由“${routeKey}”没有对应的组件文件！`);
  }
  return setViewComponentName(views[routeKey], routeKey);
}

/**
 * 给页面组件设置名称
 * @param component - 组件
 * @param name - 路由名称
 */
export function setViewComponentName(component, name) {
  if (isAsyncComponent(component)) {
    return async () => {
      const result = await component();
      Object.assign(result.default, { name });
      return result;
    };
  }

  Object.assign(component, { name });

  return component;
}

function isAsyncComponent(component) {
  return isFunction(component);
}
