/*
 * @Descripttion: 这个类主要处理定时的数据逻辑
 * @version: v1.0.0
 * @Author: nicolas
 * @Date: 2019-09-05 16:08:31
 * @LastEditors: nicolas
 * @LastEditTime: 2019-09-05 18:12:01
 */
import { LHDateUtils, LHCommonLocalizableString, LHTimeSpanUtils } from 'LHCommonFunction';

export default class TimerLogicFunctionManager {
  /**
   * @Author: nicolas
   * @name: isTimePass
   * @Descripttion: 当前时间是否过期
   * @param {timeItem，time}
   */
  static isTimePass(timeItem, time) {
    if (timeItem.setting.enable_timer_on === '1' && timeItem.setting.enable_timer_off === '1') {
      return LHDateUtils.isAfter(time.toDate);
    } else if (timeItem.setting.enable_timer_on === '1' && timeItem.setting.enable_timer_off === '0') {
      return LHDateUtils.isAfter(time.fromDate);
    } else if (timeItem.setting.enable_timer_on === '0' && timeItem.setting.enable_timer_off === '1') {
      return LHDateUtils.isAfter(time.toDate);
    } else {
      // 不存在这种情况
      return false;
    }
  }

  /**
   * @Author: nicolas
   * @name: isOnceTimer
   * @Descripttion: 是否是单次定时
   * @param {wday}
   */
  static isOnceTimer(wday) {
    return wday.length === 0;
  }

  /**
   * @Author: nicolas
   * @name: getTimeData
   * @Descripttion: 获取当前的timespan转化成开始时间和结束时间
   * @param {setting，time}
   */
  static getTimeData(setting, time) {
    const isTimerOnEnable = setting.enable_timer_on === '1';
    const isTimerOffEnable = setting.enable_timer_off === '1';
    const isShowbBothTime = isTimerOnEnable && isTimerOffEnable;
    const isOnce = time.timeSpan.wday.length === 0;

    const showTime = LHTimeSpanUtils.gettimerArrayStr(time.timeSpan);

    const startTimeTimerPrefixString = isOnce ? this.getTimePrefix(time.fromDate) : '';

    const endTimeTimerPrefixString = isOnce ? this.getTimePrefix(time.toDate) : '';

    const type = isShowbBothTime ? '' : (isTimerOnEnable ? LHCommonLocalizableString.common_open : LHCommonLocalizableString.common_close);

    const onceOpenDesctiption = isOnce ? ' | ' + time.fromDate.getFullYear() + '-' + (time.fromDate.getMonth() + 1) + '-' + time.fromDate.getDate() + ' ' + LHCommonLocalizableString.common_open : '';

    const startTime = isTimerOnEnable ? startTimeTimerPrefixString + showTime[0] : '';

    const endTime = isTimerOffEnable ? endTimeTimerPrefixString + showTime[1] : '';

    return {
      type, onceOpenDesctiption, startTime, endTime
    };
  }

  /**
   * @Author: nicolas
   * @name: getTimePrefix
   * @Descripttion: 判断时间段的描述昨天，今天，明天(只限定单次定时)
   * @param {date}
   */
  static getTimePrefix(date) {
    if (LHDateUtils.isYesterday(date)) {
      return LHCommonLocalizableString.common_log_yesterday;
    } else if (LHDateUtils.isTomorrow(date)) {
      return LHCommonLocalizableString.common_repeat_tomorrow;
    } else {
      return '';
    }
  }

  /**
   * @Author: nicolas
   * @name: isSameTimerData
   * @Descripttion: 是否是相同的定时数据比较开始时间和结束时间并且比较天数
   * @param {timeItem, isCreate}
   */
  static isSameTimerData(timeItem, isCreate) {
    const time = LHTimeSpanUtils.getSceneTimerSpan(timeItem.setting.on_time, timeItem.setting.off_time, timeItem.setting.enable_timer_on, timeItem.setting.enable_timer_off, !isCreate);
    if ((timeItem.setting.enable_timer_on === '1' && this.isStartTimeSeted) || (timeItem.setting.enable_timer_off === '1' && this.isEndTimeSeted)) {
      if (isCreate) {
        return false;
      }
    }
    const result = ((time.timeSpan.to.min === this.time.timeSpan.to.min)
    && (time.timeSpan.to.hour === this.time.timeSpan.to.hour)
    && (time.timeSpan.from.min === this.time.timeSpan.from.min)
    && (time.timeSpan.from.hour === this.time.timeSpan.from.hour)
    && (this.checkWeekArray(time.timeSpan.wday, this.time.timeSpan.wday)));
    return result;
  }
}