import { handleModuleRoutes } from '../helpers';

const modules = import.meta.glob('./**/*.js', { eager: true });

export const routes = handleModuleRoutes(modules);
