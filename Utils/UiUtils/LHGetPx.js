import {
  Dimensions,
  PixelRatio
} from 'react-native';

const { width } = Dimensions.get('window');
/**
 * @ignore
 * @export
 * @module GetPx
 * @description 根据手机屏幕宽度将设计图尺寸转换成实际尺寸
 * @param px 设计图上的尺寸
 * @param design 设计图宽度，默认360
 * @param minDesign 适配的最小尺寸，默认360
 */
export default function GetPx(px, design, minDesign) {
  // eslint-disable-next-line
  design = design || 360;
  // eslint-disable-next-line
  minDesign = minDesign || 360;
  const calPx = Math.abs(px) / design * ((width > 400 ? 400 : (width < minDesign ? minDesign : width)));
  const roundToNearestPixel = PixelRatio.roundToNearestPixel(calPx);
  return px < 0 ? -roundToNearestPixel : roundToNearestPixel;
  // eslint-disable-next-line
  // let decimal = calPx - (calPx >>> 0);
  // if (decimal > 0.5) {
  //   if (1 - decimal > decimal - 0.5) {
  //     decimal = 0.5;
  //   } else {
  //     decimal = 1;
  //   }
  // } else {
  //   // eslint-disable-next-line
  //   if (0.5 - decimal > decimal) {
  //     decimal = 0;
  //   } else {
  //     decimal = 0.5;
  //   }
  // }
  // // eslint-disable-next-line
  // return px < 0 ? -((calPx >>> 0) + decimal) : ((calPx >>> 0) + decimal);
}