/*
 * File: LHSensorSetIFTTTManager.js
 * Project: LHCommonFunction
 * File Created: Tuesday, 20th August 2019 11:39:18 am
 * Author: 廖子铭 (ziming.liao@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import { Device } from 'miot';
import {
  LHMiServer,
  CommonMethod,
  LHDialogUtils,
  LHToastUtils,
  LHUiUtils
} from 'LHCommonFunction';
import Constant from '../Constant/LHSensorSetIFTTTConstant';
import EUSetIFTTT from '../SensorSetIFTTTRequest/LHSensorSetIFTTTEURequest';
import UKSetIFTTT from '../SensorSetIFTTTRequest/LHSensorSetIFTTTUKRequest';
import LHCommonLocalizableString from '../../Config/Localized/LHCommonLocalizableString';


const SensorSetIFTTTKey = 'SensorSetIFTTTKey';
const SensorSetAlreadyBuildIFTTTKey = 'SensorSetAlreadyBuildIFTTTKey';

/**
 * 套装自动化管理类
 *
 * @export
 * @class LHSensorSetIFTTTManager
 */
export default class LHSensorSetIFTTTManager {
  /**
   * 构建套装自动化
   */
  static buildSensorSetIFTTT(onSuccess, onFail) {
    // 不在线设备不进行构建
    if (Device.isOnline === false) {
      console.log('设备不在线，不进行套装自动化的构建');
      if (typeof onFail === 'function') onFail(Constant.errorCode().OFFLine);
      return;
    }

    // 判断是否需要构建套装自动化
    if (Constant.getCurrentGatewaySensorSetIFTTTType() === Constant.IFTTTType.UnNecessary) {
      console.log('设备不属于套装，不进行套装自动化的构建');
      if (typeof onFail === 'function') onFail(Constant.errorCode().NotSupportSensorSetIFTTT);
      return;
    }

    // 先到缓存里获取是否进行过构建套装自动化
    this.getBuildSensorSetIFTTTCache((cacheResCode) => {
      // 如果缓存里已经标记进行过套装自动化的构建，直接返回
      if (cacheResCode === Constant.successCode().AlreadyBuild) {
        console.log('本地缓存已经标记未创建过套装自动化，不进行套装自动化的构建');
        if (typeof onSuccess === 'function') onSuccess(Constant.successCode().AlreadyBuild);
      } else {
        // 用户有可能会存在创建过程中退出、清理了缓存，或者重装了app，这些情况标记都会丢失
        // 所以如果缓存里发现没有创建过，还发送 RPC 到网关获取是否还需要构建（网关会告诉前端是否已经进行过构建）
        this.getCurrentGatewayIFTTTConfig((res) => {
          if (res === Constant.successCode().AlreadyBuild) {
            console.log('网关已经标记未创建过套装自动化，不进行套装自动化的构建');
            if (typeof onSuccess === 'function') onSuccess(Constant.successCode().AlreadyBuild);
          } else if (res === Constant.successCode().NeedBuild) {
            console.log('需要构建套装自动化');
            this.startBuildSensorSetIFTTT((resCode) => {
              LHDialogUtils.LoadingDialogHide();
              LHToastUtils.showShortToast(LHCommonLocalizableString.sensor_set_ifttt_config_success);
              if (typeof onSuccess === 'function') onSuccess(resCode);
            }, (errCode) => {
              this.showBuildFailToast();
              if (typeof onFail === 'function') onFail(errCode);
            });
          } else {
            this.showBuildFailToast();
            if (typeof onFail === 'function') onFail(Constant.errorCode().RPCError);
          }
        }, (err) => {
          this.showBuildFailToast();
          if (typeof onFail === 'function') onFail(err);
        });
      }
    });
  }

  /**
   *  获取当前网关的自动化配置
   */
  static getCurrentGatewayIFTTTConfig(onSuccess, onFail) {
    LHMiServer.SendRPCRequest('get_lumi_bind', ['scene'], {}, (res) => {
      if (res.result !== null && res.result.fac_scene_enable !== null) {
        // > 0 则需要配置，=0 则不需要配置
        if (res.result.fac_scene_enable > 0) {
          onSuccess(Constant.successCode().NeedBuild);
        } else if (res.result.fac_scene_enable === 0) {
          onSuccess(Constant.successCode().AlreadyBuild);
          // test 模拟需要创建
          // onSuccess(Constant.successCode().NeedBuild);
        } else {
          onFail(Constant.errorCode().RPCError);
        }
      } else {
        onFail(Constant.errorCode().RPCError);
      }
    }, () => {
      onFail(Constant.errorCode().RPCError);
    });
  }

