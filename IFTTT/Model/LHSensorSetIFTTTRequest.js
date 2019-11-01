/*
 * File: LHSensorSetIFTTTRequest.js
 * Project: LHCommonFunction
 * File Created: Wednesday, 21st August 2019 11:11:09 am
 * Author: 廖子铭 (ziming.liao@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { Service, Device } from 'miot';
import LHIFTTTManager from '../Manager/LHIFTTTManager';
import LHAlarmIFTTTAdapter from '../Manager/LHAlarmIFTTTAdapter';
import LHGuardTypeMode from './LHGuardTypeMode';
import LHDeviceTriggleModel from './LHDeivceTriggleModel';
import LHDeviceActionModel from './LHDeviceActionModel';
import LHCommonLocalizableString from '../../Config/Localized/LHCommonLocalizableString';

/**
 * 套装自动化的 Request 类
 * 该类会构建各种类型的自动化 Request
 */
export default class LHSensorSetIFTTTRequest {
  /**
   *  定时警戒
   *  周一到周五9:00-18:00，Disable
   */
  static getAlarmTimingRequest() {
    return new Promise((resolve, reject) => {
      const setting = {
        enable_push: '1',
        on_time: '0 9 * * 1,2,3,4,5',
        off_time: '0 18 * * 1,2,3,4,5',
        off_method: 'set_arming',
        off_param: 'off',
        on_method: 'set_arming',
        on_param: 'on',
        enable_timer_on: '1',
        enable_timer_off: '1',
        enable_timer: '0'
      };
      const scene = Service.scene.createTimerScene(Device.deviceID, {
        setting,
        identify: 'lumi_gateway_arming_timer',
        name: LHCommonLocalizableString.mi_linuxHub_guard_guard_timer
      });
      scene.save().then(() => {
        console.log('套装自动化---【定时警戒】创建成功');
        resolve();
      }).catch(() => {
        console.log('套装自动化---【定时警戒】创建成功');
        reject();
      });
    });
  }

  /**
   *  定时彩灯
   *  每天：18:00-22:00，Disable
   */
  static getColorLightTimingRequest(color) {
    return new Promise((resolve, reject) => {
      const setting = {
        enable_push: '1',
        on_time: '0 18 * * 0,1,2,3,4,5,6',
        off_time: '0 22 * * 0,1,2,3,4,5,6',
        off_method: 'toggle_light',
        off_param: 'off',
        on_method: 'set_night_light_rgb',
        on_param: parseInt(color, 16).toString(),
        enable_timer_on: '1',
        enable_timer_off: '1',
        enable_timer: '0'
      };
      const scene = Service.scene.createTimerScene(Device.deviceID, {
        setting,
        identify: 'lumi_gateway_single_rgb_timer',
        name: LHCommonLocalizableString.mi_linuxHub_timer_light_name
      });
      scene.save().then(() => {
        console.log('套装自动化---【定时彩灯】创建成功');
        resolve();
      }).catch(() => {
        console.log('套装自动化---【定时彩灯】创建失败');
        reject();
      });
    });
  }

  /**
   * 懒人闹钟
   * 周一到周五 7:30，Disable
   */
  static getLazyClockAlarmTimingRequest() {
    return new Promise((resolve, reject) => {
      const setting = {
        enable_push: '1',
        on_time: '30 7 * * 1,2,3,4,5',
        off_time: '0 0 * * 1,2,3,4,5',
        off_method: 'play_alarm_clock',
        off_param: 'off',
        on_method: 'play_alarm_clock',
        on_param: ['on', '20', 50],
        enable_timer_on: '1',
        enable_timer_off: '1',
        enable_timer: '0'
      };
      const scene = Service.scene.createTimerScene(Device.deviceID, {
        setting,
        identify: 'lumi_gateway_clock_timer',
        name: LHCommonLocalizableString.mi_linuxHub_lazy_clock_name
      });
      scene.save().then(() => {
        console.log('套装自动化---【懒人闹钟】创建成功');
        resolve();
      }).catch(() => {
        console.log('套装自动化---【懒人闹钟】创建失败');
        reject();
      });
    });
  }

