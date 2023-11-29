import { isObject } from './typeof';

/**
 * 合并对象
 */
export const merge = (...objs) =>
  [...objs].reduce(
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
