/*
 * File: LHSensorSetIFTTTConstant.js
 * Project: LHCommonFunction
 * File Created: Tuesday, 20th August 2019 2:42:27 pm
 * Author: 廖子铭 (ziming.liao@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

/**
 * 套装自动化Constant
 *
 * @export
 * @class LHSensorSetIFTTTConstant
 */
import { Device } from 'miot';
import LHDeviceModel from './LHDeviceModel';

const SensorSetIFTTTType = {
  UnNecessary: -1,
  V3: 1,
  ACP201705: 2,
  TW: 3,
  EU: 4,
  ACDongpeng2018: 5,
  UK: 6
};

export default class LHSensorSetIFTTTConstant {
  /**
   * 错误码
   */
  static errorCode() {
    return {
      OFFLine: -1,
      NotSupportSensorSetIFTTT: -2,
      RPCError: -3,
      DeviceListEmpty: -4,
      BuildError: -5
    };
  }

  /**
   *  成功码
   */
  static successCode() {
    return {
      AlreadyBuild: 1,
      NeedBuild: 2,
      SuccessBuild: 3,
      ApartBuild: 4 // 部分成功
    };
  }

  /**
   *  给到外面获取套装自动化的类型
   */
  static IFTTTType() {
    return SensorSetIFTTTType;
  }

  /**
   * 获取当前网关的套装自动化类型
   */
  static getCurrentGatewaySensorSetIFTTTType() {
    if (Device.model === LHDeviceModel.DeviceModelAqaraHubLmUK01()) {
      return SensorSetIFTTTType.UK;
    } else if (Device.model === LHDeviceModel.DeviceModelAqaraHubMiEU01()) {
      return SensorSetIFTTTType.EU;
    }
    // else if (Device.model === LHDeviceModel.DeviceModelAqaraHubMiTW01()) {
    //   return SensorSetIFTTTType.TW;
    // } else if (Device.model === LHDeviceModel.DeviceModelGatewayV3()) {
    //   return SensorSetIFTTTType.V3;
    // }
    return SensorSetIFTTTType.UnNecessary;
  }
}