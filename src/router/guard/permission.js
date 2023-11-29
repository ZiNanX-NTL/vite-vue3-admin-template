import { exeStrategyActions, localStg } from '@/utils';
import { createDynamicRouteGuard } from './dynamic';

/** 处理路由页面的权限 */
export async function createPermissionGuard(to, from, next) {
  // 动态路由
  const permission = await createDynamicRouteGuard(to, from, next);
  if (!permission) return;

  // 外链路由, 从新标签打开，返回上一个路由
  if (to.meta.href) {
    window.open(to.meta.href);
    next({ path: from.fullPath, replace: true, query: from.query });
    return;
  }

  const isLogin = Boolean(localStg.get('token'));
  const needLogin = Boolean(to.meta?.requiresAuth);

  const actions = [
    // 已登录状态跳转登录页，跳转至首页
    [
      isLogin && to.name === 'login',
      () => {
        next({ name: 'root' });
      }
    ],
    // 不需要登录权限的页面直接通行
    [
      !needLogin,
      () => {
        next();
      }
    ],
    // 未登录状态进入需要登录权限的页面
    [
      !isLogin && needLogin,
      () => {
        const redirect = to.fullPath;
        next({ name: 'login', query: { redirect } });
      }
    ],
    // 登录状态进入需要登录权限的页面，有权限直接通行
    [
      isLogin && needLogin,
      () => {
        next();
      }
    ]
  ];

  exeStrategyActions(actions);
}