  /**
   *  展示重试的dialog
   */
  static showRetryDialog(onSuccess, onFail) {
    LHDialogUtils.LoadingDialogHide();
    setTimeout(() => {
      LHDialogUtils.MessageDialogShow({
        title: LHCommonLocalizableString.sensor_set_ifttt_config_fail,
        message: LHCommonLocalizableString.sensor_set_ifttt_config_fail_tip,
        cancel: LHCommonLocalizableString.common_cancel,
        confirm: LHCommonLocalizableString.common_button_retry,
        confirmStyle: {
          color: LHUiUtils.MiJiaBlue
        },
        onConfirm: () => {
          // 弹窗没有消失就调loading会导致loading无法消失
          setTimeout(() => {
            this.startBuildSensorSetIFTTT(onSuccess, onFail);
          }, 300);
        }
      });
    }, 500);
  }

  /**
   *  展示配置设备的toast
   */
  static showBuildFailToast() {
    LHDialogUtils.LoadingDialogHide();
    LHToastUtils.showShortToast(LHCommonLocalizableString.sensor_set_ifttt_config_fail);
  }

  /**
   *  开始构建套装自动化
   */
  static startBuildSensorSetIFTTT(onSuccess, onFail) {
    LHDialogUtils.LoadingDialogShow({ title: LHCommonLocalizableString.common_automation_configuring });
    LHMiServer.GetSubDevices((devices) => {
      if (devices.length === 0) {
        onFail(Constant.errorCode().DeviceListEmpty);
      } else {
        this.buildCurrentGatewaySensorSetIFTTT(devices, (resCode) => {
          if (resCode === Constant.successCode().SuccessBuild) {
            onSuccess(Constant.successCode().SuccessBuild);
          } else {
            this.showRetryDialog(onSuccess, onFail);
          }
        });
      }
    }, () => {
      onFail(Constant.errorCode().RPCError);
    });
  }

  /**
   *  判断构建哪套自动化
   */
  static async buildCurrentGatewaySensorSetIFTTT(devicesList, callBack) {
    console.log('准备构建套装自动化列表');
    const iftttType = Constant.getCurrentGatewaySensorSetIFTTTType();
    // 创建完毕的回调
    const callBackfunc = (successList, failList) => {
      let rescode = Constant.successCode().SuccessBuild;
      if (successList.length === 0) {
        rescode = Constant.errorCode().BuildError; // 全部失败，允许用户重试
      } else if (failList.length > 0 && successList.length > 0) {
        rescode = Constant.errorCode().ApartBuild; // 部分成功，允许用户重试
      } else if (failList.length === 0) {
        rescode = Constant.successCode().SuccessBuild; // 没有失败，就代表成功，不通过成功的数量去判断
      }

      if (rescode === Constant.successCode().SuccessBuild) {
        // 如果成功创建就把缓存清理掉
        this.saveSuccessBuildIFTTTCache([]);
      } else {
        this.saveSuccessBuildIFTTTCache(successList);
      }
      if (successList.length > 0) {
        // 如果有成功创建的，就把本地缓存标记设置为已经创建
        this.saveAlreadyBuildSensorSetIFTTT();
      }
      callBack(rescode);
    };
    this.getAlreadyBuildIFTTTCache((alreadyBuildIFTTTList) => {
      console.log('已经创建了的自动化列表：' + alreadyBuildIFTTTList);
      if (iftttType === Constant.IFTTTType().EU) {
        EUSetIFTTT.buildSensorSetIFTTT(devicesList, alreadyBuildIFTTTList, callBackfunc);
      } else if (iftttType === Constant.IFTTTType().UK) {
        UKSetIFTTT.buildSensorSetIFTTT(devicesList, alreadyBuildIFTTTList, callBackfunc);
      }
    });
  }

  /**
   *  读取缓存里是否构建过套装自动化
   */
  static getBuildSensorSetIFTTTCache(onSuccess) {
    LHMiServer.GetHostStorage(CommonMethod.CreatCacheKey(SensorSetIFTTTKey)).then((res) => {
      if (!res) {
        // 如果缓存里没有获得数据，说明还没有进行过构建，或者构建过，用户清理过缓存
        onSuccess(Constant.successCode().NeedBuild);
      } else {
        // 如果缓存里有数据，说明已经进行过创建，就不再需要再走下面的流程了
        onSuccess(Constant.successCode().AlreadyBuild);
        // test 模拟需要创建
        // onSuccess(Constant.successCode().NeedBuild);
      }
    });
  }

  /**
   *  保存已经构建过套装自动化
   */
  static saveAlreadyBuildSensorSetIFTTT() {
    LHMiServer.SetHostStorage(CommonMethod.CreatCacheKey(SensorSetIFTTTKey), true);
  }

  /**
   *  获取已经构建成功的套装自动化
   */
  static getAlreadyBuildIFTTTCache(onSuccess) {
    LHMiServer.GetHostStorage(CommonMethod.CreatCacheKey(SensorSetAlreadyBuildIFTTTKey)).then((res) => {
      onSuccess(res);
    });
  }

  /**
   *  保存已经构建成功的套装自动化
   */
  static saveSuccessBuildIFTTTCache(successList) {
    LHMiServer.SetHostStorage(CommonMethod.CreatCacheKey(SensorSetAlreadyBuildIFTTTKey), successList);
  }
}