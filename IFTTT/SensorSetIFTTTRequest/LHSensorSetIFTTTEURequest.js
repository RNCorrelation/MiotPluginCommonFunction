/* eslint-disable no-loop-func */
/*
 * File: LHSensorSetIFTTTEURequest.js
 * Project: LHCommonFunction
 * File Created: Friday, 23rd August 2019 2:47:25 pm
 * Author: 廖子铭 (ziming.liao@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { LHDeviceModel } from 'LHCommonFunction';
import Request from '../Model/LHSensorSetIFTTTRequest';

/**
   * 获取欧洲套装自动化列表
   *
   * 欧洲套装包含：
   * 米家多功能网关（欧标）1台
   * 人体传感器2台（人体传感器1、人体传感器2）
   * 门窗传感器2台（门窗传感器1、门窗传感器2）
   * 无线开关1台（无线开关）
   *
   * 13个
   */
export default class LHSensorSetIFTTTEURequest {
  static async buildSensorSetIFTTT(devicesList, alreadyBuildIFTTTList, callBackFunc) {
    console.log('开始构建欧标套装自动化列表');
    // 人体和门窗只构建前两个子设备的自动化（为了防止用户在构建自动化之前自己添加了套装外的子设备，这里只会处理前两个子设备）
    // 无线开关只处理第一个
    const sensorMagnetDeviceList = [];
    const sensorMotionDeviceList = [];
    const sensorSwitchDeviceList = [];

    const successBuildIFTTTList = alreadyBuildIFTTTList === null ? [] : alreadyBuildIFTTTList;
    const failBuildIFTTTList = [];
    let key = '';
    for (const device of devicesList) {
      const { model } = device;

      if (model === LHDeviceModel.DeviceModelSensorMagnetV2()) { // 门窗传感器
        if (sensorMagnetDeviceList.length < 2) { // 处理前两个
          // 警戒
          key = 'alarm_' + device.deviceID;
          if (!successBuildIFTTTList.includes(key)) {
            await Request.getSensorAlarmRequest(device).then(() => {
              successBuildIFTTTList.push(key);
            }).catch(() => {
              failBuildIFTTTList.push(key);
            });
          }
          // 门铃
          key = 'doorbell_' + device.deviceID;
          if (!successBuildIFTTTList.includes(key)) {
            await Request.getSensorMagnetDoorBellRequest(device).then(() => {
              successBuildIFTTTList.push(key);
            }).catch(() => {
              failBuildIFTTTList.push(key);
            });
          }
          sensorMagnetDeviceList.push(device);
        }
      } else if (model === LHDeviceModel.DeviceModelSensorMotionV2()) { // 人体传感器
        if (sensorMotionDeviceList.length < 2) { // 处理前两个
          // 警戒
          key = 'alarm_' + device.deviceID;
          if (!successBuildIFTTTList.includes(key)) {
            await Request.getSensorAlarmRequest(device).then(() => {
              successBuildIFTTTList.push(key);
            }).catch(() => {
              failBuildIFTTTList.push(key);
            });
          }
          sensorMotionDeviceList.push(device);
        }
      } else if (model === LHDeviceModel.DeviceModelWirelessSwitchV2()) { // 无线开关
        if (sensorSwitchDeviceList.length < 1) {
          // 开/关夜灯
          key = 'triggle_light' + device.deviceID;
          if (!successBuildIFTTTList.includes(key)) {
            await Request.getSensorSwitchTriggleTheNightLightRequest(device).then(() => {
              successBuildIFTTTList.push(key);
            }).catch(() => {
              failBuildIFTTTList.push(key);
            });
          }
          // 开/关警戒
          key = 'triggle_alarm' + device.deviceID;
          if (!successBuildIFTTTList.includes(key)) {
            await Request.getSensorSwitchTriggleTheAlarmRequest(device).then(() => {
              successBuildIFTTTList.push(key);
            }).catch(() => {
              failBuildIFTTTList.push(key);
            });
          }
          sensorSwitchDeviceList.push(device);
        }
      }
    }

    // 门窗
    // 响铃(狗叫声)
    if (sensorMagnetDeviceList.length > 0 && sensorMagnetDeviceList.length <= 2) {
      key = 'ring_bell';
      if (!successBuildIFTTTList.includes(key)) {
        await Request.getSensorMagnetRingBellRequest(sensorMagnetDeviceList).then(() => {
          successBuildIFTTTList.push(key);
        }).catch(() => {
          failBuildIFTTTList.push(key);
        });
      }
    }

    // 人体
    // 感应夜灯
    if (sensorMotionDeviceList.length > 0 && sensorMotionDeviceList.length <= 2) {
      key = 'triggle_smart_light';
      if (!successBuildIFTTTList.includes(key)) {
        await Request.getSensorMotionOpenTheNightLightRequest(sensorMotionDeviceList).then(() => {
          successBuildIFTTTList.push(key);
        }).catch(() => {
          failBuildIFTTTList.push(key);
        });
      }
    }

    // 定时警戒
    key = 'timing_alarm';
    if (!successBuildIFTTTList.includes(key)) {
      await Request.getAlarmTimingRequest().then(() => {
        successBuildIFTTTList.push(key);
      }).catch(() => {
        failBuildIFTTTList.push(key);
      });
    }

    // 定时彩灯(彩灯颜色：森林)
    key = 'timing_light';
    if (!successBuildIFTTTList.includes(key)) {
      await Request.getColorLightTimingRequest('2b00ff00').then(() => {
        successBuildIFTTTList.push(key);
      }).catch(() => {
        failBuildIFTTTList.push(key);
      });
    }

    // 懒人闹钟
    const lazyClock = 'lazy_clock';
    if (!successBuildIFTTTList.includes(lazyClock)) {
      await Request.getLazyClockAlarmTimingRequest().then(() => {
        successBuildIFTTTList.push(lazyClock);
      }).catch(() => {
        failBuildIFTTTList.push(key);
      });
    }

    console.log('成功配置自动化的列表：');
    console.log(successBuildIFTTTList);
    callBackFunc(successBuildIFTTTList, failBuildIFTTTList);
  }
}
