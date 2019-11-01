/*
 * @Date: 2019-08-08 00:14:25
 * @LastEditors: Lavie
 * @LastEditTime: 2019-08-28 20:11:28
 */
import {
  Service,
  Host,
  Device
} from 'miot';
import {
  CommonMethod
} from 'LHCommonFunction';
/**
 * @ignore
 * @function baseRequire
 * @description miot云端请求基础函数，请求失败1秒后会自动尝试重新请求，重试3次
 * @param {Function} requireFn 要请求的miot方法，如Service.smarthome.getDeviceData
 * @param {number} errorCount 第几次失败，传0
 * @param {Object} params 请求参数
 * @param {Function} onSuccess 成功回调
 * @param {Function} onFail 失败回调，将在第四次失败时调用
 */
function baseRequire(requireFn, errorCount, params, onSuccess, onFail) {
  let nextErrorCount = errorCount + 1;
  requireFn(params).then((res) => {
    if (typeof onSuccess === 'function') {
      nextErrorCount = -1;
      onSuccess(res);
    }
  }).catch((err) => {
    console.log(err);
    if (nextErrorCount === -1) {
      console.warn('回调函数代码有错误，请仔细检查，%o', err);
    } else {
      setTimeout(() => {
        if (errorCount < 3) {
          // 失败的话1秒后尝试重新拉取
          console.warn('拉取数据失败，1秒后尝试重新拉取');
          return baseRequire(requireFn, nextErrorCount, params, onSuccess, onFail);
        }
        if (typeof onFail === 'function') onFail(err);
        return null;
      }, 1000);
    }
  });
}

function baseRequireWithMultipleParams(requireFn, errorCount, onSuccess, onFail, ...params) {
  console.log(params);
  let nextErrorCount = errorCount + 1;
  requireFn(...params).then((res) => {
    if (typeof onSuccess === 'function') {
      nextErrorCount = -1;
      onSuccess(res);
    }
  }).catch((err) => {
    console.log(err);
    if (nextErrorCount === -1) {
      console.warn('回调函数代码有错误，请仔细检查，%o', err);
    } else {
      setTimeout(() => {
        if (errorCount < 3) {
          // 失败的话1秒后尝试重新拉取
          console.warn('拉取数据失败，1秒后尝试重新拉取');
          return baseRequire(requireFn, nextErrorCount, params, onSuccess, onFail);
        }
        if (typeof onFail === 'function') onFail(err);
        return null;
      }, 1000);
    }
  });
}
/**
* @module LHMiServer
* @description LHMiServer模块，米家Service,Host相关api调用模块
* @example
* import {
*   LHMiServer
* } from 'LHCommonFunction';
*
* const storage = LHMiServer.GetHostStorage('test');
* console.log(storage)
*/
export default class LHMiServer {
  /**
   * @static
   * @function GetDeviceData
   * @description 对应米家Service.smarthome.getDeviceData /user/get_user_device_data
   * @param {Object} params 请求参数
   * @param {string} params.did 设备did
   * @param {string} params.key
   * @param {string} params.type
   * @param {string} params.time_start
   * @param {string} params.time_end
   * @param {string} params.limit
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static GetDeviceData(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getDeviceData, 0, params, onSuccess, onFail);
  }

  /**
   * @static
   * @function GetDeviceDataPromise
   * @description 对应米家Service.smarthome.getDeviceDataPromise
   * @param {Object} params 请求参数
   * @param {string} params.did 设备did
   * @param {string} params.key
   * @param {string} params.type
   * @param {string} params.time_start
   * @param {string} params.time_end
   * @param {string} params.limit
   * @return {Promise} 返回Promise
   */
  static GetDeviceDataPromise(params) {
    return Service.smarthome.getDeviceData(params);
  }

  /**
   * @static
   * @function GetUserDeviceDataTab
   * @description 对应米家Service.smarthome.getUserDeviceDataTab, 日志分页拉取
   * @param {Object} params 请求参数
   * @param {string} params.did 设备did
   * @param {string} params.key
   * @param {string} params.type
   * @param {string} params.timestamp
   * @param {string} params.limit
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static GetUserDeviceDataTab(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getUserDeviceDataTab, 0, params, onSuccess, onFail);
  }

  /**
   * @static
   * @function GetUserDeviceLog
   * @description 对应米家Service.smarthome.getUserDeviceLog, 日志分页拉取
   * @param {Object} params 请求参数
   * @param {string} params.did 设备did
   * @param {string} params.time_end
   * @param {string} params.time_start
   * @param {string} params.limit
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static GetUserDeviceLog(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getUserDeviceLog, 0, params, onSuccess, onFail);
  }

  /**
   * @static
   * @function GetHostStorage
   * @description 对应对应米家Host.storage.get, 获取一个key 保存的字符串，如果已经调用 set 则返回对应的值，未调用 set 则返回空字串 '' 如果value已过期，则会reject
   * @param {string} key 键值
   * @return {Promise} Promise 特别注意返回值是一个promise对象
   */
  static GetHostStorage(key) {
    return Host.storage.get(key).then((res) => {
      if (res && typeof res === 'object') {
        return CommonMethod.DeepClone(res);
      }
      return res;
    });
  }