  /**
   *  传感器警戒
   */
  static getSensorAlarmRequest(device) {
    return new Promise((resolve, reject) => {
      const deviceModel = LHAlarmIFTTTAdapter.getLinuxGatewayAlarmIFTTTModel(device);
      LHIFTTTManager.saveSceneRecord(
        Device.deviceID,
        deviceModel,
        LHGuardTypeMode.getNormalGuardType(),
        (res) => {
          console.log('套装自动化---【传感器警戒】创建成功');
          resolve(res);
        },
        (err) => {
          console.log('套装自动化---【传感器警戒】创建失败');
          reject(err);
        }
      );
    });
  }

  /**
   *  门窗传感器响铃
   * 如果门打开一分钟未关闭，网关则响起铃声(狗叫声)，同时手机推送消息“门口打开超过1分钟” (Disable)
   */
  static getSensorMagnetRingBellRequest(devices) {
    const triggleList = [];
    const authedList = [Device.deviceID];
    devices.forEach((device) => {
      triggleList.push(LHDeviceTriggleModel.getSensorMagnetTriggleModel(device, '22', 'no_close', LHCommonLocalizableString.sensor_set_ifttt_triggle_name_1));
      authedList.push(device.deviceID);
    });
    const actionList = [LHDeviceActionModel.getPlayMusiceAction()];
    return new Promise((resolve, reject) => {
      LHIFTTTManager.saveMijiaSmartSceneRecord(
        triggleList,
        actionList,
        authedList,
        LHCommonLocalizableString.sensor_set_ifttt_scene_name_1,
        0,
        () => {
          console.log('套装自动化---【门窗传感器响铃】创建成功');
          resolve();
        },
        () => {
          console.log('套装自动化---【门窗传感器响铃】创建失败');
          reject();
        }
      );
    });
  }

