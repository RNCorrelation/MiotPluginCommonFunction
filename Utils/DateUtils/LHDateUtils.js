/*
 * @Date: 2019-10-11 09:28:04
 * @LastEditors: Lavie
 * @LastEditTime: 2019-10-11 10:22:35
 */
import { Host } from 'miot';
import { LHCommonLocalizableString } from 'LHCommonFunction';

/**
* @module LHDateUtils
* @description 日期处理模块
* @example
* import {
*   LHDateUtils
* } from 'LHCommonFunction';
*
* console.log(LHDateUtils.DateFormat('yyyy/MM/dd hh:mm:ss', 1552468252))
*/
export default class LHDateUtils {
  /**
   * @static
   * @function DateFormat
   * @description 日期格式化
   * @param {string} format 格式化的格式
   * @param {number | string} time 10位时间戳
   * @param {boolean} [isUtc=false] 是否按照世界时 UTC返回
   * @return {string} 格式化后的日期
   */
  static DateFormat(format, time, isUtc) {
    const time2Date = (value) => {
      if (Number(value) > 10000000000) {
        return new Date(value);
      }
      return new Date(value * 1000);
    };
    const date = time2Date(time);
    let formatS = format;
    let fortmatKey;
    let fullYear;
    if (isUtc) {
      fortmatKey = {
        'M+': date.getUTCMonth() + 1,
        'd+': date.getUTCDate(),
        'h+': date.getUTCHours(),
        'm+': date.getUTCMinutes(),
        's+': date.getUTCSeconds(),
        'q+': Math.floor((date.getUTCMonth() + 3) / 3),
        'S+': date.getMilliseconds()
      };
      fullYear = date.getUTCFullYear();
    } else {
      fortmatKey = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S+': date.getMilliseconds()
      };
      fullYear = date.getFullYear();
    }
    if (/(y+)/i.test(formatS)) {
      formatS = formatS.replace(RegExp.$1, (fullYear + '').substr(4 - RegExp.$1.length));
    }
    // eslint-disable-next-line
    for (const k in fortmatKey) {
      if (new RegExp('(' + k + ')').test(formatS)) {
        formatS = formatS.replace(RegExp.$1, RegExp.$1.length === 1 ? fortmatKey[k] : ('00' + fortmatKey[k]).substr(('' + fortmatKey[k]).length));
      }
    }
    return formatS;
  }

  /**
   * @static
   * @function GetStandardTimeText
   * @description 获取标准月/日时间
   * @param time 10位时间戳
   * @return {string} 格式化后的日期
   */
  static GetStandardTimeText(time) {
    const today = new Date();
    const todaySec = Math.floor(today.getTime() / 1000);
    const yesterday = new Date(today.getFullYear(), today.getMonth());
    yesterday.setDate(today.getDate() - 1);
    const yesterdaySec = Math.floor(yesterday.getTime() / 1000);
    if (LHDateUtils.DateFormat('yyyy-MM-dd', todaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
      return LHCommonLocalizableString.common_log_today;
    } else if (LHDateUtils.DateFormat('yyyy-MM-dd', yesterdaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
      return LHCommonLocalizableString.common_log_yesterday;
    }
    if (LHDateUtils.DateFormat('yyyy', todaySec) !== LHDateUtils.DateFormat('yyyy', time)) {
      return LHDateUtils.DateFormat(LHDateUtils.GetDateFormatter(true), time);
    }
    return LHDateUtils.DateFormat(LHDateUtils.GetDateFormatter(), time);
  }

  /**
   * @static
   * @function GetHomeLogTime
   * @description 获取首页最新一条日志格式化时间
   * @param time 10位时间戳
   * @return {string} 格式化后的日期
   */
  static GetHomeLogTime(time) {
    const today = new Date();
    const todaySec = Math.floor(today.getTime() / 1000);
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    const yesterday = new Date(todayYear, todayMonth);
    yesterday.setDate(todayDate - 1);
    const yesterdaySec = Math.floor(yesterday.getTime() / 1000);
    if (LHDateUtils.DateFormat('yyyy-MM-dd', todaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
      return LHDateUtils.DateFormat('hh:mm', time);
    } else if (LHDateUtils.DateFormat('yyyy-MM-dd', yesterdaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
      return LHCommonLocalizableString.common_log_yesterday + ' ' + LHDateUtils.DateFormat('hh:mm', time);
    }
    return todayYear === (new Date(time * 1000)).getFullYear() ? LHDateUtils.DateFormat(LHDateUtils.GetDateFormatter() + ' hh:mm', time) : LHDateUtils.DateFormat(LHDateUtils.GetDateFormatter(true) + ' hh:mm', time);
  }

  /**
   * @static
   * @description 根据语言获取日期格式
   * @param hasYear 是否有年份
   * @returns string
   */
  static GetDateFormatter(hasYear) {
    // const MDY = ['en'];
    const YMD = ['ja', 'zh', 'zh_tw', 'zh_hk', 'ko'];
    const DMY = ['es', 'fr', 'ru', 'it', 'pl', 'id', 'de', 'vi', 'th', 'pt', 'ar', 'tr'];
    const { language } = Host.locale;
    if (DMY.indexOf(language) > -1) {
      return hasYear ? 'dd/MM/yyyy' : 'dd/MM';
    } else if (YMD.indexOf(language) > -1) {
      return hasYear ? 'yyyy/MM/dd' : 'MM/dd';
    } else {
      return hasYear ? 'MM/dd/yyyy' : 'MM/dd';
    }
  }

  /**
   * @static
   * @description 根据语言获取日期格式中划线
   * @param hasYear 是否有年份
   * @returns string
   */
  static GetDateFormatterCommon(hasYear, symbol = '/') {
    // const MDY = ['en'];
    const YMD = ['ja', 'zh', 'zh_tw', 'zh_hk', 'ko'];
    const DMY = ['es', 'fr', 'ru', 'it', 'pl', 'id', 'de', 'vi', 'th', 'pt', 'ar', 'tr'];
    const { language } = Host.locale;
    if (DMY.indexOf(language) > -1) {
      return hasYear ? 'dd' + symbol + 'MM' + symbol + 'yyyy' : 'dd' + symbol + 'MM';
    } else if (YMD.indexOf(language) > -1) {
      return hasYear ? 'yyyy' + symbol + 'MM' + symbol + 'dd' : 'MM' + symbol + 'dd';
    } else {
      return hasYear ? 'MM' + symbol + 'dd' + symbol + 'yyyy' : 'MM' + symbol + 'dd';
    }
  }

  /**
   * @static
   * @description 判断当年是不是闰年
   * @param eDate
   * @returns {boolean}
   */
  static isLeapYear(eDate) {
    const year = eDate.getFullYear();
    return (((year % 4 === 0) && ((year % 100) !== 0)) || (year % 400 === 0));
  }

  /**
   * @static
   *  @description 获取当月的天数
   * @param eDate
   * @returns {number}
   */
  static getDaysInMonth(eDate) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    daysInMonth[1] = LHDateUtils.isLeapYear(eDate) ? 29 : 28;
    return daysInMonth[eDate.getMonth() + 1];
  }

  static getTimeDiff(date) {
    const currentDate = new Date();
    currentDate.setMinutes(0);
    currentDate.setHours(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    const difValue = (date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(difValue);
  }

  static isTomorrow(date) {
    if (this.getTimeDiff(date) === 1) {
      return true;
    } else {
      return false;
    }
  }

  static isYesterday(date) {
    if (this.getTimeDiff(date) === -1) {
      return true;
    } else {
      return false;
    }
  }

  static isToday(date) {
    if (this.getTimeDiff(date) === 0) {
      return true;
    } else {
      return false;
    }
  }

  static isAfter(date) {
    const currentDate = new Date();
    if (date.getTime() > currentDate.getTime()) {
      return true;
    }
    return false;
  }

  static isBefore(date) {
    const currentDate = new Date();
    if (date.getTime() < currentDate.getTime()) {
      return true;
    }
    return false;
  }
}
