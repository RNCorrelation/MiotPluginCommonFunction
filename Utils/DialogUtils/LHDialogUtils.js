import {
  DeviceEventEmitter
} from 'react-native';
import { API_LEVEL } from 'miot';

/**
 * @module LHDialogUtils
 * @description 米家MessageDialog，LoadingDialog，InputDialog封装，可以直接通过js调用，不用在页面中注入
 * @example
 * import {
 *   LHDialogUtils
 * } from 'LHCommonFunction';
 *
 * LHDialogUtils.LoadingDialogShow({ title: '加载中...' });
 */
export default class LHDialogUtils {
  /**
   * @static
   * @function MessageDialogShow
   * @description 显示MessageDialog
   * @param {Object} [config]
   * @param {boolean} [config.visible] 是否显示
   * @param {string} [config.title] 标题
   * @param {string} [config.message] 副标题，内容
   * @param {string} [config.confirm] 确认标题
   * @param {Function} [config.onConfirm] 确认点击回调
   * @param {Object} [config.titleStyle] 弹框主标题样式，10022之后的sdk才支持
   * @param {Object} [config.messageStyle] 弹框内容样式，10022之后的sdk才支持
   * @param {Object} [config.confirmStyle] 确认按钮样式，10022之后的sdk才支持
   * @param {string} [config.cancel] 取消标题
   * @param {Function} [config.onCancel] 取消点击回调
   * @param {Function} [config.onDismiss] 对话框消失回调
   * @param {number} [config.timeout] 超时自动隐藏，设置0或者不设置不会自动隐藏,默认30s
   * @param {boolean} [config.cancelable] 否允许点击空白区域取消显示, Android Only iOS无效
   */
  static MessageDialogShow(config) {
    const data = Object.assign({}, config);
    if (API_LEVEL >= 10022) {
      // eslint-disable-next-line
      const getBtnData = function (type, configData) {
        const result = {};
        if (type === 'confirm') {
          result.callback = configData.onConfirm;
          result.text = configData.confirm;
          result.style = Object.assign({ color: '#32BAC0' }, configData.confirmStyle || {});
        } else {
          result.callback = configData.onCancel;
          result.text = configData.cancel;
        }
        return result;
      };
      if (data.confirm && data.cancel && !data.buttons) {
        data.buttons = [getBtnData('cancel', data), getBtnData('confirm', data)];
      } else if (data.confirm && !data.buttons) {
        data.buttons = [getBtnData('confirm', data)];
      } else if (data.cancel && !data.buttons) {
        data.buttons = [getBtnData('cancel', data)];
      }
    }
    DeviceEventEmitter.emit('LHMessageDialog', Object.assign({ visible: true }, data));
  }

  /**
   * @static
   * @function MessageDialogHide
   * @description 隐藏MessageDialog
   */
  static MessageDialogHide() {
    DeviceEventEmitter.emit('LHMessageDialog', Object.assign({ visible: false }));
  }

  /**
   * @static
   * @function LoadingDialogShow
   * @description 显示LoadingDialog
   * @param {Object} [config]
   * @param {boolean} [config.visible] 是否显示
   * @param {string} [config.title] 标题；注意：10022之后message和title都是同一个，同时配置时显示title
   * @param {string} [config.message] 副标题，内容，注意：10022之后message和title都是同一个，同时配置时显示title
   * @param {Function} [config.onDismiss] 对话框消失回调
   * @param {number} [config.timeout] 超时自动隐藏，设置0或者不设置不会自动隐藏,默认30s
   * @param {boolean} [config.cancelable] 否允许点击空白区域取消显示, Android Only iOS无效，10022之后废弃
   */
  static LoadingDialogShow(config) {
    DeviceEventEmitter.emit('LHLoadingDialog', Object.assign({ visible: true }, config));
  }

  /**
   * @static
   * @function LoadingDialogHide
   * @description 隐藏LoadingDialog
   * 这里需要添加 100ms 的延时，（解决 LoadingDialogShow 和 LoadingDialogHide 间隔事件太快，导致不能消失）
   */
  static LoadingDialogHide() {
    setTimeout(() => {
      DeviceEventEmitter.emit('LHLoadingDialog', Object.assign({ visible: false }));
    }, 100);
  }

