import { handleModuleRoutes } from '../helpers';

const modules = import.meta.glob('./**/*.ts', { eager: true }) as AuthRoute.RouteModule;

export const routes = handleModuleRoutes(modules);
