import type { RouteComponent } from 'vue-router';
import { BasicLayout, BlankLayout } from '@/layouts';
import { isFunction } from '@/utils';
import { views } from './autoRegister';

type Lazy<T> = () => Promise<T>;

interface ModuleComponent {
	default: RouteComponent;
}

type LayoutComponent = Record<UnionKey.LayoutComponentType, Lazy<ModuleComponent>>;

/** 获取布局相关方法 */
export function getLayout() {
	const layoutComponent: LayoutComponent = {
		basic: BasicLayout,
		blank: BlankLayout
	};
	/** 布局的所有名称 */
	const layoutTypes = Object.keys(layoutComponent) as UnionKey.LayoutComponentType[];
	/**
	 * 获取布局的vue文件(懒加载的方式)
	 *
	 * @param layoutType - 布局类型
	 */
	function getLayoutComponent(layoutType: UnionKey.LayoutComponentType) {
		return layoutComponent[layoutType];
	}

	return {
		layoutTypes,
		getLayoutComponent
	};
}

/**
 * 获取页面导入的vue文件
 *
 * @param routeKey - 路由key
 */
export function getViewComponent(routeKey: string) {
	if (!views[routeKey]) {
		throw new Error(`路由“${routeKey}”没有对应的组件文件！`);
	}
	return setViewComponentName(views[routeKey], routeKey);
}

/**
 * 给页面组件设置名称
 *
 * @param component - 组件
 * @param name - 路由名称
 */
export function setViewComponentName(component: RouteComponent | Lazy<ModuleComponent>, name: string) {
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

function isAsyncComponent(component: RouteComponent | Lazy<ModuleComponent>): component is Lazy<ModuleComponent> {
	return isFunction(component);
}
