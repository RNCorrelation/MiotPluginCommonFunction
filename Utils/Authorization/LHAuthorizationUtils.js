/*
 * @Date: 2019-08-05 18:29:04
 * @LastEditors: Lavie
 * @LastEditTime: 2019-09-23 10:59:44
 */
import {
  Device, Package, PackageEvent
} from 'miot';
import { Platform } from 'react-native';
import { LHMiServer, LHPolicyLicenseUtils } from 'LHCommonFunction';

const privacyProtocolCacheKey = 'prop.s_auth_config';
const { isOnline, isShared } = Device;
/**
* @module LHAuthorizationUtils
* @description 授权流程模块
* @example
* import {
*   LHAuthorizationUtils,
* } from 'LHCommonFunction';
* this.authorizationCancelListener = LHAuthorizationUtils.Authorization({
*  licenseTitle: LHCommonLocalizableString.common_setting_user_agreement,
*  policyResource: Resources.PolicyLicense,
*  policyTitle: LHCommonLocalizableString.common_setting_privacy_policy,
*  diffEn: true,
*  authorizationSucc: () => {
*    this.checkModal();
*   }
* });
*
*/
export default class LHAuthorizationUtils {
  static PolicyCode = {
    languageCode: 'en',
    hasRequest: false,
    hideLegalInfo: false
  }

  /**
   * @static
   * @function Authorization
   * @description 授权流程调用
   * @param {string} licenseTitle 用户协议标题
   * @param {string} policyResource 插件resource html里面的资源文件
   * @param {string} policyTitle 隐私政策标题
   * @param {Function} authorizationSucc 已授权或用户确认授权成功回调
   */
  static Authorization(params) {
    if (!params.policyResource) {
      throw new Error('LHAuthorizationUtils: params policy resource is undefine!');
    }
    if (LHAuthorizationUtils.PolicyCode.hasRequest) {
      LHAuthorizationUtils.CheckAuthorized(params);
    } else {
      LHAuthorizationUtils.checkRegion(params);
    }
    if (Platform.OS !== 'ios') {
      LHAuthorizationUtils.AuthorizationCancelListener();
    }
  }

  static AuthorizationCancelListener() {
    return PackageEvent.packageAuthorizationCancel.addListener(() => {
      if (Package) {
        Package.exit();
      }
    });
  }

  /**
   * 根据登录地区和语言判断要显示的隐私语言
   * 子设备：国内Aqara网关(aqhm01),弹的隐私和父设备的一样 摄像头 空调伴侣的子设备不弹隐私
   * 海外: Aqara网关的子设备弹的隐私和父设备一样，(后续添加)烟感在香港有一份特殊的隐私，弹自己的
   * @param {*} params
   */
  static checkRegion(params) {
    LHPolicyLicenseUtils.GetCountryLanguageCode((res, serverCode) => {
      // if (serverCode === 'cn' && Device.parentDevice && LHPolicyLicenseUtils.NotShowPolicy(Device.parentDevice.model)) {
      //   LHAuthorizationUtils.PolicyCode.hideLegalInfo = true;
      //   if (typeof params.authorizationSucc === 'function') params.authorizationSucc();
      //   return;
      // }
      LHAuthorizationUtils.PolicyCode.languageCode = res;
      LHAuthorizationUtils.PolicyCode.hasRequest = true;
      LHAuthorizationUtils.CheckAuthorized(params);
    });
  }

  /**
   * @ignore
   * @static
   * @function CheckAuthorized
   * @description 检测是否已经授权
   */
  static CheckAuthorized(params) {
    // 分享用户和离线状态不用检测
    if (!isOnline || isShared) {
      if (typeof params.authorizationSucc === 'function') params.authorizationSucc();
      return;
    }
    LHMiServer.BatchGetDeviceDatas([{ did: Device.deviceID, props: [privacyProtocolCacheKey] }], (res) => {
      let alreadyAuthed = false;
      const result = res[Device.deviceID];
      let config;
      if (result && result[privacyProtocolCacheKey]) {
        config = result[privacyProtocolCacheKey];
      }
      if (config) {
        try {
          const authJson = JSON.parse(config);
          alreadyAuthed = authJson.privacyAuthed && true;
        } catch (err) {
          // json解析失败，不处理
        }
      }
      if (alreadyAuthed) { // 已授权
        if (typeof params.authorizationSucc === 'function') params.authorizationSucc();
      } else { // 未授权
        LHAuthorizationUtils.OpenPrivacyLicense(params);
      }
    }, () => {
      if (typeof params.authorizationSucc === 'function') params.authorizationSucc();
    });
  }

  /**
   * @ignore
   * @static
   * @function OpenPrivacyLicense
   * @description 打开授权弹窗
   */
  static OpenPrivacyLicense(params) {
    const policyLicenseUrl = LHPolicyLicenseUtils.GexPolicyLicenseUrl(params.policyResource, LHAuthorizationUtils.PolicyCode.languageCode);
    LHMiServer.OpenPrivacyLicense(
      params.licenseTitle,
      policyLicenseUrl.licenseUrl,
      params.policyTitle,
      policyLicenseUrl.policyUrl
    ).then((result) => {
      if (result) {
        const onSucces = typeof params.authorizationSucc === 'function' ? params.authorizationSucc : () => {};
        LHAuthorizationUtils.SavePrivacyProtocolKey(onSucces);
      }
    });
  }

  /**
   * @ignore
   * @static
   * @function save
   * @description 打开授权弹窗
   */
  static SavePrivacyProtocolKey(success) {
    // LHMiServer.SetHostStorage(key, status);
    // if (typeof success === 'function') success();
    LHMiServer.BatchSetDeviceDatas([{ did: Device.deviceID, props: { [privacyProtocolCacheKey]: JSON.stringify({ privacyAuthed: true }) } }], () => {
      success();
    }, () => {
      // 失败了怎么处理？存失败就默认本次已授权
      success();
    });
  }
}
