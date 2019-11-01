/*
 * @Date: 2019-08-28 17:15:36
 * @LastEditors: Lavie
 * @LastEditTime: 2019-09-16 10:27:56
 */


/**
 *
 *
 * @export
 * @class LHStringUtils
 */
export default class LHStringUtils {
  /**
   *
   * 判断是否包含 emoji 表情
   * @static
   * @param {*} substring
   * @returns
   * @memberof LHStringUtils
   */
  static isContainsEmoji(substring) {
    if (substring) {
      for (let i = 0; i < substring.length; i += 1) {
        const hs = substring.charCodeAt(i);
        if (hs >= 0xd800 && hs <= 0xdbff) {
          if (substring.length > 1) {
            const ls = substring.charCodeAt(i + 1);
            const uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
            if (uc >= 0x1d000 && uc <= 0x1f9f9) {
              return true;
            }
          }
        } else if (substring.length > 1) {
          const ls = substring.charCodeAt(i + 1);
          if (ls === 0x20e3
            || ls === 0xfe0f
            || ls === 0xd83c) {
            return true;
          }
        } else if (hs >= 0x2100 && hs <= 0x27ff && hs !== 0x2103) {
          return true;
        } else if (hs >= 0x2B05 && hs <= 0x2b07) {
          return true;
        } else if (hs >= 0x2934 && hs <= 0x2935) {
          return true;
        } else if (hs >= 0x3297 && hs <= 0x3299) {
          return true;
        } else if (hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030
              || hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b
              || hs === 0x2b50 || hs === 0x231a) {
          return true;
        }
      }
    }
    return false;
  }


  /**
   *
   *  判断字符串是否包含特殊字符
   * @static
   * @param {*} substring
   * @returns
   * @memberof LHStringUtils
   * 不支持 ["!$^*{}<>?[]=\]|--
   * PS.-- 是连在一起的，不是单个。
   */
  static isContainsNotSupportChar(substring) {
    if (substring.indexOf('--') !== -1) {
      return true;
    }
    if (substring.indexOf('\\') !== -1) {
      return true;
    }
    const pattern = new RegExp('[!$^*{}<>?\\[\\]=|]');
    if (pattern.test(substring)) {
      return true;
    }
    return false;
  }

  /**
   * @description: 获取字符串的字符长度
   * @param {type} str
   * @return: 字符串的字符长度
   */
  static judgeStringLength = (str) => {
    let strLen = 0;
    for (let i = 0; i < str.length; i += 1) {
      const code = str.charAt(i);
      if (code.match(/[^\x00-\xff]/ig) !== null) {
        strLen += 2;
      } else {
        strLen += 1;
      }
    }
    return strLen;
  }
}