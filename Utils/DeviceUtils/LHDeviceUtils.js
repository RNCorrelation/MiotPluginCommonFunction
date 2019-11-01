import { Host } from 'miot';
import {
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';

const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;
const PAD_WIDTH = 768;

const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

const isIPhoneX = (() => {
  return (
    // eslint-disable-next-line
    Platform.OS === 'ios' &&
    // eslint-disable-next-line
    ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
      // eslint-disable-next-line
      (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT)) ||
    // eslint-disable-next-line
    ((D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH) ||
      (D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT))
  );
})();

const isIPad = (() => {
  if (Platform.OS !== 'ios' || isIPhoneX) return false;

  // if portrait and width is smaller than iPad width
  if (D_HEIGHT > D_WIDTH && D_WIDTH < PAD_WIDTH) {
    return false;
  }

  // if landscape and height is smaller that iPad height
  if (D_WIDTH > D_HEIGHT && D_HEIGHT < PAD_WIDTH) {
    return false;
  }

  return true;
})();

const statusBarHeight = (isLandscape) => {
  /**
   * This is a temporary workaround because we don't have a way to detect
   * if the status bar is translucent or opaque. If opaque, we don't need to
   * factor in the height here; if translucent (content renders under it) then
   * we do.
   */
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight;
  }

  if (isIPhoneX) {
    return isLandscape ? 0 : 44;
  }

  if (isIPad) {
    return 20;
  }

  return isLandscape ? 0 : 20;
};

function getInset(key, isLandscape) {
  switch (key) {
    case 'horizontal':
    case 'right':
    case 'left':
    {
      return isLandscape ? (isIPhoneX ? 44 : 0) : 0;
    }
    case 'vertical':
    case 'top':
    {
      return statusBarHeight(isLandscape);
    }
    case 'bottom':
    {
      return isIPhoneX ? (isLandscape ? 24 : 34) : 0;
    }
    default:
      return 0;
  }
}

// 安卓屏幕高度
let androidHeight = 0;

/**
* @module LHDeviceUtils
* @description 手机设备相关模块
* @example
* import {
*   LHDeviceUtils
* } from 'LHCommonFunction';
*
* console.log(LHDeviceUtils.statusBarHeight);
*/
export default class LHDeviceUtils {
  /**
   * @static
   * @member statusBarHeight
   * @description 状态栏高度,竖屏的
   */
  static statusBarHeight = getInset('top', false)

  /**
   * @static
   * @member AppHomeIndicatorHeight
   * @description home键安全距离高度，竖屏的
   */
  static AppHomeIndicatorHeight = getInset('bottom', false)

  /**
   * @static
   * @function getPhoneInset
   * @description 获取手机设备各个方向安全距离
   * @param {string} key 方向，options: ["top", "bottom", "left", "right"]
   * @param {boolean} isLandscape 是否横屏
   * @return {number} 对应方向的安全距离
   */
  static getPhoneInset(key, isLandscape) {
    return getInset(key, isLandscape);
  }

  /**
   * @static
   * @function GetPhoneScreenHeight
   * @description 获取手机屏幕的高度
   * @param onSuccess
   */
  static GetPhoneScreenHeight(onSuccess) {
    const { height } = Dimensions.get('window');
    if (Platform.OS === 'android') {
      if (androidHeight > 0) {
        if (typeof onSuccess === 'function') onSuccess(androidHeight);
      } else {
        // 第一次获取延迟一下，不然有些机型获取的不准
        setTimeout(() => {
          Host.getPhoneScreenInfo().then((res) => {
            console.log('LHDeviceUtils GetPhoneScreenHeight android', res.viewHeight, res);
            if (res && res.viewHeight) androidHeight = res.viewHeight;
            if (typeof onSuccess === 'function') onSuccess(res ? (res.viewHeight || height) : height);
          }).catch(() => {
            if (typeof onSuccess === 'function') onSuccess(height);
          });
        }, 100);
      }
    } else {
      console.log('LHDeviceUtils GetPhoneScreenHeight ios', height);
      if (typeof onSuccess === 'function') onSuccess(height);
    }
  }
}