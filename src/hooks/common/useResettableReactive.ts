import type { Reactive } from 'vue';

/** 重置配置 */
type ResettableConfig<T> = {
  transformerState?: (params: T) => any;
};

function defaultClone(value: any) {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}
export default function useResettableReactive<T extends object>(
  value: T,
  config?: ResettableConfig<Reactive<T>>,
  clone = defaultClone
) {
  const defaultValue = value;
  const state = reactive<T>(clone(defaultValue));
  const formatState = reactive<T>({} as T);

  const transformerState = config?.transformerState || ((params: Reactive<T>) => params);

  /** 设置默认值 */
  const setDefaultValue = (val: T) => {
    Object.assign(defaultValue, val);
  };
  /** 重置状态 */
  const reset = () => {
    Object.keys(state).forEach(key => Reflect.deleteProperty(state, key));
    Object.assign(state, clone(defaultValue));
  };
  /** 设置请求参数 */
  const setFormatState = () => {
    Object.assign(formatState, transformerState(state));
  };
  setFormatState();

  return { state, formatState, reset, setDefaultValue, setFormatState };
}