  /**
   * @static
   * @function InputDialogShow
   * @description 显示InputDialog
   * @param {Object} [config] 同{@link https://miecosystem.github.io/miot-plugin-sdk/module-miot_ui_InputDialog.html InputDialog}
   * @param {boolean} [config.visible] 是否显示
   * @param {string} [config.defaultText] 输入框默认初始值，默认为空
   * @param {string} [config.placeholder] 输入框placeholder，默认为空
   * @param {string} [config.title] 标题
   * @param {string} [config.message] 副标题，内容
   * @param {string} [config.confirm] 确认标题
   * @param {Function} [config.onConfirm] 确认点击回调
   * @param {string} [config.cancel] 取消标题
   * @param {Function} [config.onCancel] 取消点击回调
   * @param {Function} [config.onDismiss] 对话框消失回调
   * @param {number} [config.timeout] 超时自动隐藏，设置0或者不设置不会自动隐藏,默认30s
   * @param {boolean} [config.cancelable] 否允许点击空白区域取消显示, Android Only iOS无效
   */
  static InputDialogShow(config) {
    console.warn('请使用ShowInputDialog替代该方法，使用新版的InputDialog');
    DeviceEventEmitter.emit('LHInputDialog', Object.assign({ visible: true }, config));
  }

  /**
   * @static
   * @function ShowInputDialog
   * @description 显示Input新版Dialog
   * @param {Object} [config] 同{@link https://github.com/MiEcosystem/miot-plugin-sdk/blob/master/%E7%B1%B3%E5%AE%B6%E6%8F%92%E4%BB%B6%E9%80%9A%E7%94%A8UI%E7%BB%84%E4%BB%B6%E6%89%8B%E5%86%8C.md#%E7%B1%B3%E5%AE%B6%E5%BC%B9%E7%AA%97-%E8%BE%93%E5%85%A5%E5%BC%B9%E7%AA%97-InputDialog}
   * @param {boolean} [config.visible] 是否显示
   * @param {string} [config.type] 输入弹窗的类型。是否只有输入框，输入框上方是否有下划线超链接，输入框下方是否有勾选项，options: ['simple', 'underline', 'checkbox', 'both']
   * @param {string} [config.color] 下划线超链接的文字颜色 / 勾选框的勾选颜色，默认米家绿
   * @param {string} [config.title] 标题文字
   * @param {string} [config.underlineData] 输入框上方的数据，包括左侧说明文字，右侧下划线文字及其点击回调函数，只对 underline 和 both 有效
   * @param {Object[]} [config.inputs] 输入框数组，定义输入框的属性，对所有的 TYPE 有效
   * @param {string} [config.inputs.placeholder] 占位文字
   * @param {string} [config.inputs.defaultValue] 初始默认文字
   * @param {Function} [config.inputs.onChangeText] 文字变化回调
   * @param {Object} [config.inputs.textInputProps] 其他 TextInput 支持的属性
   * @param {Object} [config.checkboxData] 确认点击回调
   * @param {boolean} [config.checkboxData.checked] 勾选框的初始勾选状态
   * @param {string} [config.checkboxData.text] 勾选框右侧的说明文字
   * @param {string} [config.confirm] 确认标题
   * @param {Function} [config.onConfirm] 确认点击回调
   * @param {Object} [config.confirmStyle] 确认按钮样式
   * @param {string} [config.cancel] 取消标题
   * @param {Function} [config.onCancel] 取消点击回调
   * @param {Function} [config.onDismiss] 对话框消失回调
   */
  static ShowInputDialog(config) {
    const data = Object.assign({}, config);
    // eslint-disable-next-line
    const getBtnData = function (type, configData) {
      const result = {};
      if (type === 'confirm') {
        result.callback = configData.onConfirm;
        result.text = configData.confirm;
        result.style = Object.assign({ color: '#32BAC0' }, configData.confirmStyle || {});
      } else {
        result.callback = configData.onCancel;
        result.text = configData.cancel;
      }
      return result;
    };
    if (data.confirm && data.cancel && !data.buttons) {
      data.buttons = [getBtnData('cancel', data), getBtnData('confirm', data)];
    } else if (data.confirm && !data.buttons) {
      data.buttons = [getBtnData('confirm', data)];
    } else if (data.cancel && !data.buttons) {
      data.buttons = [getBtnData('cancel', data)];
    }
    DeviceEventEmitter.emit('LHNewInputDialog', Object.assign({ visible: true }, data));
  }

