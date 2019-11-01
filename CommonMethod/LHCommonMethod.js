import { Device, Service } from 'miot';
import { Platform } from 'react-native';
import DeepClone from './LHDeepClone';

/* eslint-disable */
function CRC16Array(data) {
  const result = new Array(2);
  const crc16 = 0x8005;
  let crc = 0x00;
  const bitLen = 8;
  if (!data || data.length === 0) {
    return [0, 0];
  }
  let flag;
  for (let k = 0, len = data.length; k < len; k += 1) {
    for (let i = 0; i < bitLen; i += 1) {
      flag = crc >> 15;
      crc <<= 1;
      crc |= (data[k] >> (7 - i)) & 1;
      if ((flag & 1) == 1) {
        crc ^= crc16;
      }
    }
  }
  crc &= 0xffff;
  for (let i = 0; i < result.length; i += 1) {
    result[i] = (crc >> 8 * i & 0xFF);
  }
  return result;
}

// 不同语言的数字本地化千分号和小数点号
const numberLocalMap = new Map([
  ["fi", [" ", ","]],
  ["fr", [" ", ","]],
  ["hr", [".", ","]],
  ["hu", ["", ","]],
  ["id", [".", ","]],
  ["it", [".", ","]],
  ["ja", [",", "."]],
  ["ko", [",", "."]],
  ["nb", [" ", ","]],
  ["nl", [".", ","]],
  ["ca", [".", ","]],
  ["pl", [" ", ","]],
  ["cs", [" ", ","]],
  ["pt-BR", [".", ","]],
  ["da", [".", ","]],
  ["ro", [".", ","]],
  ["de", [".", ","]],
  ["ru", [" ", ","]],
  ["el", [".", ","]],
  ["sk", [" ", ","]],
  ["en-AU", [",", "."]],
  ["sv", [" ", ","]],
  ["en-CA", [",", "."]],
  ["th", [",", "."]],
  ["en-GB", [",", "."]],
  ["tr", [".", ","]],
  ["en-IN", [",", "."]],
  ["uk", [" ", ","]],
  ["en-NZ", [",", "."]],
  ["vi", [".", ","]],
  ["en-SG", [",", "."]],
  ["zh-Hans", [",", "."]],
  ["en-ZA", [" ", ","]],
  ["zh-Hant-HK", [",", "."]],
  ["en", [",", "."]],
  ["zh-Hant", [",", "."]],
  ["ar", [",", "."]],
  ["es", [".", ","]]
]);


/**
* @module CommonMethod
* @description LHMiServer模块，米家Service,Host相关api调用模块
* @example
* import {
*   CommonMethod
* } from 'LHCommonFunction';
*
* CommonMethod.RandomNum(1,20);
*/
export default class CommonMethod {
  /**
  * @static
  * @function DeepClone
  * @description 深拷贝函数
  * @param {Object | Array} source 要拷贝的对象或数组
  * @param {Object | Array} [targetObj] 将要拷贝的对象或数组拷贝到的对象或数组
  * @return {Object | Array} 新的对象或数组
  */
  static DeepClone(source, targetObj) {
    return DeepClone(source, targetObj);
  }

  /**
  * @static
  * @function RandomNum
  * @description 生成随机数函数
  * @param {Number} min 最小值
  * @param {Number} max 最大值
  * @return {number} 随机数
  */
  static RandomNum(min, max) {
    const range = max - min;
    const rand = Math.random();
    const num = min + Math.round(rand * range);
    return num;
  }

  /**
  * @static
  * @function Find
  * @description 查找数组中某个特定属性值是否存在
  * @param {Array} array 数组
  * @param {string} attr 查找的属性
  * @param {string} value 查找的值
  * @return {number} 数据在数值中的位置，返回-1未找到
  */
  static Find(array, attr, value) {
    for (let i = 0, len = array.length; i < len; i += 1) {
      if (array[i][attr] === value) return i;
    }
    return -1;
  }

  /**
  * @static
  * @function FindSpec
  * @description 跟进siid、piid查找数组中的数据
  * @param {Array} array 数组
  * @param {string} siid siid的值
  * @param {string} piid piid的值
  * @return {Object|null} 返回查找到的数据，返回null未找到
  */
  static FindSpec(array, siid, piid) {
    for (let i = 0, len = array.length; i < len; i += 1) {
      if (array[i].siid === siid && array[i].piid === piid) return array[i];
    }
    return null;
  }

  static CRC16String(msg) {
    const data = [];
    for (let i = 0, len = msg.length; i < len; i += 2) {
      data.push('0x' + msg.substr(i, 2));
    }
    const crc = CRC16Array(data);
    let result = '';
    for (let j = 0, len1 = crc.length; j < len1; j += 1) {
      const crcStr = crc[j].toString(16);
      result += crcStr.length < 2 ? ('0' + crcStr) : crcStr;
    }
    return result;
  }

  // 高位在后低位在前 的 16 进制字符串 转化为  低位在前高位在后
  static bigEndianStrToLittleEndianString(hexStr) {
    let littleEndianString = "";
    const byteArr = CommonMethod.hexStrToByteArr(hexStr);
    for (let i = byteArr.length - 1; i >= 0; i -= 1) {
      const hexNum = byteArr[i];
      if (hexNum >= 0 && hexNum <= 255) {
        let hexByteStr = hexNum.toString(16).toUpperCase();
        if (hexByteStr.length % 2 == 1) {
          hexByteStr = '0' + hexByteStr;
        }
        littleEndianString = littleEndianString + hexByteStr;
      }
    }
    return littleEndianString;
  }

