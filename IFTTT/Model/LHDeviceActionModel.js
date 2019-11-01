import { Device } from 'miot';
import LHGuardTypeMode from './LHGuardTypeMode';
import LHCommonLocalizableString from '../../Config/Localized/LHCommonLocalizableString';

export default class LHDeviceActionModel {
  /**
   *  获取告警触发自动化的动作列表
   */
  static getGatewayAlarmActionListWithAlarmType(alarmType) {
    if (alarmType === LHGuardTypeMode.getNormalGuardType()) {
      return [{
        keyName: 'name',
        model: Device.model,
        name: Device.name,
        payload: {
          command: Device.model + '.alarm',
          did: Device.deviceID,
          extra: '[1,18,2,85,[0,2],0,0]',
          value: 10000
        }
      }];
    } else {
      return [{
        keyName: 'name',
        model: Device.model,
        name: Device.name,
        type: 0,
        tr_id: 201,
        sa_id: 3832,
        payload: {
          command: Device.model + '.set_properties',
          did: Device.deviceID,
          value: [{
            piid: 22,
            value: alarmType === LHGuardTypeMode.getBaseGuardType() ? 2 : 1, // 基础守护为（非安全系统报警：2）、其他守护为（安全系统报警：1）
            siid: 3
          }]
        }
      }];
    }
  }


  /**
   *  门铃
   */
  static getDoorbellAction() {
    return [{
      keyName: 'name',
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.door_bell',
        did: Device.deviceID,
        extra: '[1,19,2,85,[44,10000],0,0]',
        value: '10000'
      }
    }];
  }

  /**
   *  关闭闹钟
   */
  static getCloseClockAction() {
    return [{
      keyName: 'name',
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.play_alarm_clock',
        did: Device.deviceID,
        extra: '[1,19,5,111,[44,0],0,0]',
        value: 'off'
      }
    }];
  }

  /**
   *  播放铃音
   */
  static getPlayMusiceAction() {
    return {
      keyName: LHCommonLocalizableString.sensor_set_ifttt_triggle_name_3,
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.play_music_new',
        did: Device.deviceID,
        extra: '[1,19,5,85,[56,8,0,60],0,0]',
        value: ['8', 60],
        key: 'value'
      }
    };
  }

  /**
   *  开/关夜灯
   */
  static getToggleLightAction() {
    return {
      keyName: LHCommonLocalizableString.sensor_set_ifttt_triggle_name_4,
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.toggle_light',
        did: Device.deviceID,
        extra: '[1,19,7,111,[40,2],0,0]',
        value: 'toggle',
        key: 'value'
      }
    };
  }

  /**
   *  打开感应夜灯
   */
  static getOpenSmartLightAction() {
    return {
      keyName: LHCommonLocalizableString.sensor_set_ifttt_triggle_name_5,
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.toggle_smart_light',
        did: Device.deviceID,
        extra: '[1,19,7,111,[48,3],0,0]',
        value: 'on',
        key: 'value'
      }
    };
  }

  /**
   * 关闭夜灯
   */
  static getCloseLightAction() {
    return {
      keyName: LHCommonLocalizableString.sensor_set_ifttt_triggle_name_6,
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.toggle_light',
        did: Device.deviceID,
        extra: '[1,19,7,111,[48,0],0,0]',
        value: 'off',
        key: 'value'
      }
    };
  }

  /**
   * 打开夜灯
   */
  static getOpenLightAction() {
    return {
      keyName: LHCommonLocalizableString.sensor_set_ifttt_triggle_name_7,
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.toggle_light',
        did: Device.deviceID,
        extra: '[1,19,7,111,[48,1],0,0]',
        value: 'on',
        key: 'value'
      }
    };
  }

  /**
   *  开/关警戒
   */
  static getToggleAlarmAction() {
    return {
      keyName: LHCommonLocalizableString.sensor_set_ifttt_triggle_name_8,
      model: Device.model,
      name: Device.name,
      payload: {
        command: Device.model + '.set_arming',
        did: Device.deviceID,
        extra: '[1,19,6,111,[40,3],0,0]',
        value: 'toggle',
        key: 'value'
      }
    };
  }

  /**
   * 联动网关报警
   */
  static getLinkageAlarmAction(device) {
    return {
      model: device.model,
      type: 0,
      did: device.deviceID,
      name: Device.name,
      extra: '[1,19,9,85,[40,10000],0,0]',
      payload: {
        value: 'toggle',
        did: device.deviceID,
        command: `${device.model}.linkage_alarm`,
        total_length: 0,
        extra: '[1,19,9,85,[40,10000],0,0]'
      }
    };
  }
}