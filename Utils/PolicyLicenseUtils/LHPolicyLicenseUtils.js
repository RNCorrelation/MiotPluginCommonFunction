/*
 * @Date: 2019-08-05 18:29:04
 * @LastEditors: Lavie
 * @LastEditTime: 2019-10-10 11:43:35
 */
import {
  Service, Device
} from 'miot';
import {
  LHCommonLocalizableString
} from 'LHCommonFunction';


/**
 * 子设备：国内Aqara网关(aqhm01),弹的隐私和父设备的一样 摄像头 空调伴侣的子设备不弹隐私
 * 海外: Aqara网关的子设备弹的隐私和父设备一样，(后续添加)烟感在香港有一份特殊的隐私，弹自己的
 * (后续添加) 4个米家的网关需要特殊处理
 * 米家App 服务器Code
 *
 * 如果要适配的国家在LanguageArray没有，需要往里面添加，格式是：国家缩写：语言缩写
 */
const LanguageArray = {
  cn: 'zh', // 中国
  pl: 'pl', // 波兰
  gr: 'el', // 希腊
  de: 'de', // 德国
  pt: 'pt', // 葡萄牙
  ru: 'ru', // 俄罗斯
  id: 'id', // 印度尼西亚
  vn: 'vi', // 越南
  th: 'th', // 泰国
  ua: 'uk', // 乌克兰
  by: 'be', // 白俄罗斯
  ae: 'ar', // 阿拉伯联合酋长国
  eg: 'ar', // 埃及
  il: 'he', // 以色列
  tr: 'tr', // 土耳其
  ma: 'ar', // 摩洛哥
  es: 'es', // 西班牙
  tw: 'tw', // 台湾
  hk: 'hk', // 香港
  it: 'it', // 意大利
  fr: 'fr', // 法国
  sg: 'sg', // 新加波 为了区别en，改成sg
  us: 'en', // 美国
  kr: 'ko', // 韩国
  nl: 'nl', // 荷兰
  cz: 'cz', // 捷克
  ro: 'ro', // 罗马尼亚
  sk: 'sk', // 斯洛伐克
  at: 'de', // 奥地利
  br: 'pt_br', // 巴西
  cl: 'es_la', // 智利
  pe: 'es_la', // 秘鲁
  iq: 'ar', // 伊拉克
  om: 'ar', // 阿曼
  qa: 'ar', // 卡塔尔
  sa: 'ar', // 沙特阿拉伯
  za: 'sg', // 南非 新加坡服务器，同新加波的英语
  nz: 'sg', // 新西兰 新加坡服务器，同新加波的英语
  au: 'sg', // 澳大利亚 新加坡服务器，同新加波的英语
  ph: 'sg', // 菲律宾 新加坡服务器，同新加波的英语
  my: 'ms', // 马拉西亚
  be: 'de', // 比利时 对应了 nl fr de 需要特殊判断
  ch: 'de', // 瑞士 对应了 de fr it 需要特殊判断
  bh: 'ar', // 巴林
  kw: 'ar', // 科威特
  lu: 'fr' // 卢森堡
};
/**
 * 中国大陆：CN 新加坡：SG 印度：in 俄罗斯：RU 美国：us (欧洲)德国: de 韩国：kr
 */
const SeverEn = {
  cn: 'en',
  sg: 'us_en',
  ru: 'us_en',
  us: 'us_en',
  de: 'eu_en',
  kr: 'us_en'
};

/**
 * mieu01 的服务器特殊判断
 */
const MieuServer = {
  de: 'eu_en',
  us: 'us_en',
  sg: 'us_en',
  ru: 'eu_en'
};

/**
 * 空调伴侣和摄像头都不需要弹隐私 LHDeviceModel可以找到对应的model值
 */
const NoShowModel = [
  'lumi.acpartner.v1',
  'lumi.acpartner.v2',
  'lumi.acpartner.v3',
  'lumi.camera.aq1',
  'lumi.camera.gwagl01',
  'lumi.gateway.v2',
  'lumi.gateway.v3'
];

