import { isBoolean, isNumber, isRegExp, isString } from './typeof';

/**
 * EnumFactory 类用于创建枚举工厂，扩展枚举对象：keys、values(含 key 值的[{key,text,type}])、formatter。
 */
export class EnumFactory {
  /**
   * 创建一个枚举工厂实例。
   * @param {Object} enumObj 枚举值，支持标准模式 {key:{text,type},}，简单模式 {key:text,}（会自动转换为标准模式）
   * @param {Function} keyParseFunc key 的转换函数，默认 null，如果 key 为整数则传 parseInt
   * @param {Object} options 额外的选项，例如 { allowNullText: true } 允许 text 为空
   */
  constructor(enumObj, keyParseFunc = null, options = {}) {
    if (!enumObj || typeof enumObj !== 'object') {
      throw new Error('enumObj must be a valid object.');
    }

    this.enumObj = enumObj;
    this.keyParseFunc = keyParseFunc;
    this.options = options;

    this.generateEnumProperties();
    this.freezeEnum();
  }

  /**
   * 生成枚举的 keys 和 values 属性
   */
  generateEnumProperties() {
    const { keyParseFunc, options } = this;
    const keys = [];
    const values = [];

    for (const key in this.enumObj) {
      if (Object.hasOwn(this.enumObj, key)) {
        const parsedKey = keyParseFunc ? keyParseFunc(key) : key;
        const text = EnumFactory.extractTextFromItem(this.enumObj[key], key, options);
        const value = {
          key: parsedKey,
          text,
          ...(typeof this.enumObj[key] === 'string' ? {} : this.enumObj[key])
        };

        keys.push(parsedKey);
        values.push(value);

        this[parsedKey] = value;
      }
    }

    this.keys = keys;
    this.values = values;
  }

  /**
   * 从枚举项中提取文本，支持标准模式和简单模式
   * @param {string|Object} item 枚举项
   * @param {string} key 枚举的 key
   * @param {Object} options 额外的选项
   * @returns {string} 枚举项的文本
   */
  static extractTextFromItem(item, key, options) {
    if (isString(item) || isBoolean(item) || isNumber(item) || isRegExp(item)) {
      return item;
    } else if (item && item.text) {
      return item.text;
    } else if (options.allowNullText) {
      return '';
    }
    return key;
  }

  /**
   * 根据 key 获取对应的文本值，如果不存在则返回默认值
   * @param {string} key 枚举的 key
   * @param {string} defaultValue 默认值
   * @returns {string} 枚举项的文本值或默认值
   */
  getTextByKey(key, defaultValue = '') {
    const enumItem = this.getEnumByKey(key);
    return enumItem ? enumItem.text : defaultValue;
  }

  /**
   * 根据文本值获取对应的 key，如果不存在则返回默认值
   * @param {string} text 枚举项的文本值
   * @param {string} defaultValue 默认值
   * @returns {string} 枚举项的 key 或默认值
   */
  getKeyByText(text, defaultValue = '') {
    const enumItem = this.getEnumByText(text);
    return enumItem ? enumItem.key : defaultValue;
  }

  /**
   * 根据 key 获取对应的枚举项，如果不存在则返回 null
   * @param {string} key 枚举的 key
   * @returns {Object|null} 包含 key 和 text 的枚举项，或者 null
   */
  getEnumByKey(key) {
    return this.values.find(v => v.key === key) || null;
  }

  /**
   * 根据文本值获取对应的枚举项，如果不存在则返回 null
   * @param {string} text 枚举项的文本值
   * @returns {Object|null} 包含 key 和 text 的枚举项，或者 null
   */
  getEnumByText(text) {
    return this.values.find(v => v.text === text) || null;
  }

  /**
   * 冻结枚举，使其不可修改
   */
  freezeEnum() {
    Object.freeze(this);
  }
}
