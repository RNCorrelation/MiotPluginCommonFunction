import { Platform, StyleSheet } from 'react-native';
import GetPx from './LHGetPx';

/**
* @module LHUiUtils
* @description UI辅助模块
* @example
* import {
*   LHUiUtils
* } from 'LHCommonFunction';
*
* const px = LHUiUtils.GetPx(10);
* console.log(px);
* console.log(LHUiUtils.MiJiaBlue);
*/
export default class LHUiUtils {
  /**
   * @static
   * @function GetPx
   * @description 根据手机屏幕宽度将设计图尺寸转换成实际尺寸
   * @param px 设计图上的尺寸
   * @param design 设计图宽度，默认360
   * @return {number} 转换后的像素
   * @param minDesign 适配的最小尺寸，默认360
   */
  static GetPx(px, design, minDesign) {
    return GetPx(px, design, minDesign);
  }

  /**
   * @static
   * @member MiJiaBlue
   * @description 米家蓝
   */
  static MiJiaBlue = '#0099FF'

  /**
   * @static
   * @member MiJiaBluePres
   * @description 米家蓝按压态
   */
  static MiJiaBluePres = '#18BAF0'

  /**
   * @static
   * @member MiJiaGreen
   * @description 米家绿
   */
  static MiJiaGreen = '#18BAF0'

  /**
   * @static
   * @member MiJiaRed
   * @description 米家红
   */
  static MiJiaRed = '#F43F31'

  /**
   * @static
   * @member MiJiaRedPres
   * @description 米家红按压态
   */
  static MiJiaRedPres = '#d53c32'

  /**
   * @static
   * @member MiJiaWhite
   * @description 米家白
   */
  static MiJiaWhite = '#ffffff'

  /**
   * @static
   * @member MiJiaBackgroundGray
   * @description 米家灰背景色
   */
  static MiJiaBackgroundGray = '#f7f7f7'

  /**
   * @static
   * @member MiJiaCellSelBgColor
   * @description 米家cell选中背景色
   */
  static MiJiaCellSelBgColor = 'rgba(0,0,0,0.1)'

  /**
   * @static
   * @member MiJiaTitleColor
   * @description 米家主标题颜色
   */
  static MiJiaTitleColor = '#000'

  /**
   * @static
   * @member MiJiaSubTitleColor
   * @description 米家副标题颜色
   */
  static MiJiaSubTitleColor = '#666666'

  /**
   * @static
   * @member MiJiaDescriptionColor
   * @description 米家描述文字
   */
  static MiJiaDescriptionColor = '#999999'

  /**
   * @static
   * @member MiJiaLineColor
   * @description 米家边框线颜色
   */
  static MiJiaLineColor = 'rgba(0,0,0,0.15)'

  /**
   * @static
   * @member MiJiaBorderWidth
   * @description 米家线宽 StyleSheet.hairlineWidth或0.5个像素
   */
  static MiJiaBorderWidth = StyleSheet.hairlineWidth || 0.5

  /**
   * @static
   * @member MiJiaListHeaderColor
   * @description 米家sectionHeader文字颜色
   */
  static MiJiaListHeaderColor = '#7F7F7F'

  /**
   * @static
   * @member MiJiaOrangeColor
   * @description 橙色
   */
  static MiJiaOrangeColor = '#FF9900'

  /**
   * @static
   * @member MiJiaLightGray
   * @description 灰色线
   */
  static MiJiaLightGray = '#ccc'

  /**
   * @static
   * @menber FontFamilyDDINCondensed
   * @description D-DINCondensed字体
   * */
  static FontFamilyDDINCondensed = 'D-DINCondensed';

  /**
   * @static
   * @menber FontFamilyDDIN
   * @description D-DIN字体
   * */
  static FontFamilyDDIN = 'D-DIN';

  /**
   * @static
   * @menber CellDefaultFontFamily
   * @description cell默认字体
   * */
  static CellDefaultFontFamily = 'D-DINCondensed';

  /**
   * @static
   * @menber TitleBarHeight
   * @description 导航栏高度
   * */
  static TitleBarHeight = Platform.OS === 'android' ? 55 : 44

  /**
   * @static
   * @menber NumberDefaultFontFamily
   * @description 数字默认字体
   * */
  static NumberDefaultFontFamily = Platform.OS === 'android' ? 'Mitype2018-60' : 'PingFangSC-Regular';

  /**
   * @static
   * @menber DefaultFontFamily
   * @description cell默认字体
   * */
  static DefaultFontFamily = Platform.OS === 'android' ? 'MI-LANTING_GB-OUTSIDE-YS' : 'PingFangSC-Regular';
}