const BeCodeArray = ['nl', 'fr', 'de']; // 比利时
const ChCodeArray = ['de', 'fr', 'it']; // 瑞士
const LuCodeArray = ['de', 'fr']; // 卢森堡
const MijiaHkGateway = 'lumi.gateway.mihk01';
const MijiaTwHk = ['lumi.gateway.mitw01', 'lumi.gateway.mihk01'];
const Aqara3Switch = ['lumi.switch.l3acn3', 'lumi.switch.n3acn3'];// 三键开关
const MijiaEuModel = 'lumi.gateway.mieu01'; // 米家欧标套装
const MijiaUkModel = 'lumi.gateway.lmuk01'; // 米家英标套装
const MijiaEuPrefix = 'mieu01_';
const MijiaUkPrefix = 'lmuk01_';
const MijiaHkSmoke = 'lumi.sensor_smoke.v1'; // 这款烟感在米家香港网关弹自己的隐私
const PlugEuModel = 'lumi.plug.mmeu01';
export default class LHPolicyLicenseUtils {
  /**
   * 子设备不需要弹隐私协议的摄像头和空调伴侣model值
   */
   static NotShowPolicy = (model) => {
     return NoShowModel.indexOf(model) > -1;
   }

   /**
    * 判断是不是mieu01或者其子设备
    */
   static checkMieu01 = () => {
     return Device.model === MijiaEuModel || (Device.parentDevice && Device.parentDevice.model === MijiaEuModel);
   }

   /**
    * 判断是不是lmuk01或者其子设备
    */
   static checkLmuk01 = () => {
     return Device.model === MijiaUkModel || (Device.parentDevice && Device.parentDevice.model === MijiaUkModel);
   }

   /**
    * 判断是不是mitw或者mihk其子设备
    */
   static checkMitw01 = () => {
     return MijiaTwHk.indexOf(Device.model) > -1 || (Device.parentDevice && MijiaTwHk.indexOf(Device.parentDevice.model) > -1);
   }

   /**
    * @author: Lavie
    * @description: 判断香港烟感
    * @param {type}
    * @return:
    */
   static checkHkSmoke = () => {
     return Device.model === MijiaHkSmoke && (Device.parentDevice && Device.parentDevice.model === MijiaHkGateway);
   }

   /**
    * @author: Lavie
    * @description: 判断是不是三键开关
    * @param {type}
    * @return:
    */
   static checkSwitch = () => {
     return Aqara3Switch.indexOf(Device.model) > -1;
   }

   /**
    * @author: Lavie
    * @description: 截取model的尾部
    * @param {type}
    * @return:
    */
   static getSwitchModelSuffix = () => {
     const { model } = Device;
     if (!model || model.indexOf('.') === -1 || model.split('.').length < 2) return '';
     return model.split('.')[2] ? model.split('.')[2] : '';
   }

   /**
    * @description: 欧标插座弹自己的隐私，需要特殊判断，后续其他的子设备也会逐步弹自己的隐私
    * @param {type}
    * @return:
    */
   static checkEuPlug = () => {
     return Device.model === PlugEuModel;
   }

