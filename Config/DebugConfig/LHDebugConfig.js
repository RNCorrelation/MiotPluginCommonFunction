// import { Package } from 'miot';

/**
* @module LHDebugConfig
* @description 调试相关模块
* @example
* import {
*   LHDebugConfig
* } from 'LHCommonFunction';
*
* LHDebugConfig.OffDebug();
*/
export default class LHDebugConfig {
  /**
 * @static
 * @function OffDebug
 * @description 关闭console调试
 * @param {boolean} [isOff] 是否关闭console调试
 */
  static OffDebug(isOff) {
    // const off = isOff || !Package.isDebug;
    const off = isOff || !__DEV__;
    if (off) {
      global.console = {
        info: () => {},
        log: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {}
      };
    }
  }

  /**
   * 场景数据打印控制台
   * @param scene
   */
  static consoleScene(scene) {
    const {
      authorizedDeviceIDs, createTime, deviceID, identify, isArtificial, isAutomatic, isNew, isTimer, name, sceneID, setting, status, type
    } = scene;
    const json = {
      authorizedDeviceIDs, createTime, deviceID, identify, isArtificial, isAutomatic, isNew, isTimer, name, sceneID, setting, status, type
    };
    console.log(JSON.stringify(json, null, 4));
  }

  /**
   * 场景数组数据打印控制台
   * @param scene
   */
  static consoleSceneArray(sceneArray) {
    sceneArray.forEach((scene) => {
      this.consoleScene(scene);
    });
  }
}