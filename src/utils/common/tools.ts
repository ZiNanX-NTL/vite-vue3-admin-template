import { isObject } from './typeof';

/** 合并对象 */
export function merge(...objs: any[]) {
  return [...objs].reduce(
    (acc, obj) =>
      Object.keys(obj).reduce((_a, k) => {
        let accItem;
        if (Object.hasOwn(acc, k)) {
          if (isObject(acc[k]) && isObject(obj[k])) {
            accItem = merge(acc[k], obj[k]);
          } else {
            accItem = obj[k];
          }
        } else {
          accItem = obj[k];
        }
        acc[k] = accItem;
        return acc;
      }, {}),
    {}
  );
}

/** 生成guid */
export function guid() {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
}
