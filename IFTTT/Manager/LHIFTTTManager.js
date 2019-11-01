import { Service, Device } from 'miot';
import LHMiServer from '../../MiServer/LHMiServer';
import LHAlarmIFTTTAdapter from './LHAlarmIFTTTAdapter';
import LHGuardTypeMode from '../Model/LHGuardTypeMode';
import LHDeviceTriggleModel from '../Model/LHDeivceTriggleModel';
import LHDeviceActionModel from '../Model/LHDeviceActionModel';
import LHDeviceModel from '../Constant/LHDeviceModel';

const MiJiaIFTTTTypeIFThen = 15;
const AlarmIFTTTTypeIFThen = 22;
const AlarmIFTTTTypeWhenIFThen = 53;

export default class LHIFTTTManager {
  /**
   * 获取 “触发设备” 页面列表数据
   * @param {*} did 网关did
   */
  static fetchAlarmTriggleDeviceList(did, onSuccess, onFail) {
    this.fetchSubDeviceListAndSceneData(did, AlarmIFTTTTypeWhenIFThen, (res) => {
      if (typeof onSuccess === 'function') onSuccess(this.adaptAlarmTriggleDeviceData(res[0], res[1]));
    }, (err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   *  获取 Linux 网关自动化设备列表数据
   *
   * @static
   * @param {*} did
   * @param {*} type
   * @param {*} onSuccess
   * @param {*} onFail
   * @memberof LHIFTTTManager
   */
  static getLinuxGatewayIFTTTDeviceList(did, type, onSuccess, onFail) {
    this.fetchSubDeviceListAndSceneData(did, AlarmIFTTTTypeIFThen, (res) => {
      if (typeof onSuccess === 'function') onSuccess(this.adaptLinuxGatewayIFTTTDeviceData(res[0], res[1], type));
    }, (err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   *  判断 linux 网关是否可以控制告警
   */
  static isLinuxGatewayCanControlAlarm(did, onSuccess, onFail) {
    this.fetchSubDeviceListAndSceneData(did, AlarmIFTTTTypeIFThen, (res) => {
      const canControl = this.matchAlarmTriggleDeviceData(res[0], res[1], LHGuardTypeMode.getNormalGuardType());
      const dataList = this.adaptLinuxGatewayIFTTTDeviceData(res[0], res[1], LHGuardTypeMode.getNormalGuardType());
      if (typeof onSuccess === 'function') onSuccess(canControl, dataList);
    }, (err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   * 获取自动化和子设备的数据
   */
  static fetchSubDeviceListAndSceneData(did, type, onSuccess, onFail) {
    Promise.all([new Promise((resolve, reject) => {
      return LHMiServer.LoadSceneList(did, type, [], (scenesList) => {
        // LHDebugConfig.consoleSceneArray(scenesList);
        resolve(scenesList);
      }, (err) => {
        reject(err);
      });
    }), new Promise((resolve, reject) => {
      return LHMiServer.GetSubDevices((subDevices) => {
        resolve(subDevices);
      }).catch((err) => {
        reject(err);
      });
    })
    ]).then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  static getMultiModeHubReadyToDeleteSceneIDList(type, triggleDeviceId, onSuccess, onFail) {
    this.getReadyToDeleteSceneIDList(type, triggleDeviceId, onSuccess, onFail, AlarmIFTTTTypeWhenIFThen);
  }

  /**
   *   获取准备要删除的情景列表id
   */
  static getReadyToDeleteSceneIDList(type, triggleDeviceId, onSuccess, onFail, iftttType = AlarmIFTTTTypeIFThen) {
    LHMiServer.LoadSceneList(Device.deviceID, iftttType, [], (scenesList) => {
      const deviceSceneList = [];
      scenesList.forEach((scene) => {
        if (LHAlarmIFTTTAdapter.isSceneNeedToShow(scene.identify, type)) {
          const triggleDevice = this.getTriggleDeviceWithScene(scene);
          // 数据错误，匹配上的都需要删除
          if (triggleDevice === null || triggleDevice.did === triggleDeviceId) {
            deviceSceneList.push(scene.sceneID + '');
          }
        }
      });
      if (typeof onSuccess === 'function') onSuccess(deviceSceneList);
    }, (err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   * 米家多模网关专用数据源构建方法
   * 适配告警触发设备的数据（10 月 8 号改版）
   * 改版后的数据格式需要分为四个列表，如下
   * [
   * [ [ 可控制 ], [ 不可控制 ] ] 基础
   * [ [ 可控制 ], [ 不可控制 ] ] 在家
   * [ [ 可控制 ], [ 不可控制 ] ] 离家
   * [ [ 可控制 ], [ 不可控制 ] ] 睡眠
   * ]
   * 就算没有数据，也需要放入一个空数组
   */
  static adaptAlarmTriggleDeviceData(sceneList = [], subDevices = []) {
    const data = []; // 总数据
    let canControlDatas = []; // 可以控制的数据
    let cantControlDatas = []; // 不能控制的数据
    // 尝试删除数据本地自动化失败的自动化（有可能删除不成功，但是也当作不存在）
    const newSceneList = this.deleteSceneWhichStatusNotCorrect(sceneList);
    // 做 4 次循环。分别构建四个数组
    for (let index = 0; index < 4; index += 1) {
      canControlDatas = []; // 每次循环前，重置可控制列表
      cantControlDatas = []; // 每次循环前，重置不可控制列表
      const guardType = index; // 守护模式，对应 0，1，2，3
      // 以子设备为基准，子设备不存在的话，就算存在这个子设备的自动化，也不显示（例如创建自动化后，删除了子设备）
      for (let i = 0, deviceLen = subDevices.length; i < deviceLen; i += 1) {
        const subDevice = subDevices[i];
        // 判断子设备是否支持当前的守护模式，不支持的设备当然就不用管了
        if (LHAlarmIFTTTAdapter.isSupportIFTTT(subDevice.model, guardType)) {
          let isCanControl = true;
          let isAdded = false;
          const cantControlAddedGuardTypeList = []; // 比较不能控制的设备被添加到哪些守护
          for (let j = 0, sceneLen = newSceneList.length; j < sceneLen; j += 1) {
            const scene = newSceneList[j];
            const triggleDevice = this.getTriggleDeviceWithScene(scene); // 取出情景的触发设备
            if (triggleDevice !== null && triggleDevice.did === subDevice.deviceID) {
              // 如果当前的情景是当前守护的，将加入“可以操作队列”
              if (scene.identify === LHGuardTypeMode.getGuardModelWithGuardType(guardType).identify) {
                isCanControl = true;
                isAdded = true; // 标记为已经添加了（switch 打开）
                break;
              }
              // 如果当前情景是“基础守护”,并且当前守护不是“基础守护”，将加入“不能操作队列”
              if (scene.identify === LHGuardTypeMode.getGuardModelWithGuardType(LHGuardTypeMode.getBaseGuardType()).identify
              && guardType !== LHGuardTypeMode.getBaseGuardType()) {
                isCanControl = false;
                cantControlAddedGuardTypeList.push(LHGuardTypeMode.getGuardTypeWithSceneIdentify(scene.identify));
                break;
              }
              // 如果当前情景不是“基础守护”,并且当前守护是基础守护，将加入“不能操作队列”
              if (scene.identify !== LHGuardTypeMode.getGuardModelWithGuardType(LHGuardTypeMode.getBaseGuardType()).identify
              && guardType === LHGuardTypeMode.getBaseGuardType()) {
                isCanControl = false;
                cantControlAddedGuardTypeList.push(LHGuardTypeMode.getGuardTypeWithSceneIdentify(scene.identify));
              }
            }
          }
          // 获取用作显示的 model
          if (isCanControl) {
            const model = LHAlarmIFTTTAdapter.getAlarmTriggleDeviceModel(subDevice);
            model.isAdded = isAdded;
            canControlDatas.push(model);
          } else {
            const model = LHAlarmIFTTTAdapter.getAlarmTriggleDeviceCantControlModel(subDevice, cantControlAddedGuardTypeList, guardType);
            cantControlDatas.push(model);
          }
        } else if ((subDevice.model === LHDeviceModel.DeviceModelSensorNatgasV1() // 天然气报警器
          || subDevice.model === LHDeviceModel.DeviceModelSensorSmokeV1() // 烟雾报警器
        )
          && guardType !== LHGuardTypeMode.getBaseGuardType()) { // 不是“基础守护”
          const model = LHAlarmIFTTTAdapter.getAlarmTriggleDeviceCantControlModel(subDevice, [], guardType);
          cantControlDatas.push(model);
        }
      }
      data.push([canControlDatas, cantControlDatas]);
    }
    return data;
  }

  /**
   *  适配 1.2 linux 网关自动化数据
   */
  static adaptLinuxGatewayIFTTTDeviceData(sceneList = [], subDevices = [], type) {
    // LHDebugConfig.consoleSceneArray(sceneList);
    // this.deleteAllScenes(sceneList);
    // return [];
    const newSceneList = this.deleteSceneWhichStatusNotCorrect(sceneList);
    const datas = [];
    for (let j = 0, deviceLen = subDevices.length; j < deviceLen; j += 1) {
      const subDevice = subDevices[j];
      if (LHAlarmIFTTTAdapter.isSupportIFTTT(subDevice.model, type)) {
        const newSubDeviceModel = LHAlarmIFTTTAdapter.getLinuxGatewayAlarmIFTTTModel(subDevice);
        for (let i = 0, sceneLen = newSceneList.length; i < sceneLen; i += 1) {
          const scene = newSceneList[i];
          const triggleDevice = this.getTriggleDeviceWithScene(scene);
          if (triggleDevice !== null && LHAlarmIFTTTAdapter.isSceneNeedToShow(scene.identify, type)) {
            if (triggleDevice.did === subDevice.deviceID) {
              newSubDeviceModel.isAddedInLinuxGateway = true;
              newSubDeviceModel.sceneID = scene.sceneID;
              datas.push(newSubDeviceModel); // 添加已经被添加的设备（isAddedInLinuxGateway = true）
              break;
            }
          }
        }
        if (newSubDeviceModel.isAddedInLinuxGateway === false) {
          datas.push(newSubDeviceModel); // 添加未被添加的设备（isAddedInLinuxGateway = false)
        }
      }
    }
    return datas;
  }

  /**
   *  判断 linux 网关是否可以进入守护设置页面
   */
  static isLinuxGatewayCanGotoGuardSettingPage(onSuccess, onFail) {
    LHMiServer.GetSubDevices((subDevices) => {
      let isCanGo = false;
      for (let j = 0, deviceLen = subDevices.length; j < deviceLen; j += 1) {
        const subDevice = subDevices[j];
        if (LHAlarmIFTTTAdapter.isSupportIFTTT(subDevice.model, LHGuardTypeMode.getNormalGuardType())) {
          isCanGo = true;
          break;
        }
      }
      if (typeof onSuccess === 'function') onSuccess(isCanGo);
    }, (err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   * 匹配出是否还有告警触发设备
   */
  static matchAlarmTriggleDeviceData(sceneList = [], subDevices = [], guardType) {
    let match = false;
    for (let i = 0, sceneLen = sceneList.length; i < sceneLen; i += 1) {
      if (match) {
        break;
      }
      const scene = sceneList[i];
      const triggleDevice = this.getTriggleDeviceWithScene(scene);
      if (triggleDevice !== null && LHAlarmIFTTTAdapter.isSceneNeedToShow(scene.identify, guardType)) { // 需要跟当前的守护模式对应，才会进行显示
        for (let j = 0, deviceLen = subDevices.length; j < deviceLen; j += 1) {
          const subDevice = subDevices[j];
          if (triggleDevice.did === subDevice.deviceID) {
            match = true;
            break;
          }
        }
      }
    }
    return match;
  }

  /**
   *  根据情景获取到里面triggle的设备
   */
  static getTriggleDeviceWithScene(scene) {
    // LHDebugConfig.consoleScene(scene);
    if (scene === null || scene === undefined) {
      return null;
    }
    let triggleList;
    if (scene.setting.trigger) { // 如果有 trigger ，则取 trigger 里面的触发设备
      triggleList = scene.setting.trigger;
    } else {
      triggleList = scene.setting.launch.attr;
    }
    // 保证有数据
    if (triggleList === null || triggleList === undefined || triggleList.length === 0) {
      return null;
    }
    let triggleDevice = null;
    for (let i = 0, triggleLen = triggleList.length; i < triggleLen; i += 1) {
      const triggle = triggleList[i];
      if (triggle.did !== Device.deviceID) { // 如果与当前网关的 did 不一样，就说明是触发设备
        triggleDevice = triggle;
        break;
      }
    }
    return triggleDevice;
  }

  static isAlarmTriggleDeviceCanBeDeletedWithModel(model) {
    if (model === undefined || model === null || model === '') {
      return true;
    }
    if (model === LHDeviceModel.DeviceModelSensorNatgasV1()
    || model === LHDeviceModel.DeviceModelSensorSmokeV1()) {
      return false;
    }
    return true;
  }

  /**
   *
   * 保存需要添加设备的自动化
   * @static
   * @param {*} did 网关 did
   * @param {*} device 准备添加的设备
   * @param {*} alarmType 告警类型（对应的是identify字段）
   * @memberof LHIFTTTManager
   */
  static saveSceneRecord(did, device, alarmType, onSuccess, onFail) {
    let params = null;
    if (alarmType === LHGuardTypeMode.getBaseGuardType()
    || alarmType === LHGuardTypeMode.getHomeGuardType()
    || alarmType === LHGuardTypeMode.getAwayGuardType()
    || alarmType === LHGuardTypeMode.getSleepGuardType()) {
      params = this.getWhenIfThenIFTTTParams(device, alarmType);
    } else if (alarmType === LHGuardTypeMode.getNormalGuardType()) {
      params = this.getAlarmTriggleIFTTTParams(device, alarmType);
    } else if (alarmType === LHGuardTypeMode.getDoorbellType()) {
      params = this.getDoorBellIFTTTParams(device, alarmType);
    } else if (alarmType === LHGuardTypeMode.getCloseAlarmClockType()) {
      params = this.getCloseClockIFTTTParams(device, alarmType);
    }

    if (params === null) {
      if (typeof onFail === 'function') onFail();
      return;
    }
    this.editSceneRecord(params, onSuccess, onFail);
  }

  /**
   *  创建米家智能模块的自动化
   */
  static saveMijiaSmartSceneRecord(triggerList, actionList, authedList, name, enable, onSuccess, onFail) {
    const params = {
      us_id: 0,
      model: Device.model,
      did: Device.deviceID,
      st_id: MiJiaIFTTTTypeIFThen,
      identify: '',
      name,
      authed: authedList,
      setting: {
        enable,
        enable_push: 0,
        launch: {
          attr: triggerList,
          express: 1
        },
        action_list: actionList
      }
    };
    this.editSceneRecord(params, onSuccess, onFail);
  }

  static editSceneRecord(params, onSuccess, onFail) {
    console.log('准备要保存的自动化参数：');
    console.log(JSON.stringify(params));
    Service.scene.editSceneRecord(params).then((res) => {
      console.log('自动化保存成功');
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      console.log('自动化保存失败：' + err.message);
      if (typeof onFail === 'function') onFail(err);
    });
  }

  static getWhenIfThenIFTTTParams(device, alarmType) {
    // when
    const whenList = device.triggleModel.triggle;
    const triggerModel = LHDeviceTriggleModel.getGatewayAlarmTriggleModelWithAlarmType(alarmType);
    // if
    const triggerList = Array.isArray(triggerModel) ? triggerModel : [triggerModel];
    // then
    const actionList = LHDeviceActionModel.getGatewayAlarmActionListWithAlarmType(alarmType);
    // authed
    const authedList = [Device.deviceID, device.did];
    // 推送的文案，日志的文案
    const pushString = LHAlarmIFTTTAdapter.getIFTTTPushString(device.model, device.title, alarmType);

    return {
      us_id: 0,
      model: Device.model,
      did: Device.deviceID,
      st_id: AlarmIFTTTTypeWhenIFThen,
      identify: LHGuardTypeMode.getGuardModelWithGuardType(alarmType).identify,
      name: pushString,
      authed: authedList,
      setting: {
        enable: 1,
        enable_push: 1,
        launch: {
          attr: triggerList,
          express: 1 // 1 为 or
        },
        action_list: actionList,
        trigger: whenList
      }
    };
  }

  /**
   *  获取告警触发设备的自动化参数
   */
  static getAlarmTriggleIFTTTParams(device, alarmType) {
    const triggerList = [];
    triggerList.push(device.triggleModel.triggle);
    triggerList.push(LHDeviceTriggleModel.getGatewayAlarmTriggleModelWithAlarmType(alarmType));
    const authedList = [Device.deviceID, device.did];

    return {
      us_id: 0,
      model: Device.model,
      did: Device.deviceID,
      st_id: AlarmIFTTTTypeIFThen,
      identify: LHGuardTypeMode.getGuardModelWithGuardType(alarmType).identify,
      name: LHAlarmIFTTTAdapter.getNormalGatewayAlarmIFTTTName(device),
      authed: authedList,
      setting: {
        enable: 1,
        enable_push: 0,
        launch: {
          attr: triggerList,
          express: 0 // 0 为 and
        },
        action_list: LHDeviceActionModel.getGatewayAlarmActionListWithAlarmType(alarmType)
      }
    };
  }

  /**
   *  获取门铃自动化的参数
   */
  static getDoorBellIFTTTParams(device, alarmType) {
    const triggerList = [];
    triggerList.push(device.triggleModel.triggle);
    const authedList = [Device.deviceID, device.did];

    return {
      us_id: 0,
      model: Device.model,
      did: Device.deviceID,
      st_id: AlarmIFTTTTypeIFThen,
      identify: LHGuardTypeMode.getGuardModelWithGuardType(alarmType).identify,
      name: LHAlarmIFTTTAdapter.getNormalGatewayDoorBellIFTTTName(device),
      authed: authedList,
      setting: {
        enable: 1,
        enable_push: 0,
        launch: {
          attr: triggerList,
          express: 0
        },
        action_list: LHDeviceActionModel.getDoorbellAction()
      }
    };
  }

  static getCloseClockIFTTTParams(device, alarmType) {
    const triggerList = [];
    triggerList.push(device.triggleModel.triggle);
    const authedList = [Device.deviceID, device.did];
    return {
      us_id: 0,
      model: Device.model,
      did: Device.deviceID,
      st_id: AlarmIFTTTTypeIFThen,
      identify: LHGuardTypeMode.getGuardModelWithGuardType(alarmType).identify,
      name: LHAlarmIFTTTAdapter.getNormalGatewayClockIFTTTName(device),
      authed: authedList,
      setting: {
        enable: 1,
        enable_push: 0,
        launch: {
          attr: triggerList,
          express: 0
        },
        action_list: LHDeviceActionModel.getCloseClockAction()
      }
    };
  }

  /**
   * 获取联动网关报警自动化参数
   * @param {1:烟感 2:气感 3:水浸} type
   */
  static getLinkageAlarmIFTTTParams(type) {
    if (type !== 1 && type !== 2 && type !== 3) return null;
    const identify = 'lm_scene_5_' + String(type);
    const authedList = [Device.deviceID, Device.parentDevice.deviceID];
    const action = LHDeviceActionModel.getLinkageAlarmAction(Device.parentDevice);
    let triggle;
    if (type === 1) {
      triggle = LHDeviceTriggleModel.getSensorSmokeTriggleModel(Device, '火警报警');
    } else if (type === 2) {
      triggle = LHDeviceTriggleModel.getSensorNatgasTriggleModel(Device, '气体泄漏报警');
    } else {
      triggle = LHDeviceTriggleModel.getSensorWleakTriggleModel(Device, '水浸报警');
    }
    return {
      identify,
      name: LHAlarmIFTTTAdapter.getLeakAlarmIFTTTName(type),
      us_id: 0,
      model: Device.model,
      did: Device.deviceID,
      st_id: AlarmIFTTTTypeIFThen,
      authed: authedList,
      setting: {
        enable: 1,
        enable_push: 0,
        st_id: 0,
        launch: {
          attr: [triggle],
          express: 0 // 0 为 and
        },
        action_list: [action]
      }
    };
  }

  /**
   *  尝试删除不完整的自动化
   *  ex: 本地自动化失败的自动化，实际是不能执行的，
   *  return： 完整的自动化List
   */
  static deleteSceneWhichStatusNotCorrect(sceneList) {
    if (sceneList.length === 0 || sceneList === null || sceneList === undefined) {
      return [];
    }
    const finalSceneList = [];
    const notCorrectSceneList = [];
    sceneList.forEach((scene) => {
      if (scene.status === 3) { // 3就代表这条自动化本地自动化失败，将会尝试删除
        notCorrectSceneList.push(scene);
      } else {
        finalSceneList.push(scene);
      }
    });
    if (notCorrectSceneList.length !== 0) {
      console.log('尝试删除本地自动化失败的自动化：' + notCorrectSceneList);
      this.deleteAllScenes(notCorrectSceneList);
    }
    return finalSceneList;
  }

  /**
   *  批量删除自动化
   */
  static deleteAllScenes(sceneList, onSuccess, onFail) {
    const sceneIdList = [];
    sceneList.forEach((scene) => {
      sceneIdList.push(scene.sceneID + '');
    });
    this.deleteScenes(sceneIdList, onSuccess, onFail);
  }

  /**
   *
   *  删除触发设备的自动化
   * @static
   * @memberof LHIFTTTManager
   */
  static deleteScenes(sceneIdList = [], onSuccess, onFail) {
    if (!Array.isArray(sceneIdList) || sceneIdList.length === 0) {
      if (typeof onFail === 'function') onFail();
      return;
    }
    Service.scene.deleteSceneRecords(sceneIdList).then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   *
   *  获取自动化模版
   * @static
   * @param {*} did
   * @memberof LHIFTTTManager
   */
  static getTriggerTemplatesWithDid(did) {
    console.log('模版did:' + did);
    Service.scene.triggerTemplatesForQualified(did).then((res) => {
      console.log(JSON.stringify(res));
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * 获取指定场景
   * @param {*} identify
   * @param {*} triggleID
   * @param {*} actionID
   */
  static ifScenesExistWithIdentify(identify, triggleID, actionID) {
    return new Promise((resolve, reject) => {
      LHMiServer.LoadSceneList(Device.deviceID, 22, [], (sceneList) => {
        if (sceneList.length > 0) {
          const targetList = [];
          sceneList.forEach((scene) => {
            if (scene.identify === identify) {
              let isTriggerDid = false;
              let isActionDid = false;
              scene.setting.launch.attr.forEach((triggle) => {
                if (triggle.did === triggleID) {
                  isTriggerDid = true;
                }
              });
              scene.setting.action_list.forEach((action) => {
                if (action.payload.did === actionID) {
                  isActionDid = true;
                }
              });
              if (isTriggerDid && isActionDid) {
                targetList.push(scene);
              }
            }
          });
          resolve(targetList);
        }
      }, (err) => {
        reject(err);
      });
    });
  }
}