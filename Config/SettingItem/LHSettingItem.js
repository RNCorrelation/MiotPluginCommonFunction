import { Host, Device, Package } from 'miot';
import { strings } from 'miot/resources';
import {
  LHMiServer,
  LHDialogUtils,
  LHPolicyLicenseUtils,
  LHAuthorizationUtils
} from 'LHCommonFunction';
import LHCommonLocalizableString from '../Localized/LHCommonLocalizableString';

// index 用于重排通用设置项
function getSettingItem(type, extendParams) {
  const allItems = {
    deviceName: {
      index: 1,
      title: strings.name,
      rightDescription: '',
      press: () => {
        Host.ui.openChangeDeviceName();
      }
    },
    switchSetting: {
      index: 6,
      title: strings.memberSet,
      press: () => {
        Host.ui.openPowerMultikeyPage(Device.deviceID, Device.mac);
      }
    },
    shareDevice: {
      index: 9,
      title: strings.share,
      press: () => {
        Host.ui.openShareDevicePage();
      }
    },
    roomManagement: {
      index: 3,
      title: strings.location,
      press: () => {
        Host.ui.openRoomManagementPage();
      }
    },
    deviceTimeZone: {
      title: strings.timezone,
      press: () => {
        Host.ui.openDeviceTimeZoneSettingPage({ sync_device: false });
      }
    },
    iftttAuto: {
      index: 18,
      title: strings.ifttt,
      press: () => {
        Host.ui.openIftttAutoPage();
      }
    },
    btGateway: {
      index: 12,
      title: strings.btGateway,
      press: () => {
        Host.ui.openBtGatewayPage();
      }
    },
    firmwareUpgrate: {
      index: 21,
      title: strings.firmwareUpgrade,
      press: () => {
        Host.ui.openDeviceUpgradePage();
      }
    },
    pairWithHomeKitiOS: { // ios特有设置，HomeKit绑定
      index: 24,
      title: LHCommonLocalizableString.common_setting_homekit_device_add
    },
    helpPage: {
      index: 30,
      title: strings.help,
      press: () => {
        Host.ui.openHelpPage();
      }
    },
    addToDesktop: {
      title: strings.addToDesktop,
      press: () => {
        Host.ui.openAddToDesktopPage();
      }
    },
    privacyLicense: {
      index: 33,
      title: strings.legalInfo,
      press: () => {
      }
    },
    deleteDevice: {
      title: strings.deleteDevice,
      press() {
        if (Device.parentDevice) {
          LHDialogUtils.MessageDialogShow({
            title: LHCommonLocalizableString.common_setting_device_delete_confirm,
            message: LHCommonLocalizableString.common_setting_device_delete_tip,
            confirm: LHCommonLocalizableString.common_ok,
            onConfirm: () => {
              LHMiServer.DeleteDevices([{ did: Device.deviceID, pid: Device.type }], () => {
                Package.exit();
              }, () => {
                Package.exit();
              });
            },
            cancel: LHCommonLocalizableString.common_cancel,
            onCancel: () => {}
          });
        } else {
          Host.ui.openDeleteDevice();
        }
      }
    },
    securitySetting: {
      title: strings.security,
      press() {
        Host.ui.openSecuritySetting();
      }
    },
    feedbackInput: {
      title: strings.feedback,
      press() {
        Host.ui.openFeedbackInput();
      }
    },
    plugIn: {
      title: LHCommonLocalizableString.common_setting_feature_plug_in,
      hideRightArrow: true,
      noTouchableHighlight: true
    },
    voiceAuth: {
      index: 15,
      title: strings.voiceAuth,
      press() {
        Host.ui.openVoiceCtrlDeviceAuthPage();
      }
    }
  };
  return (allItems[type] && Object.assign({}, allItems[type], extendParams)) || null;
}

/**
* @module LHSettingItem
* @description 通用设置项
* @example
* import {
*   LHSettingItem
* } from 'LHCommonFunction';
*
* LHSettingItem.roomManagementItem;
*/
export default class LHSettingItem {
  /**
 * @static
 * @function getSettingItem
 * @description 获取设置页通用项
 * @param {string} type 类型，options: ["deviceName", "roomManagement", "deviceTimeZone", "iftttAuto", "moreSetting", "addToDesktop", "privacyLicense", "deleteDevice", "voiceAuth"]
 * @param {Object[]} [extendParams] 扩展参数
 * @param {Object} [extendParams.style] 样式
 * @param {Function} [extendParams.press] 点击事件
 * @return {Object} 一个符合LHStandardList结构数据对象
 */
  static getSettingItem(type, extendParams) {
    return getSettingItem(type, extendParams);
  }

