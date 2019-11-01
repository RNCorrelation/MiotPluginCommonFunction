function EVERYDAY() {
  return [0, 1, 2, 3, 4, 5, 6];
}

function WORKDAY() {
  return [1, 2, 3, 4, 5];
}

function WEEKDAY() {
  return [0, 6];
}

/**
 * 获取默认的timeSpan:
 * from:开始时间
 * to:结束时间
 * wday:[]=>执行一次  [0,1,2,3,4,5,6] 周期性定时
 *
 * @returns {{wday: number[], from: {min: number, hour: number}, to: {min: number, hour: number}}}
 */
function DEFAULT_TIME_SPAN() {
  return {
    from: {
      hour: 0,
      min: 0
    },
    to: {
      hour: 0,
      min: 0
    },
    wday: EVERYDAY()
  };
}

/**
 * 输入开始时间，结束时间:
 * @param fromTime [7,0]
 * @param toTime [23,0]
 *
 * 输出timespan对象:
 * @returns {{wday: number[], from: {min: number, hour: number}, to: {min: number, hour: number}}}
 */
function getTimeSpan(fromTime, toTime) {
  let timeSpan;
  if (fromTime instanceof Array && fromTime.length === 2
    && toTime instanceof Array && toTime.length === 2) {
    timeSpan = {
      from: {
        hour: Number(fromTime[0]),
        min: Number(fromTime[1])
      },
      to: {
        hour: Number(toTime[0]),
        min: Number(toTime[1])
      },
      wday: EVERYDAY()
    };
  } else {
    timeSpan = DEFAULT_TIME_SPAN();
  }
  return timeSpan;
}

/**
 * 输入timeSpan对象；
 * @param timeSpan
 *
 * 输出时间段的字符串,boolean值表示是否是跨天。['23:00','07:00',false]
 * @returns {[]}
 */
function gettimerArrayStr(timeSpan) {
  const timerArray = ['00:00', '00:00', false];
  if (timeSpan !== null && timeSpan !== undefined) {
    const { from, to } = timeSpan;
    const fromHour = from.hour < 10 ? '0' + from.hour : from.hour;
    const fromMin = from.min < 10 ? '0' + from.min : from.min;
    const toHour = to.hour < 10 ? '0' + to.hour : to.hour;
    const toMin = to.min < 10 ? '0' + to.min : to.min;
    timerArray[0] = fromHour + ':' + fromMin;
    timerArray[1] = toHour + ':' + toMin;
    if ((from.hour * 60 + from.min) > (to.hour * 60 + to.min)) {
      timerArray[2] = true;
    }
  }
  return timerArray;
}

/**
 * 判断是否为夏令时
 * @param date
 * @returns {boolean}
 */
function isSummerTime(date) {
  const springTime = new Date(date.getFullYear(), 0, 1);
  const summerTime = new Date(date.getFullYear(), 6, 1);
  if (springTime.getTimezoneOffset() === summerTime.getTimezoneOffset()
    && summerTime.getTimezoneOffset() === date.getTimezoneOffset()) {
    return false;
  } else {
    return true;
  }
}

/**
 * 北京时间转本地时间
 */
function getLocalDate(east8date) {
  const targetTimezone = -8;
  const dif = new Date().getTimezoneOffset();
  const localTime = east8date.getTime() + (targetTimezone * 60 * 60 * 1000) - dif * 60 * 1000;
  return new Date(localTime);
}

/**
 * 本地时间转北京时间
 */
function getEast8Date(date) {
  const targetTimezone = -8;
  const dif = new Date().getTimezoneOffset();
  const east8time = date.getTime() + dif * 60 * 1000 - (targetTimezone * 60 * 60 * 1000);
  return new Date(east8time);
}

function convertWday(timespan, originDate, zoneDate) {
  const unitDay = 1000 * 60 * 60 * 24;
  let dif = zoneDate.getTime() / unitDay - originDate.getTime() / unitDay;
  dif = parseInt(dif, 10);
  if (dif === 0) {
    return timespan.wday;
  } else if (dif > 0) {
    return timespan.wday.map((value) => {
      return value === 6 ? 0 : value + 1;
    });
  } else {
    return timespan.wday.map((value) => {
      return value === 0 ? 6 : value - 1;
    });
  }
}

/**
 * 北京时间转本地时间
 */
