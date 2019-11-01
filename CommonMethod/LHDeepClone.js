/**
 * @ignore
 * @module DeepClone
 * @description 深拷贝函数
 * @params source 要拷贝的对象或数组
 * @params targetObj 将要拷贝的对象或数组拷贝到的对象或数组
 */
export default function DeepClone(source, targetObj) {
  if (!source || typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone');
  }
  let result = targetObj;
  if (!result) {
    result = source.constructor === Array ? [] : {};
  }
  // eslint-disable-next-line
  for (const keys in source) {
    // eslint-disable-next-line
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        result[keys] = source[keys].constructor === Array ? [] : {};
        result[keys] = DeepClone(source[keys]);
      } else {
        result[keys] = source[keys];
      }
    }
  }
  return result;
}
