import Toast from 'react-native-root-toast';
import LHUiUtils from '../UiUtils/LHUiUtils';

let Instance = null;

/**
 * @module LHToastUtils
 * @description react-native-root-toast库封装，可以直接通过js调用，不用在页面中注入
 * @example
 * import {
 *   LHToastUtils
 * } from 'LHCommonFunction';
 *
 * LHDialogUtils.showShortToast('toast消息内容'，{ textColor: '#f00'});
 * Gihub地址：https://github.com/magicismight/react-native-root-toast
 */
export default class LHToastUtils {
  /**
 * @static
 * @function showShortToast
 * @description 显示短时间的Toast
 * @param {object} [options]
 * @param {Number} [options.duration] Toast显示时间(Toast.durations.SHORT (equals to 2000),Toast.durations.LONG (equals to 3500))
 * @param {boolean} [options.visible] 是否显示
 * @param {Number} [options.position] 在屏幕上显示的位置(Toast.positions.TOP
 * (equals to 20),Toast.positions.BOTTOM (equals to -20),Toast.positions.CENTER (equals to 0))
 * @param {boolean} [options.animation] 是否在显示和消息的时候显示动画效果
 * @param {boolean} [options.shadow] 设置Toast的边框是否带阴影
 * @param {string} [options.backgroundColor] 设置Toast的背景颜色
 * @param {string} [options.shadowColor] 设置阴影的颜色
 * @param {string} [options.textColor] 设置字体颜色
 * @param {Number} [options.delay] 设置延迟显示的时间
 * @param {bool} [options.hideOnPress] 设置Toast是否可触碰消息
 * @param {Number} [options.opacity] 设置Toast的透明度，默认0.8
 * @param {Function} [options.onShow] Toast显示动画开始的回调
 * @param {Function} [options.onShown] Toast显示动画结束后的回调
 * @param {Function} [options.onHide] Toast隐藏动画开始的回调
 * @param {Function} [options.cancelable] Toast隐藏动画结束的回调
 */
  static showShortToast(message, options) {
    this.hide();
    Instance = Toast.show(message, Object.assign({
      visible: true,
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
      textStyle: { fontFamily: LHUiUtils.DefaultFontFamily }
    }, options));
  }

  static hide(toast = Instance) {
    if (toast) Toast.hide(toast);
  }

  /**
 * @static
 * @function showLongToast
 * @description 显示长时间的Toast
 * @param {{textStyle: {fontFamily: string}}} [options]
 * @param {Number} [options.duration] Toast显示时间(Toast.durations.SHORT (equals to 2000),Toast.durations.LONG (equals to 3500))
 * @param {boolean} [options.visible] 是否显示
 * @param {Number} [options.position] 在屏幕上显示的位置(Toast.positions.TOP
 * (equals to 20),Toast.positions.BOTTOM (equals to -20),Toast.positions.CENTER (equals to 0))
 * @param {boolean} [options.animation] 是否在显示和消息的时候显示动画效果
 * @param {boolean} [options.shadow] 设置Toast的边框是否带阴影
 * @param {string} [options.backgroundColor] 设置Toast的背景颜色
 * @param {string} [options.shadowColor] 设置阴影的颜色
 * @param {string} [options.textColor] 设置字体颜色
 * @param {Number} [options.delay] 设置延迟显示的时间
 * @param {bool} [options.hideOnPress] 设置Toast是否可触碰消息
 * @param {Number} [options.opacity] 设置Toast的透明度，默认0.8
 * @param {Function} [options.onShow] Toast显示动画开始的回调
 * @param {Function} [options.onShown] Toast显示动画结束后的回调
 * @param {Function} [options.onHide] Toast隐藏动画开始的回调
 * @param {Function} [options.cancelable] Toast隐藏动画结束的回调
 */
  static showLongToast(message, options) {
    this.hide();
    Instance = Toast.show(message, Object.assign({
      visible: true,
      duration: Toast.durations.LONG,
      position: Toast.positions.CENTER,
      textStyle: { fontFamily: LHUiUtils.DefaultFontFamily }
    }, options));
  }
}