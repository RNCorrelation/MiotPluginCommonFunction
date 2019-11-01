/*
 * @Descripttion: 提供模版数据
 * @version: v1.0.0
 * @Author: nicolas
 * @Date: 2019-09-05 11:32:47
 * @LastEditors: nicolas
 * @LastEditTime: 2019-09-05 18:01:33
 */

import React from 'react';
import { LHCommonLocalizableString, LHUiUtils } from 'LHCommonFunction';
import { ChoiceDialog } from 'miot/ui/Dialog';
import {
  View,
  Image,
  StyleSheet
} from 'react-native';
import { LHText, LHCommonIcon } from 'LHCommonUI';

const LHStyle = StyleSheet.create({
  deleteComponent: {
    backgroundColor: '#F43F31',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  swipeoutImage: {
    width: LHUiUtils.GetPx(25),
    height: LHUiUtils.GetPx(25)
  },
  swipeoutText: {
    fontSize: LHUiUtils.GetPx(12),
    color: '#ffffff'
  }
});

class TimerDefaultDataManager {
  static EVERYDAY=[0, 1, 2, 3, 4, 5, 6];

  static WORKDAY= [1, 2, 3, 4, 5];

  static WEEKDAY= [0, 6];

  /**
   * @Author: nicolas
   * @name: getChoiceDialogRepeadData
   * @Descripttion: 获取重复选项数据模版
   * @param {repeadArr, timespan}
   */
  static getChoiceDialogRepeadData(repeadArr, selectedIndex) {
    return {
      title: LHCommonLocalizableString.common_repeat_timer_title,
      type: ChoiceDialog.TYPE.SINGLE,
      selectedIndexArray: [selectedIndex],
      options: repeadArr.map((item) => {
        return { title: item };
      })
    };
  }

  /**
   * @Author: nicolas
   * @name: getChoiceDialogRepeadSeltData
   * @Descripttion: 获取重复选项数据模版
   * @param {timespan}
   */
  static getChoiceDialogRepeadSeltData(timespan) {
    let selectedIndexArr = null;
    selectedIndexArr = timespan.wday.map((value) => {
      return value === 0 ? 6 : value - 1;
    });
    return {
      title: LHCommonLocalizableString.common_repeat_timer_title,
      type: ChoiceDialog.TYPE.SINGLE,
      selectedIndexArray: selectedIndexArr,
      options: [
        { title: LHCommonLocalizableString.common_short_date_mon },
        { title: LHCommonLocalizableString.common_short_date_tues },
        { title: LHCommonLocalizableString.common_short_date_wed },
        { title: LHCommonLocalizableString.common_short_date_thur },
        { title: LHCommonLocalizableString.common_short_date_fri },
        { title: LHCommonLocalizableString.common_short_date_sat },
        { title: LHCommonLocalizableString.common_short_date_sun }
      ]
    };
  }

  /**
   * @Author: nicolas
   * @name: arrayEquals
   * @Descripttion: 对比两个数组是否相等
   * @param {array1,array2}
   */
  static arrayEquals(array1, array2) {
    return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort());
  }

  static getTimerItem(timeData, switchColor, onSwitchChange, onDeleteCallback, onPressCallback, onLongPressCallback) {
    const deleteComponent = (
      <View style={LHStyle.deleteComponent}>
        <Image style={LHStyle.swipeoutImage} source={LHCommonIcon.common.delete.white} />
        <LHText style={LHStyle.swipeoutText}>{LHCommonLocalizableString.common_button_delete}</LHText>
      </View>
    );
    const item = {
      title: timeData.time,
      titleNumberOfLines: 1,
      description: timeData.description,
      descriptionStyle: { fontSize: LHUiUtils.GetPx(12) },
      descriptionNumberOfLines: 1,
      switchValue: timeData.enable === '1',
      switchColor,
      hideRightArrow: true,
      hasSwitch: true,
      swipeoutClose: true,
      onSwitchChange,
      swipeoutBtns: [
        {
          component: deleteComponent,
          // 删除
          press: onDeleteCallback
        }
      ],
      press: onPressCallback,
      longPress: onLongPressCallback
    };
    return item;
  }

  /**
   * @Author: nicolas
   * @name: getEditCreateNewTimerItem
   * @Descripttion:创建新定时的模版
   */
  static getEditDefaultTimerItem(identify, name, startTimeEnable, endTimeEnable, offMethod, offParam, onMethod, onParam) {
    const item = {
      sceneID: 0,
      identify,
      name,
      setting: {
        enable_timer: '1',
        enable_timer_off: endTimeEnable ? '1' : '0',
        enable_timer_on: startTimeEnable ? '1' : '0',
        on_time: '0 0 * * 0,1,2,3,4,5,6',
        off_time: '0 0 * * 0,1,2,3,4,5,6',
        on_method: onMethod,
        on_param: onParam,
        off_method: offMethod,
        off_param: offParam
      }
    };
    return item;
  }
}

export default TimerDefaultDataManager;