  /**
   * 单击无线开关 开/关 网关夜灯（Enable）
   */
  static getSensorSwitchTriggleTheNightLightRequest(device) {
    return new Promise((resolve, reject) => {
      LHIFTTTManager.saveMijiaSmartSceneRecord(
        [LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '18', 'click', LHCommonLocalizableString.ifttt_triggle_single_press)],
        [LHDeviceActionModel.getToggleLightAction()],
        [Device.deviceID, device.deviceID],
        LHCommonLocalizableString.sensor_set_ifttt_scene_name_2,
        1,
        () => {
          console.log('套装自动化---【单击无线开关 开/关 网关夜灯】创建成功');
          resolve();
        },
        () => {
          console.log('套装自动化---【单击无线开关 开/关 网关夜灯】创建失败');
          reject();
        }
      );
    });
  }

  /**
   *  双击无线开关，网关开警戒模式/关警戒模式。（Enable）
   */
  static getSensorSwitchTriggleTheAlarmRequest(device) {
    return new Promise((resolve, reject) => {
      LHIFTTTManager.saveMijiaSmartSceneRecord(
        [LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '19', 'double_click', LHCommonLocalizableString.ifttt_triggle_double_press)],
        [LHDeviceActionModel.getToggleAlarmAction()],
        [Device.deviceID, device.deviceID],
        LHCommonLocalizableString.sensor_set_ifttt_scene_name_3,
        1,
        () => {
          console.log('套装自动化---【双击无线开关，网关开警戒模式/关警戒模式】创建成功');
          resolve();
        },
        () => {
          console.log('套装自动化---【双击无线开关，网关开警戒模式/关警戒模式】创建失败');
          reject();
        }
      );
    });
  }

  /**
   *  门铃触发设备：门窗传感器1、门窗传感器2
   *  门铃音：门铃音
   */
  static getSensorMagnetDoorBellRequest(device) {
    return new Promise((resolve, reject) => {
      const triggleModel = LHAlarmIFTTTAdapter.getLinuxGatewayAlarmIFTTTModel(device);
      LHIFTTTManager.saveSceneRecord(
        Device.deviceID,
        triggleModel,
        LHGuardTypeMode.getDoorbellType(),
        () => {
          console.log('套装自动化---【门铃触发设备】创建成功');
          resolve();
        },
        () => {
          console.log('套装自动化---【门铃触发设备】创建失败');
          reject();
        }
      );
    });
  }

  /**
   *  感应夜灯
   *  勾选人体传感器1、人体传感器2
   */
  static getSensorMotionOpenTheNightLightRequest(devices) {
    return new Promise((resolve, reject) => {
      const triggerList = [];
      const authedList = [Device.deviceID];
      devices.forEach((device) => {
        const triggleModel = LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '23', 'motion', LHCommonLocalizableString.ifttt_triggle_someone_moved);
        triggleModel.timespan = {
          to: {
            min: 0,
            hour: 0
          },
          wday: [0, 1, 2, 3, 4, 5, 6],
          from: {
            min: 0,
            hour: 0
          }
        };
        triggerList.push(triggleModel);
        authedList.push(device.deviceID);
      });
      const params = {
        us_id: 0,
        model: Device.model,
        did: Device.deviceID,
        st_id: 22,
        identify: 'lm_scene_toggle_smart_light',
        name: LHCommonLocalizableString.sensor_set_ifttt_scene_name_4,
        authed: authedList,
        setting: {
          enable: 1,
          enable_push: 1,
          launch: {
            attr: triggerList,
            express: 1 // 1 为 or
          },
          action_list: [LHDeviceActionModel.getOpenSmartLightAction()]
        }
      };
      LHIFTTTManager.editSceneRecord(params, () => {
        console.log('套装自动化---【感应夜灯】创建成功');
        resolve();
      }, () => {
        reject();
        console.log('套装自动化---【感应夜灯】创建失败');
      });
    });
  }

  /**
   * 人体传感器1或人体传感器2，无人2分钟
   * 网关夜灯关闭
   */
  static getSensorMotionCloseTheNightLightRequestMijia(devices) {
    const triggleList = [];
    const authedList = [Device.deviceID];
    devices.forEach((device) => {
      triggleList.push(LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '24', 'no_motion', LHCommonLocalizableString.sensor_set_ifttt_triggle_name_2));
      authedList.push(device.deviceID);
    });
    const actionList = [LHDeviceActionModel.getCloseLightAction()];
    return new Promise((resolve, reject) => {
      LHIFTTTManager.saveMijiaSmartSceneRecord(
        triggleList,
        actionList,
        authedList,
        LHCommonLocalizableString.sensor_set_ifttt_scene_name_5,
        0,
        () => {
          console.log('套装自动化---【2分钟无人移动夜灯关】创建成功');
          resolve();
        },
        () => {
          console.log('套装自动化---【2分钟无人移动夜灯关】创建失败');
          reject();
        }
      );
    });
  }

  /**
   * 人体传感器1或人体传感器2被触发
   * 网关夜灯亮起
   */
  static getSensorMotionOpenTheNightLightRequestMijia(devices) {
    const triggleList = [];
    const authedList = [Device.deviceID];
    devices.forEach((device) => {
      triggleList.push(LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '23', 'motion', LHCommonLocalizableString.ifttt_triggle_someone_moved));
      authedList.push(device.deviceID);
    });
    const actionList = [LHDeviceActionModel.getOpenLightAction()];
    return new Promise((resolve, reject) => {
      LHIFTTTManager.saveMijiaSmartSceneRecord(
        triggleList,
        actionList,
        authedList,
        LHCommonLocalizableString.sensor_set_ifttt_scene_name_6,
        0,
        () => {
          console.log('套装自动化---【2分钟无人移动夜灯关】创建成功');
          resolve();
        },
        () => {
          console.log('套装自动化---【2分钟无人移动夜灯关】创建失败');
          reject();
        }
      );
    });
  }
}
