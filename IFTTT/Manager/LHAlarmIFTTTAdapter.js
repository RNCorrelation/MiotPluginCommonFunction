import { Device } from 'miot';
import LHCommonLocalizableString from '../../Config/Localized/LHCommonLocalizableString';
import LHDeviceModel from '../Constant/LHDeviceModel';
import LHGuardTypeMode from '../Model/LHGuardTypeMode';
import LHDeviceTriggleModel from '../Model/LHDeivceTriggleModel';

const kIFTTTKeyClick = 'click';
const kIFTTTKeyDoubleClick = 'double_click';
const kIFTTTKeyLongClickPress = 'long_click_press';
const kIFTTTKeyShake = 'shake';
const kIFTTTKeyVibrate = 'vibrate';
const kIFTTTKeyFreefall = 'free_fall';
const kIFTTTKeyTilt = 'tilt';
const kIFTTTKeyMotion = 'motion';
const kIFTTTKeyOpen = 'open';
const kIFTTTKeyClickCh0 = 'click_ch0';
const kIFTTTKeyDoubleClickCh0 = 'double_click_ch0';
const kIFTTTKeyLongClickCh0 = 'long_click_ch0';

export default class LHAlarmIFTTTAdapter {
  /**
   * 根据 model 判断该 model 是否支持告警自动化
   *
   * @static
   * @param {*} model
   * @memberof LHAlarmIFTTTAdapter
   */
  static isSupportIFTTT(model, iftttType) {
    // 小米米家多模网关 支持的守护设备
    if (Device.model === LHDeviceModel.DeviceModelMijiaMultiModeHub()) {
      if (iftttType === LHGuardTypeMode.getBaseGuardType()) {
        // 无线开关
        if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()
        || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
        || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
        || model === LHDeviceModel.DeviceModelWirelessSwitchV2()
        // 人体传感器
        || model === LHDeviceModel.DeviceModelSensorMotionAq2()
        || model === LHDeviceModel.DeviceModelSensorMotionV2()
        // 门窗传感器
        || model === LHDeviceModel.DeviceModelSensorMagnetAq2()
        || model === LHDeviceModel.DeviceModelSensorMagnetV2()
        // 动静贴
        || model === LHDeviceModel.DeviceModelVibrationAq1()
        // 魔方
        || model === LHDeviceModel.DeviceModelCubeAq1()
        || model === LHDeviceModel.DeviceModelCubeMijiaV1()
        // 温湿度传感器（暂时不支持）
        // || model === LHDeviceModel.DeviceModelSensorHTV1()
        // || model === LHDeviceModel.DeviceModelWeatherV1()
        // 无线开关（贴墙式单键版）
        || model === LHDeviceModel.DeviceModelSensor86SWV1()
        || model === LHDeviceModel.DeviceModelSensor86ACN01()
        // 天然气报警器
        || model === LHDeviceModel.DeviceModelSensorNatgasV1()
        // 烟雾报警器
        || model === LHDeviceModel.DeviceModelSensorSmokeV1()
        // 水浸传感器
        || model === LHDeviceModel.DeviceModelSensorWleakAq1()
        ) {
          return true;
        }
      } else if (iftttType === LHGuardTypeMode.getHomeGuardType()
        || iftttType === LHGuardTypeMode.getAwayGuardType()
        || iftttType === LHGuardTypeMode.getSleepGuardType()) {
        // 无线开关
        if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()
        || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
        || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
        || model === LHDeviceModel.DeviceModelWirelessSwitchV2()
        // 人体传感器
        || model === LHDeviceModel.DeviceModelSensorMotionAq2()
        || model === LHDeviceModel.DeviceModelSensorMotionV2()
        // 门窗传感器
        || model === LHDeviceModel.DeviceModelSensorMagnetAq2()
        || model === LHDeviceModel.DeviceModelSensorMagnetV2()
        // 动静贴
        || model === LHDeviceModel.DeviceModelVibrationAq1()
        // 魔方
        || model === LHDeviceModel.DeviceModelCubeAq1()
        || model === LHDeviceModel.DeviceModelCubeMijiaV1()
        // 温湿度传感器（暂时不支持）
        // || model === LHDeviceModel.DeviceModelSensorHTV1()
        // || model === LHDeviceModel.DeviceModelWeatherV1()
        // // 无线开关（贴墙式单键版）
        || model === LHDeviceModel.DeviceModelSensor86SWV1()
        || model === LHDeviceModel.DeviceModelSensor86ACN01()
        // 水浸传感器
        || model === LHDeviceModel.DeviceModelSensorWleakAq1()
        ) {
          return true;
        }
      }
    // Aqara 网关（linux hub）支持的守护设备
    } else if (Device.model === LHDeviceModel.DeviceModelAqaraHubLmUK01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubMiEU01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubMiTW01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubMiHK01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubAqHM01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubAqHM02()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubAqHM03()) {
      // 普通守护模式
      if (iftttType === LHGuardTypeMode.getNormalGuardType()) {
        // 无线开关
        if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()
        || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
        || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
        || model === LHDeviceModel.DeviceModelWirelessSwitchV2()
        // 人体传感器
        || model === LHDeviceModel.DeviceModelSensorMotionAq2()
        || model === LHDeviceModel.DeviceModelSensorMotionV2()
        // 门窗传感器
        || model === LHDeviceModel.DeviceModelSensorMagnetAq2()
        || model === LHDeviceModel.DeviceModelSensorMagnetV2()
        // 动静贴
        || model === LHDeviceModel.DeviceModelVibrationAq1()
        // 魔方
        || model === LHDeviceModel.DeviceModelCubeAq1()
        || model === LHDeviceModel.DeviceModelCubeMijiaV1()
        ) {
          return true;
        } else {
          return false;
        }
        // 门铃 && 关闭闹钟方式
      } else if (iftttType === LHGuardTypeMode.getDoorbellType()
      || iftttType === LHGuardTypeMode.getCloseAlarmClockType()) {
        // 无线开关
        if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()
        || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
        || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
        || model === LHDeviceModel.DeviceModelWirelessSwitchV2()
        // 人体传感器
        || model === LHDeviceModel.DeviceModelSensorMotionAq2()
        || model === LHDeviceModel.DeviceModelSensorMotionV2()
        // 门窗传感器
        || model === LHDeviceModel.DeviceModelSensorMagnetAq2()
        || model === LHDeviceModel.DeviceModelSensorMagnetV2()) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
    return false;
  }

  /**
   *  判断该情景是否需要显示（该方法还会对原生插件创建的自动化进行适配）
   *
   * @static
   * @param {*} identify  情景 identify
   * @param {*} guardType 当前的守护类型
   * @returns
   * @memberof LHAlarmIFTTTAdapter
   */
  static isSceneNeedToShow(identify, guardType) {
    const guardMode = LHGuardTypeMode.getGuardModelWithGuardType(guardType);
    if (identify === guardMode.identify) {
      return true;

      // 一下为适配旧插件的 identify
    } else if (guardType === LHGuardTypeMode.getBaseGuardType()) {
      if (identify === 'lm_scene_5_1'
      || identify === 'lm_scene_5_2'
      || identify === 'lm_scene_5_3') { // 水浸、烟雾、天然气
        return true;
      }
    } else if (guardType === LHGuardTypeMode.getNormalGuardType()) {
      if (identify === 'lm_scene_1_1'
      || identify === 'lm_scene_1_2'
      || identify === 'lm_scene_1_3'
      || identify === 'lm_scene_1_4'
      || identify === 'lm_scene_1_5'
      || identify === 'lm_scene_1_6'
      || identify === 'lm_scene_1_7') {
        return true;
      }
    } else if (guardType === LHGuardTypeMode.getDoorbellType()) {
      if (identify === 'lm_scene_3_1'
      || identify === 'lm_scene_3_2'
      || identify === 'lm_scene_3_3') {
        return true;
      }
    } else if (guardType === LHGuardTypeMode.getCloseAlarmClockType()) {
      if (identify === 'lm_scene_4_1'
      || identify === 'lm_scene_4_2'
      || identify === 'lm_scene_4_3') {
        return true;
      }
    }
    return false;
  }

  /**
   *  获取 触发报警设备 页面 可控制类型的 model
   */
  static getAlarmTriggleDeviceModel(subDevice) {
    const {
      iconURL,
      name,
      isOnline,
      deviceID: did,
      model
    } = subDevice;
    const triggleModel = this.getDeviceTriggleModel(subDevice);
    return {
      model,
      iconURL,
      title: triggleModel.triggleName,
      isOnline,
      subTitle: name,
      triggleModel,
      did,
      isAdded: false
    };
  }

  /**
   *  获取 触发报警设备 页面 不可控制类型的 model
   */
  static getAlarmTriggleDeviceCantControlModel(subDevice, addedGuardList = [], currentGuardType = -1) {
    const newAddedGuardList = addedGuardList;
    // 排序一下，保证是（在家、离家、睡眠）顺序
    for (let i = 0; i < newAddedGuardList.length - 1; i += 1) {
      for (let j = 0; j < newAddedGuardList.length - i - 1; j += 1) {
        if (newAddedGuardList[j] > newAddedGuardList[j + 1]) {
          const swap = newAddedGuardList[j];
          newAddedGuardList[j] = newAddedGuardList[j + 1];
          newAddedGuardList[j + 1] = swap;
        }
      }
    }
    const {
      iconURL,
      name,
      isOnline,
      deviceID: did,
      model
    } = subDevice;
    const triggleModel = this.getDeviceTriggleModel(subDevice);
    let subTitleDescribe = '';
    if (currentGuardType === LHGuardTypeMode.getBaseGuardType()) { // 如果当前是基础守护，就需要对这个设备被加到哪些守护进行显示
      for (let index = 0; index < newAddedGuardList.length; index += 1) {
        const element = newAddedGuardList[index];
        subTitleDescribe += LHGuardTypeMode.getGuardModelWithGuardType(element).guardShortName;
        if (index !== newAddedGuardList.length - 1) {
          subTitleDescribe += '、';
        }
      }
      // （已在{XX}守护中开启）
      subTitleDescribe = LHCommonLocalizableString.common_comboHub_triggle_device_opened_guard.replace('{XX}', subTitleDescribe);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this.isSupportIFTTT(model, currentGuardType) === false) {
        subTitleDescribe = LHCommonLocalizableString.common_comboHub_triggle_device_only_open_basic;
      } else {
        subTitleDescribe = LHCommonLocalizableString.common_comboHub_triggle_device_opened_basic;
      }
    }
    return {
      model,
      iconURL,
      title: triggleModel.triggleName,
      isOnline,
      subTitle: name + ' ' + subTitleDescribe,
      did
    };
  }

  static getAlarmTriggleDeviceCellTitle(model, triggleName) {
    if (model === LHDeviceModel.DeviceModelSensorNatgasV1() // 天然气报警器
    || model === LHDeviceModel.DeviceModelSensorSmokeV1() // 烟雾报警器
    || model === LHDeviceModel.DeviceModelSensorWleakAq1()) {
      return triggleName;
    } else {
      return triggleName + ' ' + LHCommonLocalizableString.common_comboHub_triggle_device_alert; // 动作 + 报警 ex：‘有人移动 报警’
    }
  }

  /**
   *  获取 1.2 网关的自动化 model
   */
  static getLinuxGatewayAlarmIFTTTModel(subDevice) {
    const triggleModel = this.getDeviceTriggleModel(subDevice);
    const {
      name,
      isOnline,
      deviceID: did,
      model
    } = subDevice;
    const onLineString = isOnline ? '' : LHCommonLocalizableString.common_ifttt_device_offline;
    return {
      title: triggleModel.triggleName,
      isOnline,
      subTitle: name + onLineString,
      triggleModel,
      did,
      isAddedInLinuxGateway: false,
      sceneID: '',
      model
    };
  }


  /**
   *  获取设备 triggle model
   */
  static getDeviceTriggleModel(device) {
    if (Device.model === LHDeviceModel.DeviceModelMijiaMultiModeHub()) { // 多模网关
      return this.getMijiaMultiModeGatewayTriggleModelWithDevice(device);
    } else if (Device.model === LHDeviceModel.DeviceModelAqaraHubLmUK01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubMiEU01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubMiTW01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubMiHK01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubAqHM01()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubAqHM02()
    || Device.model === LHDeviceModel.DeviceModelAqaraHubAqHM03()) { // 普通网关
      return this.getNormalGatewayTriggleModelWithDevice(device);
    }
    return null;
  }

  /**
   *  获取米家多模网关的 triggle model
   */
  static getMijiaMultiModeGatewayTriggleModelWithDevice(device) {
    if (device === null || device === undefined) {
      return null;
    }
    const { model } = device;
    let triggles;
    let triggleName = '';
    // 无线开关
    if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_switch;
      triggles = [LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '270', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '271', kIFTTTKeyDoubleClick, LHCommonLocalizableString.ifttt_triggle_double_press)];
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchCN01()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_switch;
      triggles = [LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '688', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '689', kIFTTTKeyDoubleClick, LHCommonLocalizableString.ifttt_triggle_double_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '690', kIFTTTKeyLongClickPress, LHCommonLocalizableString.ifttt_triggle_long_press)];
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchAq3()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_switch;
      triggles = [LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '406', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '407', kIFTTTKeyDoubleClick, LHCommonLocalizableString.ifttt_triggle_double_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '408', kIFTTTKeyLongClickPress, LHCommonLocalizableString.ifttt_triggle_long_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '409', kIFTTTKeyShake, LHCommonLocalizableString.ifttt_triggle_shake)];
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchV2()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_switch;
      triggles = [LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '18', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '19', kIFTTTKeyDoubleClick, LHCommonLocalizableString.ifttt_triggle_double_press),
        LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '58', kIFTTTKeyLongClickPress, LHCommonLocalizableString.ifttt_triggle_long_press)];
    // 动静贴
    } else if (model === LHDeviceModel.DeviceModelVibrationAq1()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_vibration;
      triggles = [LHDeviceTriggleModel.getVibrationTriggleModel(device, '199', kIFTTTKeyVibrate, LHCommonLocalizableString.ifttt_triggle_detect_vibration),
        LHDeviceTriggleModel.getVibrationTriggleModel(device, '277', kIFTTTKeyFreefall, LHCommonLocalizableString.ifttt_triggle_detect_fall),
        LHDeviceTriggleModel.getVibrationTriggleModel(device, '498', kIFTTTKeyTilt, LHCommonLocalizableString.ifttt_triggle_detect_tilting)];
    // 人体传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMotionAq2()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_motion;
      triggles = [LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '264', kIFTTTKeyMotion, LHCommonLocalizableString.ifttt_triggle_someone_moved)];
    } else if (model === LHDeviceModel.DeviceModelSensorMotionV2()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_motion;
      triggles = [LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '23', kIFTTTKeyMotion, LHCommonLocalizableString.ifttt_triggle_someone_moved)];
    // 门窗传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetV2()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_magnet;
      triggles = [LHDeviceTriggleModel.getSensorMagnetTriggleModel(device, '20', kIFTTTKeyOpen, LHCommonLocalizableString.ifttt_triggle_windoor_open)];
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetAq2()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_magnet;
      triggles = [LHDeviceTriggleModel.getSensorMagnetTriggleModel(device, '272', kIFTTTKeyOpen, LHCommonLocalizableString.ifttt_triggle_windoor_open)];
    // 魔方
    } else if (model === LHDeviceModel.DeviceModelCubeAq1()
    || model === LHDeviceModel.DeviceModelCubeMijiaV1()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_cube;
      triggles = [LHDeviceTriggleModel.getSensorCubeTriggleModel(device, LHCommonLocalizableString.ifttt_triggle_moved_afteronemin)];
    // 水浸报警器
    } else if (model === LHDeviceModel.DeviceModelSensorWleakAq1()) {
      triggles = [LHDeviceTriggleModel.getSensorWleakTriggleModel(device, LHCommonLocalizableString.ifttt_triggle_flood_alert)];
    // 烟雾报警器
    } else if (model === LHDeviceModel.DeviceModelSensorSmokeV1()) {
      triggles = [LHDeviceTriggleModel.getSensorSmokeTriggleModel(device, LHCommonLocalizableString.ifttt_triggle_fire_alert)];
    // 天然气报警器
    } else if (model === LHDeviceModel.DeviceModelSensorNatgasV1()) {
      triggles = [LHDeviceTriggleModel.getSensorNatgasTriggleModel(device, LHCommonLocalizableString.ifttt_triggle_gas_leakage_alert)];
    // 贴墙式无线开关单键
    } else if (model === LHDeviceModel.DeviceModelSensor86SWV1()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_switch;
      triggles = [LHDeviceTriggleModel.getSensor86SWTriggleModel(device, '83', kIFTTTKeyClickCh0, LHCommonLocalizableString.ifttt_triggle_single_press)];
    } else if (model === LHDeviceModel.DeviceModelSensor86ACN01()) {
      triggleName = LHCommonLocalizableString.common_ifttt_triggleName_switch;
      triggles = [LHDeviceTriggleModel.getSensor86SWTriggleModel(device, '691', kIFTTTKeyClickCh0, LHCommonLocalizableString.ifttt_triggle_single_press),
        LHDeviceTriggleModel.getSensor86SWTriggleModel(device, '692', kIFTTTKeyDoubleClickCh0, LHCommonLocalizableString.ifttt_triggle_double_press),
        LHDeviceTriggleModel.getSensor86SWTriggleModel(device, '693', kIFTTTKeyLongClickCh0, LHCommonLocalizableString.ifttt_triggle_long_press)];
    }
    return {
      triggle: triggles,
      triggleName: triggleName === '' ? this.getTriggleNameWithTriggles(triggles) : triggleName
    };
  }

  static getIFTTTPushString(model, deviceName, guardType) {
    const { guardName } = LHGuardTypeMode.getGuardModelWithGuardType(guardType);

    if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2() // 无线开关
    || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
    || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
    || model === LHDeviceModel.DeviceModelWirelessSwitchV2()
    || model === LHDeviceModel.DeviceModelSensor86SWV1() // 无线开关（贴墙式单键版）
    || model === LHDeviceModel.DeviceModelSensor86ACN01()
    || model === LHDeviceModel.DeviceModelVibrationAq1()) { // 动静贴
      // {XX}守护中，{YY}触发报警
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_1.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else if (model === LHDeviceModel.DeviceModelSensorMotionAq2() // 人体传感器
    || model === LHDeviceModel.DeviceModelSensorMotionV2()) {
      // {XX}守护中，{YY}感应到有人移动触发报警
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_2.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetAq2() // 门窗传感器
    || model === LHDeviceModel.DeviceModelSensorMagnetV2()) {
      // {XX}守护中，{YY}打开触发报警
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_3.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else if (model === LHDeviceModel.DeviceModelCubeAq1()
    || model === LHDeviceModel.DeviceModelCubeMijiaV1()) { // 魔方
      // {XX} is active, {YY} was moved and triggered the alert.
      // {XX}守护中，{YY}感应到被移动
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_4.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else if (model === LHDeviceModel.DeviceModelSensorWleakAq1()) { // 水浸传感器
      // {XX}守护中，{YY}感应到浸水报警
      // {XX} is active, {YY} detected water and triggered the alert.
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_5.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else if (model === LHDeviceModel.DeviceModelSensorNatgasV1()) { // 天然气报警器
      // {XX} is active, Gas concentration detected by the {YY} exceeds the standard.
      // {XX}守护中，{YY}检测到气体浓度超标
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_6.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else if (model === LHDeviceModel.DeviceModelSensorSmokeV1()) { // 烟雾报警器
      // {XX} is active，Smoke detected by the {YY}.
      // {XX}守护中，{YY}检测到烟雾
      return LHCommonLocalizableString.ifttt_push_title_triggle_alert_7.replace('{XX}', guardName).replace('{YY}', deviceName);
    } else {
      return 'unknown';
    }
    // 温湿度传感器（暂时不支持）
    // || model === LHDeviceModel.DeviceModelSensorHTV1()
    // || model === LHDeviceModel.DeviceModelWeatherV1()
  }

  /**
   *  获取普通网关的 triggle model
   */
  static getNormalGatewayTriggleModelWithDevice(device) {
    if (device === null || device === undefined) {
      return null;
    }
    const { model } = device;
    let triggles;
    // 无线开关
    if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()) {
      triggles = LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '270', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press);
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchCN01()) {
      triggles = LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '688', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press);
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchAq3()) {
      triggles = LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '406', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press);
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchV2()) {
      triggles = LHDeviceTriggleModel.getSensorSwitchTriggleModel(device, '18', kIFTTTKeyClick, LHCommonLocalizableString.ifttt_triggle_single_press);
    // 动静贴
    } else if (model === LHDeviceModel.DeviceModelVibrationAq1()) {
      triggles = LHDeviceTriggleModel.getVibrationTriggleModel(device, '199', kIFTTTKeyVibrate, LHCommonLocalizableString.ifttt_triggle_detect_vibration);
    // 人体传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMotionAq2()) {
      triggles = LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '264', kIFTTTKeyMotion, LHCommonLocalizableString.ifttt_triggle_someone_moved);
    } else if (model === LHDeviceModel.DeviceModelSensorMotionV2()) {
      triggles = LHDeviceTriggleModel.getSensorMotionTriggleModel(device, '23', kIFTTTKeyMotion, LHCommonLocalizableString.ifttt_triggle_someone_moved);
    // 门窗传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetV2()) {
      triggles = LHDeviceTriggleModel.getSensorMagnetTriggleModel(device, '20', kIFTTTKeyOpen, LHCommonLocalizableString.ifttt_triggle_windoor_open);
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetAq2()) {
      triggles = LHDeviceTriggleModel.getSensorMagnetTriggleModel(device, '272', kIFTTTKeyOpen, LHCommonLocalizableString.ifttt_triggle_windoor_open);
    // 魔方
    } else if (model === LHDeviceModel.DeviceModelCubeAq1()) {
      triggles = LHDeviceTriggleModel.getSensorCubeTriggleModel(device, LHCommonLocalizableString.ifttt_triggle_moved_afteronemin);
    } else if (model === LHDeviceModel.DeviceModelCubeMijiaV1()) {
      triggles = LHDeviceTriggleModel.getSensorCubeTriggleModel(device, LHCommonLocalizableString.ifttt_triggle_moved_afteronemin);
    }

    return {
      triggle: triggles,
      triggleName: this.getTriggleNameWithTriggles(triggles),
      pushString: '警戒时，' + device.name + '触发报警'
    };
  }

  /**
   *  获取普通网关的门铃自动化名称
   */
  static getNormalGatewayDoorBellIFTTTName(device) {
    if (device === null || device === undefined) {
      return null;
    }
    const { model } = device;
    let name = 'unknown';
    // 无线开关
    if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_1;
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchCN01()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_1;
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchAq3()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_1;
    } else if (model === LHDeviceModel.DeviceModelWirelessSwitchV2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_1;
    // 人体传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMotionAq2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_3;
    } else if (model === LHDeviceModel.DeviceModelSensorMotionV2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_3;
    // 门窗传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetV2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_2;
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetAq2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_3_2;
    }

    return name;
  }

  /**
   *  获取普通网关的警戒自动化名称
   */
  static getNormalGatewayAlarmIFTTTName(device) {
    if (device === null || device === undefined) {
      return null;
    }
    const { model } = device;
    let name = 'unknown';
    // 无线开关
    if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()
        || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
        || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
        || model === LHDeviceModel.DeviceModelWirelessSwitchV2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_1_3;
    // 动静贴
    } else if (model === LHDeviceModel.DeviceModelVibrationAq1()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_1_5;
    // 人体传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMotionAq2()
        || model === LHDeviceModel.DeviceModelSensorMotionV2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_1_1;
    // 门窗传感器
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetV2()
        || model === LHDeviceModel.DeviceModelSensorMagnetAq2()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_1_2;
    // 魔方
    } else if (model === LHDeviceModel.DeviceModelCubeAq1()
      || model === LHDeviceModel.DeviceModelCubeMijiaV1()) {
      name = LHCommonLocalizableString.common_scene_name_lm_scene_1_4;
    }
    return name;
  }

  /**
   *  获取普通网关的闹钟自动化名称
   */
  static getNormalGatewayClockIFTTTName(device) {
    if (device === null || device === undefined) {
      return null;
    }
    const { model } = device;
    let name = 'unknown';
    if (model === LHDeviceModel.DeviceModelWirelessSwitchAq2()
      || model === LHDeviceModel.DeviceModelWirelessSwitchCN01()
      || model === LHDeviceModel.DeviceModelWirelessSwitchAq3()
      || model === LHDeviceModel.DeviceModelWirelessSwitchV2()) {
      // 无线开关
      name = LHCommonLocalizableString.common_scene_name_lm_scene_4_3;
    } else if (model === LHDeviceModel.DeviceModelSensorMotionAq2()
      || model === LHDeviceModel.DeviceModelSensorMotionV2()) {
      // 人体传感器
      name = LHCommonLocalizableString.common_scene_name_lm_scene_4_1;
    } else if (model === LHDeviceModel.DeviceModelSensorMagnetAq2()
      || model === LHDeviceModel.DeviceModelSensorMagnetV2()) {
      // 门窗传感器
      name = LHCommonLocalizableString.common_scene_name_lm_scene_4_2;
    }
    return name;
  }

  static getLeakAlarmIFTTTName(type) {
    if (type === 1) {
      return LHCommonLocalizableString.common_scene_name_lm_scene_5_1;
    } else if (type === 2) {
      return LHCommonLocalizableString.common_scene_name_lm_scene_5_2;
    } else if (type === 3) {
      return LHCommonLocalizableString.common_scene_name_lm_scene_5_3;
    }
    return null;
  }

  /**
   * 获取 triggle 的名称
   */
  static getTriggleNameWithTriggles(triggles) {
    if (triggles === null || triggles === undefined) {
      return '';
    }
    if (!Array.isArray(triggles)) {
      return triggles.name;
    }
    let name = '';
    for (let i = 0, triggleLen = triggles.length; i < triggleLen; i += 1) {
      const triggle = triggles[i].name;
      if (name === '') {
        name = triggle;
      } else {
        name = name + '/' + triggle;
      }
    }
    return name;
  }
}