  /**
   * @static
   * @function HideInputDialog
   * @description 隐藏Input新版Dialog
   */

  static HideInputDialog() {
    DeviceEventEmitter.emit('LHNewInputDialog', Object.assign({ visible: false }));
  }

  /**
   * @description 显示单选dialog
   * @param {Object} [config] 同{@link https://miecosystem.github.io/miot-plugin-sdk/module-miot_ui_SingleChoseDialog.html}
   * @param {boolean} [config.visible]
   * @param {array} [config.dataSource] 数据项
   * @param {string} [config.title] title
   * @param {string} [config.cancel] cancel
   * @param {Function} [config.onCancel]
   * @param {string} [config.confirm]
   * @param {Function} [config.onConfirm]
   */
  static ShowSingleChoseDialog(config) {
    DeviceEventEmitter.emit('SingleChoseDialog', Object.assign({ visible: true }, config));
  }

  /**
   * 隐藏单选dialog
   * @constructor
   */
  static HideSingleChoseDialog() {
    DeviceEventEmitter.emit('SingleChoseDialog', Object.assign({ visible: false }));
  }

  /**
   * 弹出消息确认框
   * @param {Object} [config] 同{@link https://miecosystem.github.io/miot-plugin-sdk/module-miot_ui_MessageDialog.html MessageDialog}
   * @param {boolean} [config.visible] 是否显示
   * @param {string} [config.title] 标题
   * @param {string} [config.content] 显示的内容
   * @param {string} [config.okBtnText] 确认字体
   * @param {Function} [config.onConfirm] 确认点击回调
   * @param {string} [config.cancel] 取消标题
   * @param {Function} [config.onCancel] 取消点击回调
   * @param config
   */
  static showConfirmDialog(config) {
    DeviceEventEmitter.emit('LHConfirmDialog', Object.assign({ visible: true }, config));
  }

  /**
   * 隐藏消息确认框
   *
   * @param config
   */
  static hideConfirmDialog() {
    DeviceEventEmitter.emit('LHConfirmDialog', Object.assign({ visible: false }));
  }

  /**
   * 自定义加载中弹框
   * @param {Object} [config] 同{@link https://miecosystem.github.io/miot-plugin-sdk/module-miot_ui_MessageDialog.html MessageDialog}
   * @param {boolean} [config.visible] 是否显示
   * @param {string} [config.content] 显示的内容
   * @param {boolean} [config.cancelable] 否允许点击空白区域取消显示, Android Only iOS无效
   * @param config
   */
  static showCustomLoadingDialog(config) {
    DeviceEventEmitter.emit('CustomLoadingDialog', Object.assign({ visible: true }, config));
  }

  /**
   * 隐藏加载中弹框
   */
  static hideCustomLoadingDialog() {
    DeviceEventEmitter.emit('CustomLoadingDialog', Object.assign({ visible: false }));
  }

  /**
   * @description 显示自定义单选dialog
   * @param {Object} [config] 同{@link https://miecosystem.github.io/miot-plugin-sdk/module-miot_ui_SingleChoseDialog.html}
   * @param {boolean} [config.visible]
   * @param {array} [config.dataSource] 数据项
   * @param {string} [config.title] title
   * @param {string} [config.cancel] cancel
   * @param {number} [config.showType] showType 显示类型，1：没箭头，水平居中，2：有箭头，
   * @param {Function} [config.onCancel]
   * @param {string} [config.confirm]
   * @param {Function} [config.onConfirm]
   */
  static showCustomSingleChoseDialog(config) {
    DeviceEventEmitter.emit('CustomSingleChose', Object.assign({ visible: true }, config));
  }

  /**
   * 隐藏自定义单选dialog
   * @constructor
   */
  static hideCustomSingleChoseDialog() {
    DeviceEventEmitter.emit('CustomSingleChose', Object.assign({ visible: false }));
  }
}