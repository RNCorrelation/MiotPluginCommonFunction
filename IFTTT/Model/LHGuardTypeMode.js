import LHCommonLocalizableString from '../../Config/Localized/LHCommonLocalizableString';

export default class LHGuardTypeMode {
  static getBaseGuardType() {
    return 0;
  }

  static getHomeGuardType() {
    return 1;
  }

  static getAwayGuardType() {
    return 2;
  }

  static getSleepGuardType() {
    return 3;
  }

  /**
   *  普通守护类型（告警触发）
   *  20 并没有意义，只是用来区别上面四种
   */
  static getNormalGuardType() {
    return 20;
  }

  /**
   *  门铃类型
   *  21 并没有意义
   */
  static getDoorbellType() {
    return 21;
  }

  /**
   *  关闭闹钟方式类型
   *  22 并没有意义
   */
  static getCloseAlarmClockType() {
    return 22;
  }

  /**
   *  关闭闹钟方式类型
   *  23 并没有意义
   */
  static getLinkageAlarmType() {
    return 23;
  }

  /**
   *  根据情景的 identify 获取守护类型
   */
  static getGuardTypeWithSceneIdentify(identify) {
    if (identify === 'lm_scene_base') {
      return this.getBaseGuardType();
    } else if (identify === 'lm_scene_home') {
      return this.getHomeGuardType();
    } else if (identify === 'lm_scene_away') {
      return this.getAwayGuardType();
    } else if (identify === 'lm_scene_sleep') {
      return this.getSleepGuardType();
    } else {
      return this.getBaseGuardType();
    }
  }

  static getGuardModelWithGuardType(guardType) {
    let guardModel = {};
    switch (guardType) {
      case this.getBaseGuardType():
        guardModel = this.buildGuardModel('lm_scene_base', '2135', LHCommonLocalizableString.guard_type_basic, LHCommonLocalizableString.mi_comboHub_mainPage_guard_base);
        break;
      case this.getHomeGuardType():
        guardModel = this.buildGuardModel('lm_scene_home', '2132', LHCommonLocalizableString.guard_type_home, LHCommonLocalizableString.mi_comboHub_mainPage_guard_home);
        break;
      case this.getAwayGuardType():
        guardModel = this.buildGuardModel('lm_scene_away', '2133', LHCommonLocalizableString.guard_type_away, LHCommonLocalizableString.mi_comboHub_mainPage_guard_away);
        break;
      case this.getSleepGuardType():
        guardModel = this.buildGuardModel('lm_scene_sleep', '2134', LHCommonLocalizableString.guard_type_sleep, LHCommonLocalizableString.mi_comboHub_mainPage_guard_sleep);
        break;
      case this.getNormalGuardType():
        guardModel = this.buildGuardModel('lm_scene_alarm');
        break;
      case this.getDoorbellType():
        guardModel = this.buildGuardModel('lm_scene_doorbell');
        break;
      case this.getCloseAlarmClockType():
        guardModel = this.buildGuardModel('lm_scene_closeAlarmClock');
        break;
      case this.getLinkageAlarmType():
        guardModel = this.buildGuardModel('lm_scene_linkageAlarm');
        break;
      default:
        break;
    }
    return guardModel;
  }

  static buildGuardModel(identify, scId = '', guardName = '', guardShortName = '') {
    return {
      sc_id: scId,
      identify,
      guardName,
      guardShortName
    };
  }
}