function getLocalTimespan(timespan, onEnable) {
  let fromEnable = onEnable;
  if (typeof onEnable === 'string') {
    fromEnable = (onEnable === '1');
  }
  const localTimespan = DEFAULT_TIME_SPAN();
  const fromDate = new Date();
  fromDate.setHours(timespan.from.hour);
  fromDate.setMinutes(timespan.from.min);
  const toDate = new Date();
  toDate.setHours(timespan.to.hour);
  toDate.setMinutes(timespan.to.min);
  const localFromDate = getLocalDate(fromDate);
  const localToDate = getLocalDate(toDate);

  localTimespan.wday = convertWday(timespan,
    fromEnable ? fromDate : toDate,
    fromEnable ? localFromDate : localToDate);
  localTimespan.from.hour = localFromDate.getHours();
  localTimespan.from.min = localFromDate.getMinutes();
  localTimespan.to.hour = localToDate.getHours();
  localTimespan.to.min = localToDate.getMinutes();
  return localTimespan;
}

/**
 * 本地时间转北京时间
 */
function getEast8Timespan(timespan, onEnable) {
  let fromEnable = onEnable;
  if (typeof onEnable === 'string') {
    fromEnable = (onEnable === '1');
  }
  const east8Timespan = DEFAULT_TIME_SPAN();
  const fromDate = new Date();
  fromDate.setHours(timespan.from.hour);
  fromDate.setMinutes(timespan.from.min);
  const toDate = new Date();
  toDate.setHours(timespan.to.hour);
  toDate.setMinutes(timespan.to.min);
  const east8FromDate = getEast8Date(fromDate);
  const east8ToDate = getEast8Date(toDate);

  east8Timespan.wday = convertWday(timespan,
    fromEnable ? fromDate : toDate,
    fromEnable ? east8FromDate : east8ToDate);
  east8Timespan.from.hour = east8FromDate.getHours();
  east8Timespan.from.min = east8FromDate.getMinutes();
  east8Timespan.to.hour = east8ToDate.getHours();
  east8Timespan.to.min = east8ToDate.getMinutes();
  return east8Timespan;
}

/**
 * 执行一次："59 9 30 12 *"
 * 每天："59 9 * * 0,1,2,3,4,5,6"
 * 周一到周五："59 9 * * 1,2,3,4,5"
 * 周末："59 9 * * 0,6"
 * 自定义："59 9 * * 1,3,5"
 *
 * 输入开启时段:
 * @param fromTime
 * @param toTime
 * @param fromEnable:boolean & '1' :true,'0' false
 * @param toEnable:boolean & '1' :true,'0' false
 *
 * 输出timespan,fromDate,toDate.后面两个参数仅在执行一次的定时使用到。
 * @returns {*}
 *
 * 用于从服务器获取时间，转为本地时间对象。已处理好时区和夏令时的问题。
 * transformEnable = true  => 默认北京时间转本地时间，传false不转时区。
 */
function getSceneTimerSpan(fromTime, toTime, onEnable, offEnable, transformEnable = true) {
  let fromEnable = onEnable;
  if (typeof onEnable === 'string') {
    fromEnable = (onEnable === '1');
  }
  let toEnable = offEnable;
  if (typeof offEnable === 'string') {
    toEnable = (offEnable === '1');
  }
  const result = {
    timeSpan: DEFAULT_TIME_SPAN(),
    fromDate: new Date(),
    toDate: new Date()
  };
  const { timeSpan } = result;
  const { fromDate, toDate } = result;

  const regex1 = /\d{1,2}\s\d{1,2}\s\*\s\*\s[0-6]/;
  const regex2 = /^\d{1,2}\s\d{1,2}\s\d{1,2}\s\d{1,2}\s\*+$/;

  if (!regex1.test(fromTime) && !regex2.test(fromTime)) {
    return timeSpan;
  }
  if (!regex1.test(toTime) && !regex2.test(toTime)) {
    return timeSpan;
  }

  if (fromTime.includes('*')) {
    const fromArray = fromTime.split(' ');
    timeSpan.from.min = Number(fromArray[0]);
    timeSpan.from.hour = Number(fromArray[1]);
    if (fromTime.endsWith('*')) {
      fromDate.setMinutes(Number(fromArray[0]));
      fromDate.setHours(Number(fromArray[1]));
      fromDate.setDate(Number(fromArray[2]));
      fromDate.setMonth(Number(fromArray[3]) - 1);
    }
  }

  if (toTime.includes('*')) {
    const toArray = toTime.split(' ');
    timeSpan.to.min = Number(toArray[0]);
    timeSpan.to.hour = Number(toArray[1]);
    if (fromTime.endsWith('*')) {
      toDate.setMinutes(Number(toArray[0]));
      toDate.setHours(Number(toArray[1]));
      toDate.setDate(Number(toArray[2]));
      toDate.setMonth(Number(toArray[3]) - 1);
    }
  }

  if (fromEnable) {
    if (fromTime.endsWith('*')) {
      timeSpan.wday = [];
    } else {
      const fromArray = fromTime.split(' ');
      timeSpan.wday = fromArray[4].split(',').map((value) => {
        return Number(value);
      });
    }
  } else if (toEnable) {
    if (toTime.endsWith('*')) {
      timeSpan.wday = [];
    } else {
      const toArray = toTime.split(' ');
      timeSpan.wday = toArray[4].split(',').map((value) => {
        return Number(value);
      });
    }
  } else {
    timeSpan.wday = EVERYDAY();
  }
  if (transformEnable) {
    result.timeSpan = getLocalTimespan(timeSpan, fromEnable);
    result.fromDate = getLocalDate(fromDate);
    result.toDate = getLocalDate(toDate);
  } else {
    result.timeSpan = timeSpan;
    result.fromDate = fromDate;
    result.toDate = toDate;
  }
  return result;
}

