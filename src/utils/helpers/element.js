import { createVNode, render } from 'vue';

// 实例化组件,以达到通过创建组件获取dom的目的
export function instantiatedComponent(component, props) {
  // 创建虚拟dom实例
  const instance = createVNode(component, props);
  // 渲染并挂载虚拟dom
  render(instance, document.createElement('div'));
  return instance;
}