  /**
   * 根据服务器和国家，获取到对应的语言
   * @param diffEn 是否区分英文，默认false不区分
   */
  static GetCountryLanguageCode = (onSuccess) => {
    Service.getServerName().then((res) => {
      const { serverCode } = res;
      const { countryCode } = res;
      const mServerCode = serverCode.toLowerCase();
      const mCountryCode = countryCode.toLowerCase();
      if (LHPolicyLicenseUtils.checkSwitch()) {
        LHPolicyLicenseUtils.checkSwitchModel(mServerCode, mCountryCode, onSuccess);
        return;
      }
      if (!LHPolicyLicenseUtils.checkEuPlug()) { // 欧标插座弹自己的隐私
        if (LHPolicyLicenseUtils.checkMieu01()) {
          LHPolicyLicenseUtils.checkMieuModel(mServerCode, mCountryCode, onSuccess);
          return;
        }
        if (LHPolicyLicenseUtils.checkLmuk01()) {
          LHPolicyLicenseUtils.checkLmukModel(mServerCode, mCountryCode, onSuccess);
          return;
        }
        if (LHPolicyLicenseUtils.checkMitw01() && !LHPolicyLicenseUtils.checkHkSmoke()) {
          LHPolicyLicenseUtils.checkTwHkModel(mServerCode, mCountryCode, onSuccess);
          return;
        }
      }
      // console.warn('LHPolicyLicenseUtils checkCountry', res, mServerCode, mCountryCode);
      if (mServerCode === 'us' && mCountryCode === 'us') {
        onSuccess('us_en', mServerCode);
        return;
      }
      if (mServerCode === 'de' && mCountryCode === 'gb') {
        onSuccess('eu_en', mServerCode);
        return;
      }
      if (LHCommonLocalizableString.getInterfaceLanguage() === 'en') {
        if (mCountryCode === 'kr') {
          onSuccess('ko_en', mServerCode);
          return;
        }
        onSuccess(SeverEn[mServerCode] || 'en', mServerCode);
        return;
      }
      // console.log('PolicyUtils checkCountry LHCommonLocalizableString', res, LHCommonLocalizableString.getInterfaceLanguage(), LanguageArray[mCountryCode], mCountryCode);
      onSuccess(LanguageArray[mCountryCode] || 'en', mServerCode);
    });
  }

  static checkSwitchModel = (serverCode, countryCode, onSuccess) => {
    const switchPrefix = LHPolicyLicenseUtils.getSwitchModelSuffix();
    if (serverCode === 'us' && countryCode === 'us') {
      onSuccess(switchPrefix + '_en', serverCode);
      return;
    }
    if (serverCode === 'de' && countryCode === 'gb') {
      onSuccess(switchPrefix + '_en', serverCode);
      return;
    }
    if (LHCommonLocalizableString.getInterfaceLanguage() === 'en') {
      onSuccess(switchPrefix + '_en', serverCode);
      return;
    }
    // console.log('PolicyUtils checkCountry LHCommonLocalizableString', res, LHCommonLocalizableString.getInterfaceLanguage(), LanguageArray[mCountryCode], mCountryCode);
    onSuccess(switchPrefix + '_' + LanguageArray[countryCode] || switchPrefix + '_en', serverCode);
  }

  /**
   * @author: Lavie
   * @description: 判断米家欧洲套装
   * @param {type}
   * @return:
   */
  static checkMieuModel = (serverCode, countryCode, onSuccess) => {
    if (serverCode === 'us' && countryCode === 'us') {
      onSuccess(MijiaEuPrefix + 'us_en', serverCode);
      return;
    }
    if (serverCode === 'de' && countryCode === 'gb') {
      onSuccess(MijiaEuPrefix + 'eu_en', serverCode);
      return;
    }
    if (LHCommonLocalizableString.getInterfaceLanguage() === 'en') {
      onSuccess(MijiaEuPrefix + MieuServer[serverCode] || MijiaEuPrefix + 'en', serverCode);
      return;
    }
    if (countryCode === 'be') {
      if (BeCodeArray.indexOf(LHCommonLocalizableString.getInterfaceLanguage()) > -1) {
        onSuccess(MijiaEuPrefix + LHCommonLocalizableString.getInterfaceLanguage() || MijiaEuPrefix + 'en', serverCode);
      } else {
        onSuccess(MijiaEuPrefix + 'nl', serverCode);
      }
      return;
    }
    if (countryCode === 'ch') {
      if (ChCodeArray.indexOf(LHCommonLocalizableString.getInterfaceLanguage()) > -1) {
        onSuccess(MijiaEuPrefix + LHCommonLocalizableString.getInterfaceLanguage() || MijiaEuPrefix + 'en', serverCode);
      } else {
        onSuccess(MijiaEuPrefix + 'de', serverCode);
      }
      return;
    }
    if (countryCode === 'lu') {
      if (LuCodeArray.indexOf(LHCommonLocalizableString.getInterfaceLanguage()) > -1) {
        onSuccess(MijiaEuPrefix + LHCommonLocalizableString.getInterfaceLanguage() || MijiaEuPrefix + 'en', serverCode);
      } else {
        onSuccess(MijiaEuPrefix + 'fr', serverCode);
      }
      return;
    }
    onSuccess(MijiaEuPrefix + LanguageArray[countryCode] || MijiaEuPrefix + 'en', serverCode);
  }