/**
 * 用于转成北京时间存到服务器
 * @param timespan
 * @param fromEnable:boolean & '1' :true,'0' false
 * @param toEnable:boolean & '1' :true,'0' false
 *
 * @returns {{fromTime: string, toTime: string}}
 */
function getTimeSlotToCloud(timespan, onEnable, offEnable) {
  let fromEnable = onEnable;
  if (typeof onEnable === 'string') {
    fromEnable = (onEnable === '1');
  }
  let toEnable = offEnable;
  if (typeof offEnable === 'string') {
    toEnable = (offEnable === '1');
  }
  const timeSlot = timespan;
  const fromMins = timeSlot.from.hour * 60 + timeSlot.from.min;
  const toMins = timeSlot.to.hour * 60 + timeSlot.to.min;
  let fromTime;
  let toTime;

  if (!timeSlot.wday || timeSlot.wday.length === 0) {
    let fromDate = new Date();
    const nowMins = fromDate.getHours() * 60 + fromDate.getMinutes();
    fromDate.setHours(timeSlot.from.hour);
    fromDate.setMinutes(timeSlot.from.min);

    let toDate = new Date();
    toDate.setHours(timeSlot.to.hour);
    toDate.setMinutes(timeSlot.to.min);

    if (fromEnable && toEnable) {
      let fromAddDate = false;
      if (fromMins <= nowMins) {
        fromDate = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
        fromAddDate = true;
      }
      if (fromAddDate || (toMins <= fromMins) || (toMins <= nowMins)) {
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      }
    } else if (!fromEnable && toEnable) {
      if (toMins <= nowMins) {
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      }
    } else if (fromEnable && !toEnable) {
      if (fromMins <= nowMins) {
        fromDate = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    const east8FromDate = getEast8Date(fromDate);
    const east8ToDate = getEast8Date(toDate);
    fromTime = east8FromDate.getMinutes() + ' ' + east8FromDate.getHours() + ' ' + east8FromDate.getDate() + ' ' + (east8FromDate.getMonth() + 1) + ' *';
    toTime = east8ToDate.getMinutes() + ' ' + east8ToDate.getHours() + ' ' + east8ToDate.getDate() + ' ' + (east8ToDate.getMonth() + 1) + ' *';
    return { fromTime, toTime };
  }
  const timeSlotEast8 = getEast8Timespan(timeSlot, fromEnable);

  fromTime = timeSlotEast8.from.min + ' ' + timeSlotEast8.from.hour + ' * * ' + timeSlotEast8.wday.join(',');
  toTime = timeSlotEast8.to.min + ' ' + timeSlotEast8.to.hour + ' * * ' + timeSlotEast8.wday.join(',');

  if (fromEnable && toEnable && (fromMins > toMins)) {
    const towday = timeSlotEast8.wday;
    towday.map((value) => {
      return value === 6 ? 0 : value + 1;
    });

    towday.sort((a, b) => {
      return a - b;
    });
    toTime = timeSlotEast8.to.min + ' ' + timeSlotEast8.to.hour + ' * * ' + towday.join(',');
  }
  return { fromTime, toTime };
}


export default {
  getTimeSpan,
  getSceneTimerSpan,
  gettimerArrayStr,
  getTimeSlotToCloud,
  getLocalTimespan,
  getEast8Timespan,
  EVERYDAY,
  WEEKDAY,
  WORKDAY,
  DEFAULT_TIME_SPAN,
  getLocalDate,
  getEast8Date
};

/*
test>>

const timespan = {
  from: { hour: 10, min: 10 },
  to: { hour: 8, min: 11 },
  wday: []
};

const slotTime = getTimeSlotToCloud(timespan, true, true);

console.log(slotTime);

const esat8date = getEast8Date(new Date());
const localTime = getLocalDate(new Date(1562562643000));
console.log('北京时间：' + esat8date.toString() + '本地时间：' + localTime.toString());
const result = getTimeSlotToCloud(timespan, true, true);
console.log(result);


const scne = '{"min":20330}';
const newscene = scne.replace(/\d+/, String(100));
console.log(JSON.parse(scne).min);
*/
