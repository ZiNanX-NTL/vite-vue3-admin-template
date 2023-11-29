import { dataTypeLabels } from '@/constants';

function getDataTypeString(value) {
  return Object.prototype.toString.call(value);
}

export function isNumber(value) {
  return getDataTypeString(value) === dataTypeLabels.number;
}

export function isString(value) {
  return getDataTypeString(value) === dataTypeLabels.string;
}

export function isBoolean(value) {
  return getDataTypeString(value) === dataTypeLabels.boolean;
}

export function isNull(value) {
  return getDataTypeString(value) === dataTypeLabels.null;
}

export function isUndefined(value) {
  return getDataTypeString(value) === dataTypeLabels.undefined;
}

export function isSymbol(value) {
  return getDataTypeString(value) === dataTypeLabels.symbol;
}

export function isBigInt(value) {
  return getDataTypeString(value) === dataTypeLabels.bigInt;
}

export function isObject(value) {
  return getDataTypeString(value) === dataTypeLabels.object;
}

export function isArray(value) {
  return getDataTypeString(value) === dataTypeLabels.array;
}

export function isFunction(value) {
  return getDataTypeString(value) === dataTypeLabels.function;
}

export function isDate(value) {
  return getDataTypeString(value) === dataTypeLabels.date;
}

export function isRegExp(value) {
  return getDataTypeString(value) === dataTypeLabels.regExp;
}

export function isPromise(value) {
  return getDataTypeString(value) === dataTypeLabels.promise;
}

export function isSet(value) {
  return getDataTypeString(value) === dataTypeLabels.set;
}

export function isMap(value) {
  return getDataTypeString(value) === dataTypeLabels.map;
}

export function isFile(value) {
  return getDataTypeString(value) === dataTypeLabels.file;
}
