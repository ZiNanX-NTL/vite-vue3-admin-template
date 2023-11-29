import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { constantRoutes } from './routes';
import { transformAuthRouteToVueRoutes } from './helpers';
import { createRouterGuard } from './guard';

const { VITE_HASH_ROUTE = 'Y', VITE_BASE_URL } = import.meta.env;

export const router = createRouter({
  history: VITE_HASH_ROUTE === 'Y' ? createWebHashHistory(VITE_BASE_URL) : createWebHistory(VITE_BASE_URL),
  routes: transformAuthRouteToVueRoutes(constantRoutes)
});

/** setup vue router. - [安装vue路由] */
export async function setupRouter(app) {
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}

export * from './routes';
export * from './modules';
export * from './helpers';
