import setupNetworkDirective from './network';
import type { App } from 'vue';

/** setup custom vue directives. - [安装自定义的vue指令] */
export function setupDirectives(app: App) {
  setupNetworkDirective(app);
}
