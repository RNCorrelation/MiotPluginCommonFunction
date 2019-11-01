/*
 * @Date: 2019-08-15 15:36:38
 * @LastEditors: Lavie
 * @LastEditTime: 2019-08-30 10:23:52
 */
import React from 'react';
import {
  LHMiServer
} from 'LHCommonFunction';
import {
  Device
} from 'miot';

class LHLogUtils extends React.Component {
  /**
   * @static
   * @function GetLatestLog
   * @description 获取接口的最新的上报
   * @param {Object} setting 请求参数
   * @param {string} setting.key profile key
   * @param {string} setting.type event 或者 prop
   */
  static GetLatestLog(setting) {
    const params = {
      did: Device.deviceID,
      type: 'event',
      time_start: 0,
      time_end: (new Date()).getTime() / 1000,
      limit: 2
    };
    return new Promise((resolve, reject) => {
      const onSuccess = (res) => {
        resolve(res[0]);
      };
      LHMiServer.GetDeviceData({ ...params, ...setting }, onSuccess, reject);
    });
  }


  /**
   * @static
   * @function GetLatestLog
   * @description 获取最新的device_log
   */
  static GetLatestDeviceLog() {
    return LHLogUtils.GetLatestLog({ key: 'device_log', type: 'prop' });
  }
}

export {
  LHLogUtils as default
};