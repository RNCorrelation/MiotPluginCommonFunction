/* eslint-disable camelcase */
/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-29 16:40:39
 * @LastEditors: Lavie
 * @LastEditTime: 2019-10-22 11:35:11
 */
/* eslint-disable dot-notation */
import React from 'react';
import {
  LHMiServer,
  LHDateUtils,
  CommonMethod,
  LHTimeSpanUtils
} from 'LHCommonFunction';
import {
  Device,
  Host
} from 'miot';

class LHElectricityDataManager extends React.Component {
  /**
   * @description 获取今天的用电量
   */
  static fetchTodayElectricityData() {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const startDate = LHDateUtils.DateFormat('yyyy/MM/dd', today.getTime());
    const endDate = LHDateUtils.DateFormat('yyyy/MM/dd', tomorrow.getTime());
    return new Promise((resolve, reject) => {
      LHElectricityDataManager.fetchElectricityData({ start_date: startDate, end_date: endDate, data_type: 'stat_day' })
        .then((res) => {
          if (!res.length) {
            resolve(0);
            return;
          }
          const strValue = res[0].value;

          if (/(\d+)/i.test(strValue)) {
            const numStr = RegExp(/(\d+)/i).exec(strValue)[0];
            resolve(Number(numStr));
            return;
          }
          resolve(0);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @description 获取当月的用电量
   */
  static fetchMonthElectricityData() {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const startDate = LHDateUtils.DateFormat('yyyy/MM/dd', firstDay.getTime());
    const endDate = LHDateUtils.DateFormat('yyyy/MM/dd', lastDay.getTime());
    return new Promise((resolve, reject) => {
      LHElectricityDataManager.fetchElectricityData({ start_date: startDate, end_date: endDate, data_type: 'stat_month' })
        .then((res) => {
          if (!res.length) {
            resolve(0);
            return;
          }
          const strValue = res[0].value;

          if (/(\d+)/i.test(strValue)) {
            const numStr = RegExp(/(\d+)/i).exec(strValue)[0];
            resolve(Number(numStr));
            return;
          }
          resolve(0);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   *
   * @param {Object} setting
   * @param {number} setting.time_start 开始时间戳
   * @param {number} setting.time_end 结束时间戳
   * @param {number} setting.limit 限制次数，0为默认条数
   * @param {string} setting.start_date 获取数据的起始日期，优先级比[time_start] 格式为 '2019/03/01'
   * @param {string} setting.end_date 获取数据的结束日期，优先级比[time_end] 格式为 '2019/03/01'
   * @param {string} setting.data_type 日统计:stat_day / 周统计:stat_week / 月统计:stat_month
   * @returns {Array}
   [
   {
              "value": "[12,34]", // 为一个数组形式json串
              "time": 1543593600 // 时间戳
          },
   {
              "value": "[10,11]",
              "time": 1541001600
          }]
   */
  static fetchElectricityData(setting) {
    const params = {
      did: Device.deviceID,
      key: 'powerCost',
      data_type: 'stat_month',
      limit: 1000
    };
    return new Promise((resolve, reject) => {
      const onSuccess = (res) => {
        const { result } = res;
        resolve(result);
      };
      LHMiServer.GetUserStatistics({ ...params, ...setting }, onSuccess, reject);
    });
  }

  /**
   *
   * @param {Object} setting
   * @param {number} setting.time_start 开始时间戳
   * @param {number} setting.time_end 结束时间戳
   * @param {number} setting.limit 限制次数，0为默认条数
   * @param {string} setting.start_date 获取数据的起始日期，优先级比[time_start] 格式为 '2019/03/01'
   * @param {string} setting.end_date 获取数据的结束日期，优先级比[time_end] 格式为 '2019/03/01'
   * @param {string} setting.data_type 日统计:stat_day_v3 / 周统计:stat_week_v3 / 月统计:stat_month_v3
   * @param {Object} option
   * @param {function} option.callback v3接口会连续循环获取数据，这个是每次收到的累积数据的回调
   * @returns {Array}
         [
          {
              "value": "[12,34]", // 为一个数组形式json串
              "time": 1543593600 // 时间戳
          },
          {
              "value": "[10,11]",
              "time": 1541001600
          }]
   */
  static fetchPowerData(setting, option) {
    const params = {
      did: Device.deviceID,
      key: 'load_power',
      data_type: 'stat_month',
      limit: 1000
    };

    return new Promise((resolve, reject) => {
      const onSuccess = (res) => {
        // 针对stat_day的get_user_device_data接口返回数据做处理
        if (typeof res === 'object' && Array.isArray(res)) {
          resolve(res);
          return;
        }
        const { result } = res;
        resolve(result);
      };

      // 本地2019/9/10 转为 北京2019/9/10 再转为 时间戳
      const dateStringToTimeStemp = (dateString) => {
        const date = LHTimeSpanUtils.getEast8Date(new Date(dateString));
        const nowDate = LHTimeSpanUtils.getEast8Date(new Date());
        const dateTime = parseInt(date.getTime() / 1000, 10);
        const nowTime = parseInt(nowDate.getTime() / 1000, 10);
        return dateTime > nowTime ? nowTime : dateTime;
      };

      // 日的功率用可以获取1000个数量的接口 get_user_device_data
      const { data_type: powerType } = setting;
      if (powerType === 'stat_day') {
        const {
          // eslint-disable-next-line camelcase
          time_start, time_end, end_date, start_date
        } = setting;
        const newSetting = CommonMethod.DeepClone(setting);

        // get_user_device_data 不支持 end_date 和 start_date，需要转换成 time_start 和 time_end
        // eslint-disable-next-line camelcase
        if (!time_start && !time_end && end_date && start_date) {
          const timeStart = dateStringToTimeStemp(start_date);
          const timeEnd = dateStringToTimeStemp(end_date);
          Object.assign(newSetting, { time_start: timeStart, time_end: timeEnd });
          delete newSetting.start_date;
          delete newSetting.end_date;
        }
        Object.assign(newSetting, { type: 'prop' });

        LHMiServer.GetDeviceData({ ...params, ...newSetting }, onSuccess, reject);
        return;
      }

      // 新采样接口
      // 1. 天维度，每小时采样12个点，每个时间片取最大值. 12*24=288
      // 2. 周维度，每天采样144个点(每小时6个点)，每个时间片取最大值. 144*7=1008
      if (powerType === 'stat_day_v3' || powerType === 'stat_week_v3' || powerType === 'stat_month_v3') {
        const newSetting = CommonMethod.DeepClone(setting);
        // 如果有日期，将日期转为Unix时间
        const { end_date, start_date } = newSetting;
        if (end_date && start_date) {
          const timeStart = dateStringToTimeStemp(start_date);
          const timeEnd = dateStringToTimeStemp(end_date);
          Object.assign(newSetting, { time_start: timeStart, time_end: timeEnd });
        }
        delete newSetting.start_date;
        delete newSetting.end_date;

        let responseData = [];
        // 先获取，接口返回的数据量不确定，取最后一条数据，跟请求的开始时间对比，
        // 如果数据时间晚于开始时间，那就回调并继续拉，直到数据时间早于开始时间
        const onSuccessWithBlock = (res) => {
          const { result } = res;
          if (Array.isArray(result)) {
            responseData = responseData.concat(result);
            // 回调一下
            if (typeof option === 'object') {
              const { callback } = option;
              if (typeof callback === 'function') callback(responseData);
            }

            const last = result[result.length - 1];
            // 拉到没有数据了
            if (!last) {
              resolve(responseData);
              return;
            }
            const { time } = last;
            const { time_start: startTime } = newSetting;
            if (startTime < time) {
              LHMiServer.GetUserStatistics({ ...params, ...newSetting, ...{ time_end: time } }, onSuccessWithBlock, reject);
            } else {
              // 直到数据时间早于开始时间
              resolve(responseData);
            }
          } else {
            resolve([]);
          }
        };
        LHMiServer.GetUserStatistics({ ...params, ...newSetting }, onSuccessWithBlock, reject);
        return;
      }

      LHMiServer.GetUserStatistics({ ...params, ...setting }, onSuccess, reject);
    });
  }

  /**
   * @static
   * @function formatElectricityNumber
   * @description 格式化电量小数点
   * @param {number} number 电量
   * @return {string} 电量
   */
  static formatElectricityNumber(number) {
    return this.formatDataNumber(Number(number), 1);
  }

  /**
   * @static
   * @function formatPowerNumber
   * @description 格式化功率小数点
   * @param {number} number 功率
   * @return {string} 功率
   */
  static formatPowerNumber(number) {
    return this.formatDataNumber(Number(number), 2);
  }

  /**
   * @static
   * @function formatDataNumber
   * @description 格式化小数点，大于等于一千会有千分号，保留0位小数，小于一千，保留fixed位小数
   * @param {number} number 数据
   * @param {number} fixed 小数点 0-100
   * @return {string} 数据字符串
   */
  static formatDataNumber(number, fixed) {
    if (typeof number !== 'number' && Number.isNaN(Number(number))) {
      console.warn('formatDataNumber第一个参数要求是数值，不是数值不会走转换逻辑');
      return number;
    }
    if (fixed > 100 || fixed < 0) {
      console.warn('formatDataNumber 小数点位数不正确');
      return number;
    }

    let toFix = fixed;
    if (number.toFixed(fixed) >= 1000) {
      toFix = 0;
    }
    return CommonMethod.numToLocalString(number, { fixed: toFix, language: Host.locale.language });
  }

  /**
   * @description 获取气压数据
   */
  static fetchPressureDatas(setting, pressureArr, onSuccess) {
    const params = {
      did: Device.deviceID,
      type: 'prop',
      key: 'pressure',
      limit: 100
    };
    return new Promise((resolve, reject) => {
      LHMiServer.GetDeviceData({ ...params, ...setting }, (res) => {
        if (res.length !== 1) {
          pressureArr = pressureArr.concat(res);
          setting.time_end = res[res.length - 1].time;
        }
        if (res.length !== 100) {
          onSuccess(res);
        } else {
          LHElectricityDataManager.fetchPressureDatas(setting, pressureArr, onSuccess);
        }
      }, (err) => {
        reject(err);
      });
    });
  }

  static FetchHtData(temperatureSetting, humiditySetting, temperatureArr, humidityArr, onSuccess) {
    const params = {
      did: Device.deviceID,
      type: 'prop',
      key: 'temperature',
      // time_start: (now - 7 * 24 * 3600).toString(),
      // time_end: now.toString(),
      limit: 100
    };
    return new Promise((resolve, reject) => {
      Promise.all([
        LHMiServer.GetDeviceDataPromise({ ...params, ...temperatureSetting }),
        LHMiServer.GetDeviceDataPromise({ ...params, ...humiditySetting, ...{ key: 'humidity' } })
      ]).then((res) => {
        if (res[0].length !== 1) {
          temperatureArr = temperatureArr.concat(res[0]);
          temperatureSetting.time_end = res[0][res[0].length - 1].time;
        }
        if (res[1].length !== 1) {
          humidityArr = humidityArr.concat(res[1]);
          humiditySetting.time_end = res[1][res[1].length - 1].time;
        }
        console.log(res);
        if (res[0].length !== 100 && res[1].length !== 100) {
          const data = LHElectricityDataManager.matchDatas(humidityArr, temperatureArr);
          console.log(data);
          onSuccess(data);
        } else {
          LHElectricityDataManager.FetchHtData(temperatureSetting, humiditySetting, temperatureArr, humidityArr, onSuccess);
        }
      }, (err) => {
        reject(err);
      });
    });
  }

  /**
   * @param {Array} humidityDatas 温度数据
   * @param {Array} temperatureDatas 湿度数据
   */
  static matchDatas(humidityDatas, temperatureDatas) {
    const humidityArr = LHElectricityDataManager.initHumidityDatas(humidityDatas);
    const temperatureArr = LHElectricityDataManager.initTemperatureDatas(temperatureDatas);
    let datasArr = humidityArr.concat(temperatureArr);
    datasArr.sort((a, b) => {
      return a.time - b.time;
    });
    datasArr = LHElectricityDataManager.clearRepeat(datasArr);
    datasArr = LHElectricityDataManager.dataCompletion(datasArr);
    return datasArr;
  }

  /**
   * @param {Array} humidityDatas 温度数据
   * @description 把温度数据初始化成想要的数据格式
   * @returns {Array}
   */
  static initHumidityDatas(humidityDatas) {
    const humidityArr = [];
    for (let i = 0; i < humidityDatas.length; i += 1) {
      const value = (JSON.parse(humidityDatas[i].value)[0] / 100).toFixed(1);
      humidityArr.push({
        time: humidityDatas[i].time,
        humidity: value,
        temperature: -1
      });
    }
    console.log(humidityArr);
    return humidityArr;
  }

  /**
   * @param {Array} temperatureDatas 湿度数据
   * @description 把湿度数据初始化成想要的数据格式
   * @returns {Array}
   */
  static initTemperatureDatas(temperatureDatas) {
    console.log(LHElectricityDataManager);
    const temperatureArr = [];
    for (let i = 0; i < temperatureDatas.length; i += 1) {
      const value = (JSON.parse(temperatureDatas[i].value)[0] / 100).toFixed(1);
      temperatureArr.push({
        time: temperatureDatas[i].time,
        temperature: value,
        humidity: -1
      });
    }
    return temperatureArr;
  }

  /**
   * @param {Array} datasArr 合并后总数据
   * @description 数据去重
   * @returns {Array}
   */
  static clearRepeat(datasArr) {
    console.log(LHElectricityDataManager);
    const arr = [];
    for (let i = 0; i < datasArr.length; i += 1) {
      const item = datasArr[i];
      let isRepead = false;
      for (let n = 0; n < arr.length; n += 1) {
        if (arr[n].time === item.time) {
          isRepead = true;
          if (item.temperature !== -1) {
            arr[n].temperature = item.temperature;
          }
          if (item.humidity !== -1) {
            arr[n].humidity = item.humidity;
          }
        }
      }
      if (!isRepead) {
        arr.push(item);
      }
    }
    return arr;
  }

  /**
   * @param {Array} datasArr 去重后总数据
   * @description 数据补全 如果是最左边，就向右取最近一个有效值，如果是最右，就向左取最近一个有效值，如果都有，就比较时间戳
   * @returns {Array}
   */
  static dataCompletion(datasArr) {
    console.log(LHElectricityDataManager);
    const arr = datasArr;
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].temperature === -1) {
        if (i === 0) {
          arr[i].temperature = LHElectricityDataManager.rightUsedTemperatureData(i, arr) === null ? -1 : LHElectricityDataManager.rightUsedTemperatureData(i, arr).temperature;
        } else if (i === (arr.length - 1)) {
          arr[i].temperature = LHElectricityDataManager.leftUsedTemperatureData(i, arr) === null ? -1 : LHElectricityDataManager.leftUsedTemperatureData(i, arr).temperature;
        } else {
          const leftItem = LHElectricityDataManager.leftUsedTemperatureData(i, arr);
          const rightItem = LHElectricityDataManager.rightUsedTemperatureData(i, arr);
          if (leftItem === null && rightItem !== null) {
            arr[i].temperature = rightItem.temperature;
          } else if (leftItem !== null && rightItem === null) {
            arr[i].temperature = leftItem.temperature;
          } else if (leftItem !== null && rightItem !== null) {
            if ((arr[i].time - leftItem.time) > (rightItem.time - arr[i].time)) {
              arr[i].temperature = rightItem.temperature;
            } else {
              arr[i].temperature = leftItem.temperature;
            }
          }
        }
      }
      if (datasArr[i].humidity === -1) {
        if (i === 0) {
          arr[i].humidity = LHElectricityDataManager.rightUsedHumidityData(i, arr) === null ? -1 : LHElectricityDataManager.rightUsedHumidityData(i, arr).humidity;
        } else if (i === (arr.length - 1)) {
          arr[i].humidity = LHElectricityDataManager.leftUsedHumidityData(i, arr) === null ? -1 : LHElectricityDataManager.leftUsedHumidityData(i, arr).humidity;
        } else {
          const leftItem = LHElectricityDataManager.leftUsedHumidityData(i, arr);
          const rightItem = LHElectricityDataManager.rightUsedHumidityData(i, arr);
          if (leftItem === null && rightItem !== null) {
            arr[i].humidity = rightItem.humidity;
          } else if (leftItem !== null && rightItem === null) {
            arr[i].humidity = leftItem.humidity;
          } else if (leftItem !== null && rightItem !== null) {
            if ((arr[i].time - leftItem.time) > (rightItem.time - arr[i].time)) {
              arr[i].humidity = rightItem.humidity;
            } else {
              arr[i].humidity = leftItem.humidity;
            }
          }
        }
      }
    }
    return arr;
  }

  /**
   * @param {num} index 数据当前位置
   * @param {Array} datasArr 去重后总数据
   * @description 取右边最近一位有效数据没有就返回null
   * @returns {object}
   */
  static rightUsedTemperatureData(index, dataArr) {
    console.log(LHElectricityDataManager);
    for (let i = index; i < dataArr.length; i += 1) {
      if (dataArr[i].temperature !== -1) {
        return dataArr[i];
      }
    }
    return null;
  }

  /**
   * @param {num} index 数据当前位置
   * @param {Array} datasArr 去重后总数据
   * @description 取左边最近一位有效数据没有就返回null
   * @returns {object}
   */
  static leftUsedTemperatureData(index, dataArr) {
    console.log(LHElectricityDataManager);
    for (let i = index; i >= 0; i -= 1) {
      if (dataArr[i].temperature !== -1) {
        return dataArr[i];
      }
    }
    return null;
  }

  /**
   * @param {num} index 数据当前位置
   * @param {Array} datasArr 去重后总数据
   * @description 取右边最近一位有效数据没有就返回null
   * @returns {object}
   */
  static rightUsedHumidityData(index, dataArr) {
    console.log(LHElectricityDataManager);
    for (let i = index; i < dataArr.length; i += 1) {
      if (dataArr[i].humidity !== -1) {
        return dataArr[i];
      }
    }
    return null;
  }

  /**
   * @param {num} index 数据当前位置
   * @param {Array} datasArr 去重后总数据
   * @description 取左边最近一位有效数据没有就返回null
   * @returns {object}
   */
  static leftUsedHumidityData(index, dataArr) {
    console.log(LHElectricityDataManager);
    for (let i = index; i >= 0; i -= 1) {
      if (dataArr[i].humidity !== -1) {
        return dataArr[i];
      }
    }
    return null;
  }
}

export default LHElectricityDataManager;