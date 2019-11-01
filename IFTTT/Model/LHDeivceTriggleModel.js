import { Device } from 'miot';
import LHGuardTypeMode from './LHGuardTypeMode';

export default class LHDeviceTriggleModel {
  /**
   * 动静贴
   */
  static getVibrationTriggleModel(device, scId, key, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.' + key,
      device_name: device.name,
      sc_id: scId,
      tr_id: 101,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: ''
    };
  }

  /**
   * 人体传感器
   */
  static getSensorMotionTriggleModel(device, scId, key, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.' + key,
      device_name: device.name,
      sc_id: scId,
      tr_id: 108,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   *  无线开关
   */
  static getSensorSwitchTriggleModel(device, scId, key, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.' + key,
      device_name: device.name,
      sc_id: scId,
      tr_id: 101,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 米家门窗传感器
   */
  static getSensorMagnetTriggleModel(device, scId, key, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.' + key,
      device_name: device.name,
      sc_id: scId,
      tr_id: 107,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 魔方
   */
  static getSensorCubeTriggleModel(device, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.alert',
      extra: '[1,18,2,85,[0,2],0,0]', // 该 triggle 比较特殊，需要写死
      device_name: device.name,
      sc_id: '',
      tr_id: 0,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 水浸传感器
   */
  static getSensorWleakTriggleModel(device, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.leak',
      device_name: device.name,
      sc_id: '300',
      tr_id: 104,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 烟雾传感器
   */
  static getSensorSmokeTriggleModel(device, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.alarm',
      device_name: device.name,
      sc_id: '125',
      tr_id: 104,
      default_value: 0,
      value: 1,
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 天然气报警器
   */
  static getSensorNatgasTriggleModel(device, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.alarm',
      device_name: device.name,
      sc_id: '124',
      tr_id: 104,
      default_value: 0,
      value: 1,
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 贴墙板无线开关
   */
  static getSensor86SWTriggleModel(device, scId, key, triggleName) {
    return {
      name: triggleName,
      did: device.deviceID,
      key: 'event.' + device.model + '.' + key,
      device_name: device.name,
      sc_id: scId,
      tr_id: 101,
      default_value: 0,
      value: '',
      src: 'device',
      device_abbr: 'device'
    };
  }

  /**
   * 网关警戒 triggle
   */
  static getGatewayAlarmTriggleModelWithAlarmType(alarmType) {
    const guardModel = LHGuardTypeMode.getGuardModelWithGuardType(alarmType);
    if (alarmType === LHGuardTypeMode.getNormalGuardType()) {
      return {
        device_name: Device.name,
        did: Device.deviceID,
        src: 'device',
        tr_id: 104,
        sc_id: 0,
        value: 'on',
        default_value: 0,
        extra: '[1,19,6,111,[0,1],2,0]',
        key: 'prop.' + Device.model + '.arming',
        device_abbr: ''
      };
    } else if (alarmType === LHGuardTypeMode.getBaseGuardType()) {
      return [{
        device_name: Device.name,
        did: Device.deviceID,
        src: 'device',
        tr_id: 104,
        sc_id: guardModel.sc_id,
        value: alarmType,
        default_value: 0,
        key: 'prop.' + Device.model + '.3.1',
        device_abbr: ''
      },
      this.getGatewayAlarmTriggleModelWithAlarmType(LHGuardTypeMode.getHomeGuardType()),
      this.getGatewayAlarmTriggleModelWithAlarmType(LHGuardTypeMode.getAwayGuardType()),
      this.getGatewayAlarmTriggleModelWithAlarmType(LHGuardTypeMode.getSleepGuardType())];
    } else {
      return {
        device_name: Device.name,
        did: Device.deviceID,
        src: 'device',
        tr_id: 104,
        sc_id: guardModel.sc_id,
        value: alarmType,
        default_value: 0,
        key: 'prop.' + Device.model + '.3.1',
        device_abbr: ''
      };
    }
  }
}