  /**
   * @author: Lavie
   * @description: 判断米家英标套装
   * @param {type}
   * @return:
   */
  static checkLmukModel = (serverCode, countryCode, onSuccess) => {
    if (serverCode === 'us' && countryCode === 'us') {
      onSuccess(MijiaUkPrefix + 'en', serverCode);
      return;
    }
    if (serverCode === 'de' && countryCode === 'gb') {
      onSuccess(MijiaUkPrefix + 'eu_en', serverCode);
      return;
    }
    // 新加坡和马来西亚不管什么语言都弹英语
    if (serverCode === 'sg' && (countryCode === 'sg' || countryCode === 'my')) {
      onSuccess(MijiaUkPrefix + 'en', serverCode);
      return;
    }
    if (LHCommonLocalizableString.getInterfaceLanguage() === 'en') {
      onSuccess(MijiaUkPrefix + 'en', serverCode);
      return;
    }
    onSuccess(MijiaUkPrefix + LanguageArray[countryCode] || MijiaUkPrefix + 'en', serverCode);
  }

  /**
   * @author: Lavie
   * @description: 判断米家香港台湾套装
   * @param {type}
   * @return:
   */
  static checkTwHkModel = (serverCode, countryCode, onSuccess) => {
    if (serverCode === 'us' && countryCode === 'us') {
      onSuccess('mi_hk_tw_en', serverCode);
      return;
    }
    if (serverCode === 'de' && countryCode === 'gb') {
      onSuccess('mi_hk_tw_en', serverCode);
      return;
    }
    if (LHCommonLocalizableString.getInterfaceLanguage() === 'en') {
      onSuccess('mi_hk_tw_en', serverCode);
      return;
    }
    onSuccess(('mi_' + LanguageArray[countryCode] || 'mi_hk_tw_en'), serverCode);
  }

  /**
   * @static
   * @function GexPolicyLicenseUrl
   * @description 获取隐私政策和用户协议链接
   * @param {Object} urls 所有隐私政策和用户协议对象
   */
  static GexPolicyLicenseUrl(urls, languageCode) {
    const defaultEn = LHPolicyLicenseUtils.GetDefaultEn(urls);
    return {
      licenseUrl: urls['licenseUrl_' + languageCode] || defaultEn.dafaultLicenseUrl,
      policyUrl: urls['policyUrl_' + languageCode] || defaultEn.defaultPolicyUrl
    };
  }

  /**
   * @author: Lavie
   * @description:
   * @param {type}
   * @return:
   */
  static GetDefaultEn = (urls) => {
    if (LHPolicyLicenseUtils.checkSwitch()) {
      const switchPrefix = LHPolicyLicenseUtils.getSwitchModelSuffix();
      return {
        dafaultLicenseUrl: urls['licenseUrl_' + switchPrefix + '_en'],
        defaultPolicyUrl: urls['policyUrl_' + switchPrefix + '_en']
      };
    }
    if (!LHPolicyLicenseUtils.checkEuPlug()) { // 欧标插座弹自己的隐私
      if (LHPolicyLicenseUtils.checkMieu01()) {
        return {
          dafaultLicenseUrl: urls.licenseUrl_mieu01_en,
          defaultPolicyUrl: urls.policyUrl_mieu01_en
        };
      }
      if (LHPolicyLicenseUtils.checkLmuk01()) {
        return {
          dafaultLicenseUrl: urls.licenseUrl_lmuk01_en,
          defaultPolicyUrl: urls.policyUrl_lmuk01_en
        };
      }
      if (LHPolicyLicenseUtils.checkMitw01()) {
        return {
          dafaultLicenseUrl: urls.licenseUrl_mi_hk_tw_en,
          defaultPolicyUrl: urls.policyUrl_mi_hk_tw_en
        };
      }
    }
    return {
      dafaultLicenseUrl: urls.licenseUrl_en,
      defaultPolicyUrl: urls.policyUrl_en
    };
  }
}