  /**
   * @static
   * @function SetHostStorage
   * @description 对应米家Host.storage.set, 和 get 相对应，持久化一个 key=value 的数据
   * @param value 要保存的数据
   * @param opt opt.expire 有效期 从保存的时候开始 expire ms以内数据有效。
   */
  static SetHostStorage(key, value, opt) {
    return Host.storage.set(key, value, opt || { expire: 0 });
  }

  /**
   * @static
   * @function GetDeviceSetting
   * @description 对应米家Service.smarthome.getDeviceSettingV2，获取服务器中 device 对应的数据，内部调用米家代理接口 /device/setsetting
   * @param {Object} params 请求参数
   * @param {string} params.did 设备did
   * @param {Array} params.settings
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static GetDeviceSetting(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getDeviceSettingV2, 0, params, onSuccess, onFail);
  }

  /**
   * @static
   * @function SetDeviceSetting
   * @description 对应米家Service.smarthome.setDeviceSetting，获取服务器中 device 对应的数据，内部调用米家代理接口 /device/getsetting
   * @param {Object} params 请求参数
   * @param {string} params.did 设备did
   * @param {Object} params.settings map<key,value>
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调
   */
  static SetDeviceSetting(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.setDeviceSetting, 3, params, onSuccess, onFail);
  }

  /**
   * @static
   * @function OpenPrivacyLicense
   * @description 对应米家Host.ui.openPrivacyLicense, 打开授权弹窗
   * @param {string} licenseText 用户协议文案
   * @param {string} licenseUrl 用户协议url，通过require方式
   * @param {string} policyText 隐私政策文案
   * @param {string} policyUrl 隐私政策url，通过require方式
   */
  static OpenPrivacyLicense(licenseText, licenseUrl, policyText, policyUrl) {
    return Host.ui.openPrivacyLicense(licenseText, licenseUrl, policyText, policyUrl);
  }

  /**
   * @static
   * @function GetSubDevices
   * @description 对应米家Device.getSubDevices，获取子设备列表
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调
   */
  static GetSubDevices(onSuccess, onFail) {
    return Device.getSubDevices().then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   *
   * 获取某个model设备的默认配置，例如iconurl，名称等等
   * @static
   * @param {*} model 指定设备的model
   * @param {*} onSuccess
   * @param {*} onFail
   * @returns {DeviceConfig} 设备配置
   * @memberof LHMiServer
   */
  static LoadRealDeviceConfig(model, onSuccess, onFail) {
    return Device.loadRealDeviceConfig(model).then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   *
   * 批量删除设备, 不能删除 小米路由器/本地蓝牙/局域网直连设备
   * @static
   * @param {*} didAndPid did 与 pid（Device.type） 列表 [{did:xx,pid:xx}, {did:xx,pid:xx}]
   * @param {*} onSuccess
   * @param {*} onFail
   * @returns
   * @memberof LHMiServer
   */
  static DeleteDevices(didAndPid, onSuccess, onFail) {
    return Device.deleteDevices(didAndPid).then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   *
   *  修改设备名称
   * @static
   * @param {*} newName
   * @param {*} did
   * @param {*} onSuccess
   * @param {*} onFail
   * @returns
   * @memberof LHMiServer
   */
  static ChangeDeviceName(newName, did, onSuccess, onFail) {
    return Device.changeDeviceName(newName, did).then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   * @static
   * @function LoadSceneList
   * @description 对应米家Service.scene.loadScenes
   * @param {string} did 设备did
   * @param {number} sceneType 场景类型
   * @param {object} opt {identify,name}
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static LoadSceneList(did, sceneType, opt, onSuccess, onFail) {
    return baseRequireWithMultipleParams(Service.scene.loadScenes, 0, onSuccess, onFail, did, sceneType, opt);
  }

  /**
   * @static
   * @function LoadSceneList
   * @description 对应米家Service.scene.loadScenesHistoryForDevice
   * @param {string} did 设备did
   * @param {number} timestamp 时间戳
   * @param {number} limit 拉取日志数量限制，小于等于50
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static LoadScenesHistoryForDevice(did, timestamp, limit, onSuccess, onFail) {
    return baseRequireWithMultipleParams(Service.scene.loadScenesHistoryForDevice, 0, onSuccess, onFail, did, timestamp, limit);
  }

  /**
   * @static
   * @function GetPropertiesValue
   * @description 对应米家Service.spec.getPropertiesValue
   * @param {Object[]} params 请求参数
   * @param {string} params.did 设备did
   * @param {number} params.siid
   * @param {number} params.piid
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static GetPropertiesValue(params, onSuccess, onFail) {
    return baseRequire(Service.spec.getPropertiesValue, 0, params, onSuccess, onFail);
  }

  /**
   * @static
   * @function SetPropertiesValue
   * @description 对应米家Service.spec.setPropertiesValue
   * @param {Object[]} params 请求参数
   * @param {string} params.did 设备did
   * @param {number} params.siid
   * @param {number} params.piid
   * @param {Any} params.value
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调
   */
  static SetPropertiesValue(params, onSuccess, onFail) {
    return baseRequire(Service.spec.setPropertiesValue, 3, params, onSuccess, onFail);
  }

  /**
   *  根据 model 获取当前账号下所有该 model 的设备
   *
   * @static
   * @param {*} model 设备model
   * @param {*} onSuccess
   * @param {*} onFail
   * @returns
   * @memberof LHMiServer
   */
  static GetGateWayListWithModel(model, onSuccess, onFail) {
    return baseRequire(Host.ui.getDevicesWithModel, 0, model, onSuccess, onFail);
  }

  /**
   * @static
   * @function DoAction
   * @description 对应米家Service.spec.doAction
   * @param {Object[]} params 请求参数
   * @param {string} params.did 设备did
   * @param {number} params.siid
   * @param {number} params.aiid
   * @param {Any} params.in
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static DoActionValue(params, onSuccess, onFail) {
    return baseRequire(Service.spec.doAction, 0, params, onSuccess, onFail);
  }


  /**
   * 提供返回设备数据统计服务，使用该接口需要配置产品model以支持使用，建议找对接的产品人员进行操作。
   * 图表📈统计接口 /v2/user/statistics
   * 注:由于sds限额问题，可能会出现一次拉不到或者拉不完数据的情况，会返回code:0和message:“sds throttle”
   * @description 对应米家Service.smarthome.getUserStatistics
   * @param {object} params
   * @param {string} params.did did
   * @param {string} params.data_type 数据类型 包括： 采样统计 日统计:stat_day / 周统计:stat_week / 月统计:stat_month ; 计数统计(总次数，耗电量那种)(即将废弃) 日统计:total_day_v2 / 周统计:total_week_v2 / 月统计:total_month_v2
   * @param {string} params.key 需要统计的字段，即统计上报对应的key
   * @param {number} params.time_start 开始时间戳
   * @param {number} params.time_end 结束时间戳
   * @param {number} params.limit 限制次数，0为默认条数
   * @param {string} params.start_date 获取数据的起始日期，优先级比[time_start] 格式为 '2019/03/01'
   * @param {string} params.end_date 获取数据的结束日期，优先级比[time_end] 格式为 '2019/03/01'
   * @param {function} onSuccess 成功回调
   * @param {function} onFail 失败回调
   {
      "code": 0,
      "message": "ok",
      "result": [
          {
              "value": "[12,34]", // 为一个数组形式json串
              "time": 1543593600 // 时间戳
          },
          {
              "value": "[10,11]",
              "time": 1541001600
          }]
  }
    */
  static GetUserStatistics(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getUserStatistics, 0, params, onSuccess, onFail);
  }

  /**
   * 获取设备模板信息
   * @param {string} model 设备model
   * @param {function} onSuccess 成功回调
   * @param {function} onFail 失败回调
   */
  static GetMultiSwitchTemplateWithModel(model, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getMultiSwitchTemplateWithModel, 0, model, onSuccess, onFail);
  }

  /**
   * 获取设备模板信息
   * 绿米：批量获取设备成员信息
   * @param {string} prarms.dids app/网关IP地址
   * @param {string} prarms.get_sub_relation  标识是否拉取成员信息
   * @param {string} prarms.get_online_status 是否获取设备在线状态，true获取 false不获取
   * @param {function} onSuccess 成功回调
   * @param {function} onFail 失败回调
   */
  static GetMultiSwitchInfoWithDids(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.getMultiSwitchInfoWithDids, 0, params, onSuccess, onFail);
  }

  /**
   * 该接口通过RPC获取子设备属性，如果该设备没有父设备就直接获取，如果有父设备就从父设备获取
   * @deprecated 请用下面的SendRPCPayload方法
   * @description 对应米家Device.getDeviceWifi().callMethod
   * @param {string} methodName
   * @param {array} props
   * @param {object} params：有需要传sid的传{'sid':'deviceDid'}，不需要的话传{}.
   * @param {function} onSuccess 成功回调
   * @param {function} onFail 失败回调
   */

  static SendRPCRequest(methodName, array, params, onSuccess, onFail) {
    if (typeof (Device.parentDevice) === 'undefined') {
      Device.getDeviceWifi().callMethod(methodName, array, params !== null ? params : {}).then((res) => {
        onSuccess(res);
      }).catch((err) => {
        onFail(err);
      });
    } else {
      Device.parentDevice.getDeviceWifi().callMethod(methodName, [array], params !== null ? params : {}).then((res) => {
        onSuccess(res);
      }).catch((err) => {
        onFail(err);
      });
    }
  }

  /**
   * 该接口通过RPC获取子设备属性，如果该设备没有父设备就直接获取，如果有父设备就从父设备获取
   * @description 对应米家Device.getDeviceWifi().callMethod
   * @param {string} methodName 调用的方法名
   * @param {array,object} args
   * @param {boolean} isChildMethod methodName这个方法是否为子设备的方法 false会直接从网关调用，true调用子设备method，default:false
   * @return {Promise} 返回proimse
   */
  static SendRPCPayload(methodName, args, isChildMethod = false) {
    const device = Device.parentDevice || Device;
    return device.getDeviceWifi().callMethod(methodName, args, isChildMethod ? { sid: Device.deviceID } : {})
      .then((res) => {
        const { error } = res;
        if (error) {
          throw Object.assign((new Error(JSON.stringify(error))), { error });
        }
        return res;
      })
      .catch((error) => {
        console.warn(
          `SendRPCPayload error warning:
            method: ${methodName},
            params: ${JSON.stringify(args)},
            isChildMethod: ${isChildMethod},
            error: ${JSON.stringify(error.message || error.error || error)}`
        );
        throw error;
      });
  }

  /**
   * @static
   * @function UpdateDeviceHardware
   * @description 对应米家Service.smarthome.checkDeviceVersion /home/checkversion
   * @param {string} did 设备did
   * @param {string} pid
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
   */
  static UpdateDeviceHardware(onSuccess, onFail) {
    return baseRequireWithMultipleParams(Service.smarthome.checkDeviceVersion, 0, onSuccess, onFail, Device.deviceID, Device.type);
  }

  /**
   * @static
   * @function OpenYouPinShop
   * @description 打开有品的热搜页
   * @param {string} key 要搜索的产品组成的字符串，如 '人体门窗开关传感器'
   * @use LHMiServer.OpenYouPinShop('人体门窗开关传感器');
   * @attention 该api需要在sdk 10024上使用
  */
  static OpenYouPinShop(key) {
    return Host.ui.openShopSearchPage(key);
  }

  /**
   * @static
   * @function BatchGetDeviceDatas
   * @description 获取设备的属性
   * @param {Object[]} params 参数数组
   * @param {string} params.did did
   * @param {string[]} params.props props 列表,属性需要以"prop.s_"开头 e.g ["prop.s_aaa","prop.s_bbb"]
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调
  */
  static BatchGetDeviceDatas(params, onSuccess, onFail) {
    return Service.smarthome.batchGetDeviceDatas(params).then((res) => {
      if (typeof onSuccess === 'function') onSuccess(res);
    }).catch((err) => {
      if (typeof onFail === 'function') onFail(err);
    });
  }

  /**
   * @static
   * @function BatchSetDeviceDatas
   * @description 设置设备属性
   * @param {Object[]} params 参数数组
   * @param {string} params.did did
   * @param {object} params.props props 键值对， 属性需要以"prop.s_"开头
   * @param {Function} onSuccess 成功回调
   * @param {Function} onFail 失败回调，将在第四次失败时调用
  */
  static BatchSetDeviceDatas(params, onSuccess, onFail) {
    return baseRequire(Service.smarthome.batchSetDeviceDatas, 0, params, onSuccess, onFail);
  }

  /**
   * @method GetCurrentServerInfo
   * serverCode: 中国大陆：CN 新加坡：SG 印度：in 俄罗斯：RU 美国：us (欧洲)德国: de 韩国：kr
   * @description 获取 米家 App 设置的地区和服务器信息
   * @return {Promise<{countryName:"",countryCode:"",serverCode:""}>}
   */
  static GetCurrentServerInfo(onSuccess) {
    const serverInfo = {
      server: 'cn',
      country: 'cn'
    };
    Service.getServerName().then((res) => {
      const { serverCode, countryCode } = res;
      const mServerCode = serverCode.toLowerCase();
      const mCountryCode = countryCode.toLowerCase();
      serverInfo.server = mServerCode;
      serverInfo.country = mCountryCode;
      if (typeof onSuccess === 'function') onSuccess(serverInfo);
    }).catch(() => {
      if (typeof onSuccess === 'function') onSuccess(serverInfo);
    });
  }

  /**
   * 判断当前是不是海外
   * @param {*} onSuccess
   */
  static isOverSea(onSuccess) {
    LHMiServer.GetCurrentServerInfo((res) => {
      if (typeof onSuccess === 'function') onSuccess(res.server !== 'cn');
    });
  }
}
