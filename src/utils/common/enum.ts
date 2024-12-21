import { isBoolean, isNumber, isRegExp, isString } from './typeof';

interface EnumFactoryOptions {
  /** key 的转换函数，默认 undefined，如果 key 为整数则传 parseInt */
  keyParseFunc?: (key: any) => any;
  /** label 的 key，默认 'label' */
  labelKey?: string;
  /** value 的 key，默认 'value' */
  valueKey?: string;
  /** 允许 text 为空，默认 false */
  allowNullText?: boolean;
}

/** EnumFactory 类用于创建枚举工厂，扩展枚举对象：keys、values(含 key 值的[{key,text,type}])、formatter。 */
export class EnumFactory<T extends Record<any, any> = Record<string, any>> {
  enumObj: T;

  options: EnumFactoryOptions;

  keyParseFunc?: (key: any) => any;

  labelKey: string;

  valueKey: string;

  keys: (keyof T)[];

  values: any[];

  valuesMap = new Map<keyof T, any>();

  /**
   * 创建一个枚举工厂实例。
   *
   * @param {Object} enumObj 枚举值，支持标准模式 {key:{text,type},}，简单模式 {key:text,}（会自动转换为标准模式）
   * @param {Object} options 额外的选项，例如 { allowNullText: true } 允许 text 为空
   * @param {Function} options.keyParseFunc key 的转换函数，默认 undefined，如果 key 为整数则传 parseInt
   */
  constructor(enumObj: T, options: EnumFactoryOptions = {}) {
    if (!enumObj || typeof enumObj !== 'object') {
      throw new Error('enumObj must be a valid object.');
    }

    const defaultOptions = { keyParseFunc: undefined, labelKey: 'label', valueKey: 'value', allowNullText: false };
    this.enumObj = enumObj;
    this.options = { ...defaultOptions, ...options };
    this.keyParseFunc = this.options.keyParseFunc;
    this.labelKey = this.options.labelKey!;
    this.valueKey = this.options.valueKey!;
    this.keys = [];
    this.values = [];

    this.generateEnumProperties();
    this.freezeEnum();
  }

  /** 生成枚举的 keys 和 values 属性 */
  generateEnumProperties() {
    const { keyParseFunc, options, labelKey, valueKey } = this;
    const keys = [] as (keyof T)[];
    const values = [];

    for (const key in this.enumObj) {
      if (Object.hasOwn(this.enumObj, key)) {
        const parsedKey: keyof T = keyParseFunc ? keyParseFunc(key) : String(key);
        const text = this.extractTextFromItem(this.enumObj[key], key, options);
        const value = {
          [valueKey]: parsedKey,
          [labelKey]: text,
          ...(typeof this.enumObj[key] === 'string' ? {} : this.enumObj[key])
        };

        keys.push(parsedKey);
        values.push(value);

        this.valuesMap.set(parsedKey, value);
      }
    }

    this.keys = keys;
    this.values = values;
  }

  /**
   * 从枚举项中提取文本，支持标准模式和简单模式
   *
   * @param {string | Object} item 枚举项
   * @param {string} key 枚举的 key
   * @param {Object} options 额外的选项
   * @returns {string} 枚举项的文本
   */
  extractTextFromItem(item: any, key: string, options: EnumFactoryOptions) {
    if (isString(item) || isBoolean(item) || isNumber(item) || isRegExp(item)) {
      return item;
    } else if (item && item[this.labelKey]) {
      return item[this.labelKey];
    } else if (options.allowNullText) {
      return '';
    }
    return key;
  }

  /**
   * 根据 key 获取对应的枚举项
   *
   * @param {keyof T} key 枚举的 key
   * @returns {Object | null} 包含 key 和 text 的枚举项，或者 null
   */
  get(key: keyof T): T[keyof T] | null {
    const parseKey = this.keyParseFunc ? this.keyParseFunc(key) : String(key);
    return this.valuesMap.get(parseKey);
  }

  /**
   * 根据 key 获取对应的文本值，如果不存在则返回默认值
   *
   * @param {string} key 枚举的 key
   * @param {string} defaultValue 默认值
   * @returns {string} 枚举项的文本值或默认值
   */
  getTextByKey(key: keyof T, defaultValue = ''): string {
    const enumItem = this.getEnumByKey(key);
    return enumItem ? enumItem.text : defaultValue;
  }

  /**
   * 根据文本值获取对应的 key，如果不存在则返回默认值
   *
   * @param {string} text 枚举项的文本值
   * @param {string} defaultValue 默认值
   * @returns {string} 枚举项的 key 或默认值
   */
  getKeyByText(text: string, defaultValue = ''): keyof T {
    const enumItem = this.getEnumByText(text);
    return enumItem ? enumItem.key : defaultValue;
  }

  /**
   * 根据 key 获取对应的枚举项，如果不存在则返回 null
   *
   * @param {string} key 枚举的 key
   * @returns {Object | null} 包含 key 和 text 的枚举项，或者 null
   */
  getEnumByKey(key: keyof T): T[keyof T] | null {
    const parseKey = this.keyParseFunc ? this.keyParseFunc(key) : String(key);
    return this.values!.find(v => v[this.valueKey] === parseKey) || null;
  }

  /**
   * 根据文本值获取对应的枚举项，如果不存在则返回 null
   *
   * @param {string} text 枚举项的文本值
   * @returns {Object | null} 包含 key 和 text 的枚举项，或者 null
   */
  getEnumByText(text: string): T[keyof T] | null {
    return this.values!.find(v => v[this.labelKey] === text) || null;
  }

  /** 冻结枚举，使其不可修改 */
  freezeEnum() {
    Object.freeze(this);
  }
}
