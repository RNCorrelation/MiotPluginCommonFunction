/*
 * @Date: 2019-09-16 12:26:26
 * @LastEditors: Lavie
 * @LastEditTime: 2019-10-22 10:22:35
 */
/* eslint-disable no-lonely-if */
/*
 * File: LHUserConfigsManager.js
 * Project: LHCommonFunction
 * File Created: Wednesday, 28th August 2019 8:01:57 pm
 * Author: 廖子铭 (ziming.liao@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { Service, Device } from 'miot';
// import { LHMiServer } from 'LHCommonFunction';

/**
 *
 * 用户存储空间
 * @export
 * @class LHUserConfigManager
 */
export default class LHUserConfigsManager {
  /**
   *  空调伴侣V3
   */
  static getUserConfigsKeyACPartnerV3() {
    return 600;
  }

  /**
   *  LED球泡灯
   */
  static getUserConfigsKeyLEDLight() {
    return 1000;
  }

  /**
   *  VRF
   */
  static getUserConfigsKeyVRF() {
    return 2000;
  }

  /**
   *  空调伴侣V3(升级版)
   */
  static getUserConfigsKeyACPartnerV3Advanced() {
    return 4000;
  }

  /**
   *  窗帘
   */
  static getUserConfigsKeyCurtain() {
    return 5000;
  }

  /**
   *  空调伴侣2
   */
  static getUserConfigsKeyACPartnerV2() {
    return 5200;
  }


  /**
   *  获取 userconfig 数据
   * 该存储空间，是针对当前用户下所有设备的，所以获取的时候，会把当前用户下，所有用了该 key 的设备数据，都会取出来，
   * 已经针对这种情况进行了封装，使用时只需要关注当前设备就可以了
   * @static
   * @param {*} deviceId  设备ID
   * @param {*} key key 必须使用已经定义的值
   * @returns
   * @memberof LHUserConfigsManager
   */
  static getUserConfigsData(deviceId, key, onSuccess, onFail) {
    if (deviceId === null || key === null || deviceId === '' || key <= 0) {
      if (typeof onFail === 'function') onFail();
      return;
    }

    Service.storage.getThirdUserConfigsForOneKey(Device.model, key).then((res) => {
      if (res !== null && res.data !== null) {
        const data = JSON.parse(res.data);
        if (typeof onSuccess === 'function') onSuccess(typeof data[deviceId] === 'string' ? JSON.parse(data[deviceId]) : data[deviceId]);
      } else {
        if (typeof onFail === 'function') onFail();
      }
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }


  /**
   *  保存 userconfig 数据
   *  保存操作，需要先获取最新的数据，然后再把新数据，替换旧数据。
   * @static
   * @param {*} deviceId 设备ID
   * @param {*} key key 必须使用已经定义的值
   * @param {*} data 需要保存的值
   * @returns
   * @memberof LHUserConfigsManager
   */
  static setUserConfigsData(deviceId, key, data, onSuccess, onFail) {
    if (deviceId === null || key === null || deviceId === '' || key <= 0 || data === null) {
      if (typeof onFail === 'function') onFail();
      return;
    }
    Service.storage.getThirdUserConfigsForOneKey(Device.model, key).then((res) => {
      // 切换账号或者网关的时候，获取到的值会为空
      const originData = res && res.data ? JSON.parse(res.data) : {};
      originData[deviceId] = data;
      Service.storage.setThirdUserConfigsForOneKey(Device.model, key, originData).then(() => {
        if (typeof onSuccess === 'function') onSuccess();
      }).catch((err) => {
        if (typeof onFail === 'function') onFail(err);
      });
    }).catch((err) => {
      console.log(err);
      if (typeof onFail === 'function') onFail(err);
    });
  }
}