  /**
   * 插件版本
   * @param plugIn
   * @returns {*}
   */
  static plugInItem = (plugIn) => { return getSettingItem('plugIn', { rightDescription: plugIn }); };

  /**
   * 设备名称
   * @param deviceName
   * @returns {*}
   */
  static deviceNameItem = (deviceName) => { return getSettingItem('deviceName', { rightDescription: deviceName }); };

  /**
   * 隐私协议
   * @param urls,所有隐私的资源地址，如：
    {
      licenseUrl_en: require('./html/agreement_en.html'),
      licenseUrl_zh: require('./html/agreement_zh.html'),
      policyUrl_en: require('./html/policy_en.html'),
      policyUrl_zh: require('./html/policy_zh.html')
    }
   * @returns {*}
   */
  static GetPrivacyLicenseItem = (policyResource) => {
    const policyLicenseUrl = LHPolicyLicenseUtils.GexPolicyLicenseUrl(policyResource, LHAuthorizationUtils.PolicyCode.languageCode);
    console.log('LHSettingItem GetPrivacyLicenseItem', LHAuthorizationUtils.PolicyCode.languageCode, policyLicenseUrl.licenseUrl);
    return getSettingItem('privacyLicense',
      {
        press: () => {
          Host.ui.privacyAndProtocolReview(
            LHCommonLocalizableString.common_setting_user_agreement,
            policyLicenseUrl.licenseUrl,
            LHCommonLocalizableString.common_setting_privacy_policy,
            policyLicenseUrl.policyUrl
          );
        }
      });
  };

  /**
   * @description 更多设置,记得将LHMoreSettingPage注入路由，LHMoreSettingPage从LHCommonUI模块中引入
   * @param navigation
   * @param showDeviceTimeZone 更多设置里面是否显示设备时区
   * @param syncDeviceTimeZoneToDevice 是否同步设备时区到设备端
   * @returns {*}
   */
  static GetMoreSettingItem = (navigation, showDeviceTimeZone, syncDeviceTimeZoneToDevice) => {
    return {
      index: 27,
      title: strings.more,
      press: () => {
        navigation.navigate('LHMoreSettingPage', {
          showDeviceTimeZone,
          syncDeviceTimeZoneToDevice
        });
      }
    };
  };

  /**
   * @static
   * @member roomManagementItem
   * @description 位置管理
   */
  static roomManagementItem = getSettingItem('roomManagement')

  /**
   * @static
   * @member shareDeviceItem
   * @description 设备分享
   */
   static shareDeviceItem = getSettingItem('shareDevice')

  /**
   * @static
   * @member deviceTimeZoneItem
   * @description 设备时区
   */
  static deviceTimeZoneItem = getSettingItem('deviceTimeZone')

  /**
   * @static
   * @member iftttAutoItem
   * @description 智能
   */
  static iftttAutoItem = getSettingItem('iftttAuto')

  /**
   * @static
   * @member btGatewayItem
   * @description 蓝牙网关，APILevel 10001
   */
  static btGatewayItem = getSettingItem('btGateway')

  /**
   * @static
   * @member firmwareUpgrateItem
   * @description 检查固件升级
   */
  static firmwareUpgrateItem = getSettingItem('firmwareUpgrate')

  /**
   * @static
   * @member helpPageItem
   * @description 使用帮助
   */
  static helpPageItem = getSettingItem('helpPage')

  /**
   * @static
   * @member addToDesktopItem
   * @description 添加到桌面
   */
  static addToDesktopItem = getSettingItem('addToDesktop')

  /**
   * @static
   * @member deleteDeviceItem
   * @description 删除设备
   */
  static deleteDeviceItem = getSettingItem('deleteDevice')

  /**
   * @static
   * @member securitySettingItem
   * @description 安全设置
   */
  static securitySettingItem = getSettingItem('securitySetting')

  /**
   * @static
   * @member feedbackInputItem
   * @description 反馈问题
   */
  static feedbackInputItem = getSettingItem('feedbackInput')

  /**
   * @static
   * @member voiceAuthItem
   * @description 语音授权
   */
  static voiceAuthItem = getSettingItem('voiceAuth')

  /**
   * @static
   * @member switchSettingItem
   * @description 按键设置
   */
  static switchSettingItem = getSettingItem('switchSetting')
}