/*
 * @Descripttion: 该类主要是提供定时模块的主要操作方法
 * @version: v1.0.0
 * @Author: nicolas
 * @Date: 2019-09-05 10:05:22
 * @LastEditors: nicolas
 * @LastEditTime: 2019-09-05 11:26:42
 */

import Service from 'miot/Service';
import { Device } from 'miot';
import { LHTimeSpanUtils, LHDateUtils } from 'LHCommonFunction';

class TimerMainFunctionManager {
  /**
   * @Author: nicolas
   * @name: enableTimerScene
   * @Descripttion: 使能定时场景，执行一次的时间转成未来的时间，不然服务器会自动关闭 过去式的执行一次的定时。如果是执行一次的过去式定时，再去关闭这个定时，时间原封不动。
   * @param {enable,timerScene,onSuccess,onFail}
   */
  static enableTimerScene(enable, timerScene, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    const {
      on_time: onTime,
      off_time: offTime,
      enable_timer_on: fromEnable,
      enable_timer_off: toEnable
    } = setting;
    const localTimer = LHTimeSpanUtils.getSceneTimerSpan(onTime, offTime, fromEnable, toEnable);
    const { timeSpan, fromDate, toDate } = localTimer;
    let { fromTime, toTime } = LHTimeSpanUtils.getTimeSlotToCloud(timeSpan, fromEnable, toEnable);

    if (!timeSpan.wday || timeSpan.wday.length === 0) {
      if (!enable) {
        if (fromEnable === '1' && toEnable === '1') {
          if (LHDateUtils.isBefore(fromDate) && LHDateUtils.isBefore(toDate)) {
            fromTime = onTime;
          }
        } else if (fromEnable === '0' && toEnable === '1' && LHDateUtils.isBefore(toDate)) {
          toTime = offTime;
        } else if (fromEnable === '1' && toEnable === '0' && LHDateUtils.isBefore(fromDate)) {
          fromTime = onTime;
        }
      }
    }

    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    scene = timerScene;
    if (typeof scene.save !== 'undefined') {
      scene.save({
        setting: {
          enable_timer: enable ? '1' : '0',
          enable_timer_off: timerScene.setting.enable_timer_off,
          enable_timer_on: timerScene.setting.enable_timer_on,
          off_method: timerScene.setting.off_method,
          off_param: timerScene.setting.off_param,
          on_method: timerScene.setting.on_method,
          on_param: timerScene.setting.on_param,
          on_time: String(fromTime),
          off_time: String(toTime),
          on_filter: timerScene.setting.on_filter,
          timer_type: timerScene.setting.timer_type
        }
      }).then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }

  /**
   * @Author: nicolas
   * @name: editTimerScene
   * @Descripttion: 创建或者修改定时
   * @param {timerScene, onSuccess, onFail}
   */
  static editTimerScene(timerScene, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    if (timerScene.sceneID && timerScene.sceneID !== 0) {
      scene = timerScene;
    }
    if (typeof scene.save !== 'undefined') {
      scene.save().then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }

  /**
   * @Author: nicolas
   * @name: removeTimerScene
   * @Descripttion: 删除定时
   * @param {timerScene, onSuccess, onFail}
   */
  static removeTimerScene(timerScene, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    scene = timerScene;
    if (typeof scene.remove !== 'undefined') {
      scene.remove().then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }
}

export default TimerMainFunctionManager;