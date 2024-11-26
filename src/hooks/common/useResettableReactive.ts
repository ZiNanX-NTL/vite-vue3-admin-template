function defaultClone(value: any) {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}
export default function useResettableReactive<T extends object>(value: T, clone = defaultClone) {
  const defaultValue = value;
  const state = reactive<T>(clone(defaultValue));

  const setDefaultValue = (val: T) => {
    Object.assign(defaultValue, val);
  };
  const reset = () => {
    Object.keys(state).forEach(key => Reflect.deleteProperty(state, key));
    Object.assign(state, clone(defaultValue));
  };

  return { state, reset, setDefaultValue };
}