  // 16进制字符串转换为10进制数组
  static hexStrToByteArr(hexStr) {

    const byteArr = [];

    if (!hexStr || !hexStr.length || hexStr.length % 2 !== 0) {
      return byteArr;
    }
    // 把原字符串变成大写字符串
    hexStr = hexStr.toLocaleUpperCase();

    // 十六进制常量字符串
    const hexs = '0123456789ABCDEF';

    for (let i = 0; i < hexStr.length / 2; i += 1) {

      var bytePR = hexStr[2 * i];
      var byteSF = hexStr[2 * i + 1];
      // 判断次byte是否是合法byte
      if (bytePR.indexOf(hexs) && byteSF.indexOf(hexs)) {
        byteArr.push(parseInt((bytePR + byteSF), 16));
      }
    }
    return byteArr;
  }

  // 快速排序
  static QuickSort(array, attr) {
    const sortFn = function(start, end) {
      if (start === end) return
      var oStart = start,
        oEnd = end,
        key = array[start]
      while (start < end) {
        if (attr ? (key[attr] <= array[end][attr]) : (key <= array[end])) {
          end--
        } else {
          array[start] = array[end]
          while (end > ++start) {
            if (attr ? (key[attr] < array[start][attr]) : array[start] > key) {
              array[end] = array[start]
              end--
              break
            }
          }
        }
      }
      if (start === oStart) {
        sortFn(++oStart, oEnd);
        return
      }
      array[start] = key;
      if (start === oEnd) {
        sortFn(oStart, --oEnd);
        return
      }
      sortFn(oStart, --start);
      sortFn(++end, oEnd);
    }
    if (array.length > 1) sortFn(0, array.length - 1);
    return array;
  }

  static getDistanceBetweenDot(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  /**
  * @static
  * @function CreatCacheKey
  * @description 生成带用户id和设备id的key
  * @param {string} keyName
  */
  static CreatCacheKey(keyName) {
    return keyName + '_' + Device.deviceID + Service.account.ID;
  }

  /**
  * @static
  * @function PromiseRetry
  * @description 重试Promise
  * @param {Function} request
  * @param {object} option
  * @param {number} option.maxRetryTime 最大重试次数，默认为3
  * @param {number} option.interval 重试间隔，默认为1000ms
  * @param {Function} option.onTest 回调的校验方法
  * @param {array} option.params request的调用参数
  */
  static PromiseRetry(request, option) {
    let p = Promise.reject();
    const defaultOpt = {
      maxRetryTime: 3,
      interval: 1000
    };
    const opt = Object.assign({}, defaultOpt, option);
    const {
      interval, maxRetryTime, onTest, params
    } = opt;
    function rejectDelay(reason) {
      return new Promise(((resolve, reject) => {
        setTimeout(reject.bind(null, reason), interval);
      }));
    }
    for (let i = 0; i < maxRetryTime; i += 1) {
      p = p.catch(request.bind(null, ...(params || []))).then(onTest).catch(rejectDelay);
    }
    return p;
  }

  /**
   * 顺序执行多个异步任务
   */
  static AwaitForeach = async (count, callback) => {
    let k = 0;
    while (k < count) {
      // eslint-disable-next-line no-await-in-loop
      await callback(k);
      k += 1;
    }
  };

  /**
   * @static
   * @function numToLocalString
   * @description 将数字本地化显示，如 123456.789 -> 123,456.789
   * @param {number} number 数据
   * @param {object} options
   * @param {number} options.fixed 保留小数点位数
   * @param {string} options.language 本地化语言
   * @return {string} 数据字符串
   */
  static numToLocalString(number, options) {
    const { fixed, language } = options;
    if (typeof number !== 'number' && Number.isNaN(Number(number))) {
      return number;
    }

    let toFixed = fixed;
    if (typeof toFixed !== 'number' && Number.isNaN(Number(toFixed))) {
      toFixed = 0;
    }

    if (toFixed > 100 || toFixed < 0) {
      console.warn('formatDataNumber 小数点位数不正确');
      return number;
    }

    // 千分位
    function format(num = 0) {
      const lang = numberLocalMap.get(language);
      const thousand = lang ? lang[0] : ',';
      const reg = /\d{1,3}(?=(\d{3})+$)/g;
      return (num + '').replace(reg, '$&' + thousand);
    }

    const formatNumber = (number, fixNum = 0) => {
      const lang = numberLocalMap.get(language);
      const numberPoint = lang ? lang[1] || '.' : '.';
      const elec = number.toFixed(fixNum);
      const int = Math.floor(Number(elec));
      const match = /\.\d*/.exec(elec + '');
      const fraction = match ? match[0] || '' : '';
      const fracString = fraction.replace('.', numberPoint);
      return format(int) + fracString;
    };

    // toLocaleString在安卓上无效，本地化需要自己维护
    if (Platform.OS === 'ios') {
      let value;
      try {
        value = number.toLocaleString(language, { minimumFractionDigits: toFixed, maximumFractionDigits: toFixed });
      } catch (e) {
        value = number.toLocaleString(undefined, { minimumFractionDigits: toFixed, maximumFractionDigits: toFixed });
      }
      return value;
    } else {
      return formatNumber(number, toFixed);
    }
  }
}
