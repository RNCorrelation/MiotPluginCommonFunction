var __DEV__=development,__BUNDLE_START_TIME__=this.nativePerformanceNow?nativePerformanceNow():Date.now(),process=this.process||{};process.env=process.env||{};process.env.NODE_ENV='development';
(function (global) {
  'use strict';

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  global.require = _require;
  global.__d = define;
  var modules = Object.create(null);

  if (__DEV__) {
    var verboseNamesToModuleIds = Object.create(null);
  }

  function define(factory, moduleId, dependencyMap) {
    if (moduleId in modules) {
      if (__DEV__) {
        var inverseDependencies = arguments[4];

        if (inverseDependencies) {
          global.__accept(moduleId, factory, dependencyMap, inverseDependencies);
        } else {
          console.warn("Trying to define twice module ID " + moduleId + " in the same bundle");
        }
      }

      return;
    }

    modules[moduleId] = {
      dependencyMap: dependencyMap,
      exports: undefined,
      factory: factory,
      hasError: false,
      isInitialized: false
    };

    if (__DEV__) {
      modules[moduleId].hot = createHotReloadingObject();
      var verboseName = arguments[3];

      if (verboseName) {
        modules[moduleId].verboseName = verboseName;
        verboseNamesToModuleIds[verboseName] = moduleId;
      }
    }
  }

  function _require(moduleId) {
    if (__DEV__ && typeof moduleId === 'string') {
      var verboseName = moduleId;
      moduleId = verboseNamesToModuleIds[verboseName];

      if (moduleId == null) {
        throw new Error("Unknown named module: '" + verboseName + "'");
      } else {
        console.warn("Requiring module '" + verboseName + "' by name is only supported for " + 'debugging purposes and will BREAK IN PRODUCTION!');
      }
    }

    var moduleIdReallyIsNumber = moduleId;
    var module = modules[moduleIdReallyIsNumber];
    return module && module.isInitialized ? module.exports : guardedLoadModule(moduleIdReallyIsNumber, module);
  }

  var inGuard = false;

  function guardedLoadModule(moduleId, module) {
    if (!inGuard && global.ErrorUtils) {
      inGuard = true;
      var returnValue = void 0;

      try {
        returnValue = loadModuleImplementation(moduleId, module);
      } catch (e) {
        global.ErrorUtils.reportFatalError(e);
      }

      inGuard = false;
      return returnValue;
    } else {
      return loadModuleImplementation(moduleId, module);
    }
  }

  var ID_MASK_SHIFT = 16;
  var LOCAL_ID_MASK = ~0 >>> ID_MASK_SHIFT;

  function unpackModuleId(moduleId) {
    var segmentId = moduleId >>> ID_MASK_SHIFT;
    var localId = moduleId & LOCAL_ID_MASK;
    return {
      segmentId: segmentId,
      localId: localId
    };
  }

  _require.unpackModuleId = unpackModuleId;

  function packModuleId(value) {
    return value.segmentId << ID_MASK_SHIFT + value.localId;
  }

  _require.packModuleId = packModuleId;

  function loadModuleImplementation(moduleId, module) {
    var nativeRequire = global.nativeRequire;

    if (!module && nativeRequire) {
      var _unpackModuleId = unpackModuleId(moduleId);

      var segmentId = _unpackModuleId.segmentId,
          localId = _unpackModuleId.localId;
      nativeRequire(localId, segmentId);
      module = modules[moduleId];
    }

    if (!module) {
      throw unknownModuleError(moduleId);
    }

    if (module.hasError) {
      throw moduleThrewError(moduleId, module.error);
    }

    if (__DEV__) {
      var Systrace = _require.Systrace;
    }

    module.isInitialized = true;
    var exports = module.exports = {};
    var _module = module;
    var factory = _module.factory,
        dependencyMap = _module.dependencyMap;

    try {
      if (__DEV__) {
        Systrace.beginEvent('JS_require_' + (module.verboseName || moduleId));
      }

      var moduleObject = {
        exports: exports
      };

      if (__DEV__ && module.hot) {
        moduleObject.hot = module.hot;
      }

      factory(global, _require, moduleObject, exports, dependencyMap);

      if (!__DEV__) {
        module.factory = undefined;
        module.dependencyMap = undefined;
      }

      if (__DEV__) {
        Systrace.endEvent();
      }

      return module.exports = moduleObject.exports;
    } catch (e) {
      module.hasError = true;
      module.error = e;
      module.isInitialized = false;
      module.exports = undefined;
      throw e;
    }
  }

  function unknownModuleError(id) {
    var message = 'Requiring unknown module "' + id + '".';

    if (__DEV__) {
      message += 'If you are sure the module is there, try restarting Metro Bundler. ' + 'You may also want to run `yarn`, or `npm install` (depending on your environment).';
    }

    return Error(message);
  }

  function moduleThrewError(id, error) {
    var displayName = __DEV__ && modules[id] && modules[id].verboseName || id;
    return Error('Requiring module "' + displayName + '", which threw an exception: ' + error);
  }

  if (__DEV__) {
    _require.Systrace = {
      beginEvent: function beginEvent() {},
      endEvent: function endEvent() {}
    };

    _require.getModules = function () {
      return modules;
    };

    var createHotReloadingObject = function createHotReloadingObject() {
      var hot = {
        acceptCallback: null,
        accept: function accept(callback) {
          hot.acceptCallback = callback;
        }
      };
      return hot;
    };

    var acceptAll = function acceptAll(dependentModules, inverseDependencies, patchedModules) {
      if (!dependentModules || dependentModules.length === 0) {
        return true;
      }

      var notAccepted = dependentModules.filter(function (module) {
        return !accept(module, undefined, undefined, inverseDependencies, patchedModules);
      });
      var parents = [];

      for (var i = 0; i < notAccepted.length; i++) {
        if (inverseDependencies[notAccepted[i]].length === 0) {
          return false;
        }

        parents.push.apply(parents, _toConsumableArray(inverseDependencies[notAccepted[i]]));
      }

      return parents.length == 0;
    };

    var accept = function accept(id, factory, dependencyMap, inverseDependencies) {
      var patchedModules = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      if (id in patchedModules) {
        return true;
      }

      patchedModules[id] = true;
      var mod = modules[id];

      if (!mod && factory) {
        return true;
      }

      var hot = mod.hot;

      if (!hot) {
        console.warn('Cannot accept module because Hot Module Replacement ' + 'API was not installed.');
        return false;
      }

      if (factory) {
        mod.factory = factory;
      }

      if (dependencyMap) {
        mod.dependencyMap = dependencyMap;
      }

      mod.hasError = false;
      mod.isInitialized = false;

      _require(id);

      if (hot.acceptCallback) {
        hot.acceptCallback();
        return true;
      } else {
        if (!inverseDependencies) {
          throw new Error('Undefined `inverseDependencies`');
        }

        return acceptAll(inverseDependencies[id], inverseDependencies, patchedModules);
      }
    };

    global.__accept = accept;
  }
})(this);
__d(function (global, _require, module, exports, _dependencyMap) {
  var _miot = _require(_dependencyMap[0], "miot");

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var _index = _require(_dependencyMap[2], "./Main/index");

  var _index2 = babelHelpers.interopRequireDefault(_index);

  _LHCommonFunction.LHDebugConfig.OffDebug();

  switch (_miot.Package.entrance) {
    default:
      {
        _miot.Package.entry(_index2.default);

        break;
      }
  }
},2,[147,3,39],"projects/com.lumi.plug/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LHPolicyLicenseUtils = exports.LHElectricityDataManager = exports.LHBluetoothUtils = exports.LHToastUtils = exports.LHDebugConfig = exports.LHDialogUtils = exports.LHPureRenderDecorator = exports.LHAuthorizationUtils = exports.LHSettingItem = exports.LHMiServer = exports.CommonMethod = exports.LHCommonLocalizableString = exports.LHLocalizedStrings = exports.LHUiUtils = exports.LHDeviceUtils = exports.LHDateUtils = undefined;

  var _LHDateUtils = _require(_dependencyMap[0], "./Utils/DateUtils/LHDateUtils");

  var _LHDateUtils2 = babelHelpers.interopRequireDefault(_LHDateUtils);

  var _LHDeviceUtils = _require(_dependencyMap[1], "./Utils/DeviceUtils/LHDeviceUtils");

  var _LHDeviceUtils2 = babelHelpers.interopRequireDefault(_LHDeviceUtils);

  var _LHUiUtils = _require(_dependencyMap[2], "./Utils/UiUtils/LHUiUtils");

  var _LHUiUtils2 = babelHelpers.interopRequireDefault(_LHUiUtils);

  var _LHLocalizedStrings = _require(_dependencyMap[3], "./Config/Localized/LHLocalizedStrings");

  var _LHLocalizedStrings2 = babelHelpers.interopRequireDefault(_LHLocalizedStrings);

  var _LHCommonLocalizableString = _require(_dependencyMap[4], "./Config/Localized/LHCommonLocalizableString");

  var _LHCommonLocalizableString2 = babelHelpers.interopRequireDefault(_LHCommonLocalizableString);

  var _LHCommonMethod = _require(_dependencyMap[5], "./CommonMethod/LHCommonMethod");

  var _LHCommonMethod2 = babelHelpers.interopRequireDefault(_LHCommonMethod);

  var _LHMiServer = _require(_dependencyMap[6], "./MiServer/LHMiServer");

  var _LHMiServer2 = babelHelpers.interopRequireDefault(_LHMiServer);

  var _LHSettingItem = _require(_dependencyMap[7], "./Config/SettingItem/LHSettingItem");

  var _LHSettingItem2 = babelHelpers.interopRequireDefault(_LHSettingItem);

  var _LHAuthorizationUtils = _require(_dependencyMap[8], "./Utils/Authorization/LHAuthorizationUtils");

  var _LHAuthorizationUtils2 = babelHelpers.interopRequireDefault(_LHAuthorizationUtils);

  var _LHPureRenderDecorator = _require(_dependencyMap[9], "./Utils/PureRenderDecorator/LHPureRenderDecorator");

  var _LHPureRenderDecorator2 = babelHelpers.interopRequireDefault(_LHPureRenderDecorator);

  var _LHDialogUtils = _require(_dependencyMap[10], "./Utils/DialogUtils/LHDialogUtils");

  var _LHDialogUtils2 = babelHelpers.interopRequireDefault(_LHDialogUtils);

  var _LHDebugConfig = _require(_dependencyMap[11], "./Config/DebugConfig/LHDebugConfig");

  var _LHDebugConfig2 = babelHelpers.interopRequireDefault(_LHDebugConfig);

  var _LHBluetoothUtils = _require(_dependencyMap[12], "./Utils/BluetoothUtils/LHBluetoothUtils");

  var _LHBluetoothUtils2 = babelHelpers.interopRequireDefault(_LHBluetoothUtils);

  var _LHToastUtils = _require(_dependencyMap[13], "./Utils/ToastUtils/LHToastUtils");

  var _LHToastUtils2 = babelHelpers.interopRequireDefault(_LHToastUtils);

  var _LHPolicyLicenseUtils = _require(_dependencyMap[14], "./Utils/PolicyLicenseUtils/LHPolicyLicenseUtils");

  var _LHPolicyLicenseUtils2 = babelHelpers.interopRequireDefault(_LHPolicyLicenseUtils);

  var _LHElectricityDataManager = _require(_dependencyMap[15], "./CommonMethod/LHElectricityDataManager");

  var _LHElectricityDataManager2 = babelHelpers.interopRequireDefault(_LHElectricityDataManager);

  exports.LHDateUtils = _LHDateUtils2.default;
  exports.LHDeviceUtils = _LHDeviceUtils2.default;
  exports.LHUiUtils = _LHUiUtils2.default;
  exports.LHLocalizedStrings = _LHLocalizedStrings2.default;
  exports.LHCommonLocalizableString = _LHCommonLocalizableString2.default;
  exports.CommonMethod = _LHCommonMethod2.default;
  exports.LHMiServer = _LHMiServer2.default;
  exports.LHSettingItem = _LHSettingItem2.default;
  exports.LHAuthorizationUtils = _LHAuthorizationUtils2.default;
  exports.LHPureRenderDecorator = _LHPureRenderDecorator2.default;
  exports.LHDialogUtils = _LHDialogUtils2.default;
  exports.LHDebugConfig = _LHDebugConfig2.default;
  exports.LHToastUtils = _LHToastUtils2.default;
  exports.LHBluetoothUtils = _LHBluetoothUtils2.default;
  exports.LHElectricityDataManager = _LHElectricityDataManager2.default;
  exports.LHPolicyLicenseUtils = _LHPolicyLicenseUtils2.default;
},3,[4,5,6,8,9,13,15,16,18,19,20,21,22,23,17,38],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LHCommonFunction = _require(_dependencyMap[0], "LHCommonFunction");

  var LHDateUtils = function () {
    function LHDateUtils() {
      babelHelpers.classCallCheck(this, LHDateUtils);
    }

    babelHelpers.createClass(LHDateUtils, null, [{
      key: "DateFormat",
      value: function DateFormat(format, time, isUtc) {
        var time2Date = function time2Date(value) {
          if (Number(value) > 10000000000) {
            return new Date(value);
          }

          return new Date(value * 1000);
        };

        var date = time2Date(time);
        var formatS = format;
        var fortmatKey = void 0;
        var fullYear = void 0;

        if (isUtc) {
          fortmatKey = {
            'M+': date.getUTCMonth() + 1,
            'd+': date.getUTCDate(),
            'h+': date.getUTCHours(),
            'm+': date.getUTCMinutes(),
            's+': date.getUTCSeconds(),
            'q+': Math.floor((date.getUTCMonth() + 3) / 3),
            'S+': date.getMilliseconds()
          };
          fullYear = date.getUTCFullYear();
        } else {
          fortmatKey = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S+': date.getMilliseconds()
          };
          fullYear = date.getFullYear();
        }

        if (/(y+)/i.test(formatS)) {
          formatS = formatS.replace(RegExp.$1, (fullYear + '').substr(4 - RegExp.$1.length));
        }

        for (var k in fortmatKey) {
          if (new RegExp('(' + k + ')').test(formatS)) {
            formatS = formatS.replace(RegExp.$1, RegExp.$1.length === 1 ? fortmatKey[k] : ('00' + fortmatKey[k]).substr(('' + fortmatKey[k]).length));
          }
        }

        return formatS;
      }
    }, {
      key: "GetStandardTimeText",
      value: function GetStandardTimeText(time) {
        var today = new Date();
        var todaySec = Math.floor(today.getTime() / 1000);
        var yesterday = new Date(today.getFullYear(), today.getMonth());
        yesterday.setDate(today.getDate() - 1);
        var yesterdaySec = Math.floor(yesterday.getTime() / 1000);

        if (LHDateUtils.DateFormat('yyyy-MM-dd', todaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
          return _LHCommonFunction.LHCommonLocalizableString.common_log_today;
        } else if (LHDateUtils.DateFormat('yyyy-MM-dd', yesterdaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
          return _LHCommonFunction.LHCommonLocalizableString.common_log_yesterday;
        }

        if (LHDateUtils.DateFormat('yyyy', todaySec) !== LHDateUtils.DateFormat('yyyy', time)) {
          return LHDateUtils.DateFormat('yyyy/MM/dd', time);
        }

        return LHDateUtils.DateFormat('MM/dd', time);
      }
    }, {
      key: "GetHomeLogTime",
      value: function GetHomeLogTime(time, isHomeDesc) {
        var today = new Date();
        var todaySec = Math.floor(today.getTime() / 1000);
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth();
        var todayDate = today.getDate();
        var yesterday = new Date(todayYear, todayMonth);
        yesterday.setDate(todayDate - 1);
        var yesterdaySec = Math.floor(yesterday.getTime() / 1000);

        if (LHDateUtils.DateFormat('yyyy-MM-dd', todaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
          return LHDateUtils.DateFormat('hh:mm', time);
        } else if (LHDateUtils.DateFormat('yyyy-MM-dd', yesterdaySec) === LHDateUtils.DateFormat('yyyy-MM-dd', time)) {
          return (isHomeDesc ? _LHCommonFunction.LHCommonLocalizableString.common_log_yesterday : _LHCommonFunction.LHCommonLocalizableString.common_log_yesterday + ' ') + LHDateUtils.DateFormat('hh:mm', time);
        }

        return todayYear === new Date(time * 1000).getFullYear() ? LHDateUtils.DateFormat('MM/dd hh:mm', time) : LHDateUtils.DateFormat('yyyy/MM/dd hh:mm', time);
      }
    }, {
      key: "isLeapYear",
      value: function isLeapYear(eDate) {
        var year = eDate.getFullYear();
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
    }, {
      key: "getDaysInMonth",
      value: function getDaysInMonth(eDate) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        daysInMonth[1] = LHDateUtils.isLeapYear(eDate) ? 29 : 28;
        return daysInMonth[eDate.getMonth() + 1];
      }
    }]);
    return LHDateUtils;
  }();

  exports.default = LHDateUtils;
},4,[3],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/DateUtils/LHDateUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var X_WIDTH = 375;
  var X_HEIGHT = 812;
  var XSMAX_WIDTH = 414;
  var XSMAX_HEIGHT = 896;
  var PAD_WIDTH = 768;

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      D_HEIGHT = _Dimensions$get.height,
      D_WIDTH = _Dimensions$get.width;

  var isIPhoneX = function () {
    return _reactNative.Platform.OS === 'ios' && (D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH || D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT) || D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH || D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT;
  }();

  var isIPad = function () {
    if (_reactNative.Platform.OS !== 'ios' || isIPhoneX) return false;

    if (D_HEIGHT > D_WIDTH && D_WIDTH < PAD_WIDTH) {
      return false;
    }

    if (D_WIDTH > D_HEIGHT && D_HEIGHT < PAD_WIDTH) {
      return false;
    }

    return true;
  }();

  var statusBarHeight = function statusBarHeight(isLandscape) {
    if (_reactNative.Platform.OS === 'android') {
      return _reactNative.StatusBar.currentHeight;
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
          return isLandscape ? isIPhoneX ? 44 : 0 : 0;
        }

      case 'vertical':
      case 'top':
        {
          return statusBarHeight(isLandscape);
        }

      case 'bottom':
        {
          return isIPhoneX ? isLandscape ? 24 : 34 : 0;
        }

      default:
        return 0;
    }
  }

  var LHDeviceUtils = function () {
    function LHDeviceUtils() {
      babelHelpers.classCallCheck(this, LHDeviceUtils);
    }

    babelHelpers.createClass(LHDeviceUtils, null, [{
      key: "getPhoneInset",
      value: function getPhoneInset(key, isLandscape) {
        return getInset(key, isLandscape);
      }
    }]);
    return LHDeviceUtils;
  }();

  LHDeviceUtils.statusBarHeight = getInset('top', false);
  LHDeviceUtils.AppHomeIndicatorHeight = getInset('bottom', false);
  exports.default = LHDeviceUtils;
},5,[148],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/DeviceUtils/LHDeviceUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var _LHGetPx = _require(_dependencyMap[1], "./LHGetPx");

  var _LHGetPx2 = babelHelpers.interopRequireDefault(_LHGetPx);

  var LHUiUtils = function () {
    function LHUiUtils() {
      babelHelpers.classCallCheck(this, LHUiUtils);
    }

    babelHelpers.createClass(LHUiUtils, null, [{
      key: "GetPx",
      value: function GetPx(px, design) {
        return (0, _LHGetPx2.default)(px, design);
      }
    }]);
    return LHUiUtils;
  }();

  LHUiUtils.MiJiaBlue = '#0099FF';
  LHUiUtils.MiJiaBluePres = '#18BAF0';
  LHUiUtils.MiJiaGreen = '#18BAF0';
  LHUiUtils.MiJiaRed = '#ff0000';
  LHUiUtils.MiJiaRedPres = '#d53c32';
  LHUiUtils.MiJiaWhite = '#ffffff';
  LHUiUtils.MiJiaBackgroundGray = '#f6f6f6';
  LHUiUtils.MiJiaCellSelBgColor = 'rgba(0,0,0,0.1)';
  LHUiUtils.MiJiaTitleColor = '#333333';
  LHUiUtils.MiJiaSubTitleColor = '#666666';
  LHUiUtils.MiJiaDescriptionColor = '#999999';
  LHUiUtils.MiJiaLineColor = _reactNative.Platform.OS === 'ios' ? '#f1f1f1' : 'rgba(0,0,0,0.15)';
  LHUiUtils.MiJiaBorderWidth = 0.5;
  LHUiUtils.MiJiaListHeaderColor = '#7f7f7f';
  LHUiUtils.MiJiaOrangeColor = '#f7b33e';
  LHUiUtils.MiJiaLightGray = '#ccc';
  LHUiUtils.FontFamilyDDINCondensed = 'D-DINCondensed';
  LHUiUtils.CellDefaultFontFamily = 'D-DINCondensed';
  LHUiUtils.TitleBarHeight = _reactNative.Platform.OS === 'android' ? 55 : 44;
  LHUiUtils.DefaultFontFamily = _reactNative.Platform.OS === 'android' ? 'MI-LANTING_GB-OUTSIDE-YS' : 'PingFangSC-Regular';
  exports.default = LHUiUtils;
},6,[148,7],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/UiUtils/LHUiUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = GetPx;

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      width = _Dimensions$get.width;

  function GetPx(px, design) {
    design = design && (design > 414 ? 414 : design) || 360;
    var calPx = Math.abs(px) / design * width;
    var decimal = calPx - (calPx >>> 0);

    if (decimal > 0.5) {
      if (1 - decimal > decimal - 0.5) {
        decimal = 0.5;
      } else {
        decimal = 1;
      }
    } else {
      if (0.5 - decimal > decimal) {
        decimal = 0;
      } else {
        decimal = 0.5;
      }
    }

    return px < 0 ? -((calPx >>> 0) + decimal) : (calPx >>> 0) + decimal;
  }
},7,[148],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/UiUtils/LHGetPx.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _miot = _require(_dependencyMap[0], "miot");

  var interfaceLanguage = _miot.Host.locale.language;

  var LHLocalizedStrings = function () {
    babelHelpers.createClass(LHLocalizedStrings, null, [{
      key: "getBestMatchingLanguage",
      value: function getBestMatchingLanguage(language, props) {
        if (props[language]) return language;
        return 'en';
      }
    }]);

    function LHLocalizedStrings(props) {
      babelHelpers.classCallCheck(this, LHLocalizedStrings);
      this.props = props;
      this.setLanguage(interfaceLanguage);
    }

    babelHelpers.createClass(LHLocalizedStrings, [{
      key: "setLanguage",
      value: function setLanguage(language) {
        var bestLanguage = LHLocalizedStrings.getBestMatchingLanguage(language, this.props);
        this.language = bestLanguage;

        if (this.props[bestLanguage]) {
          var localizedStrings = this.props[this.language];

          for (var key in localizedStrings) {
            if (localizedStrings.hasOwnProperty(key)) {
              this[key] = localizedStrings[key];
            }
          }
        }
      }
    }, {
      key: "getLanguage",
      value: function getLanguage() {
        return this.language;
      }
    }, {
      key: "getInterfaceLanguage",
      value: function getInterfaceLanguage() {
        return interfaceLanguage;
      }
    }, {
      key: "adjustLanguagePacket",
      value: function adjustLanguagePacket(languagePacket) {
        var keys = Object.keys(this.props);

        for (var i = 0, len = keys.length; i < len; i += 1) {
          if (!languagePacket[keys[i]]) delete this.props[keys[i]];
        }

        this.setLanguage(interfaceLanguage);
      }
    }]);
    return LHLocalizedStrings;
  }();

  exports.default = LHLocalizedStrings;
},8,[147],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/Localized/LHLocalizedStrings.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _LHLocalizedStrings = _require(_dependencyMap[0], "./LHLocalizedStrings");

  var _LHLocalizedStrings2 = babelHelpers.interopRequireDefault(_LHLocalizedStrings);

  var _en = _require(_dependencyMap[1], "./Language/en");

  var _en2 = babelHelpers.interopRequireDefault(_en);

  var _zhHans = _require(_dependencyMap[2], "./Language/zh-Hans");

  var _zhHans2 = babelHelpers.interopRequireDefault(_zhHans);

  var _zhHantHK = _require(_dependencyMap[3], "./Language/zh-Hant-HK");

  var _zhHantHK2 = babelHelpers.interopRequireDefault(_zhHantHK);

  var LHCommonLocalizableString = new _LHLocalizedStrings2.default({
    en: _en2.default,
    zh: _zhHans2.default,
    zh_hk: _zhHantHK2.default
  });
  exports.default = LHCommonLocalizableString;
},9,[8,10,11,12],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/Localized/LHCommonLocalizableString.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var en = {
    "common_setting_title": "Settings",
    "common_setting_feature_setting": "Shortcut settings",
    "common_setting_general_setting": "General settings",
    "common_setting_device_name": "Device name",
    "common_setting_multiswitch": "Switch settings",
    "common_setting_device_timeZone": "Device time zone",
    "common_setting_location_management": "Manage locations",
    "common_setting_share_device": "Share",
    "common_setting_ifttt_auto": "Automation",
    "common_setting_btGateway": "BLE Gateway",
    "common_setting_firmware_upgrate": "Check for firmware updates",
    "common_setting_more_setting": "Additional settings",
    "common_setting_add_to_desktop": "Add to Home screen",
    "common_setting_privacy_agreement": "User Agreement & Privacy Policy",
    "common_setting_delete_device": "Delete device",
    "common_setting_help_page": "Help",
    "common_setting_more_seting_security": "Security settings",
    "common_setting_more_seting_faq": "FAQ",
    "common_setting_more_seting_isssues": "Report an issue",
    "common_setting_user_agreement": "Software License and Service Agreement",
    "common_setting_privacy_policy": "Privacy Policy",
    "common_setting_feature_plug_in": "Plugin version",
    "common_setting_homekit_device_add": "绑定到HomeKit",
    "common_setting_homekit_device_bound": "已绑定",
    "common_setting_homekit_device_noBind": "未绑定",
    "common_log_title": "Logs",
    "common_log_today": "Today",
    "common_log_yesterday": "Yesterday",
    "common_log_no_logs": "No logs",
    "common_log_loading": "Loading",
    "common_log_logDataHasloaded": "加载完全部日志",
    "common_log_all_data_has_been_loaded": "All data has been loaded",
    "common_log_no_data": "No data",
    "common_cancel": "Cancel",
    "common_ok": "OK",
    "common_manufacturer": "Manufacturer",
    "common_lumi": "Lumi",
    "common_tips_network_unconnect": "Can't connect to the network",
    "common_tips_battery_low": "Battery low",
    "common_tips_iknow": "OK",
    "common_button_done": "Done",
    "common_button_delete": "Delete",
    "common_button_retry": "Try again",
    "common_button_save": "Save",
    "common_tips_delete_succeed": "Delete succeed",
    "common_tips_delete_failed": "Delete failed",
    "common_tips_loading_failed": "Could not load",
    "common_tips_request_failed": "Request failed. Check your network",
    "common_button_prev": "Back",
    "common_button_next": "Next",
    "common_button_changename": "Rename",
    "common_date_workday": "Mon to Fri",
    "common_date_weekend": "Weekend",
    "common_date_selfdefine": "Custom",
    "common_date_mon": "Monday",
    "common_date_tues": "Tuesday",
    "common_date_wed": "Wednesday",
    "common_date_thur": "Thursday",
    "common_date_fri": "Friday",
    "common_date_sat": "Saturday",
    "common_date_sun": "Sunday",
    "common_date_day": "D",
    "common_date_week": "Week",
    "common_date_month": "M",
    "common_date_hour": "Hour",
    "common_date_minute": "Minute",
    "common_tips_discard_operation": "Discard current operation?",
    "common_tips_setting": "Setting, please wait…",
    "common_tips_setting_failed": "Failed to set",
    "common_tips_loading_failed_retry": "加载失败，点击重试",
    "common_tips_shared_no_promision": "The shared device has no permission"
  };
  exports.default = en;
},10,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/Localized/Language/en.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var zhHans = {
    "common_setting_title": "设置",
    "common_setting_feature_setting": "功能设置",
    "common_setting_general_setting": "通用设置",
    "common_setting_device_name": "设备名称",
    "common_setting_multiswitch": "按键设置",
    "common_setting_device_timeZone": "设备时区",
    "common_setting_location_management": "位置管理",
    "common_setting_share_device": "设备共享",
    "common_setting_ifttt_auto": "智能",
    "common_setting_btGateway": "蓝牙网关",
    "common_setting_firmware_upgrate": "检查固件升级",
    "common_setting_more_setting": "更多设置",
    "common_setting_add_to_desktop": "添加到桌面",
    "common_setting_privacy_agreement": "使用条款和隐私政策",
    "common_setting_delete_device": "删除设备",
    "common_setting_help_page": "使用帮助",
    "common_setting_more_seting_security": "安全设置",
    "common_setting_more_seting_faq": "常见问题",
    "common_setting_more_seting_isssues": "反馈问题",
    "common_setting_user_agreement": "软件许可及服务协议",
    "common_setting_privacy_policy": "隐私政策",
    "common_setting_feature_plug_in": "插件版本号",
    "common_setting_homekit_device_add": "绑定到HomeKit",
    "common_setting_homekit_device_bound": "已绑定",
    "common_setting_homekit_device_noBind": "未绑定",
    "common_log_title": "日志",
    "common_log_today": "今天",
    "common_log_yesterday": "昨天",
    "common_log_no_logs": "暂无日志",
    "common_log_loading": "加载中",
    "common_log_logDataHasloaded": "加载完全部日志",
    "common_log_all_data_has_been_loaded": "全部数据已加载完成",
    "common_log_no_data": "暂无数据",
    "common_cancel": "取消",
    "common_ok": "确定",
    "common_manufacturer": "制造商",
    "common_lumi": "绿米",
    "common_tips_network_unconnect": "网络连接不可用",
    "common_tips_battery_low": "电池电量低",
    "common_tips_iknow": "我知道了",
    "common_button_done": "完成",
    "common_button_delete": "删除",
    "common_button_retry": "重试",
    "common_button_save": "保存",
    "common_tips_delete_succeed": "删除成功",
    "common_tips_delete_failed": "删除失败",
    "common_tips_loading_failed": "加载失败",
    "common_tips_request_failed": "请求失败，请检查网络",
    "common_button_prev": "上一步",
    "common_button_next": "下一步",
    "common_button_changename": "重命名",
    "common_date_workday": "周一至周五",
    "common_date_weekend": "周末",
    "common_date_selfdefine": "自定义",
    "common_date_mon": "星期一",
    "common_date_tues": "星期二",
    "common_date_wed": "星期三",
    "common_date_thur": "星期四",
    "common_date_fri": "星期五",
    "common_date_sat": "星期六",
    "common_date_sun": "星期日",
    "common_date_day": "日",
    "common_date_week": "周",
    "common_date_month": "月",
    "common_date_hour": "时",
    "common_date_minute": "分",
    "common_tips_discard_operation": "确认放弃本次操作？",
    "common_tips_setting": "设置中，请稍候...",
    "common_tips_setting_failed": "设置失败",
    "common_tips_loading_failed_retry": "加载失败，点击重试",
    "common_tips_shared_no_promision": "被分享设备无此权限"
  };
  exports.default = zhHans;
},11,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/Localized/Language/zh-Hans.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var zhHantHK = {
    "common_setting_title": "设置",
    "common_setting_feature_setting": "功能设置",
    "common_setting_general_setting": "通用设置",
    "common_setting_device_name": "设备名称",
    "common_setting_multiswitch": "按键设置",
    "common_setting_device_timeZone": "设备时区",
    "common_setting_location_management": "位置管理",
    "common_setting_share_device": "共享",
    "common_setting_ifttt_auto": "智能",
    "common_setting_btGateway": "蓝牙网关",
    "common_setting_firmware_upgrate": "检查固件升级",
    "common_setting_more_setting": "更多设置",
    "common_setting_add_to_desktop": "添加到桌面",
    "common_setting_privacy_agreement": "使用条款和隐私政策",
    "common_setting_delete_device": "删除设备",
    "common_setting_help_page": "使用説明",
    "common_setting_more_seting_security": "安全设置",
    "common_setting_more_seting_faq": "常见问题",
    "common_setting_more_seting_isssues": "反馈问题",
    "common_setting_user_agreement": "软件许可及服务协议",
    "common_setting_privacy_policy": "隐私政策",
    "common_setting_feature_plug_in": "插件版本号",
    "common_setting_homekit_device_add": "绑定到HomeKit",
    "common_setting_homekit_device_bound": "已绑定",
    "common_setting_homekit_device_noBind": "未绑定",
    "common_log_title": "日志",
    "common_log_today": "今天",
    "common_log_yesterday": "昨天",
    "common_log_no_logs": "暂无日志",
    "common_log_loading": "載入中",
    "common_log_logDataHasloaded": "加载完全部日志",
    "common_log_all_data_has_been_loaded": "全部数据已加载完成",
    "common_log_no_data": "暂无数据",
    "common_cancel": "取消",
    "common_ok": "确定",
    "common_manufacturer": "製造商",
    "common_lumi": "绿米",
    "common_tips_network_unconnect": "網絡連接不可用",
    "common_tips_battery_low": "电池电量低",
    "common_tips_iknow": "我知道了",
    "common_button_done": "完成",
    "common_button_delete": "刪除",
    "common_button_retry": "重試",
    "common_button_save": "保存",
    "common_tips_delete_succeed": "刪除成功",
    "common_tips_delete_failed": "刪除失敗",
    "common_tips_loading_failed": "載入失敗",
    "common_tips_request_failed": "請求失敗，請檢查網路",
    "common_button_prev": "上一步",
    "common_button_next": "下一步",
    "common_button_changename": "重命名",
    "common_date_workday": "週一至週五",
    "common_date_weekend": "週末",
    "common_date_selfdefine": "自定義",
    "common_date_mon": "星期一",
    "common_date_tues": "星期二",
    "common_date_wed": "星期三",
    "common_date_thur": "星期四",
    "common_date_fri": "星期五",
    "common_date_sat": "星期六",
    "common_date_sun": "星期日",
    "common_date_day": "日",
    "common_date_week": "週",
    "common_date_month": "月",
    "common_date_hour": "時",
    "common_date_minute": "分",
    "common_tips_discard_operation": "確認放棄本次操作？",
    "common_tips_setting": "設定中，請稍候..",
    "common_tips_setting_failed": "設定失敗",
    "common_tips_loading_failed_retry": "",
    "common_tips_shared_no_promision": "被共用裝置無此權限"
  };
  exports.default = zhHantHK;
},12,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/Localized/Language/zh-Hant-HK.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LHDeepClone = _require(_dependencyMap[0], "./LHDeepClone");

  var _LHDeepClone2 = babelHelpers.interopRequireDefault(_LHDeepClone);

  function CRC16Array(data) {
    var result = new Array(2);
    var crc16 = 0x8005;
    var crc = 0x00;
    var bitLen = 8;

    if (!data || data.length === 0) {
      return [0, 0];
    }

    var flag = void 0;

    for (var k = 0, len = data.length; k < len; k += 1) {
      for (var i = 0; i < bitLen; i += 1) {
        flag = crc >> 15;
        crc <<= 1;
        crc |= data[k] >> 7 - i & 1;

        if ((flag & 1) == 1) {
          crc ^= crc16;
        }
      }
    }

    crc &= 0xffff;

    for (var _i = 0; _i < result.length; _i += 1) {
      result[_i] = crc >> 8 * _i & 0xFF;
    }

    return result;
  }

  var CommonMethod = function () {
    function CommonMethod() {
      babelHelpers.classCallCheck(this, CommonMethod);
    }

    babelHelpers.createClass(CommonMethod, null, [{
      key: "DeepClone",
      value: function DeepClone(source, targetObj) {
        return (0, _LHDeepClone2.default)(source, targetObj);
      }
    }, {
      key: "RandomNum",
      value: function RandomNum(min, max) {
        var range = max - min;
        var rand = Math.random();
        var num = min + Math.round(rand * range);
        return num;
      }
    }, {
      key: "Find",
      value: function Find(array, attr, value) {
        for (var i = 0, len = array.length; i < len; i += 1) {
          if (array[i][attr] === value) return i;
        }

        return -1;
      }
    }, {
      key: "CRC16String",
      value: function CRC16String(msg) {
        var data = [];

        for (var i = 0, len = msg.length; i < len; i += 2) {
          data.push('0x' + msg.substr(i, 2));
        }

        var crc = CRC16Array(data);
        var result = '';

        for (var j = 0, len1 = crc.length; j < len1; j += 1) {
          var crcStr = crc[j].toString(16);
          result += crcStr.length < 2 ? '0' + crcStr : crcStr;
        }

        return result;
      }
    }, {
      key: "bigEndianStrToLittleEndianString",
      value: function bigEndianStrToLittleEndianString(hexStr) {
        var littleEndianString = "";
        var byteArr = CommonMethod.hexStrToByteArr(hexStr);

        for (var i = byteArr.length - 1; i >= 0; i -= 1) {
          var hexNum = byteArr[i];

          if (hexNum >= 0 && hexNum <= 255) {
            var hexByteStr = hexNum.toString(16).toUpperCase();

            if (hexByteStr.length % 2 == 1) {
              hexByteStr = '0' + hexByteStr;
            }

            littleEndianString = littleEndianString + hexByteStr;
          }
        }

        return littleEndianString;
      }
    }, {
      key: "hexStrToByteArr",
      value: function hexStrToByteArr(hexStr) {
        var byteArr = [];

        if (!hexStr || !hexStr.length || hexStr.length % 2 !== 0) {
          return byteArr;
        }

        hexStr = hexStr.toLocaleUpperCase();
        var hexs = '0123456789ABCDEF';

        for (var i = 0; i < hexStr.length / 2; i += 1) {
          var bytePR = hexStr[2 * i];
          var byteSF = hexStr[2 * i + 1];

          if (bytePR.indexOf(hexs) && byteSF.indexOf(hexs)) {
            byteArr.push(parseInt(bytePR + byteSF, 16));
          }
        }

        return byteArr;
      }
    }, {
      key: "QuickSort",
      value: function QuickSort(array, attr) {
        var sortFn = function sortFn(start, end) {
          if (start === end) return;
          var oStart = start,
              oEnd = end,
              key = array[start];

          while (start < end) {
            if (attr ? key[attr] <= array[end][attr] : key <= array[end]) {
              end--;
            } else {
              array[start] = array[end];

              while (end > ++start) {
                if (attr ? key[attr] < array[start][attr] : array[start] > key) {
                  array[end] = array[start];
                  end--;
                  break;
                }
              }
            }
          }

          if (start === oStart) {
            sortFn(++oStart, oEnd);
            return;
          }

          array[start] = key;

          if (start === oEnd) {
            sortFn(oStart, --oEnd);
            return;
          }

          sortFn(oStart, --start);
          sortFn(++end, oEnd);
        };

        if (array.length > 1) sortFn(0, array.length - 1);
        return array;
      }
    }, {
      key: "getDistanceBetweenDot",
      value: function getDistanceBetweenDot(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      }
    }]);
    return CommonMethod;
  }();

  exports.default = CommonMethod;
},13,[14],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/CommonMethod/LHCommonMethod.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = DeepClone;

  function DeepClone(source, targetObj) {
    if (!source || typeof source !== 'object') {
      throw new Error('error arguments', 'shallowClone');
    }

    var result = targetObj;

    if (!result) {
      result = source.constructor === Array ? [] : {};
    }

    for (var keys in source) {
      if (source.hasOwnProperty(keys)) {
        if (source[keys] && typeof source[keys] === 'object') {
          result[keys] = source[keys].constructor === Array ? [] : {};
          result[keys] = DeepClone(source[keys]);
        } else {
          result[keys] = source[keys];
        }
      }
    }

    return result;
  }
},14,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/CommonMethod/LHDeepClone.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _miot = _require(_dependencyMap[0], "miot");

  function baseRequire(requireFn, errorCount, params, onSuccess, onFail) {
    var nextErrorCount = errorCount + 1;
    requireFn(params).then(function (res) {
      if (typeof onSuccess === 'function') {
        nextErrorCount = -1;
        onSuccess(res);
      }
    }).catch(function (err) {
      console.log(err);

      if (nextErrorCount === -1) {
        console.warn('回调函数代码有错误，请仔细检查，%o', err);
      } else {
        console.warn('拉取数据失败，1秒后尝试重新拉取');
        setTimeout(function () {
          if (errorCount < 3) {
            return baseRequire(requireFn, nextErrorCount, params, onSuccess, onFail);
          }

          if (typeof onFail === 'function') onFail(err);
          return null;
        }, 1000);
      }
    });
  }

  var LHMiServer = function () {
    function LHMiServer() {
      babelHelpers.classCallCheck(this, LHMiServer);
    }

    babelHelpers.createClass(LHMiServer, null, [{
      key: "GetDeviceData",
      value: function GetDeviceData(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.smarthome.getDeviceData, 0, params, onSuccess, onFail);
      }
    }, {
      key: "GetDeviceDataPromise",
      value: function GetDeviceDataPromise(params) {
        return _miot.Service.smarthome.getDeviceData(params);
      }
    }, {
      key: "GetUserDeviceDataTab",
      value: function GetUserDeviceDataTab(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.smarthome.getUserDeviceDataTab, 0, params, onSuccess, onFail);
      }
    }, {
      key: "GetUserDeviceLog",
      value: function GetUserDeviceLog(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.smarthome.getUserDeviceLog, 0, params, onSuccess, onFail);
      }
    }, {
      key: "GetHostStorage",
      value: function GetHostStorage(key) {
        return _miot.Host.storage.get(key);
      }
    }, {
      key: "SetHostStorage",
      value: function SetHostStorage(key, value, opt) {
        return _miot.Host.storage.set(key, value, opt || {
          expire: 0
        });
      }
    }, {
      key: "GetDeviceSetting",
      value: function GetDeviceSetting(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.smarthome.getDeviceSettingV2, 0, params, onSuccess, onFail);
      }
    }, {
      key: "SetDeviceSetting",
      value: function SetDeviceSetting(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.smarthome.setDeviceSetting, 0, params, onSuccess, onFail);
      }
    }, {
      key: "OpenPrivacyLicense",
      value: function OpenPrivacyLicense(licenseText, licenseUrl, policyText, policyUrl) {
        return _miot.Host.ui.openPrivacyLicense(licenseText, licenseUrl, policyText, policyUrl);
      }
    }, {
      key: "GetSubDevices",
      value: function GetSubDevices(onSuccess, onFail) {
        return _miot.Device.getSubDevices().then(function (res) {
          if (typeof onSuccess === 'function') onSuccess(res);
        }).catch(function (err) {
          if (typeof onFail === 'function') onFail(err);
        });
      }
    }, {
      key: "LoadRealDeviceConfig",
      value: function LoadRealDeviceConfig(model, onSuccess, onFail) {
        return _miot.Device.loadRealDeviceConfig(model).then(function (res) {
          if (typeof onSuccess === 'function') onSuccess(res);
        }).catch(function (err) {
          if (typeof onFail === 'function') onFail(err);
        });
      }
    }, {
      key: "DeleteDevices",
      value: function DeleteDevices(didAndPid, onSuccess, onFail) {
        console.log(didAndPid);
        return _miot.Device.deleteDevices(didAndPid).then(function (res) {
          if (typeof onSuccess === 'function') onSuccess(res);
        }).catch(function (err) {
          if (typeof onFail === 'function') onFail(err);
        });
      }
    }, {
      key: "GetPropertiesValue",
      value: function GetPropertiesValue(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.spec.getPropertiesValue, 0, params, onSuccess, onFail);
      }
    }, {
      key: "SetPropertiesValue",
      value: function SetPropertiesValue(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.spec.setPropertiesValue, 0, params, onSuccess, onFail);
      }
    }, {
      key: "DoActionValue",
      value: function DoActionValue(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.spec.doAction, 0, params, onSuccess, onFail);
      }
    }, {
      key: "GetUserStatistics",
      value: function GetUserStatistics(params, onSuccess, onFail) {
        return baseRequire(_miot.Service.smarthome.getUserStatistics, 0, params, onSuccess, onFail);
      }
    }]);
    return LHMiServer;
  }();

  exports.default = LHMiServer;
},15,[147],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/MiServer/LHMiServer.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _miot = _require(_dependencyMap[0], "miot");

  var _LHCommonLocalizableString = _require(_dependencyMap[1], "../Localized/LHCommonLocalizableString");

  var _LHCommonLocalizableString2 = babelHelpers.interopRequireDefault(_LHCommonLocalizableString);

  var _LHPolicyLicenseUtils = _require(_dependencyMap[2], "../../Utils/PolicyLicenseUtils/LHPolicyLicenseUtils");

  var _LHPolicyLicenseUtils2 = babelHelpers.interopRequireDefault(_LHPolicyLicenseUtils);

  function _getSettingItem(type, extendParams) {
    var allItems = {
      deviceName: {
        title: _LHCommonLocalizableString2.default.common_setting_device_name,
        rightDescriptionStyle: {
          maxWidth: '40%'
        },
        rightDescription: '',
        press: function press() {
          _miot.Host.ui.openChangeDeviceName();
        }
      },
      switchSetting: {
        title: _LHCommonLocalizableString2.default.common_setting_multiswitch,
        press: function press() {
          _miot.Host.ui.openShareDevicePage();
        }
      },
      shareDevice: {
        title: _LHCommonLocalizableString2.default.common_setting_share_device,
        press: function press() {
          _miot.Host.ui.openShareDevicePage();
        }
      },
      roomManagement: {
        title: _LHCommonLocalizableString2.default.common_setting_location_management,
        press: function press() {
          _miot.Host.ui.openRoomManagementPage();
        }
      },
      deviceTimeZone: {
        title: _LHCommonLocalizableString2.default.common_setting_device_timeZone,
        press: function press() {
          _miot.Host.ui.openDeviceTimeZoneSettingPage();
        }
      },
      iftttAuto: {
        title: _LHCommonLocalizableString2.default.common_setting_ifttt_auto,
        press: function press() {
          _miot.Host.ui.openIftttAutoPage();
        }
      },
      btGateway: {
        title: _LHCommonLocalizableString2.default.common_setting_btGateway,
        press: function press() {
          _miot.Host.ui.openBtGatewayActivity();
        }
      },
      firmwareUpgrate: {
        title: _LHCommonLocalizableString2.default.common_setting_firmware_upgrate,
        press: function press() {
          _miot.Host.ui.openDeviceUpgradePage();
        }
      },
      pairWithHomeKitiOS: {
        title: _LHCommonLocalizableString2.default.common_setting_homekit_device_add
      },
      moreSetting: {
        title: _LHCommonLocalizableString2.default.common_setting_more_setting,
        press: function press() {
          _miot.Host.ui.openNewMorePage();
        }
      },
      helpPage: {
        title: _LHCommonLocalizableString2.default.common_setting_help_page,
        press: function press() {
          _miot.Host.ui.openHelpPage();
        }
      },
      addToDesktop: {
        title: _LHCommonLocalizableString2.default.common_setting_add_to_desktop,
        press: function press() {
          _miot.Host.ui.openAddToDesktopPage();
        }
      },
      privacyLicense: {
        title: _LHCommonLocalizableString2.default.common_setting_privacy_agreement,
        press: function press() {}
      },
      deleteDevice: {
        title: _LHCommonLocalizableString2.default.common_setting_delete_device,
        press: function press() {
          _miot.Host.ui.openDeleteDevice();
        }
      },
      securitySetting: {
        title: _LHCommonLocalizableString2.default.common_setting_more_seting_security,
        press: function press() {
          _miot.Host.ui.openSecuritySetting();
        }
      },
      feedbackInput: {
        title: _LHCommonLocalizableString2.default.common_setting_more_seting_isssues,
        press: function press() {
          _miot.Host.ui.openFeedbackInput();
        }
      },
      plugIn: {
        title: _LHCommonLocalizableString2.default.common_setting_feature_plug_in,
        hideRightArrow: true,
        noTouchableHighlight: true
      }
    };
    return allItems[type] && babelHelpers.extends({}, allItems[type], extendParams) || null;
  }

  var LHSettingItem = function () {
    function LHSettingItem() {
      babelHelpers.classCallCheck(this, LHSettingItem);
    }

    babelHelpers.createClass(LHSettingItem, null, [{
      key: "getSettingItem",
      value: function getSettingItem(type, extendParams) {
        return _getSettingItem(type, extendParams);
      }
    }]);
    return LHSettingItem;
  }();

  LHSettingItem.plugInItem = function (plugIn) {
    return _getSettingItem('plugIn', {
      rightDescription: plugIn
    });
  };

  LHSettingItem.deviceNameItem = function (deviceName) {
    return _getSettingItem('deviceName', {
      rightDescription: deviceName
    });
  };

  LHSettingItem.privacyLicenseItem = function (urls) {
    return _getSettingItem('privacyLicense', {
      press: function press() {
        var policyLicenseUrl = _LHPolicyLicenseUtils2.default.GexPolicyLicenseUrl(urls);

        _miot.Host.ui.privacyAndProtocolReview(_LHCommonLocalizableString2.default.common_setting_user_agreement, policyLicenseUrl.licenseUrl, _LHCommonLocalizableString2.default.common_setting_privacy_policy, policyLicenseUrl.policyUrl);
      }
    });
  };

  LHSettingItem.roomManagementItem = _getSettingItem('roomManagement');
  LHSettingItem.shareDeviceItem = _getSettingItem('shareDevice');
  LHSettingItem.deviceTimeZoneItem = _getSettingItem('deviceTimeZone');
  LHSettingItem.iftttAutoItem = _getSettingItem('iftttAuto');
  LHSettingItem.btGatewayItem = _getSettingItem('btGateway');
  LHSettingItem.firmwareUpgrateItem = _getSettingItem('firmwareUpgrate');
  LHSettingItem.moreSettingItem = _getSettingItem('moreSetting');
  LHSettingItem.helpPageItem = _getSettingItem('helpPage');
  LHSettingItem.addToDesktopItem = _getSettingItem('addToDesktop');
  LHSettingItem.deleteDeviceItem = _getSettingItem('deleteDevice');
  LHSettingItem.securitySettingItem = _getSettingItem('securitySetting');
  LHSettingItem.feedbackInputItem = _getSettingItem('feedbackInput');
  exports.default = LHSettingItem;
},16,[147,9,17],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/SettingItem/LHSettingItem.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LHCommonFunction = _require(_dependencyMap[0], "LHCommonFunction");

  var LHPolicyLicenseUtils = function () {
    function LHPolicyLicenseUtils() {
      babelHelpers.classCallCheck(this, LHPolicyLicenseUtils);
    }

    babelHelpers.createClass(LHPolicyLicenseUtils, null, [{
      key: "GexPolicyLicenseUrl",
      value: function GexPolicyLicenseUrl(urls) {
        return {
          licenseUrl: urls['licenseUrl_' + _LHCommonFunction.LHCommonLocalizableString.language],
          policyUrl: urls['policyUrl_' + _LHCommonFunction.LHCommonLocalizableString.language]
        };
      }
    }]);
    return LHPolicyLicenseUtils;
  }();

  exports.default = LHPolicyLicenseUtils;
},17,[3],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/PolicyLicenseUtils/LHPolicyLicenseUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _miot = _require(_dependencyMap[0], "miot");

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var baseKey = 'privacyProtocolCacheKey_';
  var privacyProtocolCacheKey = baseKey + _miot.Device.deviceID;

  var LHAuthorizationUtils = function () {
    function LHAuthorizationUtils() {
      babelHelpers.classCallCheck(this, LHAuthorizationUtils);
    }

    babelHelpers.createClass(LHAuthorizationUtils, null, [{
      key: "Authorization",
      value: function Authorization(params) {
        LHAuthorizationUtils.CheckAuthorized(params);
        return LHAuthorizationUtils.AuthorizationCancelListener();
      }
    }, {
      key: "AuthorizationCancelListener",
      value: function AuthorizationCancelListener() {
        return _miot.PackageEvent.packageAuthorizationCancel.addListener(function () {
          LHAuthorizationUtils.SavePrivacyProtocolKey(privacyProtocolCacheKey, false);
        });
      }
    }, {
      key: "CheckAuthorized",
      value: function CheckAuthorized(params) {
        _LHCommonFunction.LHMiServer.GetHostStorage(privacyProtocolCacheKey).then(function (value) {
          if (value) {
            if (typeof params.authorizationSucc === 'function') params.authorizationSucc();
          } else {
            LHAuthorizationUtils.OpenPrivacyLicense(params);
          }
        });
      }
    }, {
      key: "OpenPrivacyLicense",
      value: function OpenPrivacyLicense(params) {
        _LHCommonFunction.LHMiServer.OpenPrivacyLicense(params.licenseTitle, params.licenseUrl, params.policyTitle, params.policyUrl).then(function (result) {
          if (result) {
            LHAuthorizationUtils.SavePrivacyProtocolKey(privacyProtocolCacheKey, true, params.authorizationSucc);
          }
        });
      }
    }, {
      key: "SavePrivacyProtocolKey",
      value: function SavePrivacyProtocolKey(key, status, success) {
        _LHCommonFunction.LHMiServer.SetHostStorage(key, status);

        if (typeof success === 'function') success();
      }
    }]);
    return LHAuthorizationUtils;
  }();

  exports.default = LHAuthorizationUtils;
},18,[147,3],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/Authorization/LHAuthorizationUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.deepCompare = deepCompare;
  var maxDep = 6;
  var jsType = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'];
  var dUtil = {};

  var _loop = function _loop(i) {
    dUtil['is' + jsType[i]] = function (obj) {
      return Object.prototype.toString.call(obj) === '[object ' + jsType[i] + ']';
    };
  };

  for (var i = 0; i < jsType.length; i += 1) {
    _loop(i);
  }

  function skipKeys(key) {
    var keyMaps = {
      $$typeof: 1,
      _owner: 1,
      _store: 1,
      _self: 1,
      _source: 1
    };

    if (keyMaps[key]) {
      return true;
    }

    return false;
  }

  function deepEqual(objA, objB, depth) {
    if (depth > maxDep) {
      return false;
    }

    depth += 1;

    if (!dUtil.isObject(objA) && !dUtil.isArray(objB)) {
      if (!valCompare(objA, objB)) {
        return false;
      }
    }

    var keysA = Object.keys(objA || {});
    var keysB = Object.keys(objB || {});

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (var i = 0; i < keysA.length; i += 1) {
      var comPareValA = objA[keysA[i]];
      var comPareValB = objB[keysB[i]];

      if (keysA[0] === '$$typeof' && keysA[i] === 'children') {
        return true;
      } else if (keysA[0] === '$$typeof' && skipKeys(keysA[i])) {
        continue;
      }

      if (!objB.hasOwnProperty(keysA[i])) {
        return false;
      }

      if (!valCompare(comPareValA, comPareValB, depth)) {
        return false;
      }
    }

    return true;
  }

  function valCompare(valA, valB, depth) {
    if (dUtil.isFunction(valA)) {
      if (valA.hasOwnProperty('name') && valB.hasOwnProperty('name') && valA.name === valB.name) {
        return true;
      }

      return false;
    }

    if (dUtil.isString(valA) || dUtil.isNumber(valA) || dUtil.isBoolean(valA)) {
      if (valA !== valB) {
        return false;
      }

      return true;
    }

    if (dUtil.isDate(valA)) {
      if (valA.getTime() !== valB.getTime()) {
        return false;
      }

      return true;
    }

    if (dUtil.isObject(valA) || dUtil.isArray(valA)) {
      return deepEqual(valA, valB, depth);
    }

    if (valA !== valB) {
      return false;
    }

    return true;
  }

  function deepCompare(instance, nextProps, nextState) {
    var result = !deepEqual(instance.props, nextProps, 1) || !deepEqual(instance.state, nextState, 1);
    return result;
  }

  function shouldComponentUpdate(nextProps, nextState) {
    return deepCompare(this, nextProps, nextState);
  }

  function LHPureRenderDecorator(component) {
    component.prototype.shouldComponentUpdate = shouldComponentUpdate;
    return component;
  }

  exports.default = LHPureRenderDecorator;
},19,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/PureRenderDecorator/LHPureRenderDecorator.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var LHDialogUtils = function () {
    function LHDialogUtils() {
      babelHelpers.classCallCheck(this, LHDialogUtils);
    }

    babelHelpers.createClass(LHDialogUtils, null, [{
      key: "MessageDialogShow",
      value: function MessageDialogShow(config) {
        _reactNative.DeviceEventEmitter.emit('LHMessageDialog', babelHelpers.extends({
          visible: true
        }, config));
      }
    }, {
      key: "MessageDialogHide",
      value: function MessageDialogHide() {
        _reactNative.DeviceEventEmitter.emit('LHMessageDialog', babelHelpers.extends({
          visible: false
        }));
      }
    }, {
      key: "LoadingDialogShow",
      value: function LoadingDialogShow(config) {
        _reactNative.DeviceEventEmitter.emit('LHLoadingDialog', babelHelpers.extends({
          visible: true
        }, config));
      }
    }, {
      key: "LoadingDialogHide",
      value: function LoadingDialogHide() {
        _reactNative.DeviceEventEmitter.emit('LHLoadingDialog', babelHelpers.extends({
          visible: false
        }));
      }
    }, {
      key: "InputDialogShow",
      value: function InputDialogShow(config) {
        _reactNative.DeviceEventEmitter.emit('LHInputDialog', babelHelpers.extends({
          visible: true
        }, config));
      }
    }, {
      key: "ShowSingleChoseDialog",
      value: function ShowSingleChoseDialog(config) {
        _reactNative.DeviceEventEmitter.emit('SingleChoseDialog', babelHelpers.extends({
          visible: true
        }, config));
      }
    }, {
      key: "HideSingleChoseDialog",
      value: function HideSingleChoseDialog() {
        _reactNative.DeviceEventEmitter.emit('SingleChoseDialog', babelHelpers.extends({
          visible: false
        }));
      }
    }]);
    return LHDialogUtils;
  }();

  exports.default = LHDialogUtils;
},20,[148],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/DialogUtils/LHDialogUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var LHDebugConfig = function () {
    function LHDebugConfig() {
      babelHelpers.classCallCheck(this, LHDebugConfig);
    }

    babelHelpers.createClass(LHDebugConfig, null, [{
      key: "OffDebug",
      value: function OffDebug(isOff) {
        var off = isOff || !__DEV__;

        if (off) {
          global.console = {
            info: function info() {},
            log: function log() {},
            warn: function warn() {},
            debug: function debug() {},
            error: function error() {}
          };
        }
      }
    }]);
    return LHDebugConfig;
  }();

  exports.default = LHDebugConfig;
},21,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Config/DebugConfig/LHDebugConfig.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _miot = _require(_dependencyMap[0], "miot");

  var _Bluetooth = _require(_dependencyMap[1], "miot/Bluetooth");

  var _Bluetooth2 = babelHelpers.interopRequireDefault(_Bluetooth);

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var LHBluetoothUtils = function () {
    babelHelpers.createClass(LHBluetoothUtils, null, [{
      key: "ActiveCallback",
      value: function ActiveCallback(callbacks, res) {
        for (var i = 0, len = callbacks.length; i < len; i += 1) {
          if (typeof callbacks[i] === 'function') callbacks[i](res);
        }
      }
    }, {
      key: "getRemainList",
      value: function getRemainList(list, index) {
        var result = [];

        for (var i = index, len = list.length; i < len; i += 1) {
          result.push(list[i]);
        }

        return result;
      }
    }]);

    function LHBluetoothUtils(config) {
      babelHelpers.classCallCheck(this, LHBluetoothUtils);
      babelHelpers.extends(this, config || {});
      this.Queue = [];
      this.reportQueue = [];
      this.BluetoothLE = _miot.Device.getBluetoothLE();
      this.charactersObject = {};
      this.initListener();
    }

    babelHelpers.createClass(LHBluetoothUtils, [{
      key: "addTaskToList",
      value: function addTaskToList(startIndex, task, callback) {
        var list = LHBluetoothUtils.getRemainList(this.Queue, startIndex);

        var index = _LHCommonFunction.CommonMethod.Find(list, 'cmds', task.cmds);

        if (index > -1) {
          if (this.Queue[startIndex + index].data === task.data) {
            this.Queue[startIndex + index].callbacks.push(callback);
          } else {
            this.addTaskToList(startIndex + index + 1, task, callback);
          }
        } else {
          this.Queue.push(babelHelpers.extends({
            isLoading: false,
            callbacks: [callback],
            timeout: task.nextLongReply ? 30000 : 5000
          }, task));
        }
      }
    }, {
      key: "send",
      value: function send(params, callback) {
        this.addTaskToList(0, params, callback);
        console.log(this.Queue);
        this.next();
      }
    }, {
      key: "addReportListener",
      value: function addReportListener(cmds, callback) {
        var _this = this;

        var cmdsArray = cmds.split(',');

        for (var i = 0, len = cmdsArray.length; i < len; i += 1) {
          var index = _LHCommonFunction.CommonMethod.Find(this.reportQueue, 'cmds', cmdsArray[i]);

          if (index > -1) {
            this.reportQueue[index].callbacks.push(callback);
          } else {
            this.reportQueue.push({
              cmds: cmdsArray[i],
              callbacks: [callback]
            });
          }
        }

        return {
          remove: function remove() {
            for (var _i = 0, _len = cmdsArray.length; _i < _len; _i += 1) {
              var rIndex = _LHCommonFunction.CommonMethod.Find(_this.reportQueue, 'cmds', cmdsArray[_i]);

              if (rIndex > -1) {
                var callbackIndex = _this.reportQueue[rIndex].callbacks.indexOf(callback);

                if (callbackIndex > -1) {
                  _this.reportQueue[rIndex].callbacks.splice(callbackIndex, 1);

                  if (_this.reportQueue[rIndex].callbacks.length === 0) _this.reportQueue.splice(rIndex, 1);
                }
              }
            }
          }
        };
      }
    }, {
      key: "next",
      value: function next() {
        var _this2 = this;

        if (this.Queue.length === 0) return null;
        var item = this.Queue[0];
        if (item.isLoading) return null;
        item.isLoading = true;
        var msg = item.cmds + item.data || '';
        msg += _LHCommonFunction.CommonMethod.CRC16String(msg);

        if (!item.noEncrypt) {
          var mianMsg = msg.substring(0, 2);
          var decryptedMsg = msg.substring(2);
          var isOta = item.isOta;
          console.log('加密前发送的数据：' + msg);
          this.encryptMessageXiaoMiBLE(decryptedMsg, function (data) {
            console.log('加密后发送的数据：' + mianMsg + data);
            if (item.nextLongReply) _this2.longDataCache = [];

            _this2.writeWithoutResponse(mianMsg + data, isOta);
          });
        } else {
          console.log('加密前发送的数据：' + msg);
          if (item.nextLongReply) this.longDataCache = [];
          this.writeWithoutResponse(msg, item.isOta);
        }

        this.timeoutId = setTimeout(function () {
          _this2.timeoutId = null;
          if (_this2.Queue.length === 0) return null;
          LHBluetoothUtils.ActiveCallback(item.callbacks, {
            code: 9999,
            msg: 'timeout',
            data: ''
          });

          var index = _LHCommonFunction.CommonMethod.Find(_this2.Queue, 'cmds', item.cmds);

          if (index > -1) {
            _this2.Queue.splice(index, 1);
          }

          _this2.next();

          return null;
        }, item.timeout);
        return null;
      }
    }, {
      key: "encryptMessageXiaoMiBLE",
      value: function encryptMessageXiaoMiBLE(decryptedMsg, callback) {
        this.BluetoothLE.securityLock.encryptMessage(decryptedMsg).then(function (decrypted) {
          callback(decrypted);
        }).catch(function (err) {
          console.log(err);
        });
      }
    }, {
      key: "decryptMessageXiaoMiBLE",
      value: function decryptMessageXiaoMiBLE(decryptedMsg, callback) {
        this.BluetoothLE.securityLock.decryptMessage(decryptedMsg).then(function (decrypted) {
          callback(decrypted);
        }).catch(function (err) {
          console.log(err);
        });
      }
    }, {
      key: "disconnectCurrentDevice",
      value: function disconnectCurrentDevice(time) {
        this.BluetoothLE.disconnect(time || 0);
      }
    }, {
      key: "initListener",
      value: function initListener() {
        var _this3 = this;

        this.bluetoothSeviceDiscoveredListener = _miot.BluetoothEvent.bluetoothSeviceDiscovered.addListener(function (blut, services) {
          console.log('发现服务：');
          console.log(services);

          if (_this3.BluetoothLE.isConnected) {
            services.forEach(function (s) {
              if (s.UUID.toUpperCase().indexOf(_this3.LUMI_UUID_SERVICE) > -1) {
                s.startDiscoverCharacteristics(_this3.LUMI_WRITE_UUID_NOTIFY, _this3.LUMI_READ_UUID_NOTIFY, _this3.OTA_WRITE_UUID_NOTIFY, _this3.OTA_READ_UUID_NOTIFY);
              }
            });
          } else {}
        });
        this.bluetoothCharacteristicDiscoveredListener = _miot.BluetoothEvent.bluetoothCharacteristicDiscovered.addListener(function (bluetooth, service, characters) {
          console.log('发现特征值：');
          console.log(characters);

          if (_this3.BluetoothLE.isConnected) {
            characters.forEach(function (c) {
              var UUID = c.UUID.toUpperCase();

              if (UUID === _this3.LUMI_READ_UUID_NOTIFY || UUID === _this3.OTA_READ_UUID_NOTIFY) {
                c.setNotify(true);
              } else if (UUID === _this3.LUMI_WRITE_UUID_NOTIFY || UUID === _this3.OTA_WRITE_UUID_NOTIFY) {
                _this3.charactersObject[UUID] = c;
              }
            });

            if (_this3.loginCallback) {
              _this3.loginCallback({
                type: 'succ',
                data: '打开蓝牙通知成功'
              });

              _this3.loginCallback = null;
            }
          } else {}
        });
        this.bluetoothCharacteristicValueChangedListener = _miot.BluetoothEvent.bluetoothCharacteristicValueChanged.addListener(function (bluetooth, service, character, value) {
          console.log('监听UpdateValue蓝牙body:' + value);
          var msgData = value && value.toUpperCase();

          if (msgData && msgData.indexOf('3F') === 0) {
            var decryptedMsg = msgData.substring(6);
            var prevMsgData = msgData.substr(0, 6);

            if (_this3.longDataCache && _LHCommonFunction.CommonMethod.Find(_this3.longDataCache, 'prevMsgData', prevMsgData) === -1 && msgData.substr(4, 2) !== 'FF') {
              _this3.longDataCache.push({
                data: decryptedMsg,
                number: parseInt(msgData.substr(4, 2), 16),
                prevMsgData: prevMsgData
              });
            }

            if (msgData && msgData.substr(4, 2) === 'FF' && _this3.longDataCache && _LHCommonFunction.CommonMethod.Find(_this3.longDataCache, 'prevMsgData', prevMsgData) === -1) {
              _this3.longDataCache.push({
                data: decryptedMsg,
                number: parseInt(msgData.substr(4, 2), 16),
                prevMsgData: prevMsgData
              });

              _LHCommonFunction.CommonMethod.QuickSort(_this3.longDataCache, 'number');

              var encryptMsg = _this3.longDataCache.map(function (item) {
                return item.data;
              });

              console.log(encryptMsg.join(''));

              _this3.decryptMessageXiaoMiBLE(encryptMsg.join(''), function (data) {
                console.log(data);
                console.log(_this3.longPacketLength);

                if (data && data.length === _this3.longPacketLength) {
                  var index = _LHCommonFunction.CommonMethod.Find(_this3.Queue, 'nextLongReply', msgData.substring(0, 4));

                  if (index > -1) {
                    LHBluetoothUtils.ActiveCallback(_this3.Queue[index].callbacks, {
                      code: 0,
                      msg: 'succ',
                      data: data
                    });

                    _this3.Queue.splice(index, 1);

                    if (_this3.timeoutId) {
                      clearTimeout(_this3.timeoutId);
                    }

                    _this3.next();
                  }
                }
              });
            }
          } else {
            var mianCmd = msgData.substring(0, 2);

            var _decryptedMsg = msgData.substring(2);

            console.log('解密前的数据：' + msgData);

            _this3.decryptMessageXiaoMiBLE(_decryptedMsg, function (data) {
              var upperCaseData = data.toUpperCase();
              console.log('解密后的数据：' + upperCaseData);

              var index = _LHCommonFunction.CommonMethod.Find(_this3.Queue, 'replyCmds', mianCmd + upperCaseData.substring(0, 2));

              var reportIndex = _LHCommonFunction.CommonMethod.Find(_this3.reportQueue, 'cmds', mianCmd + upperCaseData.substring(0, 2));

              if (index > -1) {
                if (_this3.Queue[index].nextLongReply) {
                  _this3.longPacketLength = parseInt(_LHCommonFunction.CommonMethod.bigEndianStrToLittleEndianString(upperCaseData.substr(4, 4)), 16) * 2;

                  if (typeof _this3.Queue[index].shortCallback === 'function') {
                    _this3.Queue[index].shortCallback(_this3, upperCaseData);
                  }
                } else {
                  LHBluetoothUtils.ActiveCallback(_this3.Queue[index].callbacks, {
                    code: 0,
                    msg: 'succ',
                    data: upperCaseData
                  });

                  _this3.Queue.splice(index, 1);

                  if (_this3.timeoutId) {
                    clearTimeout(_this3.timeoutId);
                  }

                  _this3.next();
                }
              } else if (reportIndex > -1) {
                LHBluetoothUtils.ActiveCallback(_this3.reportQueue[reportIndex].callbacks, {
                  code: 0,
                  msg: 'succ',
                  data: upperCaseData
                });
              }
            });
          }
        });
      }
    }, {
      key: "loginXiaoMiBLE",
      value: function loginXiaoMiBLE(params, callback) {
        var _this4 = this;

        this.loginCallback = null;
        this.BluetoothLE.connect(params && params.type || 1, {
          timeout: params && params.timeout || 10000
        }).then(function (data) {
          console.log('connected', data);
          _this4.loginCallback = callback;

          _this4.BluetoothLE.startDiscoverServices(_this4.LUMI_UUID_SERVICE);
        }).catch(function (data) {
          callback(data);
        });
      }
    }, {
      key: "writeWithoutResponse",
      value: function writeWithoutResponse(value, isOta) {
        var charactersObject = this.charactersObject[isOta ? this.OTA_WRITE_UUID_NOTIFY : this.LUMI_WRITE_UUID_NOTIFY];
        if (charactersObject) charactersObject.writeWithoutResponse(value);
      }
    }, {
      key: "isEnabled",
      value: function isEnabled(callback) {
        _Bluetooth2.default.checkBluetoothIsEnabled().then(function (res) {
          callback(res);
        }).catch(function () {});
      }
    }]);
    return LHBluetoothUtils;
  }();

  exports.default = LHBluetoothUtils;
},22,[147,149,3],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/BluetoothUtils/LHBluetoothUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reactNativeRootToast = _require(_dependencyMap[0], "react-native-root-toast");

  var _reactNativeRootToast2 = babelHelpers.interopRequireDefault(_reactNativeRootToast);

  var _LHUiUtils = _require(_dependencyMap[1], "../UiUtils/LHUiUtils");

  var _LHUiUtils2 = babelHelpers.interopRequireDefault(_LHUiUtils);

  var LHToastUtils = function () {
    function LHToastUtils() {
      babelHelpers.classCallCheck(this, LHToastUtils);
    }

    babelHelpers.createClass(LHToastUtils, null, [{
      key: "showShortToast",
      value: function showShortToast(message, options) {
        _reactNativeRootToast2.default.show(message, babelHelpers.extends({
          visible: true,
          duration: _reactNativeRootToast2.default.durations.SHORT,
          position: _reactNativeRootToast2.default.positions.CENTER,
          textStyle: {
            fontFamily: _LHUiUtils2.default.FontFamilyDDINCondensed
          }
        }, options));
      }
    }, {
      key: "showLongToast",
      value: function showLongToast(message, options) {
        _reactNativeRootToast2.default.show(message, babelHelpers.extends({
          visible: true,
          duration: _reactNativeRootToast2.default.durations.LONG,
          position: _reactNativeRootToast2.default.positions.CENTER,
          textStyle: {
            fontFamily: _LHUiUtils2.default.FontFamilyDDINCondensed
          }
        }, options));
      }
    }]);
    return LHToastUtils;
  }();

  exports.default = LHToastUtils;
},23,[24,6],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/Utils/ToastUtils/LHToastUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ToastContainer = undefined;

  var _Toast = _require(_dependencyMap[0], "./lib/Toast");

  Object.keys(_Toast).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function get() {
        return _Toast[key];
      }
    });
  });

  var _Toast2 = babelHelpers.interopRequireDefault(_Toast);

  var _ToastContainer = _require(_dependencyMap[1], "./lib/ToastContainer");

  var _ToastContainer2 = babelHelpers.interopRequireDefault(_ToastContainer);

  exports.ToastContainer = _ToastContainer2.default;
  exports.default = _Toast2.default;
},24,[25,37],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-toast/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Manager = undefined;
    var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-toast/lib/Toast.js";

    var _react = _require(_dependencyMap[0], "react");

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactNative = _require(_dependencyMap[1], "react-native");

    var _reactNativeRootSiblings = _require(_dependencyMap[2], "react-native-root-siblings");

    var _reactNativeRootSiblings2 = babelHelpers.interopRequireDefault(_reactNativeRootSiblings);

    var _ToastContainer = _require(_dependencyMap[3], "./ToastContainer");

    var _ToastContainer2 = babelHelpers.interopRequireDefault(_ToastContainer);

    var Toast = function (_Component) {
        babelHelpers.inherits(Toast, _Component);

        function Toast() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Toast);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = Toast.__proto__ || Object.getPrototypeOf(Toast)).call.apply(_ref, [this].concat(args))), _this), _this._toast = null, _this.componentWillMount = function () {
                _this._toast = new _reactNativeRootSiblings2.default(_react2.default.createElement(_ToastContainer2.default, babelHelpers.extends({}, _this.props, {
                    duration: 0,
                    __source: {
                        fileName: _jsxFileName,
                        lineNumber: 36
                    }
                })));
            }, _this.componentWillReceiveProps = function (nextProps) {
                _this._toast.update(_react2.default.createElement(_ToastContainer2.default, babelHelpers.extends({}, nextProps, {
                    duration: 0,
                    __source: {
                        fileName: _jsxFileName,
                        lineNumber: 43
                    }
                })));
            }, _this.componentWillUnmount = function () {
                _this._toast.destroy();
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Toast, [{
            key: "render",
            value: function render() {
                return null;
            }
        }]);
        return Toast;
    }(_react.Component);

    Toast.displayName = 'Toast';
    Toast.propTypes = _ToastContainer2.default.propTypes;
    Toast.positions = _ToastContainer.positions;
    Toast.durations = _ToastContainer.durations;

    Toast.show = function (message) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
            position: _ToastContainer.positions.BOTTOM,
            duration: _ToastContainer.durations.SHORT
        };
        return new _reactNativeRootSiblings2.default(_react2.default.createElement(
            _ToastContainer2.default,
            babelHelpers.extends({}, options, {
                visible: true,
                __source: {
                    fileName: _jsxFileName,
                    lineNumber: 17
                }
            }),
            message
        ));
    };

    Toast.hide = function (toast) {
        if (toast instanceof _reactNativeRootSiblings2.default) {
            toast.destroy();
        } else {
            console.warn("Toast.hide expected a `RootSiblings` instance as argument.\nBut got `" + typeof toast + "` instead.");
        }
    };

    exports.Manager = _reactNativeRootSiblings2.default;
    exports.default = Toast;
},25,[150,148,26,37],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-toast/lib/Toast.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-siblings/index.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _staticContainer = _require(_dependencyMap[2], "static-container");

  var _staticContainer2 = babelHelpers.interopRequireDefault(_staticContainer);

  var _propTypes = _require(_dependencyMap[3], "prop-types");

  var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1
    }
  });

  var Provider = function (_Component) {
    babelHelpers.inherits(Provider, _Component);

    function Provider() {
      babelHelpers.classCallCheck(this, Provider);
      return babelHelpers.possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).apply(this, arguments));
    }

    babelHelpers.createClass(Provider, [{
      key: "getChildContext",
      value: function getChildContext() {
        return {
          store: this.props.store
        };
      }
    }, {
      key: "render",
      value: function render() {
        return this.props.children;
      }
    }]);
    return Provider;
  }(_react.Component);

  Provider.childContextTypes = {
    store: _propTypes2.default.shape({
      subscribe: _propTypes2.default.func.isRequired,
      dispatch: _propTypes2.default.func.isRequired,
      getState: _propTypes2.default.func.isRequired
    })
  };

  if (!global.__rootSiblingsInjected) {
    _reactNative.AppRegistry.setWrapperComponentProvider(function () {
      return function RootSiblingsWrapper(props) {
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: styles.container,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 34
            }
          },
          props.children,
          _react2.default.createElement(RootSiblings, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 36
            }
          })
        );
      };
    });

    global.__rootSiblingsInjected = true;
  }

  var uuid = 0;
  var triggers = [];

  var RootSiblings = function (_Component2) {
    babelHelpers.inherits(RootSiblings, _Component2);

    function RootSiblings(props) {
      babelHelpers.classCallCheck(this, RootSiblings);

      var _this2 = babelHelpers.possibleConstructorReturn(this, (RootSiblings.__proto__ || Object.getPrototypeOf(RootSiblings)).call(this, props));

      _this2._updatedSiblings = {};
      _this2._siblings = {};
      _this2._stores = {};

      _this2._update = function (id, element, callback, store) {
        var siblings = babelHelpers.extends({}, _this2._siblings);
        var stores = babelHelpers.extends({}, _this2._stores);

        if (siblings[id] && !element) {
          delete siblings[id];
          delete stores[id];
        } else if (element) {
          siblings[id] = element;
          stores[id] = store;
        }

        _this2._updatedSiblings[id] = true;
        _this2._siblings = siblings;
        _this2._stores = stores;

        _this2.forceUpdate(callback);
      };

      _this2._siblings = {};
      triggers.push(_this2._update);
      return _this2;
    }

    babelHelpers.createClass(RootSiblings, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        triggers.splice(triggers.indexOf(this._update), 1);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var siblings = this._siblings;
        var stores = this._stores;
        var elements = [];
        Object.keys(siblings).forEach(function (key) {
          var element = siblings[key];

          if (element) {
            var sibling = _react2.default.createElement(
              _staticContainer2.default,
              {
                key: "root-sibling-" + key,
                shouldUpdate: !!_this3._updatedSiblings[key],
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 85
                }
              },
              element
            );

            var store = stores[key];

            if (store) {
              elements.push(_react2.default.createElement(
                Provider,
                {
                  store: store,
                  key: "root-sibling-" + key + "-provider",
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 96
                  }
                },
                sibling
              ));
            } else {
              elements.push(sibling);
            }
          }
        });
        this._updatedSiblings = {};
        return elements;
      }
    }]);
    return RootSiblings;
  }(_react.Component);

  var RootSiblingManager = function RootSiblingManager(element, callback, store) {
    babelHelpers.classCallCheck(this, RootSiblingManager);
    var id = uuid++;

    function update(element, callback, store) {
      triggers.forEach(function (trigger) {
        trigger(id, element, callback, store);
      });
    }

    function destroy(callback) {
      triggers.forEach(function (trigger) {
        trigger(id, null, callback);
      });
    }

    update(element, callback, store);
    this.update = update;
    this.destroy = destroy;
  };

  exports.default = RootSiblingManager;
},26,[150,148,27,28],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-siblings/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react = _require(_dependencyMap[0], "react");

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _propTypes = _require(_dependencyMap[1], "prop-types");

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _class = function (_Component) {
        babelHelpers.inherits(_class, _Component);

        function _class() {
            babelHelpers.classCallCheck(this, _class);
            return babelHelpers.possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        babelHelpers.createClass(_class, [{
            key: "shouldComponentUpdate",
            value: function shouldComponentUpdate(nextProps) {
                return nextProps.shouldUpdate;
            }
        }, {
            key: "render",
            value: function render() {
                var child = this.props.children;
                return child === null || child === false ? null : _react.Children.only(child);
            }
        }]);
        return _class;
    }(_react.Component);

    _class.propTypes = {
        shouldUpdate: _propTypes2.default.bool.isRequired
    };
    exports.default = _class;
},27,[150,28],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/static-container/StaticContainer.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  if (process.env.NODE_ENV !== 'production') {
    var ReactIs = _require(_dependencyMap[0], 'react-is');

    var throwOnDirectAccess = true;
    module.exports = _require(_dependencyMap[1], './factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
  } else {
    module.exports = _require(_dependencyMap[2], './factoryWithThrowingShims')();
  }
},28,[29,32,36],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/prop-types/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  if (process.env.NODE_ENV === 'production') {
    module.exports = _require(_dependencyMap[0], './cjs/react-is.production.min.js');
  } else {
    module.exports = _require(_dependencyMap[1], './cjs/react-is.development.js');
  }
},29,[30,31],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-is/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  /** @license React v16.8.6
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: !0
  });
  var b = "function" === typeof Symbol && (typeof Symbol === "function" ? Symbol.for : "@@for"),
      c = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.element") : 60103,
      d = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.portal") : 60106,
      e = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.fragment") : 60107,
      f = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.strict_mode") : 60108,
      g = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.profiler") : 60114,
      h = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.provider") : 60109,
      k = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.context") : 60110,
      l = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.async_mode") : 60111,
      m = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.concurrent_mode") : 60111,
      n = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.forward_ref") : 60112,
      p = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.suspense") : 60113,
      q = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.memo") : 60115,
      r = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.lazy") : 60116;

  function t(a) {
    if ("object" === typeof a && null !== a) {
      var u = a.$$typeof;

      switch (u) {
        case c:
          switch (a = a.type, a) {
            case l:
            case m:
            case e:
            case g:
            case f:
            case p:
              return a;

            default:
              switch (a = a && a.$$typeof, a) {
                case k:
                case n:
                case h:
                  return a;

                default:
                  return u;
              }

          }

        case r:
        case q:
        case d:
          return u;
      }
    }
  }

  function v(a) {
    return t(a) === m;
  }

  exports.typeOf = t;
  exports.AsyncMode = l;
  exports.ConcurrentMode = m;
  exports.ContextConsumer = k;
  exports.ContextProvider = h;
  exports.Element = c;
  exports.ForwardRef = n;
  exports.Fragment = e;
  exports.Lazy = r;
  exports.Memo = q;
  exports.Portal = d;
  exports.Profiler = g;
  exports.StrictMode = f;
  exports.Suspense = p;

  exports.isValidElementType = function (a) {
    return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || "object" === typeof a && null !== a && (a.$$typeof === r || a.$$typeof === q || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n);
  };

  exports.isAsyncMode = function (a) {
    return v(a) || t(a) === l;
  };

  exports.isConcurrentMode = v;

  exports.isContextConsumer = function (a) {
    return t(a) === k;
  };

  exports.isContextProvider = function (a) {
    return t(a) === h;
  };

  exports.isElement = function (a) {
    return "object" === typeof a && null !== a && a.$$typeof === c;
  };

  exports.isForwardRef = function (a) {
    return t(a) === n;
  };

  exports.isFragment = function (a) {
    return t(a) === e;
  };

  exports.isLazy = function (a) {
    return t(a) === r;
  };

  exports.isMemo = function (a) {
    return t(a) === q;
  };

  exports.isPortal = function (a) {
    return t(a) === d;
  };

  exports.isProfiler = function (a) {
    return t(a) === g;
  };

  exports.isStrictMode = function (a) {
    return t(a) === f;
  };

  exports.isSuspense = function (a) {
    return t(a) === p;
  };
},30,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-is/cjs/react-is.production.min.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  /** @license React v16.8.6
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */'use strict';

  if (process.env.NODE_ENV !== "production") {
    (function () {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true
      });
      var hasSymbol = typeof Symbol === 'function' && (typeof Symbol === "function" ? Symbol.for : "@@for");
      var REACT_ELEMENT_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.element') : 0xeac7;
      var REACT_PORTAL_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.portal') : 0xeaca;
      var REACT_FRAGMENT_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.fragment') : 0xeacb;
      var REACT_STRICT_MODE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.strict_mode') : 0xeacc;
      var REACT_PROFILER_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.profiler') : 0xead2;
      var REACT_PROVIDER_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.provider') : 0xeacd;
      var REACT_CONTEXT_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.context') : 0xeace;
      var REACT_ASYNC_MODE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.async_mode') : 0xeacf;
      var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.concurrent_mode') : 0xeacf;
      var REACT_FORWARD_REF_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.forward_ref') : 0xead0;
      var REACT_SUSPENSE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.suspense') : 0xead1;
      var REACT_MEMO_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.memo') : 0xead3;
      var REACT_LAZY_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.lazy') : 0xead4;

      function isValidElementType(type) {
        return typeof type === 'string' || typeof type === 'function' || type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
      }

      var lowPriorityWarning = function lowPriorityWarning() {};

      {
        var printWarning = function printWarning(format) {
          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var argIndex = 0;
          var message = 'Warning: ' + format.replace(/%s/g, function () {
            return args[argIndex++];
          });

          if (typeof console !== 'undefined') {
            console.warn(message);
          }

          try {
            throw new Error(message);
          } catch (x) {}
        };

        lowPriorityWarning = function lowPriorityWarning(condition, format) {
          if (format === undefined) {
            throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument');
          }

          if (!condition) {
            for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
              args[_key2 - 2] = arguments[_key2];
            }

            printWarning.apply(undefined, [format].concat(args));
          }
        };
      }
      var lowPriorityWarning$1 = lowPriorityWarning;

      function typeOf(object) {
        if (typeof object === 'object' && object !== null) {
          var $$typeof = object.$$typeof;

          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;

              switch (type) {
                case REACT_ASYNC_MODE_TYPE:
                case REACT_CONCURRENT_MODE_TYPE:
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                  return type;

                default:
                  var $$typeofType = type && type.$$typeof;

                  switch ($$typeofType) {
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;

                    default:
                      return $$typeof;
                  }

              }

            case REACT_LAZY_TYPE:
            case REACT_MEMO_TYPE:
            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }

        return undefined;
      }

      var AsyncMode = REACT_ASYNC_MODE_TYPE;
      var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;

      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true;
            lowPriorityWarning$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
          }
        }
        return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
      }

      function isConcurrentMode(object) {
        return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
      }

      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }

      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }

      function isElement(object) {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }

      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }

      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }

      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }

      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }

      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }

      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }

      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }

      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }

      exports.typeOf = typeOf;
      exports.AsyncMode = AsyncMode;
      exports.ConcurrentMode = ConcurrentMode;
      exports.ContextConsumer = ContextConsumer;
      exports.ContextProvider = ContextProvider;
      exports.Element = Element;
      exports.ForwardRef = ForwardRef;
      exports.Fragment = Fragment;
      exports.Lazy = Lazy;
      exports.Memo = Memo;
      exports.Portal = Portal;
      exports.Profiler = Profiler;
      exports.StrictMode = StrictMode;
      exports.Suspense = Suspense;
      exports.isValidElementType = isValidElementType;
      exports.isAsyncMode = isAsyncMode;
      exports.isConcurrentMode = isConcurrentMode;
      exports.isContextConsumer = isContextConsumer;
      exports.isContextProvider = isContextProvider;
      exports.isElement = isElement;
      exports.isForwardRef = isForwardRef;
      exports.isFragment = isFragment;
      exports.isLazy = isLazy;
      exports.isMemo = isMemo;
      exports.isPortal = isPortal;
      exports.isProfiler = isProfiler;
      exports.isStrictMode = isStrictMode;
      exports.isSuspense = isSuspense;
    })();
  }
},31,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-is/cjs/react-is.development.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var ReactIs = _require(_dependencyMap[0], 'react-is');

  var assign = _require(_dependencyMap[1], 'object-assign');

  var ReactPropTypesSecret = _require(_dependencyMap[2], './lib/ReactPropTypesSecret');

  var checkPropTypes = _require(_dependencyMap[3], './checkPropTypes');

  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  var printWarning = function printWarning() {};

  if (process.env.NODE_ENV !== 'production') {
    printWarning = function printWarning(text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        throw new Error(message);
      } catch (x) {}
    };
  }

  function emptyFunctionThatReturnsNull() {
    return null;
  }

  module.exports = function (isValidElement, throwOnDirectAccess) {
    var ITERATOR_SYMBOL = typeof Symbol === 'function' && (typeof Symbol === "function" ? Symbol.iterator : "@@iterator");
    var FAUX_ITERATOR_SYMBOL = '@@iterator';

    function getIteratorFn(maybeIterable) {
      var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);

      if (typeof iteratorFn === 'function') {
        return iteratorFn;
      }
    }

    var ANONYMOUS = '<<anonymous>>';
    var ReactPropTypes = {
      array: createPrimitiveTypeChecker('array'),
      bool: createPrimitiveTypeChecker('boolean'),
      func: createPrimitiveTypeChecker('function'),
      number: createPrimitiveTypeChecker('number'),
      object: createPrimitiveTypeChecker('object'),
      string: createPrimitiveTypeChecker('string'),
      symbol: createPrimitiveTypeChecker('symbol'),
      any: createAnyTypeChecker(),
      arrayOf: createArrayOfTypeChecker,
      element: createElementTypeChecker(),
      elementType: createElementTypeTypeChecker(),
      instanceOf: createInstanceTypeChecker,
      node: createNodeChecker(),
      objectOf: createObjectOfTypeChecker,
      oneOf: createEnumTypeChecker,
      oneOfType: createUnionTypeChecker,
      shape: createShapeTypeChecker,
      exact: createStrictShapeTypeChecker
    };

    function is(x, y) {
      if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
      } else {
        return x !== x && y !== y;
      }
    }

    function PropTypeError(message) {
      this.message = message;
      this.stack = '';
    }

    PropTypeError.prototype = Error.prototype;

    function createChainableTypeChecker(validate) {
      if (process.env.NODE_ENV !== 'production') {
        var manualPropTypeCallCache = {};
        var manualPropTypeWarningCount = 0;
      }

      function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
        componentName = componentName || ANONYMOUS;
        propFullName = propFullName || propName;

        if (secret !== ReactPropTypesSecret) {
          if (throwOnDirectAccess) {
            var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
            err.name = 'Invariant Violation';
            throw err;
          } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            var cacheKey = componentName + ':' + propName;

            if (!manualPropTypeCallCache[cacheKey] && manualPropTypeWarningCount < 3) {
              printWarning('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
              manualPropTypeCallCache[cacheKey] = true;
              manualPropTypeWarningCount++;
            }
          }
        }

        if (props[propName] == null) {
          if (isRequired) {
            if (props[propName] === null) {
              return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
            }

            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
          }

          return null;
        } else {
          return validate(props, propName, componentName, location, propFullName);
        }
      }

      var chainedCheckType = checkType.bind(null, false);
      chainedCheckType.isRequired = checkType.bind(null, true);
      return chainedCheckType;
    }

    function createPrimitiveTypeChecker(expectedType) {
      function validate(props, propName, componentName, location, propFullName, secret) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== expectedType) {
          var preciseType = getPreciseType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createAnyTypeChecker() {
      return createChainableTypeChecker(emptyFunctionThatReturnsNull);
    }

    function createArrayOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
        }

        var propValue = props[propName];

        if (!Array.isArray(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
        }

        for (var i = 0; i < propValue.length; i++) {
          var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);

          if (error instanceof Error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createElementTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        if (!isValidElement(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createElementTypeTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        if (!ReactIs.isValidElementType(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createInstanceTypeChecker(expectedClass) {
      function validate(props, propName, componentName, location, propFullName) {
        if (!(props[propName] instanceof expectedClass)) {
          var expectedClassName = expectedClass.name || ANONYMOUS;
          var actualClassName = getClassName(props[propName]);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createEnumTypeChecker(expectedValues) {
      if (!Array.isArray(expectedValues)) {
        if (process.env.NODE_ENV !== 'production') {
          if (arguments.length > 1) {
            printWarning('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
          } else {
            printWarning('Invalid argument supplied to oneOf, expected an array.');
          }
        }

        return emptyFunctionThatReturnsNull;
      }

      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        for (var i = 0; i < expectedValues.length; i++) {
          if (is(propValue, expectedValues[i])) {
            return null;
          }
        }

        var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
          var type = getPreciseType(value);

          if (type === 'symbol') {
            return String(value);
          }

          return value;
        });
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
      }

      return createChainableTypeChecker(validate);
    }

    function createObjectOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
        }

        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
        }

        for (var key in propValue) {
          if (has(propValue, key)) {
            var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);

            if (error instanceof Error) {
              return error;
            }
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createUnionTypeChecker(arrayOfTypeCheckers) {
      if (!Array.isArray(arrayOfTypeCheckers)) {
        process.env.NODE_ENV !== 'production' ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
        return emptyFunctionThatReturnsNull;
      }

      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];

        if (typeof checker !== 'function') {
          printWarning('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
          return emptyFunctionThatReturnsNull;
        }
      }

      function validate(props, propName, componentName, location, propFullName) {
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];

          if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
            return null;
          }
        }

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
      }

      return createChainableTypeChecker(validate);
    }

    function createNodeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        if (!isNode(props[propName])) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }

        for (var key in shapeTypes) {
          var checker = shapeTypes[key];

          if (!checker) {
            continue;
          }

          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);

          if (error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createStrictShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }

        var allKeys = assign({}, props[propName], shapeTypes);

        for (var key in allKeys) {
          var checker = shapeTypes[key];

          if (!checker) {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
          }

          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);

          if (error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function isNode(propValue) {
      switch (typeof propValue) {
        case 'number':
        case 'string':
        case 'undefined':
          return true;

        case 'boolean':
          return !propValue;

        case 'object':
          if (Array.isArray(propValue)) {
            return propValue.every(isNode);
          }

          if (propValue === null || isValidElement(propValue)) {
            return true;
          }

          var iteratorFn = getIteratorFn(propValue);

          if (iteratorFn) {
            var iterator = iteratorFn.call(propValue);
            var step;

            if (iteratorFn !== propValue.entries) {
              while (!(step = iterator.next()).done) {
                if (!isNode(step.value)) {
                  return false;
                }
              }
            } else {
              while (!(step = iterator.next()).done) {
                var entry = step.value;

                if (entry) {
                  if (!isNode(entry[1])) {
                    return false;
                  }
                }
              }
            }
          } else {
            return false;
          }

          return true;

        default:
          return false;
      }
    }

    function isSymbol(propType, propValue) {
      if (propType === 'symbol') {
        return true;
      }

      if (!propValue) {
        return false;
      }

      if (propValue['@@toStringTag'] === 'Symbol') {
        return true;
      }

      if (typeof Symbol === 'function' && propValue instanceof Symbol) {
        return true;
      }

      return false;
    }

    function getPropType(propValue) {
      var propType = typeof propValue;

      if (Array.isArray(propValue)) {
        return 'array';
      }

      if (propValue instanceof RegExp) {
        return 'object';
      }

      if (isSymbol(propType, propValue)) {
        return 'symbol';
      }

      return propType;
    }

    function getPreciseType(propValue) {
      if (typeof propValue === 'undefined' || propValue === null) {
        return '' + propValue;
      }

      var propType = getPropType(propValue);

      if (propType === 'object') {
        if (propValue instanceof Date) {
          return 'date';
        } else if (propValue instanceof RegExp) {
          return 'regexp';
        }
      }

      return propType;
    }

    function getPostfixForTypeWarning(value) {
      var type = getPreciseType(value);

      switch (type) {
        case 'array':
        case 'object':
          return 'an ' + type;

        case 'boolean':
        case 'date':
        case 'regexp':
          return 'a ' + type;

        default:
          return type;
      }
    }

    function getClassName(propValue) {
      if (!propValue.constructor || !propValue.constructor.name) {
        return ANONYMOUS;
      }

      return propValue.constructor.name;
    }

    ReactPropTypes.checkPropTypes = checkPropTypes;
    ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
},32,[29,33,34,35],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/prop-types/factoryWithTypeCheckers.js");
__d(function (global, _require, module, exports, _dependencyMap) {
	/*
 object-assign
 (c) Sindre Sorhus
 @license MIT
 */'use strict';

	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			var test1 = new String('abc');
			test1[5] = 'de';

			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			var test2 = {};

			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}

			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});

			if (order2.join('') !== '0123456789') {
				return false;
			}

			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});

			if (Object.keys(babelHelpers.extends({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);

				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};
},33,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/object-assign/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
  module.exports = ReactPropTypesSecret;
},34,[],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/prop-types/lib/ReactPropTypesSecret.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var printWarning = function printWarning() {};

  if (process.env.NODE_ENV !== 'production') {
    var ReactPropTypesSecret = _require(_dependencyMap[0], './lib/ReactPropTypesSecret');

    var loggedTypeFailures = {};
    var has = Function.call.bind(Object.prototype.hasOwnProperty);

    printWarning = function printWarning(text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        throw new Error(message);
      } catch (x) {}
    };
  }

  function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    if (process.env.NODE_ENV !== 'production') {
      for (var typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error;

          try {
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.');
              err.name = 'Invariant Violation';
              throw err;
            }

            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
          } catch (ex) {
            error = ex;
          }

          if (error && !(error instanceof Error)) {
            printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
          }

          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            loggedTypeFailures[error.message] = true;
            var stack = getStack ? getStack() : '';
            printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
          }
        }
      }
    }
  }

  checkPropTypes.resetWarningCache = function () {
    if (process.env.NODE_ENV !== 'production') {
      loggedTypeFailures = {};
    }
  };

  module.exports = checkPropTypes;
},35,[34],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/prop-types/checkPropTypes.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var ReactPropTypesSecret = _require(_dependencyMap[0], './lib/ReactPropTypesSecret');

  function emptyFunction() {}

  function emptyFunctionWithReset() {}

  emptyFunctionWithReset.resetWarningCache = emptyFunction;

  module.exports = function () {
    function shim(props, propName, componentName, location, propFullName, secret) {
      if (secret === ReactPropTypesSecret) {
        return;
      }

      var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
      err.name = 'Invariant Violation';
      throw err;
    }

    ;
    shim.isRequired = shim;

    function getShim() {
      return shim;
    }

    ;
    var ReactPropTypes = {
      array: shim,
      bool: shim,
      func: shim,
      number: shim,
      object: shim,
      string: shim,
      symbol: shim,
      any: shim,
      arrayOf: getShim,
      element: shim,
      elementType: shim,
      instanceOf: getShim,
      node: shim,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
},36,[34],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/prop-types/factoryWithThrowingShims.js");
__d(function (global, _require, module, exports, _dependencyMap) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.durations = exports.positions = undefined;
    var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-toast/lib/ToastContainer.js";

    var _react = _require(_dependencyMap[0], "react");

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _propTypes = _require(_dependencyMap[1], "prop-types");

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _reactNative = _require(_dependencyMap[2], "react-native");

    var TOAST_MAX_WIDTH = 0.8;
    var TOAST_ANIMATION_DURATION = 200;
    var positions = {
        TOP: 20,
        BOTTOM: -20,
        CENTER: 0
    };
    var durations = {
        LONG: 3500,
        SHORT: 2000
    };

    var styles = _reactNative.StyleSheet.create({
        defaultStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center'
        },
        containerStyle: {
            padding: 10,
            backgroundColor: '#000',
            opacity: 0.8,
            borderRadius: 5
        },
        shadowStyle: {
            shadowColor: '#000',
            shadowOffset: {
                width: 4,
                height: 4
            },
            shadowOpacity: 0.8,
            shadowRadius: 6,
            elevation: 10
        },
        textStyle: {
            fontSize: 16,
            color: '#fff',
            textAlign: 'center'
        }
    });

    var ToastContainer = function (_Component) {
        babelHelpers.inherits(ToastContainer, _Component);

        function ToastContainer() {
            babelHelpers.classCallCheck(this, ToastContainer);

            var _this = babelHelpers.possibleConstructorReturn(this, (ToastContainer.__proto__ || Object.getPrototypeOf(ToastContainer)).apply(this, arguments));

            _initialiseProps.call(_this);

            var window = _reactNative.Dimensions.get('window');

            _this.state = {
                visible: _this.props.visible,
                opacity: new _reactNative.Animated.Value(0),
                windowWidth: window.width,
                windowHeight: window.height,
                keyboardScreenY: window.height
            };
            return _this;
        }

        babelHelpers.createClass(ToastContainer, [{
            key: "componentWillMount",
            value: function componentWillMount() {
                _reactNative.Dimensions.addEventListener('change', this._windowChanged);

                if (this.props.keyboardAvoiding) {
                    _reactNative.Keyboard.addListener('keyboardDidChangeFrame', this._keyboardDidChangeFrame);
                }
            }
        }, {
            key: "render",
            value: function render() {
                var _this2 = this;

                var props = this.props;
                var windowWidth = this.state.windowWidth;
                var offset = props.position;
                var _state = this.state,
                    windowHeight = _state.windowHeight,
                    keyboardScreenY = _state.keyboardScreenY;
                var keyboardHeight = Math.max(windowHeight - keyboardScreenY, 0);
                var position = offset ? babelHelpers.defineProperty({}, offset < 0 ? 'bottom' : 'top', offset < 0 ? keyboardHeight - offset : offset) : {
                    top: 0,
                    bottom: keyboardHeight
                };
                return this.state.visible || this._animating ? _react2.default.createElement(
                    _reactNative.View,
                    {
                        style: [styles.defaultStyle, position],
                        pointerEvents: "box-none",
                        __source: {
                            fileName: _jsxFileName,
                            lineNumber: 225
                        }
                    },
                    _react2.default.createElement(
                        _reactNative.TouchableWithoutFeedback,
                        {
                            onPress: function onPress() {
                                typeof _this2.props.onPress === 'function' ? _this2.props.onPress() : null;
                                _this2.props.hideOnPress ? _this2._hide() : null;
                            },
                            __source: {
                                fileName: _jsxFileName,
                                lineNumber: 232
                            }
                        },
                        _react2.default.createElement(
                            _reactNative.Animated.View,
                            {
                                style: [styles.containerStyle, {
                                    marginHorizontal: windowWidth * ((1 - TOAST_MAX_WIDTH) / 2)
                                }, props.containerStyle, props.backgroundColor && {
                                    backgroundColor: props.backgroundColor
                                }, {
                                    opacity: this.state.opacity
                                }, props.shadow && styles.shadowStyle, props.shadowColor && {
                                    shadowColor: props.shadowColor
                                }],
                                pointerEvents: "none",
                                ref: function ref(ele) {
                                    return _this2._root = ele;
                                },
                                __source: {
                                    fileName: _jsxFileName,
                                    lineNumber: 238
                                }
                            },
                            _react2.default.createElement(
                                _reactNative.Text,
                                {
                                    style: [styles.textStyle, props.textStyle, props.textColor && {
                                        color: props.textColor
                                    }],
                                    __source: {
                                        fileName: _jsxFileName,
                                        lineNumber: 253
                                    }
                                },
                                this.props.children
                            )
                        )
                    )
                ) : null;
            }
        }]);
        return ToastContainer;
    }(_react.Component);

    ToastContainer.displayName = 'ToastContainer';
    ToastContainer.propTypes = babelHelpers.extends({}, _reactNative.ViewPropTypes, {
        containerStyle: _reactNative.ViewPropTypes.style,
        duration: _propTypes2.default.number,
        visible: _propTypes2.default.bool,
        position: _propTypes2.default.number,
        animation: _propTypes2.default.bool,
        shadow: _propTypes2.default.bool,
        keyboardAvoiding: _propTypes2.default.bool,
        backgroundColor: _propTypes2.default.string,
        opacity: _propTypes2.default.number,
        shadowColor: _propTypes2.default.string,
        textColor: _propTypes2.default.string,
        textStyle: _reactNative.Text.propTypes.style,
        delay: _propTypes2.default.number,
        hideOnPress: _propTypes2.default.bool,
        onPress: _propTypes2.default.func,
        onHide: _propTypes2.default.func,
        onHidden: _propTypes2.default.func,
        onShow: _propTypes2.default.func,
        onShown: _propTypes2.default.func
    });
    ToastContainer.defaultProps = {
        visible: false,
        duration: durations.SHORT,
        animation: true,
        shadow: true,
        position: positions.BOTTOM,
        opacity: 0.8,
        delay: 0,
        hideOnPress: true,
        keyboardAvoiding: true
    };

    var _initialiseProps = function _initialiseProps() {
        var _this3 = this;

        this.componentDidMount = function () {
            if (_this3.state.visible) {
                _this3._showTimeout = setTimeout(function () {
                    return _this3._show();
                }, _this3.props.delay);
            }
        };

        this.componentWillReceiveProps = function (nextProps) {
            if (nextProps.visible !== _this3.props.visible) {
                if (nextProps.visible) {
                    clearTimeout(_this3._showTimeout);
                    clearTimeout(_this3._hideTimeout);
                    _this3._showTimeout = setTimeout(function () {
                        return _this3._show();
                    }, _this3.props.delay);
                } else {
                    _this3._hide();
                }

                _this3.setState({
                    visible: nextProps.visible
                });
            }
        };

        this.componentWillUnmount = function () {
            _reactNative.Dimensions.removeEventListener('change', _this3._windowChanged);

            _reactNative.Keyboard.removeListener('keyboardDidChangeFrame', _this3._keyboardDidChangeFrame);

            _this3._hide();
        };

        this._animating = false;
        this._root = null;
        this._hideTimeout = null;
        this._showTimeout = null;
        this._keyboardHeight = 0;

        this._windowChanged = function (_ref2) {
            var window = _ref2.window;

            _this3.setState({
                windowWidth: window.width,
                windowHeight: window.height
            });
        };

        this._keyboardDidChangeFrame = function (_ref3) {
            var endCoordinates = _ref3.endCoordinates;

            _this3.setState({
                keyboardScreenY: endCoordinates.screenY
            });
        };

        this._show = function () {
            clearTimeout(_this3._showTimeout);

            if (!_this3._animating) {
                clearTimeout(_this3._hideTimeout);
                _this3._animating = true;

                _this3._root.setNativeProps({
                    pointerEvents: 'auto'
                });

                _this3.props.onShow && _this3.props.onShow(_this3.props.siblingManager);

                _reactNative.Animated.timing(_this3.state.opacity, {
                    toValue: _this3.props.opacity,
                    duration: _this3.props.animation ? TOAST_ANIMATION_DURATION : 0,
                    easing: _reactNative.Easing.out(_reactNative.Easing.ease)
                }).start(function (_ref4) {
                    var finished = _ref4.finished;

                    if (finished) {
                        _this3._animating = !finished;
                        _this3.props.onShown && _this3.props.onShown(_this3.props.siblingManager);

                        if (_this3.props.duration > 0) {
                            _this3._hideTimeout = setTimeout(function () {
                                return _this3._hide();
                            }, _this3.props.duration);
                        }
                    }
                });
            }
        };

        this._hide = function () {
            clearTimeout(_this3._showTimeout);
            clearTimeout(_this3._hideTimeout);

            if (!_this3._animating) {
                _this3._root.setNativeProps({
                    pointerEvents: 'none'
                });

                _this3.props.onHide && _this3.props.onHide(_this3.props.siblingManager);

                _reactNative.Animated.timing(_this3.state.opacity, {
                    toValue: 0,
                    duration: _this3.props.animation ? TOAST_ANIMATION_DURATION : 0,
                    easing: _reactNative.Easing.in(_reactNative.Easing.ease)
                }).start(function (_ref5) {
                    var finished = _ref5.finished;

                    if (finished) {
                        _this3._animating = false;
                        _this3.props.onHidden && _this3.props.onHidden(_this3.props.siblingManager);
                    }
                });
            }
        };
    };

    exports.default = ToastContainer;
    exports.positions = positions;
    exports.durations = durations;
},37,[150,28,148],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/node_modules/react-native-root-toast/lib/ToastContainer.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var _miot = _require(_dependencyMap[2], "miot");

  var LHElectricityDataManager = function (_React$Component) {
    babelHelpers.inherits(LHElectricityDataManager, _React$Component);

    function LHElectricityDataManager() {
      babelHelpers.classCallCheck(this, LHElectricityDataManager);
      return babelHelpers.possibleConstructorReturn(this, (LHElectricityDataManager.__proto__ || Object.getPrototypeOf(LHElectricityDataManager)).apply(this, arguments));
    }

    babelHelpers.createClass(LHElectricityDataManager, null, [{
      key: "fetchTodayElectricityData",
      value: function fetchTodayElectricityData() {
        var today = new Date();
        var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        var startDate = _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd', today.getTime());

        var endDate = _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd', tomorrow.getTime());

        return new Promise(function (resolve, reject) {
          LHElectricityDataManager.fetchElectricityData({
            start_date: startDate,
            end_date: endDate,
            data_type: 'stat_day'
          }).then(function (res) {
            if (!res.length) {
              resolve(0);
              return;
            }

            var strValue = res[0].value;

            if (/(\d+)/i.test(strValue)) {
              var numStr = RegExp(/(\d+)/i).exec(strValue)[0];
              resolve(Number(numStr));
              return;
            }

            resolve(0);
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "fetchMonthElectricityData",
      value: function fetchMonthElectricityData() {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        var startDate = _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd', firstDay.getTime());

        var endDate = _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd', lastDay.getTime());

        return new Promise(function (resolve, reject) {
          LHElectricityDataManager.fetchElectricityData({
            start_date: startDate,
            end_date: endDate,
            data_type: 'stat_month'
          }).then(function (res) {
            if (!res.length) {
              resolve(0);
              return;
            }

            var strValue = res[0].value;

            if (/(\d+)/i.test(strValue)) {
              var numStr = RegExp(/(\d+)/i).exec(strValue)[0];
              resolve(Number(numStr));
              return;
            }

            resolve(0);
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "fetchElectricityData",
      value: function fetchElectricityData(setting) {
        var params = {
          did: _miot.Device.deviceID,
          key: 'powerCost',
          data_type: 'stat_month',
          limit: 1000
        };
        return new Promise(function (resolve, reject) {
          var onSuccess = function onSuccess(res) {
            var result = res.result;
            resolve(result);
          };

          _LHCommonFunction.LHMiServer.GetUserStatistics(babelHelpers.extends({}, params, setting), onSuccess, reject);
        });
      }
    }, {
      key: "fetchPowerData",
      value: function fetchPowerData(setting) {
        var params = {
          did: _miot.Device.deviceID,
          key: 'load_power',
          data_type: 'stat_month',
          limit: 1000
        };
        return new Promise(function (resolve, reject) {
          var onSuccess = function onSuccess(res) {
            var result = res.result;
            resolve(result);
          };

          _LHCommonFunction.LHMiServer.GetUserStatistics(babelHelpers.extends({}, params, setting), onSuccess, reject);
        });
      }
    }, {
      key: "GetLatestLog",
      value: function GetLatestLog(setting) {
        var params = {
          did: _miot.Device.deviceID,
          type: 'event',
          time_start: 0,
          time_end: new Date().getTime() / 1000,
          limit: 1
        };
        return new Promise(function (resolve, reject) {
          var onSuccess = function onSuccess(res) {
            resolve(res[0]);
          };

          _LHCommonFunction.LHMiServer.GetDeviceData(babelHelpers.extends({}, params, setting), onSuccess, reject);
        });
      }
    }, {
      key: "formatElectricityNumber",
      value: function formatElectricityNumber(number) {
        function format(num) {
          var reg = /\d{1,3}(?=(\d{3})+$)/g;
          return (num + '').replace(reg, '$&,');
        }

        var formatNumber = function formatNumber(elec) {
          var fixNum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          if (Number(elec) > 1000) {
            return format(Number(elec).toFixed(0));
          }

          return Number(elec).toFixed(fixNum) + '';
        };

        return formatNumber(number, 1);
      }
    }, {
      key: "formatPowerNumber",
      value: function formatPowerNumber(number) {
        function format(num) {
          var reg = /\d{1,3}(?=(\d{3})+$)/g;
          return (num + '').replace(reg, '$&,');
        }

        var formatNumber = function formatNumber(elec) {
          var fixNum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          if (Number(elec) > 1000) {
            return format(Number(elec).toFixed(0));
          }

          return Number(elec).toFixed(fixNum) + '';
        };

        return formatNumber(number, 2);
      }
    }, {
      key: "fetchPressureDatas",
      value: function fetchPressureDatas(setting) {
        var params = {
          did: 'lumi.158d00036b2418',
          type: 'prop',
          key: 'pressure',
          limit: 9999
        };
        return new Promise(function (resolve, reject) {
          _LHCommonFunction.LHMiServer.GetDeviceData(babelHelpers.extends({}, params, setting), function (res) {
            resolve(res);
          }, function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "FetchHtData",
      value: function FetchHtData(setting) {
        var params = {
          did: 'lumi.158d00036b2418',
          type: 'prop',
          key: 'temperature',
          limit: 9999
        };
        return new Promise(function (resolve, reject) {
          Promise.all([_LHCommonFunction.LHMiServer.GetDeviceDataPromise(babelHelpers.extends({}, params, setting)), _LHCommonFunction.LHMiServer.GetDeviceDataPromise(babelHelpers.extends({}, params, setting, {
            key: 'humidity'
          }))]).then(function (res) {
            console.log(res);
            var data = LHElectricityDataManager.matchDatas(res[1], res[0]);
            console.log(data);
            resolve(data);
          }, function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "matchDatas",
      value: function matchDatas(humidityDatas, temperatureDatas) {
        var humidityArr = LHElectricityDataManager.initHumidityDatas(humidityDatas);
        var temperatureArr = LHElectricityDataManager.initTemperatureDatas(temperatureDatas);
        var datasArr = humidityArr.concat(temperatureArr);
        datasArr.sort(function (a, b) {
          return a.time - b.time;
        });
        datasArr = LHElectricityDataManager.clearRepeat(datasArr);
        datasArr = LHElectricityDataManager.dataCompletion(datasArr);
        return datasArr;
      }
    }, {
      key: "initHumidityDatas",
      value: function initHumidityDatas(humidityDatas) {
        var humidityArr = [];

        for (var i = 0; i < humidityDatas.length; i += 1) {
          var value = (JSON.parse(humidityDatas[i].value)[0] / 100).toFixed(1);
          humidityArr.push({
            time: humidityDatas[i].time,
            humidity: value,
            temperature: -1
          });
        }

        console.log(humidityArr);
        return humidityArr;
      }
    }, {
      key: "initTemperatureDatas",
      value: function initTemperatureDatas(temperatureDatas) {
        console.log(LHElectricityDataManager);
        var temperatureArr = [];

        for (var i = 0; i < temperatureDatas.length; i += 1) {
          var value = (JSON.parse(temperatureDatas[i].value)[0] / 100).toFixed(1);
          temperatureArr.push({
            time: temperatureDatas[i].time,
            temperature: value,
            humidity: -1
          });
        }

        return temperatureArr;
      }
    }, {
      key: "clearRepeat",
      value: function clearRepeat(datasArr) {
        console.log(LHElectricityDataManager);
        var arr = [];

        for (var i = 0; i < datasArr.length; i += 1) {
          var item = datasArr[i];
          var isRepead = false;

          for (var n = 0; n < arr.length; n += 1) {
            if (arr[n].time === item.time) {
              isRepead = true;

              if (item.temperature !== -1) {
                arr[n].temperature = item.temperature;
              }

              if (item.humidity !== -1) {
                arr[n].humidity = item.humidity;
              }
            }
          }

          if (!isRepead) {
            arr.push(item);
          }
        }

        return arr;
      }
    }, {
      key: "dataCompletion",
      value: function dataCompletion(datasArr) {
        console.log(LHElectricityDataManager);
        var arr = datasArr;

        for (var i = 0; i < arr.length; i += 1) {
          if (arr[i].temperature === -1) {
            if (i === 0) {
              arr[i].temperature = LHElectricityDataManager.rightUsedTemperatureData(i, arr) === null ? -1 : LHElectricityDataManager.rightUsedTemperatureData(i, arr).temperature;
            } else if (i === arr.length - 1) {
              arr[i].temperature = LHElectricityDataManager.leftUsedTemperatureData(i, arr) === null ? -1 : LHElectricityDataManager.leftUsedTemperatureData(i, arr).temperature;
            } else {
              var leftItem = LHElectricityDataManager.leftUsedTemperatureData(i, arr);
              var rightItem = LHElectricityDataManager.rightUsedTemperatureData(i, arr);

              if (leftItem === null && rightItem !== null) {
                arr[i].temperature = rightItem.temperature;
              } else if (leftItem !== null && rightItem === null) {
                arr[i].temperature = leftItem.temperature;
              } else if (leftItem !== null && rightItem !== null) {
                if (arr[i].time - leftItem.time > rightItem.time - arr[i].time) {
                  arr[i].temperature = rightItem.temperature;
                } else {
                  arr[i].temperature = leftItem.temperature;
                }
              }
            }
          }

          if (datasArr[i].humidity === -1) {
            if (i === 0) {
              arr[i].humidity = LHElectricityDataManager.rightUsedHumidityData(i, arr) === null ? -1 : LHElectricityDataManager.rightUsedHumidityData(i, arr).humidity;
            } else if (i === arr.length - 1) {
              arr[i].humidity = LHElectricityDataManager.leftUsedHumidityData(i, arr) === null ? -1 : LHElectricityDataManager.leftUsedHumidityData(i, arr).humidity;
            } else {
              var _leftItem = LHElectricityDataManager.leftUsedHumidityData(i, arr);

              var _rightItem = LHElectricityDataManager.rightUsedHumidityData(i, arr);

              if (_leftItem === null && _rightItem !== null) {
                arr[i].humidity = _rightItem.humidity;
              } else if (_leftItem !== null && _rightItem === null) {
                arr[i].humidity = _leftItem.humidity;
              } else if (_leftItem !== null && _rightItem !== null) {
                if (arr[i].time - _leftItem.time > _rightItem.time - arr[i].time) {
                  arr[i].humidity = _rightItem.humidity;
                } else {
                  arr[i].humidity = _leftItem.humidity;
                }
              }
            }
          }
        }

        return arr;
      }
    }, {
      key: "rightUsedTemperatureData",
      value: function rightUsedTemperatureData(index, dataArr) {
        console.log(LHElectricityDataManager);

        for (var i = index; i < dataArr.length; i += 1) {
          if (dataArr[i].temperature !== -1) {
            return dataArr[i];
          }
        }

        return null;
      }
    }, {
      key: "leftUsedTemperatureData",
      value: function leftUsedTemperatureData(index, dataArr) {
        console.log(LHElectricityDataManager);

        for (var i = index; i >= 0; i -= 1) {
          if (dataArr[i].temperature !== -1) {
            return dataArr[i];
          }
        }

        return null;
      }
    }, {
      key: "rightUsedHumidityData",
      value: function rightUsedHumidityData(index, dataArr) {
        console.log(LHElectricityDataManager);

        for (var i = index; i < dataArr.length; i += 1) {
          if (dataArr[i].humidity !== -1) {
            return dataArr[i];
          }
        }

        return null;
      }
    }, {
      key: "leftUsedHumidityData",
      value: function leftUsedHumidityData(index, dataArr) {
        console.log(LHElectricityDataManager);

        for (var i = index; i >= 0; i -= 1) {
          if (dataArr[i].humidity !== -1) {
            return dataArr[i];
          }
        }

        return null;
      }
    }]);
    return LHElectricityDataManager;
  }(_react2.default.Component);

  exports.default = LHElectricityDataManager;
},38,[150,3,147],"projects/com.lumi.plug/Modules/Mijia-CommonFunction-Modules/CommonMethod/LHElectricityDataManager.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/index.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _reactNavigation = _require(_dependencyMap[2], "react-navigation");

  var _reactRedux = _require(_dependencyMap[3], "react-redux");

  var _ui = _require(_dependencyMap[4], "miot/ui");

  var _LHCommonUI = _require(_dependencyMap[5], "LHCommonUI");

  var _Stores = _require(_dependencyMap[6], "./Redux/Stores");

  var _Stores2 = babelHelpers.interopRequireDefault(_Stores);

  var _LHMainPage = _require(_dependencyMap[7], "./LHMainPage");

  var _LHMainPage2 = babelHelpers.interopRequireDefault(_LHMainPage);

  var _LHSettingPage = _require(_dependencyMap[8], "./Page/SettingPage/LHSettingPage");

  var _LHSettingPage2 = babelHelpers.interopRequireDefault(_LHSettingPage);

  var _LHReplaceIconPage = _require(_dependencyMap[9], "./Page/ReplaceIconPage/LHReplaceIconPage");

  var _LHReplaceIconPage2 = babelHelpers.interopRequireDefault(_LHReplaceIconPage);

  var _LHPowerPage = _require(_dependencyMap[10], "./Page/PowerPage/LHPowerPage");

  var _LHPowerPage2 = babelHelpers.interopRequireDefault(_LHPowerPage);

  var _LHBatteryPage = _require(_dependencyMap[11], "./Page/BatteryPage/LHBatteryPage");

  var _LHBatteryPage2 = babelHelpers.interopRequireDefault(_LHBatteryPage);

  var _LHLogPage = _require(_dependencyMap[12], "./Page/LogPage/LHLogPage");

  var _LHLogPage2 = babelHelpers.interopRequireDefault(_LHLogPage);

  var RootStack = (0, _reactNavigation.createStackNavigator)({
    LHMainPage: _LHMainPage2.default,
    LHSettingPage: _LHSettingPage2.default,
    LHReplaceIconPage: _LHReplaceIconPage2.default,
    LHPowerPage: _LHPowerPage2.default,
    LHBatteryPage: _LHBatteryPage2.default,
    LHLogPage: _LHLogPage2.default,
    LHMoreSettingPage: _LHCommonUI.LHMoreSettingPage
  }, {
    headerMode: 'screen',
    initialRouteName: 'LHMainPage',
    navigationOptions: function navigationOptions(_ref) {
      var navigation = _ref.navigation;
      return {
        header: _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: navigation.state.params ? navigation.state.params.title : '',
          style: {
            backgroundColor: '#fff'
          },
          onPressLeft: function onPressLeft() {
            navigation.goBack();
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 34
          }
        })
      };
    }
  });
  var store = (0, _Stores2.default)();

  var App = function (_React$Component) {
    babelHelpers.inherits(App, _React$Component);

    function App(props, context) {
      babelHelpers.classCallCheck(this, App);

      var _this = babelHelpers.possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props, context));

      _this.state = {
        MessageDialogObject: {},
        LoadingDialogObject: {},
        InputDialogObject: {}
      };

      _this.bindListener();

      return _this;
    }

    babelHelpers.createClass(App, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.MessageDialogListener.remove();
        this.LoadingDialogListener.remove();
        this.InputDialogListener.remove();
      }
    }, {
      key: "bindListener",
      value: function bindListener() {
        var _this2 = this;

        this.MessageDialogListener = _reactNative.DeviceEventEmitter.addListener('LHMessageDialog', function (MessageDialogConfig) {
          _this2.setState({
            MessageDialogObject: MessageDialogConfig
          });
        });
        this.LoadingDialogListener = _reactNative.DeviceEventEmitter.addListener('LHLoadingDialog', function (LoadingDialogConfig) {
          _this2.setState({
            LoadingDialogObject: LoadingDialogConfig
          });
        });
        this.InputDialogListener = _reactNative.DeviceEventEmitter.addListener('LHInputDialog', function (InputDialogConfig) {
          _this2.setState({
            InputDialogObject: InputDialogConfig
          });
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var _state = this.state,
            MessageDialogObject = _state.MessageDialogObject,
            LoadingDialogObject = _state.LoadingDialogObject,
            InputDialogObject = _state.InputDialogObject;
        return _react2.default.createElement(
          _reactRedux.Provider,
          {
            store: store,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 93
            }
          },
          _react2.default.createElement(RootStack, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 94
            }
          }),
          _react2.default.createElement(_ui.LoadingDialog, {
            title: LoadingDialogObject.title,
            message: LoadingDialogObject.message,
            visible: LoadingDialogObject.visible,
            cancelable: LoadingDialogObject.cancelable || false,
            timeout: LoadingDialogObject.timeout || 30000,
            onDismiss: function onDismiss() {
              _this3.setState({
                LoadingDialogObject: babelHelpers.extends({}, LoadingDialogObject, {
                  visible: false
                })
              });
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 95
            }
          }),
          _react2.default.createElement(_ui.MessageDialog, {
            title: MessageDialogObject.title,
            message: MessageDialogObject.message,
            visible: MessageDialogObject.visible,
            confirm: MessageDialogObject.confirm,
            onConfirm: MessageDialogObject.onConfirm,
            cancel: MessageDialogObject.cancel,
            onCancel: MessageDialogObject.onCancel,
            cancelable: MessageDialogObject.cancelable || false,
            timeout: MessageDialogObject.timeout || 0,
            onDismiss: function onDismiss() {
              _this3.setState({
                MessageDialogObject: babelHelpers.extends({}, MessageDialogObject, {
                  visible: false
                })
              });
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 107
            }
          }),
          _react2.default.createElement(_ui.InputDialog, {
            title: InputDialogObject.title,
            message: InputDialogObject.message,
            defaultText: InputDialogObject.defaultText,
            placeholder: InputDialogObject.placeholder,
            singleLine: InputDialogObject.singleLine,
            visible: InputDialogObject.visible,
            confirm: InputDialogObject.confirm,
            onConfirm: InputDialogObject.onConfirm,
            cancel: InputDialogObject.cancel,
            onCancel: InputDialogObject.onCancel,
            cancelable: InputDialogObject.cancelable || false,
            timeout: InputDialogObject.timeout || 0,
            onDismiss: function onDismiss() {
              _this3.setState({
                InputDialogObject: babelHelpers.extends({}, InputDialogObject, {
                  visible: false
                })
              });
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 123
            }
          })
        );
      }
    }]);
    return App;
  }(_react2.default.Component);

  exports.default = App;
},39,[150,148,151,40,152,75,86,133,139,141,143,145,146],"projects/com.lumi.plug/Main/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;

  var _Provider = _interopRequireDefault(_require(_dependencyMap[1], "./components/Provider"));

  exports.Provider = _Provider.default;

  var _connectAdvanced = _interopRequireDefault(_require(_dependencyMap[2], "./components/connectAdvanced"));

  exports.connectAdvanced = _connectAdvanced.default;

  var _Context = _require(_dependencyMap[3], "./components/Context");

  exports.ReactReduxContext = _Context.ReactReduxContext;

  var _connect = _interopRequireDefault(_require(_dependencyMap[4], "./connect/connect"));

  exports.connect = _connect.default;
},40,[41,42,55,54,61],"projects/com.lumi.plug/node_modules/react-redux/lib/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  module.exports = _interopRequireDefault;
},41,[],"projects/com.lumi.plug/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireWildcard = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireWildcard");

  var _interopRequireDefault = _require(_dependencyMap[1], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.default = void 0;

  var _inheritsLoose2 = _interopRequireDefault(_require(_dependencyMap[2], "@babel/runtime/helpers/inheritsLoose"));

  var _react = _interopRequireWildcard(_require(_dependencyMap[3], "react"));

  var _propTypes = _interopRequireDefault(_require(_dependencyMap[4], "prop-types"));

  var _Context = _require(_dependencyMap[5], "./Context");

  var Provider = function (_Component) {
    (0, _inheritsLoose2.default)(Provider, _Component);

    function Provider(props) {
      var _this;

      _this = _Component.call(this, props) || this;
      var store = props.store;
      _this.state = {
        storeState: store.getState(),
        store: store
      };
      return _this;
    }

    var _proto = Provider.prototype;

    _proto.componentDidMount = function componentDidMount() {
      this._isMounted = true;
      this.subscribe();
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      if (this.unsubscribe) this.unsubscribe();
      this._isMounted = false;
    };

    _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
      if (this.props.store !== prevProps.store) {
        if (this.unsubscribe) this.unsubscribe();
        this.subscribe();
      }
    };

    _proto.subscribe = function subscribe() {
      var _this2 = this;

      var store = this.props.store;
      this.unsubscribe = store.subscribe(function () {
        var newStoreState = store.getState();

        if (!_this2._isMounted) {
          return;
        }

        _this2.setState(function (providerState) {
          if (providerState.storeState === newStoreState) {
            return null;
          }

          return {
            storeState: newStoreState
          };
        });
      });
      var postMountStoreState = store.getState();

      if (postMountStoreState !== this.state.storeState) {
        this.setState({
          storeState: postMountStoreState
        });
      }
    };

    _proto.render = function render() {
      var Context = this.props.context || _Context.ReactReduxContext;
      return _react.default.createElement(Context.Provider, {
        value: this.state
      }, this.props.children);
    };

    return Provider;
  }(_react.Component);

  Provider.propTypes = {
    store: _propTypes.default.shape({
      subscribe: _propTypes.default.func.isRequired,
      dispatch: _propTypes.default.func.isRequired,
      getState: _propTypes.default.func.isRequired
    }),
    context: _propTypes.default.object,
    children: _propTypes.default.any
  };
  var _default = Provider;
  exports.default = _default;
},42,[43,41,44,150,45,54],"projects/com.lumi.plug/node_modules/react-redux/lib/components/Provider.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

            if (desc.get || desc.set) {
              Object.defineProperty(newObj, key, desc);
            } else {
              newObj[key] = obj[key];
            }
          }
        }
      }

      newObj["default"] = obj;
      return newObj;
    }
  }

  module.exports = _interopRequireWildcard;
},43,[],"projects/com.lumi.plug/node_modules/@babel/runtime/helpers/interopRequireWildcard.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  module.exports = _inheritsLoose;
},44,[],"projects/com.lumi.plug/node_modules/@babel/runtime/helpers/inheritsLoose.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  if (process.env.NODE_ENV !== 'production') {
    var ReactIs = _require(_dependencyMap[0], 'react-is');

    var throwOnDirectAccess = true;
    module.exports = _require(_dependencyMap[1], './factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
  } else {
    module.exports = _require(_dependencyMap[2], './factoryWithThrowingShims')();
  }
},45,[46,49,53],"projects/com.lumi.plug/node_modules/prop-types/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  if (process.env.NODE_ENV === 'production') {
    module.exports = _require(_dependencyMap[0], './cjs/react-is.production.min.js');
  } else {
    module.exports = _require(_dependencyMap[1], './cjs/react-is.development.js');
  }
},46,[47,48],"projects/com.lumi.plug/node_modules/react-is/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  /** @license React v16.8.6
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: !0
  });
  var b = "function" === typeof Symbol && (typeof Symbol === "function" ? Symbol.for : "@@for"),
      c = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.element") : 60103,
      d = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.portal") : 60106,
      e = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.fragment") : 60107,
      f = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.strict_mode") : 60108,
      g = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.profiler") : 60114,
      h = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.provider") : 60109,
      k = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.context") : 60110,
      l = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.async_mode") : 60111,
      m = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.concurrent_mode") : 60111,
      n = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.forward_ref") : 60112,
      p = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.suspense") : 60113,
      q = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.memo") : 60115,
      r = b ? (typeof Symbol === "function" ? Symbol.for : "@@for")("react.lazy") : 60116;

  function t(a) {
    if ("object" === typeof a && null !== a) {
      var u = a.$$typeof;

      switch (u) {
        case c:
          switch (a = a.type, a) {
            case l:
            case m:
            case e:
            case g:
            case f:
            case p:
              return a;

            default:
              switch (a = a && a.$$typeof, a) {
                case k:
                case n:
                case h:
                  return a;

                default:
                  return u;
              }

          }

        case r:
        case q:
        case d:
          return u;
      }
    }
  }

  function v(a) {
    return t(a) === m;
  }

  exports.typeOf = t;
  exports.AsyncMode = l;
  exports.ConcurrentMode = m;
  exports.ContextConsumer = k;
  exports.ContextProvider = h;
  exports.Element = c;
  exports.ForwardRef = n;
  exports.Fragment = e;
  exports.Lazy = r;
  exports.Memo = q;
  exports.Portal = d;
  exports.Profiler = g;
  exports.StrictMode = f;
  exports.Suspense = p;

  exports.isValidElementType = function (a) {
    return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || "object" === typeof a && null !== a && (a.$$typeof === r || a.$$typeof === q || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n);
  };

  exports.isAsyncMode = function (a) {
    return v(a) || t(a) === l;
  };

  exports.isConcurrentMode = v;

  exports.isContextConsumer = function (a) {
    return t(a) === k;
  };

  exports.isContextProvider = function (a) {
    return t(a) === h;
  };

  exports.isElement = function (a) {
    return "object" === typeof a && null !== a && a.$$typeof === c;
  };

  exports.isForwardRef = function (a) {
    return t(a) === n;
  };

  exports.isFragment = function (a) {
    return t(a) === e;
  };

  exports.isLazy = function (a) {
    return t(a) === r;
  };

  exports.isMemo = function (a) {
    return t(a) === q;
  };

  exports.isPortal = function (a) {
    return t(a) === d;
  };

  exports.isProfiler = function (a) {
    return t(a) === g;
  };

  exports.isStrictMode = function (a) {
    return t(a) === f;
  };

  exports.isSuspense = function (a) {
    return t(a) === p;
  };
},47,[],"projects/com.lumi.plug/node_modules/react-is/cjs/react-is.production.min.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  /** @license React v16.8.6
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */'use strict';

  if (process.env.NODE_ENV !== "production") {
    (function () {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true
      });
      var hasSymbol = typeof Symbol === 'function' && (typeof Symbol === "function" ? Symbol.for : "@@for");
      var REACT_ELEMENT_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.element') : 0xeac7;
      var REACT_PORTAL_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.portal') : 0xeaca;
      var REACT_FRAGMENT_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.fragment') : 0xeacb;
      var REACT_STRICT_MODE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.strict_mode') : 0xeacc;
      var REACT_PROFILER_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.profiler') : 0xead2;
      var REACT_PROVIDER_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.provider') : 0xeacd;
      var REACT_CONTEXT_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.context') : 0xeace;
      var REACT_ASYNC_MODE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.async_mode') : 0xeacf;
      var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.concurrent_mode') : 0xeacf;
      var REACT_FORWARD_REF_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.forward_ref') : 0xead0;
      var REACT_SUSPENSE_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.suspense') : 0xead1;
      var REACT_MEMO_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.memo') : 0xead3;
      var REACT_LAZY_TYPE = hasSymbol ? (typeof Symbol === "function" ? Symbol.for : "@@for")('react.lazy') : 0xead4;

      function isValidElementType(type) {
        return typeof type === 'string' || typeof type === 'function' || type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
      }

      var lowPriorityWarning = function lowPriorityWarning() {};

      {
        var printWarning = function printWarning(format) {
          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var argIndex = 0;
          var message = 'Warning: ' + format.replace(/%s/g, function () {
            return args[argIndex++];
          });

          if (typeof console !== 'undefined') {
            console.warn(message);
          }

          try {
            throw new Error(message);
          } catch (x) {}
        };

        lowPriorityWarning = function lowPriorityWarning(condition, format) {
          if (format === undefined) {
            throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument');
          }

          if (!condition) {
            for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
              args[_key2 - 2] = arguments[_key2];
            }

            printWarning.apply(undefined, [format].concat(args));
          }
        };
      }
      var lowPriorityWarning$1 = lowPriorityWarning;

      function typeOf(object) {
        if (typeof object === 'object' && object !== null) {
          var $$typeof = object.$$typeof;

          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;

              switch (type) {
                case REACT_ASYNC_MODE_TYPE:
                case REACT_CONCURRENT_MODE_TYPE:
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                  return type;

                default:
                  var $$typeofType = type && type.$$typeof;

                  switch ($$typeofType) {
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;

                    default:
                      return $$typeof;
                  }

              }

            case REACT_LAZY_TYPE:
            case REACT_MEMO_TYPE:
            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }

        return undefined;
      }

      var AsyncMode = REACT_ASYNC_MODE_TYPE;
      var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;

      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true;
            lowPriorityWarning$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
          }
        }
        return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
      }

      function isConcurrentMode(object) {
        return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
      }

      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }

      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }

      function isElement(object) {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }

      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }

      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }

      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }

      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }

      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }

      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }

      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }

      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }

      exports.typeOf = typeOf;
      exports.AsyncMode = AsyncMode;
      exports.ConcurrentMode = ConcurrentMode;
      exports.ContextConsumer = ContextConsumer;
      exports.ContextProvider = ContextProvider;
      exports.Element = Element;
      exports.ForwardRef = ForwardRef;
      exports.Fragment = Fragment;
      exports.Lazy = Lazy;
      exports.Memo = Memo;
      exports.Portal = Portal;
      exports.Profiler = Profiler;
      exports.StrictMode = StrictMode;
      exports.Suspense = Suspense;
      exports.isValidElementType = isValidElementType;
      exports.isAsyncMode = isAsyncMode;
      exports.isConcurrentMode = isConcurrentMode;
      exports.isContextConsumer = isContextConsumer;
      exports.isContextProvider = isContextProvider;
      exports.isElement = isElement;
      exports.isForwardRef = isForwardRef;
      exports.isFragment = isFragment;
      exports.isLazy = isLazy;
      exports.isMemo = isMemo;
      exports.isPortal = isPortal;
      exports.isProfiler = isProfiler;
      exports.isStrictMode = isStrictMode;
      exports.isSuspense = isSuspense;
    })();
  }
},48,[],"projects/com.lumi.plug/node_modules/react-is/cjs/react-is.development.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var ReactIs = _require(_dependencyMap[0], 'react-is');

  var assign = _require(_dependencyMap[1], 'object-assign');

  var ReactPropTypesSecret = _require(_dependencyMap[2], './lib/ReactPropTypesSecret');

  var checkPropTypes = _require(_dependencyMap[3], './checkPropTypes');

  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  var printWarning = function printWarning() {};

  if (process.env.NODE_ENV !== 'production') {
    printWarning = function printWarning(text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        throw new Error(message);
      } catch (x) {}
    };
  }

  function emptyFunctionThatReturnsNull() {
    return null;
  }

  module.exports = function (isValidElement, throwOnDirectAccess) {
    var ITERATOR_SYMBOL = typeof Symbol === 'function' && (typeof Symbol === "function" ? Symbol.iterator : "@@iterator");
    var FAUX_ITERATOR_SYMBOL = '@@iterator';

    function getIteratorFn(maybeIterable) {
      var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);

      if (typeof iteratorFn === 'function') {
        return iteratorFn;
      }
    }

    var ANONYMOUS = '<<anonymous>>';
    var ReactPropTypes = {
      array: createPrimitiveTypeChecker('array'),
      bool: createPrimitiveTypeChecker('boolean'),
      func: createPrimitiveTypeChecker('function'),
      number: createPrimitiveTypeChecker('number'),
      object: createPrimitiveTypeChecker('object'),
      string: createPrimitiveTypeChecker('string'),
      symbol: createPrimitiveTypeChecker('symbol'),
      any: createAnyTypeChecker(),
      arrayOf: createArrayOfTypeChecker,
      element: createElementTypeChecker(),
      elementType: createElementTypeTypeChecker(),
      instanceOf: createInstanceTypeChecker,
      node: createNodeChecker(),
      objectOf: createObjectOfTypeChecker,
      oneOf: createEnumTypeChecker,
      oneOfType: createUnionTypeChecker,
      shape: createShapeTypeChecker,
      exact: createStrictShapeTypeChecker
    };

    function is(x, y) {
      if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
      } else {
        return x !== x && y !== y;
      }
    }

    function PropTypeError(message) {
      this.message = message;
      this.stack = '';
    }

    PropTypeError.prototype = Error.prototype;

    function createChainableTypeChecker(validate) {
      if (process.env.NODE_ENV !== 'production') {
        var manualPropTypeCallCache = {};
        var manualPropTypeWarningCount = 0;
      }

      function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
        componentName = componentName || ANONYMOUS;
        propFullName = propFullName || propName;

        if (secret !== ReactPropTypesSecret) {
          if (throwOnDirectAccess) {
            var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
            err.name = 'Invariant Violation';
            throw err;
          } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            var cacheKey = componentName + ':' + propName;

            if (!manualPropTypeCallCache[cacheKey] && manualPropTypeWarningCount < 3) {
              printWarning('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
              manualPropTypeCallCache[cacheKey] = true;
              manualPropTypeWarningCount++;
            }
          }
        }

        if (props[propName] == null) {
          if (isRequired) {
            if (props[propName] === null) {
              return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
            }

            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
          }

          return null;
        } else {
          return validate(props, propName, componentName, location, propFullName);
        }
      }

      var chainedCheckType = checkType.bind(null, false);
      chainedCheckType.isRequired = checkType.bind(null, true);
      return chainedCheckType;
    }

    function createPrimitiveTypeChecker(expectedType) {
      function validate(props, propName, componentName, location, propFullName, secret) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== expectedType) {
          var preciseType = getPreciseType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createAnyTypeChecker() {
      return createChainableTypeChecker(emptyFunctionThatReturnsNull);
    }

    function createArrayOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
        }

        var propValue = props[propName];

        if (!Array.isArray(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
        }

        for (var i = 0; i < propValue.length; i++) {
          var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);

          if (error instanceof Error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createElementTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        if (!isValidElement(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createElementTypeTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        if (!ReactIs.isValidElementType(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createInstanceTypeChecker(expectedClass) {
      function validate(props, propName, componentName, location, propFullName) {
        if (!(props[propName] instanceof expectedClass)) {
          var expectedClassName = expectedClass.name || ANONYMOUS;
          var actualClassName = getClassName(props[propName]);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createEnumTypeChecker(expectedValues) {
      if (!Array.isArray(expectedValues)) {
        if (process.env.NODE_ENV !== 'production') {
          if (arguments.length > 1) {
            printWarning('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
          } else {
            printWarning('Invalid argument supplied to oneOf, expected an array.');
          }
        }

        return emptyFunctionThatReturnsNull;
      }

      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];

        for (var i = 0; i < expectedValues.length; i++) {
          if (is(propValue, expectedValues[i])) {
            return null;
          }
        }

        var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
          var type = getPreciseType(value);

          if (type === 'symbol') {
            return String(value);
          }

          return value;
        });
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
      }

      return createChainableTypeChecker(validate);
    }

    function createObjectOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
        }

        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
        }

        for (var key in propValue) {
          if (has(propValue, key)) {
            var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);

            if (error instanceof Error) {
              return error;
            }
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createUnionTypeChecker(arrayOfTypeCheckers) {
      if (!Array.isArray(arrayOfTypeCheckers)) {
        process.env.NODE_ENV !== 'production' ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
        return emptyFunctionThatReturnsNull;
      }

      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];

        if (typeof checker !== 'function') {
          printWarning('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
          return emptyFunctionThatReturnsNull;
        }
      }

      function validate(props, propName, componentName, location, propFullName) {
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];

          if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
            return null;
          }
        }

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
      }

      return createChainableTypeChecker(validate);
    }

    function createNodeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        if (!isNode(props[propName])) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }

        for (var key in shapeTypes) {
          var checker = shapeTypes[key];

          if (!checker) {
            continue;
          }

          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);

          if (error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function createStrictShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);

        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }

        var allKeys = assign({}, props[propName], shapeTypes);

        for (var key in allKeys) {
          var checker = shapeTypes[key];

          if (!checker) {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
          }

          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);

          if (error) {
            return error;
          }
        }

        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function isNode(propValue) {
      switch (typeof propValue) {
        case 'number':
        case 'string':
        case 'undefined':
          return true;

        case 'boolean':
          return !propValue;

        case 'object':
          if (Array.isArray(propValue)) {
            return propValue.every(isNode);
          }

          if (propValue === null || isValidElement(propValue)) {
            return true;
          }

          var iteratorFn = getIteratorFn(propValue);

          if (iteratorFn) {
            var iterator = iteratorFn.call(propValue);
            var step;

            if (iteratorFn !== propValue.entries) {
              while (!(step = iterator.next()).done) {
                if (!isNode(step.value)) {
                  return false;
                }
              }
            } else {
              while (!(step = iterator.next()).done) {
                var entry = step.value;

                if (entry) {
                  if (!isNode(entry[1])) {
                    return false;
                  }
                }
              }
            }
          } else {
            return false;
          }

          return true;

        default:
          return false;
      }
    }

    function isSymbol(propType, propValue) {
      if (propType === 'symbol') {
        return true;
      }

      if (!propValue) {
        return false;
      }

      if (propValue['@@toStringTag'] === 'Symbol') {
        return true;
      }

      if (typeof Symbol === 'function' && propValue instanceof Symbol) {
        return true;
      }

      return false;
    }

    function getPropType(propValue) {
      var propType = typeof propValue;

      if (Array.isArray(propValue)) {
        return 'array';
      }

      if (propValue instanceof RegExp) {
        return 'object';
      }

      if (isSymbol(propType, propValue)) {
        return 'symbol';
      }

      return propType;
    }

    function getPreciseType(propValue) {
      if (typeof propValue === 'undefined' || propValue === null) {
        return '' + propValue;
      }

      var propType = getPropType(propValue);

      if (propType === 'object') {
        if (propValue instanceof Date) {
          return 'date';
        } else if (propValue instanceof RegExp) {
          return 'regexp';
        }
      }

      return propType;
    }

    function getPostfixForTypeWarning(value) {
      var type = getPreciseType(value);

      switch (type) {
        case 'array':
        case 'object':
          return 'an ' + type;

        case 'boolean':
        case 'date':
        case 'regexp':
          return 'a ' + type;

        default:
          return type;
      }
    }

    function getClassName(propValue) {
      if (!propValue.constructor || !propValue.constructor.name) {
        return ANONYMOUS;
      }

      return propValue.constructor.name;
    }

    ReactPropTypes.checkPropTypes = checkPropTypes;
    ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
},49,[46,50,51,52],"projects/com.lumi.plug/node_modules/prop-types/factoryWithTypeCheckers.js");
__d(function (global, _require, module, exports, _dependencyMap) {
	/*
 object-assign
 (c) Sindre Sorhus
 @license MIT
 */'use strict';

	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			var test1 = new String('abc');
			test1[5] = 'de';

			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			var test2 = {};

			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}

			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});

			if (order2.join('') !== '0123456789') {
				return false;
			}

			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});

			if (Object.keys(babelHelpers.extends({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);

				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};
},50,[],"projects/com.lumi.plug/node_modules/object-assign/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
  module.exports = ReactPropTypesSecret;
},51,[],"projects/com.lumi.plug/node_modules/prop-types/lib/ReactPropTypesSecret.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var printWarning = function printWarning() {};

  if (process.env.NODE_ENV !== 'production') {
    var ReactPropTypesSecret = _require(_dependencyMap[0], './lib/ReactPropTypesSecret');

    var loggedTypeFailures = {};
    var has = Function.call.bind(Object.prototype.hasOwnProperty);

    printWarning = function printWarning(text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        throw new Error(message);
      } catch (x) {}
    };
  }

  function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    if (process.env.NODE_ENV !== 'production') {
      for (var typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error;

          try {
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.');
              err.name = 'Invariant Violation';
              throw err;
            }

            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
          } catch (ex) {
            error = ex;
          }

          if (error && !(error instanceof Error)) {
            printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
          }

          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            loggedTypeFailures[error.message] = true;
            var stack = getStack ? getStack() : '';
            printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
          }
        }
      }
    }
  }

  checkPropTypes.resetWarningCache = function () {
    if (process.env.NODE_ENV !== 'production') {
      loggedTypeFailures = {};
    }
  };

  module.exports = checkPropTypes;
},52,[51],"projects/com.lumi.plug/node_modules/prop-types/checkPropTypes.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var ReactPropTypesSecret = _require(_dependencyMap[0], './lib/ReactPropTypesSecret');

  function emptyFunction() {}

  function emptyFunctionWithReset() {}

  emptyFunctionWithReset.resetWarningCache = emptyFunction;

  module.exports = function () {
    function shim(props, propName, componentName, location, propFullName, secret) {
      if (secret === ReactPropTypesSecret) {
        return;
      }

      var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
      err.name = 'Invariant Violation';
      throw err;
    }

    ;
    shim.isRequired = shim;

    function getShim() {
      return shim;
    }

    ;
    var ReactPropTypes = {
      array: shim,
      bool: shim,
      func: shim,
      number: shim,
      object: shim,
      string: shim,
      symbol: shim,
      any: shim,
      arrayOf: getShim,
      element: shim,
      elementType: shim,
      instanceOf: getShim,
      node: shim,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
},53,[51],"projects/com.lumi.plug/node_modules/prop-types/factoryWithThrowingShims.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.default = exports.ReactReduxContext = void 0;

  var _react = _interopRequireDefault(_require(_dependencyMap[1], "react"));

  var ReactReduxContext = _react.default.createContext(null);

  exports.ReactReduxContext = ReactReduxContext;
  var _default = ReactReduxContext;
  exports.default = _default;
},54,[41,150],"projects/com.lumi.plug/node_modules/react-redux/lib/components/Context.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireWildcard = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireWildcard");

  var _interopRequireDefault = _require(_dependencyMap[1], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.default = connectAdvanced;

  var _assertThisInitialized2 = _interopRequireDefault(_require(_dependencyMap[2], "@babel/runtime/helpers/assertThisInitialized"));

  var _inheritsLoose2 = _interopRequireDefault(_require(_dependencyMap[3], "@babel/runtime/helpers/inheritsLoose"));

  var _extends2 = _interopRequireDefault(_require(_dependencyMap[4], "@babel/runtime/helpers/extends"));

  var _objectWithoutPropertiesLoose2 = _interopRequireDefault(_require(_dependencyMap[5], "@babel/runtime/helpers/objectWithoutPropertiesLoose"));

  var _hoistNonReactStatics = _interopRequireDefault(_require(_dependencyMap[6], "hoist-non-react-statics"));

  var _invariant = _interopRequireDefault(_require(_dependencyMap[7], "invariant"));

  var _react = _interopRequireWildcard(_require(_dependencyMap[8], "react"));

  var _reactIs = _require(_dependencyMap[9], "react-is");

  var _Context = _require(_dependencyMap[10], "./Context");

  var stringifyComponent = function stringifyComponent(Comp) {
    try {
      return JSON.stringify(Comp);
    } catch (err) {
      return String(Comp);
    }
  };

  function connectAdvanced(selectorFactory, _ref) {
    if (_ref === void 0) {
      _ref = {};
    }

    var _ref2 = _ref,
        _ref2$getDisplayName = _ref2.getDisplayName,
        getDisplayName = _ref2$getDisplayName === void 0 ? function (name) {
      return "ConnectAdvanced(" + name + ")";
    } : _ref2$getDisplayName,
        _ref2$methodName = _ref2.methodName,
        methodName = _ref2$methodName === void 0 ? 'connectAdvanced' : _ref2$methodName,
        _ref2$renderCountProp = _ref2.renderCountProp,
        renderCountProp = _ref2$renderCountProp === void 0 ? undefined : _ref2$renderCountProp,
        _ref2$shouldHandleSta = _ref2.shouldHandleStateChanges,
        shouldHandleStateChanges = _ref2$shouldHandleSta === void 0 ? true : _ref2$shouldHandleSta,
        _ref2$storeKey = _ref2.storeKey,
        storeKey = _ref2$storeKey === void 0 ? 'store' : _ref2$storeKey,
        _ref2$withRef = _ref2.withRef,
        withRef = _ref2$withRef === void 0 ? false : _ref2$withRef,
        _ref2$forwardRef = _ref2.forwardRef,
        forwardRef = _ref2$forwardRef === void 0 ? false : _ref2$forwardRef,
        _ref2$context = _ref2.context,
        context = _ref2$context === void 0 ? _Context.ReactReduxContext : _ref2$context,
        connectOptions = (0, _objectWithoutPropertiesLoose2.default)(_ref2, ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"]);
    (0, _invariant.default)(renderCountProp === undefined, "renderCountProp is removed. render counting is built into the latest React dev tools profiling extension");
    (0, _invariant.default)(!withRef, 'withRef is removed. To access the wrapped instance, use a ref on the connected component');
    var customStoreWarningMessage = 'To use a custom Redux store for specific components,  create a custom React context with ' + "React.createContext(), and pass the context object to React Redux's Provider and specific components" + ' like:  <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' + 'You may also pass a {context : MyContext} option to connect';
    (0, _invariant.default)(storeKey === 'store', 'storeKey has been removed and does not do anything. ' + customStoreWarningMessage);
    var Context = context;
    return function wrapWithConnect(WrappedComponent) {
      if (process.env.NODE_ENV !== 'production') {
        (0, _invariant.default)((0, _reactIs.isValidElementType)(WrappedComponent), "You must pass a component to the function returned by " + (methodName + ". Instead received " + stringifyComponent(WrappedComponent)));
      }

      var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
      var displayName = getDisplayName(wrappedComponentName);
      var selectorFactoryOptions = (0, _extends2.default)({}, connectOptions, {
        getDisplayName: getDisplayName,
        methodName: methodName,
        renderCountProp: renderCountProp,
        shouldHandleStateChanges: shouldHandleStateChanges,
        storeKey: storeKey,
        displayName: displayName,
        wrappedComponentName: wrappedComponentName,
        WrappedComponent: WrappedComponent
      });
      var pure = connectOptions.pure;
      var OuterBaseComponent = _react.Component;

      if (pure) {
        OuterBaseComponent = _react.PureComponent;
      }

      function makeDerivedPropsSelector() {
        var lastProps;
        var lastState;
        var lastDerivedProps;
        var lastStore;
        var lastSelectorFactoryOptions;
        var sourceSelector;
        return function selectDerivedProps(state, props, store, selectorFactoryOptions) {
          if (pure && lastProps === props && lastState === state) {
            return lastDerivedProps;
          }

          if (store !== lastStore || lastSelectorFactoryOptions !== selectorFactoryOptions) {
            lastStore = store;
            lastSelectorFactoryOptions = selectorFactoryOptions;
            sourceSelector = selectorFactory(store.dispatch, selectorFactoryOptions);
          }

          lastProps = props;
          lastState = state;
          var nextProps = sourceSelector(state, props);
          lastDerivedProps = nextProps;
          return lastDerivedProps;
        };
      }

      function makeChildElementSelector() {
        var lastChildProps, lastForwardRef, lastChildElement, lastComponent;
        return function selectChildElement(WrappedComponent, childProps, forwardRef) {
          if (childProps !== lastChildProps || forwardRef !== lastForwardRef || lastComponent !== WrappedComponent) {
            lastChildProps = childProps;
            lastForwardRef = forwardRef;
            lastComponent = WrappedComponent;
            lastChildElement = _react.default.createElement(WrappedComponent, (0, _extends2.default)({}, childProps, {
              ref: forwardRef
            }));
          }

          return lastChildElement;
        };
      }

      var Connect = function (_OuterBaseComponent) {
        (0, _inheritsLoose2.default)(Connect, _OuterBaseComponent);

        function Connect(props) {
          var _this;

          _this = _OuterBaseComponent.call(this, props) || this;
          (0, _invariant.default)(forwardRef ? !props.wrapperProps[storeKey] : !props[storeKey], 'Passing redux store in props has been removed and does not do anything. ' + customStoreWarningMessage);
          _this.selectDerivedProps = makeDerivedPropsSelector();
          _this.selectChildElement = makeChildElementSelector();
          _this.indirectRenderWrappedComponent = _this.indirectRenderWrappedComponent.bind((0, _assertThisInitialized2.default)(_this));
          return _this;
        }

        var _proto = Connect.prototype;

        _proto.indirectRenderWrappedComponent = function indirectRenderWrappedComponent(value) {
          return this.renderWrappedComponent(value);
        };

        _proto.renderWrappedComponent = function renderWrappedComponent(value) {
          (0, _invariant.default)(value, "Could not find \"store\" in the context of " + ("\"" + displayName + "\". Either wrap the root component in a <Provider>, ") + "or pass a custom React context provider to <Provider> and the corresponding " + ("React context consumer to " + displayName + " in connect options."));
          var storeState = value.storeState,
              store = value.store;
          var wrapperProps = this.props;
          var forwardedRef;

          if (forwardRef) {
            wrapperProps = this.props.wrapperProps;
            forwardedRef = this.props.forwardedRef;
          }

          var derivedProps = this.selectDerivedProps(storeState, wrapperProps, store, selectorFactoryOptions);
          return this.selectChildElement(WrappedComponent, derivedProps, forwardedRef);
        };

        _proto.render = function render() {
          var ContextToUse = this.props.context && this.props.context.Consumer && (0, _reactIs.isContextConsumer)(_react.default.createElement(this.props.context.Consumer, null)) ? this.props.context : Context;
          return _react.default.createElement(ContextToUse.Consumer, null, this.indirectRenderWrappedComponent);
        };

        return Connect;
      }(OuterBaseComponent);

      Connect.WrappedComponent = WrappedComponent;
      Connect.displayName = displayName;

      if (forwardRef) {
        var forwarded = _react.default.forwardRef(function forwardConnectRef(props, ref) {
          return _react.default.createElement(Connect, {
            wrapperProps: props,
            forwardedRef: ref
          });
        });

        forwarded.displayName = displayName;
        forwarded.WrappedComponent = WrappedComponent;
        return (0, _hoistNonReactStatics.default)(forwarded, WrappedComponent);
      }

      return (0, _hoistNonReactStatics.default)(Connect, WrappedComponent);
    };
  }
},55,[43,41,56,44,57,58,59,60,150,46,54],"projects/com.lumi.plug/node_modules/react-redux/lib/components/connectAdvanced.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  module.exports = _assertThisInitialized;
},56,[],"projects/com.lumi.plug/node_modules/@babel/runtime/helpers/assertThisInitialized.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  function _extends() {
    module.exports = _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  module.exports = _extends;
},57,[],"projects/com.lumi.plug/node_modules/@babel/runtime/helpers/extends.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  module.exports = _objectWithoutPropertiesLoose;
},58,[],"projects/com.lumi.plug/node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js");
__d(function (global, _require, module, exports, _dependencyMap) {
    'use strict';

    var ReactIs = _require(_dependencyMap[0], 'react-is');

    var REACT_STATICS = {
        childContextTypes: true,
        contextType: true,
        contextTypes: true,
        defaultProps: true,
        displayName: true,
        getDefaultProps: true,
        getDerivedStateFromError: true,
        getDerivedStateFromProps: true,
        mixins: true,
        propTypes: true,
        type: true
    };
    var KNOWN_STATICS = {
        name: true,
        length: true,
        prototype: true,
        caller: true,
        callee: true,
        arguments: true,
        arity: true
    };
    var FORWARD_REF_STATICS = {
        '$$typeof': true,
        render: true,
        defaultProps: true,
        displayName: true,
        propTypes: true
    };
    var MEMO_STATICS = {
        '$$typeof': true,
        compare: true,
        defaultProps: true,
        displayName: true,
        propTypes: true,
        type: true
    };
    var TYPE_STATICS = {};
    TYPE_STATICS[ReactIs.ForwardRef] = FORWARD_REF_STATICS;

    function getStatics(component) {
        if (ReactIs.isMemo(component)) {
            return MEMO_STATICS;
        }

        return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
    }

    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = Object.prototype;

    function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
        if (typeof sourceComponent !== 'string') {
            if (objectPrototype) {
                var inheritedComponent = getPrototypeOf(sourceComponent);

                if (inheritedComponent && inheritedComponent !== objectPrototype) {
                    hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
                }
            }

            var keys = getOwnPropertyNames(sourceComponent);

            if (getOwnPropertySymbols) {
                keys = keys.concat(getOwnPropertySymbols(sourceComponent));
            }

            var targetStatics = getStatics(targetComponent);
            var sourceStatics = getStatics(sourceComponent);

            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];

                if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
                    var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

                    try {
                        defineProperty(targetComponent, key, descriptor);
                    } catch (e) {}
                }
            }

            return targetComponent;
        }

        return targetComponent;
    }

    module.exports = hoistNonReactStatics;
},59,[46],"projects/com.lumi.plug/node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  var invariant = function invariant(condition, format, a, b, c, d, e, f) {
    if (process.env.NODE_ENV !== 'production') {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    }

    if (!condition) {
      var error;

      if (format === undefined) {
        error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        error = new Error(format.replace(/%s/g, function () {
          return args[argIndex++];
        }));
        error.name = 'Invariant Violation';
      }

      error.framesToPop = 1;
      throw error;
    }
  };

  module.exports = invariant;
},60,[],"projects/com.lumi.plug/node_modules/invariant/browser.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.createConnect = createConnect;
  exports.default = void 0;

  var _extends2 = _interopRequireDefault(_require(_dependencyMap[1], "@babel/runtime/helpers/extends"));

  var _objectWithoutPropertiesLoose2 = _interopRequireDefault(_require(_dependencyMap[2], "@babel/runtime/helpers/objectWithoutPropertiesLoose"));

  var _connectAdvanced = _interopRequireDefault(_require(_dependencyMap[3], "../components/connectAdvanced"));

  var _shallowEqual = _interopRequireDefault(_require(_dependencyMap[4], "../utils/shallowEqual"));

  var _mapDispatchToProps = _interopRequireDefault(_require(_dependencyMap[5], "./mapDispatchToProps"));

  var _mapStateToProps = _interopRequireDefault(_require(_dependencyMap[6], "./mapStateToProps"));

  var _mergeProps = _interopRequireDefault(_require(_dependencyMap[7], "./mergeProps"));

  var _selectorFactory = _interopRequireDefault(_require(_dependencyMap[8], "./selectorFactory"));

  function match(arg, factories, name) {
    for (var i = factories.length - 1; i >= 0; i--) {
      var result = factories[i](arg);
      if (result) return result;
    }

    return function (dispatch, options) {
      throw new Error("Invalid value of type " + typeof arg + " for " + name + " argument when connecting component " + options.wrappedComponentName + ".");
    };
  }

  function strictEqual(a, b) {
    return a === b;
  }

  function createConnect(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$connectHOC = _ref.connectHOC,
        connectHOC = _ref$connectHOC === void 0 ? _connectAdvanced.default : _ref$connectHOC,
        _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
        mapStateToPropsFactories = _ref$mapStateToPropsF === void 0 ? _mapStateToProps.default : _ref$mapStateToPropsF,
        _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
        mapDispatchToPropsFactories = _ref$mapDispatchToPro === void 0 ? _mapDispatchToProps.default : _ref$mapDispatchToPro,
        _ref$mergePropsFactor = _ref.mergePropsFactories,
        mergePropsFactories = _ref$mergePropsFactor === void 0 ? _mergeProps.default : _ref$mergePropsFactor,
        _ref$selectorFactory = _ref.selectorFactory,
        selectorFactory = _ref$selectorFactory === void 0 ? _selectorFactory.default : _ref$selectorFactory;

    return function connect(mapStateToProps, mapDispatchToProps, mergeProps, _ref2) {
      if (_ref2 === void 0) {
        _ref2 = {};
      }

      var _ref3 = _ref2,
          _ref3$pure = _ref3.pure,
          pure = _ref3$pure === void 0 ? true : _ref3$pure,
          _ref3$areStatesEqual = _ref3.areStatesEqual,
          areStatesEqual = _ref3$areStatesEqual === void 0 ? strictEqual : _ref3$areStatesEqual,
          _ref3$areOwnPropsEqua = _ref3.areOwnPropsEqual,
          areOwnPropsEqual = _ref3$areOwnPropsEqua === void 0 ? _shallowEqual.default : _ref3$areOwnPropsEqua,
          _ref3$areStatePropsEq = _ref3.areStatePropsEqual,
          areStatePropsEqual = _ref3$areStatePropsEq === void 0 ? _shallowEqual.default : _ref3$areStatePropsEq,
          _ref3$areMergedPropsE = _ref3.areMergedPropsEqual,
          areMergedPropsEqual = _ref3$areMergedPropsE === void 0 ? _shallowEqual.default : _ref3$areMergedPropsE,
          extraOptions = (0, _objectWithoutPropertiesLoose2.default)(_ref3, ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"]);
      var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
      var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
      var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
      return connectHOC(selectorFactory, (0, _extends2.default)({
        methodName: 'connect',
        getDisplayName: function getDisplayName(name) {
          return "Connect(" + name + ")";
        },
        shouldHandleStateChanges: Boolean(mapStateToProps),
        initMapStateToProps: initMapStateToProps,
        initMapDispatchToProps: initMapDispatchToProps,
        initMergeProps: initMergeProps,
        pure: pure,
        areStatesEqual: areStatesEqual,
        areOwnPropsEqual: areOwnPropsEqual,
        areStatePropsEqual: areStatePropsEqual,
        areMergedPropsEqual: areMergedPropsEqual
      }, extraOptions));
    };
  }

  var _default = createConnect();

  exports.default = _default;
},61,[41,57,58,55,62,63,71,72,73],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/connect.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = shallowEqual;
  var hasOwn = Object.prototype.hasOwnProperty;

  function is(x, y) {
    if (x === y) {
      return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true;

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;

    for (var i = 0; i < keysA.length; i++) {
      if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }

    return true;
  }
},62,[],"projects/com.lumi.plug/node_modules/react-redux/lib/utils/shallowEqual.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.whenMapDispatchToPropsIsFunction = whenMapDispatchToPropsIsFunction;
  exports.whenMapDispatchToPropsIsMissing = whenMapDispatchToPropsIsMissing;
  exports.whenMapDispatchToPropsIsObject = whenMapDispatchToPropsIsObject;
  exports.default = void 0;

  var _redux = _require(_dependencyMap[0], "redux");

  var _wrapMapToProps = _require(_dependencyMap[1], "./wrapMapToProps");

  function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    return typeof mapDispatchToProps === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapDispatchToProps, 'mapDispatchToProps') : undefined;
  }

  function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    return !mapDispatchToProps ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
      return {
        dispatch: dispatch
      };
    }) : undefined;
  }

  function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
      return (0, _redux.bindActionCreators)(mapDispatchToProps, dispatch);
    }) : undefined;
  }

  var _default = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];
  exports.default = _default;
},63,[64,67],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/mapDispatchToProps.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopDefault(ex) {
    return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
  }

  var $$observable = _interopDefault(_require(_dependencyMap[0], 'symbol-observable'));

  var randomString = function randomString() {
    return Math.random().toString(36).substring(7).split('').join('.');
  };

  var ActionTypes = {
    INIT: "@@redux/INIT" + randomString(),
    REPLACE: "@@redux/REPLACE" + randomString(),
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
    }
  };

  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }

  function createStore(reducer, preloadedState, enhancer) {
    var _ref2;

    if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
      throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function');
    }

    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(createStore)(reducer, preloadedState);
    }

    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }

    var currentReducer = reducer;
    var currentState = preloadedState;
    var currentListeners = [];
    var nextListeners = currentListeners;
    var isDispatching = false;

    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
    }

    function getState() {
      if (isDispatching) {
        throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
      }

      return currentState;
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error('Expected the listener to be a function.');
      }

      if (isDispatching) {
        throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
      }

      var isSubscribed = true;
      ensureCanMutateNextListeners();
      nextListeners.push(listener);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
        }

        isSubscribed = false;
        ensureCanMutateNextListeners();
        var index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
      };
    }

    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
      }

      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
      }

      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      var listeners = currentListeners = nextListeners;

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }

      return action;
    }

    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== 'function') {
        throw new Error('Expected the nextReducer to be a function.');
      }

      currentReducer = nextReducer;
      dispatch({
        type: ActionTypes.REPLACE
      });
    }

    function observable() {
      var _ref;

      var outerSubscribe = subscribe;
      return _ref = {
        subscribe: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            throw new TypeError('Expected the observer to be an object.');
          }

          function observeState() {
            if (observer.next) {
              observer.next(getState());
            }
          }

          observeState();
          var unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe: unsubscribe
          };
        }
      }, _ref[$$observable] = function () {
        return this;
      }, _ref;
    }

    dispatch({
      type: ActionTypes.INIT
    });
    return _ref2 = {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    }, _ref2[$$observable] = observable, _ref2;
  }

  function warning(message) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }

    try {
      throw new Error(message);
    } catch (e) {}
  }

  function getUndefinedStateErrorMessage(key, action) {
    var actionType = action && action.type;
    var actionDescription = actionType && "action \"" + String(actionType) + "\"" || 'an action';
    return "Given " + actionDescription + ", reducer \"" + key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.";
  }

  function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
    var reducerKeys = Object.keys(reducers);
    var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

    if (reducerKeys.length === 0) {
      return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
    }

    if (!isPlainObject(inputState)) {
      return "The " + argumentName + " has unexpected type of \"" + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + "\". Expected argument to be an object with the following " + ("keys: \"" + reducerKeys.join('", "') + "\"");
    }

    var unexpectedKeys = Object.keys(inputState).filter(function (key) {
      return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
    });
    unexpectedKeys.forEach(function (key) {
      unexpectedKeyCache[key] = true;
    });
    if (action && action.type === ActionTypes.REPLACE) return;

    if (unexpectedKeys.length > 0) {
      return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
    }
  }

  function assertReducerShape(reducers) {
    Object.keys(reducers).forEach(function (key) {
      var reducer = reducers[key];
      var initialState = reducer(undefined, {
        type: ActionTypes.INIT
      });

      if (typeof initialState === 'undefined') {
        throw new Error("Reducer \"" + key + "\" returned undefined during initialization. " + "If the state passed to the reducer is undefined, you must " + "explicitly return the initial state. The initial state may " + "not be undefined. If you don't want to set a value for this reducer, " + "you can use null instead of undefined.");
      }

      if (typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined') {
        throw new Error("Reducer \"" + key + "\" returned undefined when probed with a random type. " + ("Don't try to handle " + ActionTypes.INIT + " or other actions in \"redux/*\" ") + "namespace. They are considered private. Instead, you must return the " + "current state for any unknown actions, unless it is undefined, " + "in which case you must return the initial state, regardless of the " + "action type. The initial state may not be undefined, but can be null.");
      }
    });
  }

  function combineReducers(reducers) {
    var reducerKeys = Object.keys(reducers);
    var finalReducers = {};

    for (var i = 0; i < reducerKeys.length; i++) {
      var key = reducerKeys[i];

      if (process.env.NODE_ENV !== 'production') {
        if (typeof reducers[key] === 'undefined') {
          warning("No reducer provided for key \"" + key + "\"");
        }
      }

      if (typeof reducers[key] === 'function') {
        finalReducers[key] = reducers[key];
      }
    }

    var finalReducerKeys = Object.keys(finalReducers);
    var unexpectedKeyCache;

    if (process.env.NODE_ENV !== 'production') {
      unexpectedKeyCache = {};
    }

    var shapeAssertionError;

    try {
      assertReducerShape(finalReducers);
    } catch (e) {
      shapeAssertionError = e;
    }

    return function combination(state, action) {
      if (state === void 0) {
        state = {};
      }

      if (shapeAssertionError) {
        throw shapeAssertionError;
      }

      if (process.env.NODE_ENV !== 'production') {
        var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);

        if (warningMessage) {
          warning(warningMessage);
        }
      }

      var hasChanged = false;
      var nextState = {};

      for (var _i = 0; _i < finalReducerKeys.length; _i++) {
        var _key = finalReducerKeys[_i];
        var reducer = finalReducers[_key];
        var previousStateForKey = state[_key];
        var nextStateForKey = reducer(previousStateForKey, action);

        if (typeof nextStateForKey === 'undefined') {
          var errorMessage = getUndefinedStateErrorMessage(_key, action);
          throw new Error(errorMessage);
        }

        nextState[_key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }

      return hasChanged ? nextState : state;
    };
  }

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      return dispatch(actionCreator.apply(this, arguments));
    };
  }

  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
      throw new Error("bindActionCreators expected an object or a function, instead received " + (actionCreators === null ? 'null' : typeof actionCreators) + ". " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
    }

    var keys = Object.keys(actionCreators);
    var boundActionCreators = {};

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var actionCreator = actionCreators[key];

      if (typeof actionCreator === 'function') {
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
      }
    }

    return boundActionCreators;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function compose() {
    for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    if (funcs.length === 0) {
      return function (arg) {
        return arg;
      };
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce(function (a, b) {
      return function () {
        return a(b.apply(void 0, arguments));
      };
    });
  }

  function applyMiddleware() {
    for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }

    return function (createStore) {
      return function () {
        var store = createStore.apply(void 0, arguments);

        var _dispatch = function dispatch() {
          throw new Error("Dispatching while constructing your middleware is not allowed. " + "Other middleware would not be applied to this dispatch.");
        };

        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch() {
            return _dispatch.apply(void 0, arguments);
          }
        };
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        _dispatch = compose.apply(void 0, chain)(store.dispatch);
        return _objectSpread({}, store, {
          dispatch: _dispatch
        });
      };
    };
  }

  function isCrushed() {}

  if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
    warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
  }

  exports.createStore = createStore;
  exports.combineReducers = combineReducers;
  exports.bindActionCreators = bindActionCreators;
  exports.applyMiddleware = applyMiddleware;
  exports.compose = compose;
  exports.__DO_NOT_USE__ActionTypes = ActionTypes;
},64,[65],"projects/com.lumi.plug/node_modules/redux/lib/redux.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ponyfill = _require(_dependencyMap[0], './ponyfill.js');

  var _ponyfill2 = _interopRequireDefault(_ponyfill);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }

  var root;

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof module !== 'undefined') {
    root = module;
  } else {
    root = Function('return this')();
  }

  var result = (0, _ponyfill2['default'])(root);
  exports['default'] = result;
},65,[66],"projects/com.lumi.plug/node_modules/symbol-observable/lib/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;

	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;

		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}

		return result;
	}

	;
},66,[],"projects/com.lumi.plug/node_modules/symbol-observable/lib/ponyfill.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.wrapMapToPropsConstant = wrapMapToPropsConstant;
  exports.getDependsOnOwnProps = getDependsOnOwnProps;
  exports.wrapMapToPropsFunc = wrapMapToPropsFunc;

  var _verifyPlainObject = _interopRequireDefault(_require(_dependencyMap[1], "../utils/verifyPlainObject"));

  function wrapMapToPropsConstant(getConstant) {
    return function initConstantSelector(dispatch, options) {
      var constant = getConstant(dispatch, options);

      function constantSelector() {
        return constant;
      }

      constantSelector.dependsOnOwnProps = false;
      return constantSelector;
    };
  }

  function getDependsOnOwnProps(mapToProps) {
    return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
  }

  function wrapMapToPropsFunc(mapToProps, methodName) {
    return function initProxySelector(dispatch, _ref) {
      var displayName = _ref.displayName;

      var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
        return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
      };

      proxy.dependsOnOwnProps = true;

      proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
        proxy.mapToProps = mapToProps;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
        var props = proxy(stateOrDispatch, ownProps);

        if (typeof props === 'function') {
          proxy.mapToProps = props;
          proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
          props = proxy(stateOrDispatch, ownProps);
        }

        if (process.env.NODE_ENV !== 'production') (0, _verifyPlainObject.default)(props, displayName, methodName);
        return props;
      };

      return proxy;
    };
  }
},67,[41,68],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/wrapMapToProps.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.default = verifyPlainObject;

  var _isPlainObject = _interopRequireDefault(_require(_dependencyMap[1], "./isPlainObject"));

  var _warning = _interopRequireDefault(_require(_dependencyMap[2], "./warning"));

  function verifyPlainObject(value, displayName, methodName) {
    if (!(0, _isPlainObject.default)(value)) {
      (0, _warning.default)(methodName + "() in " + displayName + " must return a plain object. Instead received " + value + ".");
    }
  }
},68,[41,69,70],"projects/com.lumi.plug/node_modules/react-redux/lib/utils/verifyPlainObject.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = isPlainObject;

  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = Object.getPrototypeOf(obj);
    if (proto === null) return true;
    var baseProto = proto;

    while (Object.getPrototypeOf(baseProto) !== null) {
      baseProto = Object.getPrototypeOf(baseProto);
    }

    return proto === baseProto;
  }
},69,[],"projects/com.lumi.plug/node_modules/react-redux/lib/utils/isPlainObject.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = warning;

  function warning(message) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }

    try {
      throw new Error(message);
    } catch (e) {}
  }
},70,[],"projects/com.lumi.plug/node_modules/react-redux/lib/utils/warning.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.whenMapStateToPropsIsFunction = whenMapStateToPropsIsFunction;
  exports.whenMapStateToPropsIsMissing = whenMapStateToPropsIsMissing;
  exports.default = void 0;

  var _wrapMapToProps = _require(_dependencyMap[0], "./wrapMapToProps");

  function whenMapStateToPropsIsFunction(mapStateToProps) {
    return typeof mapStateToProps === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapStateToProps, 'mapStateToProps') : undefined;
  }

  function whenMapStateToPropsIsMissing(mapStateToProps) {
    return !mapStateToProps ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function () {
      return {};
    }) : undefined;
  }

  var _default = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];
  exports.default = _default;
},71,[67],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/mapStateToProps.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.defaultMergeProps = defaultMergeProps;
  exports.wrapMergePropsFunc = wrapMergePropsFunc;
  exports.whenMergePropsIsFunction = whenMergePropsIsFunction;
  exports.whenMergePropsIsOmitted = whenMergePropsIsOmitted;
  exports.default = void 0;

  var _extends2 = _interopRequireDefault(_require(_dependencyMap[1], "@babel/runtime/helpers/extends"));

  var _verifyPlainObject = _interopRequireDefault(_require(_dependencyMap[2], "../utils/verifyPlainObject"));

  function defaultMergeProps(stateProps, dispatchProps, ownProps) {
    return (0, _extends2.default)({}, ownProps, stateProps, dispatchProps);
  }

  function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, _ref) {
      var displayName = _ref.displayName,
          pure = _ref.pure,
          areMergedPropsEqual = _ref.areMergedPropsEqual;
      var hasRunOnce = false;
      var mergedProps;
      return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
        var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        if (hasRunOnce) {
          if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
        } else {
          hasRunOnce = true;
          mergedProps = nextMergedProps;
          if (process.env.NODE_ENV !== 'production') (0, _verifyPlainObject.default)(mergedProps, displayName, 'mergeProps');
        }

        return mergedProps;
      };
    };
  }

  function whenMergePropsIsFunction(mergeProps) {
    return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
  }

  function whenMergePropsIsOmitted(mergeProps) {
    return !mergeProps ? function () {
      return defaultMergeProps;
    } : undefined;
  }

  var _default = [whenMergePropsIsFunction, whenMergePropsIsOmitted];
  exports.default = _default;
},72,[41,57,68],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/mergeProps.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.impureFinalPropsSelectorFactory = impureFinalPropsSelectorFactory;
  exports.pureFinalPropsSelectorFactory = pureFinalPropsSelectorFactory;
  exports.default = finalPropsSelectorFactory;

  var _objectWithoutPropertiesLoose2 = _interopRequireDefault(_require(_dependencyMap[1], "@babel/runtime/helpers/objectWithoutPropertiesLoose"));

  var _verifySubselectors = _interopRequireDefault(_require(_dependencyMap[2], "./verifySubselectors"));

  function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
    return function impureFinalPropsSelector(state, ownProps) {
      return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
    };
  }

  function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
    var areStatesEqual = _ref.areStatesEqual,
        areOwnPropsEqual = _ref.areOwnPropsEqual,
        areStatePropsEqual = _ref.areStatePropsEqual;
    var hasRunAtLeastOnce = false;
    var state;
    var ownProps;
    var stateProps;
    var dispatchProps;
    var mergedProps;

    function handleFirstCall(firstState, firstOwnProps) {
      state = firstState;
      ownProps = firstOwnProps;
      stateProps = mapStateToProps(state, ownProps);
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      hasRunAtLeastOnce = true;
      return mergedProps;
    }

    function handleNewPropsAndNewState() {
      stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewProps() {
      if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewState() {
      var nextStateProps = mapStateToProps(state, ownProps);
      var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
      stateProps = nextStateProps;
      if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
      var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
      var stateChanged = !areStatesEqual(nextState, state);
      state = nextState;
      ownProps = nextOwnProps;
      if (propsChanged && stateChanged) return handleNewPropsAndNewState();
      if (propsChanged) return handleNewProps();
      if (stateChanged) return handleNewState();
      return mergedProps;
    }

    return function pureFinalPropsSelector(nextState, nextOwnProps) {
      return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
    };
  }

  function finalPropsSelectorFactory(dispatch, _ref2) {
    var initMapStateToProps = _ref2.initMapStateToProps,
        initMapDispatchToProps = _ref2.initMapDispatchToProps,
        initMergeProps = _ref2.initMergeProps,
        options = (0, _objectWithoutPropertiesLoose2.default)(_ref2, ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"]);
    var mapStateToProps = initMapStateToProps(dispatch, options);
    var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    var mergeProps = initMergeProps(dispatch, options);

    if (process.env.NODE_ENV !== 'production') {
      (0, _verifySubselectors.default)(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
    return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
  }
},73,[41,58,74],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/selectorFactory.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  var _interopRequireDefault = _require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");

  exports.__esModule = true;
  exports.default = verifySubselectors;

  var _warning = _interopRequireDefault(_require(_dependencyMap[1], "../utils/warning"));

  function verify(selector, methodName, displayName) {
    if (!selector) {
      throw new Error("Unexpected value for " + methodName + " in " + displayName + ".");
    } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
      if (!selector.hasOwnProperty('dependsOnOwnProps')) {
        (0, _warning.default)("The selector for " + methodName + " of " + displayName + " did not specify a value for dependsOnOwnProps.");
      }
    }
  }

  function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
    verify(mapStateToProps, 'mapStateToProps', displayName);
    verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
    verify(mergeProps, 'mergeProps', displayName);
  }
},74,[41,70],"projects/com.lumi.plug/node_modules/react-redux/lib/connect/verifySubselectors.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LHCommonIcon = exports.LHNumberModalPicker = exports.LHStandardEmpty = exports.LHStandardLog = exports.LHCardBase = exports.LHStandardCell = exports.LHStandardList = exports.LHMoreSettingPage = exports.LHImageButton = exports.LHTitleBarCustom = undefined;

  var _LHTitleBarCustom = _require(_dependencyMap[0], "./Components/LHTitleBarCustom");

  var _LHTitleBarCustom2 = babelHelpers.interopRequireDefault(_LHTitleBarCustom);

  var _LHImageButton = _require(_dependencyMap[1], "./Components/LHImageButton");

  var _LHImageButton2 = babelHelpers.interopRequireDefault(_LHImageButton);

  var _LHMoreSettingPage = _require(_dependencyMap[2], "./CommonPage/LHMoreSettingPage");

  var _LHMoreSettingPage2 = babelHelpers.interopRequireDefault(_LHMoreSettingPage);

  var _LHStandardList = _require(_dependencyMap[3], "./Components/List/LHStandardList");

  var _LHStandardList2 = babelHelpers.interopRequireDefault(_LHStandardList);

  var _LHStandardCell = _require(_dependencyMap[4], "./Components/LHStandardCell");

  var _LHStandardCell2 = babelHelpers.interopRequireDefault(_LHStandardCell);

  var _LHCardBase = _require(_dependencyMap[5], "./Components/Card/LHCardBase");

  var _LHCardBase2 = babelHelpers.interopRequireDefault(_LHCardBase);

  var _LHStandardLog = _require(_dependencyMap[6], "./Components/LHStandardLog");

  var _LHStandardLog2 = babelHelpers.interopRequireDefault(_LHStandardLog);

  var _LHStandardEmpty = _require(_dependencyMap[7], "./Components/LHStandardEmpty");

  var _LHStandardEmpty2 = babelHelpers.interopRequireDefault(_LHStandardEmpty);

  var _LHNumberModalPicker = _require(_dependencyMap[8], "./Components/Picker/LHNumberModalPicker");

  var _LHNumberModalPicker2 = babelHelpers.interopRequireDefault(_LHNumberModalPicker);

  var _LHCommonIcon = _require(_dependencyMap[9], "./Resources/LHCommonIcon");

  var _LHCommonIcon2 = babelHelpers.interopRequireDefault(_LHCommonIcon);

  exports.LHTitleBarCustom = _LHTitleBarCustom2.default;
  exports.LHImageButton = _LHImageButton2.default;
  exports.LHMoreSettingPage = _LHMoreSettingPage2.default;
  exports.LHStandardList = _LHStandardList2.default;
  exports.LHStandardCell = _LHStandardCell2.default;
  exports.LHCardBase = _LHCardBase2.default;
  exports.LHStandardLog = _LHStandardLog2.default;
  exports.LHStandardEmpty = _LHStandardEmpty2.default;
  exports.LHNumberModalPicker = _LHNumberModalPicker2.default;
  exports.LHCommonIcon = _LHCommonIcon2.default;
},75,[76,77,78,79,80,82,83,84,85,153],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHTitleBarCustom.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _reactNavigation = _require(_dependencyMap[2], "react-navigation");

  var _reactNativeUiKitten = _require(_dependencyMap[3], "react-native-ui-kitten");

  var _LHCommonFunction = _require(_dependencyMap[4], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[5], "LHCommonUI");

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      width = _Dimensions$get.width;

  var titleHeight = _LHCommonFunction.LHUiUtils.TitleBarHeight;
  var imgHeight = 28;

  var styles = _reactNative.StyleSheet.create({
    titleBarContainer: {
      width: width,
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: (_reactNative.StatusBar.currentHeight || 0) + titleHeight
    },
    textContainer: {
      height: titleHeight,
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center'
    },
    titleText: {
      color: '#000000cc',
      fontSize: 15,
      textAlignVertical: 'center',
      textAlign: 'center',
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    subtitleText: {
      color: '#00000088',
      fontSize: 12,
      textAlignVertical: 'center',
      textAlign: 'center',
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    leftRightText: {
      flexDirection: 'column',
      backgroundColor: '#0000',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    leftRightTextFontStyle: {
      color: '#00000088',
      fontSize: 14,
      textAlignVertical: 'center',
      textAlign: 'center'
    },
    img: {
      width: imgHeight,
      height: imgHeight,
      resizeMode: 'contain',
      marginLeft: 14,
      marginTop: (titleHeight - 28) / 2,
      marginBottom: (titleHeight - 28) / 2,
      marginRight: 14
    },
    dot: {
      position: 'absolute',
      width: 10,
      height: 10,
      resizeMode: 'contain',
      right: 14,
      top: _LHCommonFunction.LHDeviceUtils.statusBarHeight + (titleHeight - 28) / 2
    }
  });

  var LHTitleBarCustom = function (_Component) {
    babelHelpers.inherits(LHTitleBarCustom, _Component);
    babelHelpers.createClass(LHTitleBarCustom, null, [{
      key: "getDeafultShareBtn",
      value: function getDeafultShareBtn(position, btns, btn, index) {
        return _react2.default.createElement(_LHCommonUI.LHImageButton, {
          onPress: btn.press,
          key: 'btn_share_' + index,
          style: [styles.img, {
            marginRight: position === 'right' ? index !== btns.length - 1 ? 0 : 14 : 14,
            marginLeft: position === 'left' ? index === 0 ? 14 : 0 : 14,
            height: imgHeight
          }, btn.style],
          source: btn.backBtnIcon === 'white' ? _require(_dependencyMap[6], '../../../../../miot-sdk/resources/title/share_white_normal.png') : _require(_dependencyMap[7], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_share_normal.png'),
          highlightedSource: btn.backBtnIcon === 'white' ? _require(_dependencyMap[8], '../../../../../miot-sdk/resources/title/share_white_press.png') : _require(_dependencyMap[9], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_share_press.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 122
          }
        });
      }
    }, {
      key: "getDeafultMoreBtn",
      value: function getDeafultMoreBtn(position, btns, btn, index) {
        return _react2.default.createElement(_LHCommonUI.LHImageButton, {
          onPress: btn.press,
          key: 'btn_more_' + index,
          style: [styles.img, {
            height: imgHeight,
            marginRight: position === 'right' ? index !== btns.length - 1 ? 0 : 14 : 14,
            marginLeft: position === 'left' ? index === 0 ? 14 : 0 : 14
          }, btn.style],
          source: btn.backBtnIcon === 'white' ? _require(_dependencyMap[10], '../../../../../miot-sdk/resources/title/more_white_normal.png') : _require(_dependencyMap[11], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_more_normal.png'),
          highlightedSource: btn.backBtnIcon === 'white' ? _require(_dependencyMap[12], '../../../../../miot-sdk/resources/title/more_white_press.png') : _require(_dependencyMap[13], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_more_press.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 141
          }
        });
      }
    }, {
      key: "balanceLeftRightButtons",
      value: function balanceLeftRightButtons(leftButtons, rightBtns) {
        var gap = leftButtons.length - rightBtns.length;

        for (var i = 0; i < Math.abs(gap); i += 1) {
          var btn = {
            text: '',
            press: function press() {},
            source: _require(_dependencyMap[14], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_back_normal.png'),
            style: {
              opacity: 0
            }
          };
          gap > 0 ? rightBtns.push(btn) : leftButtons.push(btn);
        }
      }
    }]);

    function LHTitleBarCustom(props) {
      babelHelpers.classCallCheck(this, LHTitleBarCustom);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHTitleBarCustom.__proto__ || Object.getPrototypeOf(LHTitleBarCustom)).call(this, props));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHTitleBarCustom, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        if (_reactNative.Platform.OS === 'android') {
          _reactNative.StatusBar.setTranslucent(true);
        }
      }
    }, {
      key: "getDeafultBackBtn",
      value: function getDeafultBackBtn(position, btns, btn, index) {
        var backBtnIcon = this.props.backBtnIcon;
        return _react2.default.createElement(_LHCommonUI.LHImageButton, {
          onPress: btn.press,
          key: 'btn_back_' + index,
          style: [styles.img, {
            height: imgHeight
          }, btn.style],
          source: backBtnIcon === 'white' ? _require(_dependencyMap[15], '../../../../../miot-sdk/resources/title/back_white_normal.png') : _require(_dependencyMap[14], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_back_normal.png'),
          highlightedSource: backBtnIcon === 'white' ? _require(_dependencyMap[16], '../../../../../miot-sdk/resources/title/back_white_press.png') : _require(_dependencyMap[17], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_back_press.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 188
          }
        });
      }
    }, {
      key: "renderBtn",
      value: function renderBtn(position, btns, btn, index) {
        var type = btn.type;

        if (type === 'deafultBackBtn') {
          return this.getDeafultBackBtn(position, btns, btn, index);
        } else if (type === 'deafultShareBtn') {
          return LHTitleBarCustom.getDeafultShareBtn(position, btns, btn, index);
        } else if (type === 'deafultMoreBtn') {
          return LHTitleBarCustom.getDeafultMoreBtn(position, btns, btn, index);
        } else {
          return btn.source ? _react2.default.createElement(_LHCommonUI.LHImageButton, {
            onPress: btn.press,
            key: position + index,
            style: [styles.img, {
              height: imgHeight,
              marginRight: position === 'right' ? index !== btns.length - 1 ? 0 : 14 : 14,
              marginLeft: position === 'left' ? index === 0 ? 14 : 0 : 14
            }, btn.style],
            source: btn.source,
            highlightedSource: btn.highlightedSource,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 211
            }
          }) : _react2.default.createElement(
            _reactNativeUiKitten.RkButton,
            {
              onPress: btn.press,
              key: position + index,
              contentStyle: [styles.leftRightTextFontStyle, btn.style],
              style: [styles.leftRightText, {
                height: titleHeight,
                width: imgHeight + 14 * 2
              }, btn.textContainerStyle],
              __source: {
                fileName: _jsxFileName,
                lineNumber: 225
              }
            },
            btn.text
          );
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _props = this.props,
            onPressLeft = _props.onPressLeft,
            statusBarStyle = _props.statusBarStyle;

        _reactNative.StatusBar.setBarStyle(statusBarStyle === 'light' ? 'light-content' : 'dark-content');

        var leftButtons = _LHCommonFunction.CommonMethod.DeepClone(this.props.leftButtons || [], []);

        var rightBtns = _LHCommonFunction.CommonMethod.DeepClone(this.props.rightButtons || [], []);

        var rightButtons = [];

        if (onPressLeft && leftButtons.length === 0) {
          leftButtons.push({
            type: 'deafultBackBtn',
            press: onPressLeft
          });
        }

        LHTitleBarCustom.balanceLeftRightButtons(leftButtons, rightBtns);

        for (var i = rightBtns.length - 1; i > -1; i -= 1) {
          rightButtons.push(rightBtns[i]);
        }

        var _props2 = this.props,
            style = _props2.style,
            titleStyle = _props2.titleStyle,
            onPressTitle = _props2.onPressTitle,
            title = _props2.title,
            subTitle = _props2.subTitle,
            subTitleStyle = _props2.subTitleStyle,
            showDot = _props2.showDot;
        var subTitleEle = subTitle ? _react2.default.createElement(
          _reactNative.Text,
          {
            numberOfLines: 1,
            style: [styles.subtitleText, subTitleStyle],
            onPress: onPressTitle,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 273
            }
          },
          subTitle
        ) : null;
        return _react2.default.createElement(
          _reactNavigation.SafeAreaView,
          {
            style: [styles.titleBarContainer, style],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 282
            }
          },
          leftButtons.map(function (item, i) {
            return _this2.renderBtn('left', leftButtons, item, i);
          }),
          _react2.default.createElement(
            _reactNative.View,
            {
              style: [styles.textContainer],
              __source: {
                fileName: _jsxFileName,
                lineNumber: 286
              }
            },
            _react2.default.createElement(
              _reactNative.Text,
              {
                numberOfLines: 1,
                style: [styles.titleText, titleStyle],
                onPress: onPressTitle,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 287
                }
              },
              title
            ),
            subTitleEle
          ),
          rightButtons.map(function (item, i) {
            return _this2.renderBtn('right', rightButtons, item, i);
          }),
          showDot && _react2.default.createElement(_reactNative.Image, {
            style: styles.dot,
            source: _require(_dependencyMap[18], '../../../../../miot-sdk/resources/title/std_tittlebar_main_device_massage_point.png'),
            __source: {
              fileName: _jsxFileName,
              lineNumber: 301
            }
          })
        );
      }
    }]);
    return LHTitleBarCustom;
  }(_react.Component);

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHTitleBarCustom);
},76,[150,148,151,154,3,75,155,156,157,158,159,160,161,162,163,164,165,166,167],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHTitleBarCustom.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHImageButton.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var LHImageButton = function (_React$Component) {
    babelHelpers.inherits(LHImageButton, _React$Component);

    function LHImageButton(props) {
      babelHelpers.classCallCheck(this, LHImageButton);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHImageButton.__proto__ || Object.getPrototypeOf(LHImageButton)).call(this, props));

      _this.state = {
        buttonPressed: false
      };
      return _this;
    }

    babelHelpers.createClass(LHImageButton, [{
      key: "buttonPressIn",
      value: function buttonPressIn() {
        this.setState({
          buttonPressed: true
        });
      }
    }, {
      key: "buttonPressOut",
      value: function buttonPressOut() {
        this.setState({
          buttonPressed: false
        });
      }
    }, {
      key: "isButtonPressed",
      value: function isButtonPressed() {
        var buttonPressed = this.state.buttonPressed;
        return buttonPressed;
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var source = this.props.source;
        var _props = this.props,
            highlightedSource = _props.highlightedSource,
            style = _props.style,
            onPress = _props.onPress;

        if (this.isButtonPressed() && highlightedSource) {
          source = highlightedSource;
        }

        return _react2.default.createElement(
          _reactNative.TouchableWithoutFeedback,
          {
            onPress: onPress,
            onPressIn: function onPressIn() {
              _this2.buttonPressIn();
            },
            onPressOut: function onPressOut() {
              _this2.buttonPressOut();
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 66
            }
          },
          _react2.default.createElement(
            _reactNative.View,
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 71
              }
            },
            _react2.default.createElement(_reactNative.Image, {
              style: style,
              source: source,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 72
              }
            })
          )
        );
      }
    }]);
    return LHImageButton;
  }(_react2.default.Component);

  LHImageButton.initialState = {
    buttonPressed: false
  };
  LHImageButton.defaultProps = {
    source: null,
    highlightedSource: null,
    onPress: null
  };
  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHImageButton);
},77,[150,148,3],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHImageButton.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/CommonPage/LHMoreSettingPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[3], "LHCommonUI");

  var LHMoreSettingPage = function (_React$Component) {
    babelHelpers.inherits(LHMoreSettingPage, _React$Component);
    babelHelpers.createClass(LHMoreSettingPage, null, [{
      key: "getPageData",
      value: function getPageData() {
        return [{
          title: '',
          data: [_LHCommonFunction.LHSettingItem.securitySettingItem, _LHCommonFunction.LHSettingItem.helpPageItem, _LHCommonFunction.LHSettingItem.feedbackInputItem]
        }];
      }
    }]);

    function LHMoreSettingPage(props, context) {
      babelHelpers.classCallCheck(this, LHMoreSettingPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHMoreSettingPage.__proto__ || Object.getPrototypeOf(LHMoreSettingPage)).call(this, props, context));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHMoreSettingPage, [{
      key: "componentWillMount",
      value: function componentWillMount() {}
    }, {
      key: "render",
      value: function render() {
        var pageData = LHMoreSettingPage.getPageData();
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: {
              flex: 1,
              backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 53
            }
          },
          _react2.default.createElement(_LHCommonUI.LHStandardList, {
            data: pageData,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 58
            }
          })
        );
      }
    }]);
    return LHMoreSettingPage;
  }(_react2.default.Component);

  LHMoreSettingPage.navigationOptions = function (_ref) {
    var navigation = _ref.navigation;
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 15
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: _LHCommonFunction.LHCommonLocalizableString.common_setting_more_setting,
          style: [{
            backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite,
            borderBottomWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
            borderBottomColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor
          }],
          onPressLeft: function onPressLeft() {
            navigation.goBack();
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 16
          }
        })
      )
    };
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHMoreSettingPage);
},78,[150,148,3,75],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/CommonPage/LHMoreSettingPage.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/List/LHStandardList.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[3], "LHCommonUI");

  var styles = _reactNative.StyleSheet.create({
    sectionHeader: {
      paddingTop: 9,
      paddingBottom: 9,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    },
    listTitle: {
      color: _LHCommonFunction.LHUiUtils.MiJiaListHeaderColor,
      fontSize: 11,
      paddingLeft: 23.5
    },
    btnContainer: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      flex: 1,
      backgroundColor: '#fff',
      height: 42,
      alignItems: 'center'
    },
    btnText: {
      fontSize: 13,
      flex: 1,
      color: '#f43f31',
      textAlign: 'center',
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    }
  });

  var LHStandardList = function (_React$Component) {
    babelHelpers.inherits(LHStandardList, _React$Component);

    function LHStandardList(props) {
      babelHelpers.classCallCheck(this, LHStandardList);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHStandardList.__proto__ || Object.getPrototypeOf(LHStandardList)).call(this, props));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHStandardList, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps() {}
    }, {
      key: "render",
      value: function render() {
        var _props = this.props,
            data = _props.data,
            noBounces = _props.noBounces,
            stickySectionHeadersEnabled = _props.stickySectionHeadersEnabled,
            style = _props.style,
            contentContainerStyle = _props.contentContainerStyle;
        return _react2.default.createElement(_reactNative.SectionList, {
          initialNumToRender: 20,
          style: style,
          contentContainerStyle: contentContainerStyle,
          bounces: !noBounces,
          sections: data,
          stickySectionHeadersEnabled: stickySectionHeadersEnabled || true,
          renderItem: function renderItem(_ref) {
            var item = _ref.item,
                index = _ref.index,
                section = _ref.section;

            if (section.title === 'type:bottomButton') {
              return _react2.default.createElement(
                _reactNative.TouchableHighlight,
                {
                  onPress: item.press,
                  style: {
                    marginHorizontal: 24,
                    marginBottom: 50,
                    borderRadius: 5,
                    borderWidth: 0.3,
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden'
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 147
                  }
                },
                _react2.default.createElement(
                  _reactNative.View,
                  {
                    style: styles.btnContainer,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 158
                    }
                  },
                  _react2.default.createElement(
                    _reactNative.Text,
                    {
                      style: styles.btnText,
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 159
                      }
                    },
                    item.title
                  )
                )
              );
            } else {
              return _react2.default.createElement(_LHCommonUI.LHStandardCell, {
                marginLeft: item.marginLeft,
                marginBottom: item.marginBottom,
                marginTop: item.marginTop,
                separatorMarginLeft: item.separatorMarginLeft,
                iconSource: item.iconSource,
                leftIconStyle: item.leftIconStyle,
                hasRightArrow: !item.hideRightArrow,
                rightArrowStyle: item.rightArrowStyle,
                hasBadge: item.hasBadge,
                showBadge: item.showBadge,
                badge: item.badge,
                descriptionNumberOfLines: item.descriptionNumberOfLines,
                active: item.active,
                leftArrowSource: item.leftRrrowSource,
                description: item.description,
                descriptionStyle: item.descriptionStyle,
                rightDescriptionStyle: item.rightDescriptionStyle,
                rightDescriptionColor: item.rightDescriptionColor,
                rightDescription: item.rightDescription,
                rightIconSource: item.rightIconSource,
                rightIconStype: item.rightIconStype,
                hasSwitch: item.hasSwitch,
                switchValue: item.switchValue,
                switchColor: item.switchColor,
                onSwitchChange: item.onSwitchChange,
                hasSlider: item.hasSlider,
                sliderValue: item.sliderValue,
                onSliderChange: item.onSliderChange,
                hasCheckBox: item.hasCheckBox,
                checkBoxValue: item.checkBoxValue,
                rowContainerStyle: item.rowContainerStyle,
                titleStyle: item.titleStyle,
                title: item.title,
                titleNumberOfLines: item.titleNumberOfLines,
                topSeparatorStyle: index === 0 && !section.title ? {
                  marginLeft: 0
                } : item.topSeparatorStyle,
                topSeparatorLine: !item.hideTopSeparatorLine,
                bottomSeparatorStyle: index === section.data.length - 1 ? {
                  marginLeft: 0
                } : item.bottomSeparatorStyle,
                bottomSeparatorLine: typeof item.bottomSeparatorLine !== 'undefined' ? item.bottomSeparatorLine : index === section.data.length - 1,
                useTouchableHighlight: !item.noTouchableHighlight,
                minimumLongPressDuration: item.minimumLongPressDuration,
                press: item.press,
                longPress: item.longPress,
                style: [{
                  marginBottom: index === section.data.length - 1 ? 8 : 0
                }, item.style],
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 165
                }
              });
            }
          },
          renderSectionHeader: function renderSectionHeader(_ref2) {
            var section = _ref2.section;

            if (section.title === 'type:bottomButton') {
              return _react2.default.createElement(_reactNative.View, {
                style: {
                  height: 16,
                  backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
                },
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 218
                }
              });
            } else if (section.title) {
              return _react2.default.createElement(
                _reactNative.View,
                {
                  style: [styles.sectionHeader, {
                    borderTopWidth: data.indexOf(section) === 0 ? 0 : _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
                    borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor
                  }],
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 226
                  }
                },
                _react2.default.createElement(
                  _reactNative.Text,
                  {
                    style: styles.listTitle,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 231
                    }
                  },
                  section.title
                )
              );
            } else {
              return null;
            }
          },
          keyExtractor: function keyExtractor(item, index) {
            return index;
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 137
          }
        });
      }
    }]);
    return LHStandardList;
  }(_react2.default.Component);

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHStandardList);
},79,[150,148,3,75],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/List/LHStandardList.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHStandardCell.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var _rkSwitch = _require(_dependencyMap[3], "./Switch/rkSwitch");

  var styles = _reactNative.StyleSheet.create({
    whiteBg: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    },
    allContainer: {
      alignSelf: 'stretch',
      flex: 1
    },
    textContainer: {
      alignSelf: 'stretch',
      flexDirection: 'column',
      flex: 1
    },
    rowContainer: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      width: '100%'
    },
    icon: {
      marginRight: 12,
      alignSelf: 'center'
    },
    rightIcon: {
      marginRight: 12,
      alignSelf: 'center'
    },
    activeIcon: {
      marginLeft: 10,
      marginRight: 15,
      width: 10,
      height: 10,
      alignSelf: 'center'
    },
    title: {
      fontSize: 15,
      alignItems: 'stretch',
      alignSelf: 'stretch',
      textAlign: 'left',
      color: _LHCommonFunction.LHUiUtils.MiJiaTitleColor,
      marginLeft: 24,
      marginTop: 14,
      marginRight: 24,
      marginBottom: 2,
      lineHeight: 20,
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    active: {
      color: _LHCommonFunction.LHUiUtils.MiJiaBlue
    },
    description: {
      fontSize: 12,
      lineHeight: 17,
      alignItems: 'stretch',
      alignSelf: 'stretch',
      textAlign: 'left',
      color: _LHCommonFunction.LHUiUtils.MiJiaSubTitleColor,
      marginRight: 24,
      marginBottom: 15,
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    rightDescription: {
      fontSize: 12,
      lineHeight: 14,
      color: _LHCommonFunction.LHUiUtils.MiJiaSubTitleColor,
      alignSelf: 'center',
      marginRight: 12,
      textAlign: 'right',
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    noRightArrow: {
      marginRight: 18
    },
    switch: {
      alignSelf: 'center',
      marginRight: 20
    },
    subArrow: {
      width: 7,
      height: 13,
      marginRight: 18,
      alignSelf: 'center'
    },
    badgeText: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBlueColor,
      alignSelf: 'center',
      justifyContent: 'center',
      color: _LHCommonFunction.LHUiUtils.MiJiaWhite,
      textAlign: 'center',
      overflow: 'hidden',
      fontSize: 12
    },
    topSeparator: {
      borderTopWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor,
      alignSelf: 'stretch'
    },
    bottomSeparator: {
      borderBottomWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor,
      alignSelf: 'stretch'
    },
    checkBox: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignSelf: 'center',
      marginRight: 24
    },
    checkBoxActive: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBlue,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaBlue
    },
    checkBoxInner: {
      transform: [{
        rotate: '-225deg'
      }],
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaWhite,
      borderRightWidth: 2,
      borderTopWidth: 2,
      width: 10,
      height: 6,
      alignSelf: 'center',
      marginTop: 2,
      opacity: 0
    },
    checkBoxInnerShow: {
      opacity: 1
    }
  });

  var LHStandardCell = function (_React$Component) {
    babelHelpers.inherits(LHStandardCell, _React$Component);

    function LHStandardCell(props) {
      babelHelpers.classCallCheck(this, LHStandardCell);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHStandardCell.__proto__ || Object.getPrototypeOf(LHStandardCell)).call(this, props));

      var _this$props = _this.props,
          marginLeft = _this$props.marginLeft,
          data = _this$props.data,
          marginTop = _this$props.marginTop,
          marginBottom = _this$props.marginBottom,
          separatorMarginLeft = _this$props.separatorMarginLeft;
      _this.state = {
        marginLeft: typeof marginLeft !== 'undefined' ? marginLeft : 24,
        data: data || {},
        marginTop: typeof marginTop !== 'undefined' ? marginTop : 15,
        marginBottom: typeof marginBottom !== 'undefined' ? marginBottom : typeof marginTop !== 'undefined' ? marginTop : 15,
        separatorMarginLeft: _this.getSeparatorMarginLeft(separatorMarginLeft)
      };
      return _this;
    }

    babelHelpers.createClass(LHStandardCell, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(data) {
        var separatorMarginLeft = this.state.separatorMarginLeft;

        if (data.separatorMarginLeft !== separatorMarginLeft) {
          this.setState({
            separatorMarginLeft: this.getSeparatorMarginLeft(data.separatorMarginLeft)
          });
        }
      }
    }, {
      key: "getSeparatorMarginLeft",
      value: function getSeparatorMarginLeft(separatorMarginLeft) {
        var marginLeft = this.props.marginLeft;
        return typeof separatorMarginLeft !== 'undefined' ? separatorMarginLeft : typeof marginLeft !== 'undefined' ? marginLeft : 24;
      }
    }, {
      key: "viewOnTouched",
      value: function viewOnTouched() {
        var press = this.props.press;
        var data = this.state.data;

        if (press) {
          press(data);
        }
      }
    }, {
      key: "viewOnLongPressed",
      value: function viewOnLongPressed() {
        var longPress = this.props.longPress;
        var data = this.state.data;

        if (longPress) {
          longPress(data);
        }
      }
    }, {
      key: "switchIsOn",
      value: function switchIsOn(isOn) {
        var onSwitchChange = this.props.onSwitchChange;

        if (onSwitchChange) {
          onSwitchChange(isOn);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _props = this.props,
            iconSource = _props.iconSource,
            leftIconStyle = _props.leftIconStyle,
            hasRightArrow = _props.hasRightArrow,
            rightArrowStyle = _props.rightArrowStyle,
            hasBadge = _props.hasBadge,
            showBadge = _props.showBadge,
            badge = _props.badge,
            descriptionNumberOfLines = _props.descriptionNumberOfLines,
            active = _props.active,
            leftArrowSource = _props.leftArrowSource,
            description = _props.description,
            descriptionStyle = _props.descriptionStyle,
            rightDescriptionStyle = _props.rightDescriptionStyle,
            rightDescription = _props.rightDescription,
            rightIconSource = _props.rightIconSource,
            rightIconStype = _props.rightIconStype,
            hasSwitch = _props.hasSwitch,
            switchValue = _props.switchValue,
            switchColor = _props.switchColor,
            hasSlider = _props.hasSlider,
            sliderValue = _props.sliderValue,
            hasCheckBox = _props.hasCheckBox,
            checkBoxActive = _props.checkBoxActive,
            rowContainerStyle = _props.rowContainerStyle,
            titleStyle = _props.titleStyle,
            title = _props.title,
            titleNumberOfLines = _props.titleNumberOfLines,
            style = _props.style,
            topSeparatorStyle = _props.topSeparatorStyle,
            topSeparatorLine = _props.topSeparatorLine,
            bottomSeparatorStyle = _props.bottomSeparatorStyle,
            bottomSeparatorLine = _props.bottomSeparatorLine,
            useTouchableHighlight = _props.useTouchableHighlight,
            minimumLongPressDuration = _props.minimumLongPressDuration,
            textContainer = _props.textContainer;
        var _state = this.state,
            marginLeft = _state.marginLeft,
            marginBottom = _state.marginBottom,
            marginTop = _state.marginTop,
            separatorMarginLeft = _state.separatorMarginLeft;
        var icon = iconSource ? _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          key: iconSource.uri,
          style: [styles.icon, {
            marginLeft: marginLeft
          }, leftIconStyle],
          source: iconSource,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 316
          }
        }) : null;
        var rightArrow = hasRightArrow ? _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          style: [styles.subArrow, rightArrowStyle],
          source: _require(_dependencyMap[4], '../Resources/sub_arrow.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 324
          }
        }) : null;
        var badgeElement = hasBadge ? _react2.default.createElement(
          _reactNative.Text,
          {
            style: [styles.badgeText, {
              opacity: showBadge ? 1 : 0
            }],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 326
            }
          },
          badge
        ) : null;
        var descriptionElement = description ? descriptionNumberOfLines ? _react2.default.createElement(
          _reactNative.Text,
          {
            numberOfLines: descriptionNumberOfLines,
            style: [styles.description, {
              marginBottom: marginBottom,
              marginLeft: iconSource || active ? 0 : marginLeft
            }, descriptionStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 329
            }
          },
          description
        ) : _react2.default.createElement(
          _reactNative.Text,
          {
            style: [styles.description, {
              marginBottom: marginBottom
            }, {
              marginLeft: iconSource || active ? 0 : marginLeft
            }, descriptionStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 340
            }
          },
          description
        ) : null;
        var activeIcon = active ? _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          style: styles.activeIcon,
          source: leftArrowSource || _require(_dependencyMap[5], '../Resources/lumi_camera_arrow_elected_blue.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 354
          }
        }) : null;
        var rightDescriptionElement = rightDescription ? _react2.default.createElement(
          _reactNative.Text,
          {
            numberOfLines: 1,
            style: [styles.rightDescription, hasRightArrow ? '' : styles.noRightArrow, rightDescriptionStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 358
            }
          },
          rightDescription
        ) : null;
        var rightIcon = rightIconSource ? _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          style: [styles.rightIcon, hasRightArrow ? '' : styles.noRightArrow, rightIconStype],
          source: rightIconSource,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 370
          }
        }) : null;
        var rightSwitch = hasSwitch ? _react2.default.createElement(
          _reactNative.View,
          {
            style: {
              alignSelf: 'center',
              marginRight: 15
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 378
            }
          },
          _react2.default.createElement(_rkSwitch.RkSwitch, {
            thumbTintColor: _reactNative.Platform.select({
              ios: null,
              android: '#ffffff'
            }),
            onTintColor: switchColor || _LHCommonFunction.LHUiUtils.MiJiaBlue,
            onValueChange: function onValueChange(state) {
              _this2.switchIsOn(state);
            },
            value: switchValue,
            ref: function ref(switchBtn) {
              _this2.switchBtn = switchBtn;
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 383
            }
          })
        ) : null;
        var slider = hasSlider ? _react2.default.createElement(
          _reactNative.View,
          {
            style: {
              marginHorizontal: 24,
              marginTop: 14,
              marginBottom: 24
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 398
            }
          },
          _react2.default.createElement(_reactNative.Slider, {
            thumbTintColor: _LHCommonFunction.LHUiUtils.MiJiaBlue,
            minimumTrackTintColor: _LHCommonFunction.LHUiUtils.MiJiaBlue,
            maximumTrackTintColor: "#F1F1F1",
            value: sliderValue,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 404
            }
          })
        ) : null;
        var rightCheckbBox = hasCheckBox ? _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          style: styles.checkBox,
          source: checkBoxActive ? _require(_dependencyMap[6], '../Resources/checkBox/check1.png') : _require(_dependencyMap[7], '../Resources/checkBox/check2.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 414
          }
        }) : null;
        var titleS = [styles.title, {
          marginBottom: description ? 2 : marginBottom
        }, {
          marginTop: marginTop
        }, active ? styles.active : '', {
          marginLeft: iconSource || active ? 0 : marginLeft
        }, titleStyle];
        var titleEle = title ? titleNumberOfLines ? _react2.default.createElement(
          _reactNative.Text,
          {
            numberOfLines: titleNumberOfLines,
            style: titleS,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 429
            }
          },
          title
        ) : _react2.default.createElement(
          _reactNative.Text,
          {
            style: titleS,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 436
            }
          },
          title
        ) : null;

        var content = _react2.default.createElement(
          _reactNative.View,
          {
            style: [styles.rowContainer, rowContainerStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 441
            }
          },
          activeIcon,
          icon,
          _react2.default.createElement(
            _reactNative.View,
            {
              style: [styles.textContainer, {
                marginLeft: active ? marginLeft - 35 : 0
              }, textContainer],
              __source: {
                fileName: _jsxFileName,
                lineNumber: 444
              }
            },
            titleEle,
            descriptionElement,
            slider
          ),
          rightDescriptionElement,
          rightIcon,
          badgeElement,
          rightSwitch,
          rightCheckbBox,
          rightArrow
        );

        if (useTouchableHighlight) {
          content = _react2.default.createElement(
            _reactNative.TouchableHighlight,
            {
              style: [styles.rowContainer, styles.whiteBg],
              onPress: function onPress() {
                _this2.viewOnTouched();
              },
              onLongPress: function onLongPress() {
                _this2.viewOnLongPressed();
              },
              delayLongPress: minimumLongPressDuration || 500,
              underlayColor: _LHCommonFunction.LHUiUtils.MiJiaCellSelBgColor,
              activeOpacity: 1,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 464
              }
            },
            content
          );
        } else {
          content = _react2.default.createElement(
            _reactNative.TouchableWithoutFeedback,
            {
              style: [styles.rowContainer, styles.whiteBg],
              onPress: function onPress() {
                _this2.viewOnTouched();
              },
              onLongPress: function onLongPress() {
                _this2.viewOnLongPressed();
              },
              delayLongPress: minimumLongPressDuration || 500,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 477
              }
            },
            content
          );
        }

        return _react2.default.createElement(
          _reactNative.View,
          {
            style: [styles.whiteBg, style],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 488
            }
          },
          _react2.default.createElement(_reactNative.View, {
            style: [styles.topSeparator, {
              opacity: topSeparatorLine ? 1 : 0
            }, {
              marginLeft: separatorMarginLeft
            }, topSeparatorStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 489
            }
          }),
          content,
          _react2.default.createElement(_reactNative.View, {
            style: [styles.bottomSeparator, {
              opacity: bottomSeparatorLine ? 1 : 0
            }, {
              marginLeft: separatorMarginLeft
            }, bottomSeparatorStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 497
            }
          })
        );
      }
    }]);
    return LHStandardCell;
  }(_react2.default.Component);

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHStandardCell);
},80,[150,148,3,81,168,169,170,171],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHStandardCell.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RkSwitch = undefined;
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/Switch/rkSwitch.ios.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _propTypes = _require(_dependencyMap[2], "prop-types");

  var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

  var _reactNativeUiKitten = _require(_dependencyMap[3], "react-native-ui-kitten");

  var RkSwitch = exports.RkSwitch = function (_RkComponent) {
    babelHelpers.inherits(RkSwitch, _RkComponent);

    function RkSwitch() {
      var _ref;

      var _temp, _this, _ret;

      babelHelpers.classCallCheck(this, RkSwitch);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = RkSwitch.__proto__ || Object.getPrototypeOf(RkSwitch)).call.apply(_ref, [this].concat(args))), _this), _this.componentName = 'RkSwitch', _this.typeMapping = {
        component: {}
      }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
    }

    babelHelpers.createClass(RkSwitch, [{
      key: "defineStyles",
      value: function defineStyles(additionalTypes) {
        var _babelHelpers$get$cal = babelHelpers.get(RkSwitch.prototype.__proto__ || Object.getPrototypeOf(RkSwitch.prototype), "defineStyles", this).call(this, additionalTypes),
            component = _babelHelpers$get$cal.component;

        var switchStyles = {
          onTintColor: this.extractNonStyleValue(component, 'onTintColor'),
          thumbTintColor: this.extractNonStyleValue(component, 'thumbTintColor'),
          tintColor: this.extractNonStyleValue(component, 'tintColor')
        };
        return {
          componentStyles: component,
          switchStyles: switchStyles
        };
      }
    }, {
      key: "render",
      value: function render() {
        var _props = this.props,
            onTintColor = _props.onTintColor,
            thumbTintColor = _props.thumbTintColor,
            tintColor = _props.tintColor,
            rkType = _props.rkType,
            style = _props.style,
            restProps = babelHelpers.objectWithoutProperties(_props, ["onTintColor", "thumbTintColor", "tintColor", "rkType", "style"]);

        var _defineStyles = this.defineStyles(rkType),
            componentStyles = _defineStyles.componentStyles,
            switchStyles = _defineStyles.switchStyles;

        return _react2.default.createElement(
          _reactNative.View,
          {
            style: [componentStyles, style],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 134
            }
          },
          _react2.default.createElement(_reactNative.Switch, babelHelpers.extends({
            onTintColor: switchStyles.onTintColor || onTintColor,
            thumbTintColor: switchStyles.thumbTintColor || thumbTintColor,
            tintColor: switchStyles.tintColor || tintColor
          }, restProps, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 135
            }
          }))
        );
      }
    }]);
    return RkSwitch;
  }(_reactNativeUiKitten.RkComponent);

  RkSwitch.propTypes = {
    rkType: _reactNativeUiKitten.RkComponent.propTypes.rkType,
    disabled: _propTypes2.default.bool,
    onTintColor: _propTypes2.default.string,
    thumbTintColor: _propTypes2.default.string,
    tintColor: _propTypes2.default.string,
    value: _propTypes2.default.bool,
    onValueChange: _propTypes2.default.func,
    style: _reactNative.ViewPropTypes.style
  };
  RkSwitch.defaultProps = {
    rkType: _reactNativeUiKitten.RkComponent.defaultProps.rkType,
    disabled: false,
    onTintColor: '#53d669',
    thumbTintColor: '#ffffff',
    tintColor: '#e5e5e5',
    value: false,
    onValueChange: function onValueChange() {
      return null;
    },
    style: null
  };
},81,[150,148,45,154],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/Switch/rkSwitch.ios.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/Card/LHCardBase.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _Card = _require(_dependencyMap[2], "miot/ui/Card");

  var _Card2 = babelHelpers.interopRequireDefault(_Card);

  var _LHCommonFunction = _require(_dependencyMap[3], "LHCommonFunction");

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      width = _Dimensions$get.width;

  var styles = _reactNative.StyleSheet.create({
    defaultCardStyle: {
      height: 80,
      marginTop: 0,
      width: width - 10 * 2,
      marginLeft: 10,
      borderRadius: 10
    },
    innerViewWrap: {
      height: '100%'
    },
    borderLine: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor,
      height: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0
    },
    itemWrap: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    icon: {
      width: 40,
      height: 40,
      marginLeft: 20,
      marginRight: 13
    },
    title: {
      fontSize: 15,
      lineHeight: 20,
      color: '#000',
      letterSpacing: -0.14,
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    subTitle: {
      fontSize: 12,
      lineHeight: 16,
      color: '#666',
      letterSpacing: -0.11,
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    textWrap: {
      flex: 1
    },
    rightIcon: {
      width: 7,
      height: 13
    },
    rightIconWrap: {
      paddingHorizontal: 20,
      height: '100%',
      justifyContent: 'center'
    }
  });

  var LHCardBase = function (_React$Component) {
    babelHelpers.inherits(LHCardBase, _React$Component);

    function LHCardBase(props) {
      babelHelpers.classCallCheck(this, LHCardBase);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHCardBase.__proto__ || Object.getPrototypeOf(LHCardBase)).call(this, props));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHCardBase, [{
      key: "renderItem",
      value: function renderItem(item, index, len) {
        var borderTop = index !== 0 ? _react2.default.createElement(_reactNative.View, {
          style: styles.borderLine,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 91
          }
        }) : null;
        var subTitle = typeof item.subTitle !== 'undefined' ? _react2.default.createElement(
          _reactNative.Text,
          {
            numberOfLines: item.subTitleNumberOfLines || 1,
            style: [styles.subTitle, item.subTitleStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 92
            }
          },
          item.subTitle
        ) : null;
        var rightIcon = item.hideRightIcon ? null : _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          style: [styles.rightIcon, item.rightIconStyle],
          source: item.rightIconSource || _require(_dependencyMap[4], '../../Resources/sub_arrow.png'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 94
          }
        });
        var rightIconWrap = item.rightIconPress ? _react2.default.createElement(
          _reactNative.TouchableHighlight,
          {
            style: [styles.rightIconWrap, item.rightIconWrapStyle],
            underlayColor: "transparent",
            activeOpacity: 1,
            onPress: function onPress() {
              item.rightIconPress();
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 101
            }
          },
          rightIcon
        ) : _react2.default.createElement(
          _reactNative.View,
          {
            style: [styles.rightIconWrap, item.rightIconWrapStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 112
            }
          },
          rightIcon
        );

        var icon = _react2.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          style: [styles.icon, item.iconStyle],
          source: item.iconSource,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 119
          }
        });

        var textWrap = _react2.default.createElement(
          _reactNative.View,
          {
            style: [styles.textWrap, item.textWrapStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 126
            }
          },
          _react2.default.createElement(
            _reactNative.Text,
            {
              numberOfLines: item.titleNumberOfLines || 1,
              style: [styles.title, item.titleStyle],
              __source: {
                fileName: _jsxFileName,
                lineNumber: 127
              }
            },
            item.title || ''
          ),
          subTitle
        );

        var content = item.onPress ? _react2.default.createElement(
          _reactNative.TouchableHighlight,
          {
            key: 'item_' + index,
            style: [styles.itemWrap, {
              height: 1 / len * 100 + '%'
            }],
            underlayColor: _LHCommonFunction.LHUiUtils.MiJiaCellSelBgColor,
            activeOpacity: 1,
            onPress: function onPress() {
              item.onPress();
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 132
            }
          },
          _react2.default.createElement(
            _reactNative.View,
            {
              style: [styles.itemWrap, {
                height: '100%',
                flex: 1
              }],
              __source: {
                fileName: _jsxFileName,
                lineNumber: 141
              }
            },
            borderTop,
            icon,
            textWrap,
            rightIconWrap
          )
        ) : _react2.default.createElement(
          _reactNative.View,
          {
            key: 'item_' + index,
            style: [styles.itemWrap, {
              height: 1 / len * 100 + '%'
            }],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 149
            }
          },
          borderTop,
          icon,
          textWrap,
          rightIconWrap
        );
        return content;
      }
    }, {
      key: "renderInnerView",
      value: function renderInnerView() {
        var _this2 = this;

        var data = this.props.data;
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: styles.innerViewWrap,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 165
            }
          },
          data.map(function (item, index) {
            return _this2.renderItem(item, index, data.length);
          })
        );
      }
    }, {
      key: "render",
      value: function render() {
        var _props = this.props,
            visible = _props.visible,
            cardStyle = _props.cardStyle;
        return _react2.default.createElement(_Card2.default, {
          innerView: this.renderInnerView(),
          visible: visible,
          cardStyle: babelHelpers.extends({}, _reactNative.StyleSheet.flatten(styles.defaultCardStyle), cardStyle || {}),
          showShadow: true,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 179
          }
        });
      }
    }]);
    return LHCardBase;
  }(_react2.default.Component);

  LHCardBase.initialState = {};
  LHCardBase.defaultProps = {
    visible: true,
    data: []
  };
  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHCardBase);
},82,[150,148,172,3,168],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/Card/LHCardBase.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHStandardLog.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _miot = _require(_dependencyMap[2], "miot");

  var _LHCommonFunction = _require(_dependencyMap[3], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[4], "LHCommonUI");

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      height = _Dimensions$get.height;

  var styles = _reactNative.StyleSheet.create({
    bgWhite: babelHelpers.extends({}, _reactNative.Platform.select({
      ios: {
        backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
      },
      android: {
        backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
      }
    })),
    loading: {
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(13),
      lineHeight: _LHCommonFunction.LHUiUtils.GetPx(17),
      textAlign: 'center',
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(10),
      color: _LHCommonFunction.LHUiUtils.MiJiaSubTitleColor
    },
    gap: {
      borderBottomWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor,
      height: _LHCommonFunction.LHUiUtils.GetPx(10),
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
    },
    borderTop: {
      paddingBottom: _LHCommonFunction.LHUiUtils.GetPx(10),
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    },
    listTitle: {
      color: _LHCommonFunction.LHUiUtils.MiJiaSubTitleColor,
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(13),
      lineHeight: _LHCommonFunction.LHUiUtils.GetPx(17),
      paddingLeft: _LHCommonFunction.LHUiUtils.GetPx(24),
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(9),
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    titleBorderBottom: {
      height: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor,
      position: 'absolute',
      bottom: _LHCommonFunction.LHUiUtils.GetPx(10),
      left: _LHCommonFunction.LHUiUtils.GetPx(23),
      right: 0
    },
    row: {
      flexDirection: 'row'
    },
    itemWrap: {
      paddingHorizontal: _LHCommonFunction.LHUiUtils.GetPx(24),
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    },
    time: {
      width: _LHCommonFunction.LHUiUtils.GetPx(48),
      marginTop: _LHCommonFunction.LHUiUtils.GetPx(11),
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(15),
      lineHeight: _LHCommonFunction.LHUiUtils.GetPx(20),
      color: _LHCommonFunction.LHUiUtils.MiJiaSubTitleColor,
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    contextWrap: {
      flex: 1,
      marginLeft: _LHCommonFunction.LHUiUtils.GetPx(15)
    },
    contextValue: {
      justifyContent: 'center',
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(10),
      flex: 1
    },
    context: {
      marginLeft: _LHCommonFunction.LHUiUtils.GetPx(15),
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(15),
      color: _LHCommonFunction.LHUiUtils.MiJiaTitleColor,
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    circle: {
      width: _LHCommonFunction.LHUiUtils.GetPx(10),
      height: _LHCommonFunction.LHUiUtils.GetPx(10),
      borderRadius: _LHCommonFunction.LHUiUtils.GetPx(5),
      marginTop: _LHCommonFunction.LHUiUtils.GetPx(15),
      transform: [{
        translateX: _LHCommonFunction.LHUiUtils.GetPx(-5)
      }]
    },
    line: {
      width: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      height: _LHCommonFunction.LHUiUtils.GetPx(13.5),
      position: 'absolute',
      left: 0,
      top: 0
    },
    lineBottom: {
      width: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      height: _LHCommonFunction.LHUiUtils.GetPx(60),
      position: 'absolute',
      left: 0,
      top: _LHCommonFunction.LHUiUtils.GetPx(26.5)
    },
    lastItem: {
      borderBottomWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor,
      paddingBottom: _LHCommonFunction.LHUiUtils.GetPx(10)
    },
    noMoreWrap: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray,
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(8),
      alignItems: 'center'
    },
    noMore: {
      borderRadius: _LHCommonFunction.LHUiUtils.GetPx(20),
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: _LHCommonFunction.LHUiUtils.GetPx(16),
      overflow: 'hidden'
    },
    noMoreText: {
      color: _LHCommonFunction.LHUiUtils.MiJiaWhite,
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(12),
      lineHeight: _LHCommonFunction.LHUiUtils.GetPx(16),
      letterSpacing: -0.11,
      textAlign: 'center',
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(8),
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    loadingcontainer: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray,
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(12),
      alignItems: 'center'
    },
    loadingWrap: {
      flexDirection: 'row'
    },
    loadingText: {
      color: '#666',
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(12),
      lineHeight: _LHCommonFunction.LHUiUtils.GetPx(16),
      letterSpacing: -0.11,
      marginLeft: _LHCommonFunction.LHUiUtils.GetPx(10),
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    },
    emptyPageWrap: {
      height: height - 44 - _LHCommonFunction.LHDeviceUtils.statusBarHeight,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    }
  });

  var LHStandardLog = function (_React$Component) {
    babelHelpers.inherits(LHStandardLog, _React$Component);

    function LHStandardLog(props) {
      babelHelpers.classCallCheck(this, LHStandardLog);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHStandardLog.__proto__ || Object.getPrototypeOf(LHStandardLog)).call(this, props));

      _this.timestamp = Math.floor(+new Date() / 1000);
      _this.pageSize = 20;
      _this.state = {
        logListData: [],
        isLoading: false,
        page: 1,
        pageOver: false,
        firstIn: true
      };
      return _this;
    }

    babelHelpers.createClass(LHStandardLog, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.getServerData(1);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
      }
    }, {
      key: "onRefresh",
      value: function onRefresh() {
        this.timestamp = Math.floor(+new Date() / 1000);
        this.setState({
          page: 1
        });
        this.getServerData(1);
      }
    }, {
      key: "onEndReached",
      value: function onEndReached() {
        var _state = this.state,
            page = _state.page,
            firstIn = _state.firstIn;
        if (firstIn) return;
        var _state2 = this.state,
            isLoading = _state2.isLoading,
            pageOver = _state2.pageOver;
        if (isLoading || pageOver) return;
        this.getServerData(page);
      }
    }, {
      key: "getServerData",
      value: function getServerData(page) {
        var _this2 = this;

        this.setState({
          isLoading: true
        });
        var extraParam = this.props.extraParam;
        if (extraParam && extraParam.limit) this.pageSize = extraParam.limit;

        _LHCommonFunction.LHMiServer.GetUserDeviceDataTab(babelHelpers.extends({}, {
          did: _miot.Device.deviceID,
          timestamp: this.timestamp,
          limit: this.pageSize
        }, extraParam), function (res) {
          var dataSource = res && res.data || [];
          console.log(res);
          var pageOverFlag = true;

          if (dataSource.length === _this2.pageSize) {
            pageOverFlag = false;
            _this2.timestamp = dataSource[_this2.pageSize - 1].time;
          }

          var data = [];

          if (page === 1) {
            data = dataSource;
          } else {
            var logListData = _this2.state.logListData;
            data = logListData.concat(dataSource);
          }

          _this2.setState({
            logListData: data,
            isLoading: false,
            page: page + 1,
            pageOver: pageOverFlag
          });

          var firstIn = _this2.state.firstIn;

          if (page === 1 && firstIn) {
            _this2.timeoutId = setTimeout(function () {
              _this2.timeoutId = null;

              _this2.setState({
                firstIn: false
              });
            }, 200);
          }
        }, function () {
          _this2.setState({
            isLoading: false
          });
        });
      }
    }, {
      key: "getPageData",
      value: function getPageData() {
        var logListData = this.state.logListData;
        var result = this.dealData(logListData);
        return result;
      }
    }, {
      key: "dealData",
      value: function dealData(data) {
        var dataMap = this.props.dataMap;
        var result = [];

        for (var i = 0, len = data.length; i < len; i += 1) {
          if (!dataMap(data[i])) continue;
          var dataItem = babelHelpers.extends({}, data[i], dataMap(data[i]), {
            time: data[i].time
          });
          var index = LHStandardLog.getDataIndex(result, dataItem);

          if (index > -1) {
            result[index].data.push(dataItem);
          } else {
            result.push({
              title: dataItem.time,
              data: [dataItem]
            });
          }
        }

        return result;
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var _state3 = this.state,
            page = _state3.page,
            isLoading = _state3.isLoading,
            pageOver = _state3.pageOver,
            firstIn = _state3.firstIn;
        var _props = this.props,
            emptyText = _props.emptyText,
            allDataHasLoadedText = _props.allDataHasLoadedText;
        var pageData = this.getPageData();
        return _react2.default.createElement(_reactNative.SectionList, {
          initialNumToRender: 20,
          style: styles.bgWhite,
          sections: pageData,
          refreshControl: _react2.default.createElement(_reactNative.RefreshControl, {
            refreshing: !firstIn && page === 1 && isLoading,
            onRefresh: function onRefresh() {
              _this3.onRefresh();
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 328
            }
          }),
          onEndReached: function onEndReached() {
            _this3.onEndReached();
          },
          onEndReachedThreshold: 0.2,
          stickySectionHeadersEnabled: false,
          ListEmptyComponent: function ListEmptyComponent() {
            if (firstIn) {
              return null;
            } else {
              return _react2.default.createElement(
                _reactNative.View,
                {
                  style: styles.emptyPageWrap,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 346
                  }
                },
                _react2.default.createElement(_LHCommonUI.LHStandardEmpty, {
                  text: emptyText || _LHCommonFunction.LHCommonLocalizableString.common_log_no_logs,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 347
                  }
                })
              );
            }
          },
          renderItem: function renderItem(_ref) {
            var item = _ref.item,
                index = _ref.index,
                section = _ref.section;
            return _react2.default.createElement(
              _reactNative.View,
              {
                style: [styles.row, styles.itemWrap, index === section.data.length - 1 ? styles.lastItem : null],
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 356
                }
              },
              _react2.default.createElement(
                _reactNative.Text,
                {
                  style: styles.time,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 362
                  }
                },
                _LHCommonFunction.LHDateUtils.DateFormat('hh:mm', item.time)
              ),
              _react2.default.createElement(
                _reactNative.View,
                {
                  style: styles.contextWrap,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 363
                  }
                },
                _react2.default.createElement(
                  _reactNative.View,
                  {
                    style: styles.row,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 364
                    }
                  },
                  _react2.default.createElement(_reactNative.View, {
                    style: [styles.line, {
                      backgroundColor: index === 0 ? 'transparent' : _LHCommonFunction.LHUiUtils.MiJiaLineColor
                    }],
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 365
                    }
                  }),
                  _react2.default.createElement(_reactNative.View, {
                    style: [styles.circle, {
                      backgroundColor: item.logType === 'alert' ? _LHCommonFunction.LHUiUtils.MiJiaOrangeColor : item.logType === 'error' ? _LHCommonFunction.LHUiUtils.MiJiaRed : _LHCommonFunction.LHUiUtils.MiJiaLightGray
                    }],
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 370
                    }
                  }),
                  _react2.default.createElement(_reactNative.View, {
                    style: [styles.lineBottom, {
                      backgroundColor: index === section.data.length - 1 ? 'transparent' : _LHCommonFunction.LHUiUtils.MiJiaLineColor
                    }],
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 377
                    }
                  }),
                  _react2.default.createElement(
                    _reactNative.View,
                    {
                      style: styles.contextValue,
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 382
                      }
                    },
                    _react2.default.createElement(
                      _reactNative.Text,
                      {
                        style: styles.context,
                        numberOfLines: 2,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 383
                        }
                      },
                      item.context
                    )
                  )
                )
              )
            );
          },
          renderSectionHeader: function renderSectionHeader(_ref2) {
            var section = _ref2.section;
            var gapElement = null;

            if (pageData[0].title !== section.title) {
              gapElement = _react2.default.createElement(_reactNative.View, {
                style: styles.gap,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 393
                }
              });
            }

            return _react2.default.createElement(
              _reactNative.View,
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 396
                }
              },
              gapElement,
              _react2.default.createElement(
                _reactNative.View,
                {
                  style: styles.borderTop,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 398
                  }
                },
                _react2.default.createElement(
                  _reactNative.Text,
                  {
                    style: styles.listTitle,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 399
                    }
                  },
                  _LHCommonFunction.LHDateUtils.GetStandardTimeText(section.title)
                ),
                _react2.default.createElement(_reactNative.View, {
                  style: styles.titleBorderBottom,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 402
                  }
                })
              )
            );
          },
          ListFooterComponent: function ListFooterComponent() {
            if (!isLoading && pageOver && pageData.length > 0 && !firstIn) {
              return _react2.default.createElement(
                _reactNative.View,
                {
                  style: styles.noMoreWrap,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 410
                  }
                },
                _react2.default.createElement(
                  _reactNative.View,
                  {
                    style: styles.noMore,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 411
                    }
                  },
                  _react2.default.createElement(
                    _reactNative.Text,
                    {
                      style: styles.noMoreText,
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 412
                      }
                    },
                    allDataHasLoadedText || _LHCommonFunction.LHCommonLocalizableString.common_log_all_data_has_been_loaded
                  )
                )
              );
            } else if (page !== 1 && isLoading) {
              return _react2.default.createElement(
                _reactNative.View,
                {
                  style: styles.loadingcontainer,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 418
                  }
                },
                _react2.default.createElement(
                  _reactNative.View,
                  {
                    style: styles.loadingWrap,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 419
                    }
                  },
                  _react2.default.createElement(_reactNative.ActivityIndicator, {
                    color: "#666",
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 420
                    }
                  }),
                  _react2.default.createElement(
                    _reactNative.Text,
                    {
                      style: styles.loadingText,
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 421
                      }
                    },
                    _LHCommonFunction.LHCommonLocalizableString.common_log_loading
                  )
                )
              );
            } else if (!isLoading && pageData.length === 0) {
              return null;
            } else {
              return _react2.default.createElement(_reactNative.View, {
                style: {
                  height: _LHCommonFunction.LHUiUtils.GetPx(40)
                },
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 428
                }
              });
            }
          },
          keyExtractor: function keyExtractor(item, index) {
            return index;
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 322
          }
        });
      }
    }]);
    return LHStandardLog;
  }(_react2.default.Component);

  LHStandardLog.getDataIndex = function (dataList, data) {
    for (var i = 0, len = dataList.length; i < len; i += 1) {
      if (_LHCommonFunction.LHDateUtils.DateFormat('yyyy-MM-dd', data.time) === _LHCommonFunction.LHDateUtils.DateFormat('yyyy-MM-dd', dataList[i].title)) return i;
    }

    return -1;
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHStandardLog);
},83,[150,148,147,3,75],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHStandardLog.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHStandardEmpty.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var styles = _reactNative.StyleSheet.create({
    emptyWrap: {
      alignItems: 'center'
    },
    emptyImg: {
      marginTop: _LHCommonFunction.LHUiUtils.GetPx(139),
      width: _LHCommonFunction.LHUiUtils.GetPx(128),
      height: _LHCommonFunction.LHUiUtils.GetPx(101)
    },
    emptyText: {
      marginTop: _LHCommonFunction.LHUiUtils.GetPx(24),
      textAlign: 'center',
      fontSize: _LHCommonFunction.LHUiUtils.GetPx(15),
      lineHeight: _LHCommonFunction.LHUiUtils.GetPx(20),
      color: '#333',
      fontFamily: _LHCommonFunction.LHUiUtils.DefaultFontFamily
    }
  });

  var LHStandardEmpty = function (_React$PureComponent) {
    babelHelpers.inherits(LHStandardEmpty, _React$PureComponent);

    function LHStandardEmpty() {
      babelHelpers.classCallCheck(this, LHStandardEmpty);
      return babelHelpers.possibleConstructorReturn(this, (LHStandardEmpty.__proto__ || Object.getPrototypeOf(LHStandardEmpty)).apply(this, arguments));
    }

    babelHelpers.createClass(LHStandardEmpty, [{
      key: "render",
      value: function render() {
        var _props = this.props,
            text = _props.text,
            emptyIcon = _props.emptyIcon,
            style = _props.style;
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: [styles.emptyWrap, style],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 52
            }
          },
          _react2.default.createElement(
            _reactNative.View,
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 53
              }
            },
            _react2.default.createElement(_reactNative.Image, {
              style: styles.emptyImg,
              source: emptyIcon || _require(_dependencyMap[3], '../Resources/list_blank.png'),
              __source: {
                fileName: _jsxFileName,
                lineNumber: 54
              }
            }),
            _react2.default.createElement(
              _reactNative.Text,
              {
                style: styles.emptyText,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 55
                }
              },
              text
            )
          )
        );
      }
    }]);
    return LHStandardEmpty;
  }(_react2.default.PureComponent);

  exports.default = LHStandardEmpty;
},84,[150,148,3,173],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/LHStandardEmpty.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/Picker/LHNumberModalPicker.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _ui = _require(_dependencyMap[2], "miot/ui");

  var _LHCommonFunction = _require(_dependencyMap[3], "LHCommonFunction");

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      width = _Dimensions$get.width,
      height = _Dimensions$get.height;

  var styles = _reactNative.StyleSheet.create({
    backgroundMask: {
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.5)',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    modal: {
      flex: 1
    },
    modalMask: {
      flex: 1
    },
    modalContent: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite,
      overflow: 'hidden',
      width: width - 20,
      marginLeft: 10,
      borderRadius: 9,
      marginBottom: 10 + _LHCommonFunction.LHDeviceUtils.AppHomeIndicatorHeight
    },
    row: {
      flexDirection: 'row'
    },
    title: {
      color: '#000',
      fontSize: 14,
      lineHeight: 19,
      textAlign: 'center',
      paddingTop: 17,
      paddingBottom: 16,
      fontWeight: 'bold'
    },
    Btn: {
      flex: 1,
      paddingTop: 14.5,
      paddingBottom: 16,
      fontSize: 14,
      lineHeight: 19,
      color: 'rgba(0,0,0,0.7)',
      textAlign: 'center'
    },
    confirm: {
      color: _LHCommonFunction.LHUiUtils.MiJiaBlue
    },
    borderLeft: {
      borderLeftWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor
    },
    borderTop: {
      borderTopWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor
    }
  });

  var LHNumberModalPicker = function (_React$Component) {
    babelHelpers.inherits(LHNumberModalPicker, _React$Component);

    function LHNumberModalPicker(props, context) {
      babelHelpers.classCallCheck(this, LHNumberModalPicker);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHNumberModalPicker.__proto__ || Object.getPrototypeOf(LHNumberModalPicker)).call(this, props, context));

      var _this$props = _this.props,
          show = _this$props.show,
          defaultValue = _this$props.defaultValue,
          autoCloseWhenSelected = _this$props.autoCloseWhenSelected,
          animated = _this$props.animated,
          maskClickClose = _this$props.maskClickClose,
          onRequestClose = _this$props.onRequestClose,
          onSelected = _this$props.onSelected,
          onClose = _this$props.onClose,
          title = _this$props.title,
          minValue = _this$props.minValue,
          maxValue = _this$props.maxValue;
      var value = defaultValue;

      if (defaultValue < minValue || defaultValue > maxValue) {
        value = minValue;
      }

      _this.state = {
        value: {
          newValue: value
        },
        show: show,
        autoCloseWhenSelected: autoCloseWhenSelected,
        animated: animated,
        maskClickClose: maskClickClose,
        onRequestClose: onRequestClose,
        onSelected: onSelected,
        onClose: onClose,
        title: title || '',
        slideValue: new _reactNative.Animated.Value(0),
        hideValue: new _reactNative.Animated.Value(0)
      };
      return _this;
    }

    babelHelpers.createClass(LHNumberModalPicker, [{
      key: "componentWillMount",
      value: function componentWillMount() {}
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {}
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(data) {
        var show = this.state.show;

        if (typeof data.show !== 'undefined') {
          if (show && !data.show) {
            this.close();
          } else {
            this.setState({
              show: data.show
            });
          }
        }

        if (!show && data.show) this.showModalAnimate();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {}
    }, {
      key: "onSelected",
      value: function onSelected() {
        var _state = this.state,
            autoCloseWhenSelected = _state.autoCloseWhenSelected,
            onSelected = _state.onSelected,
            value = _state.value;
        if (autoCloseWhenSelected) this.close();
        onSelected(value);
      }
    }, {
      key: "calcel",
      value: function calcel() {
        var onRequestClose = this.state.onRequestClose;
        onRequestClose(this);
      }
    }, {
      key: "closeWithoutAnimate",
      value: function closeWithoutAnimate() {
        var onClose = this.state.onClose;
        this.setState({
          show: false
        });
        onClose();
      }
    }, {
      key: "close",
      value: function close() {
        var animated = this.state.animated;

        if (animated) {
          this.hideModalAnimate();
        } else {
          this.closeWithoutAnimate();
          this.isHiding = false;
        }
      }
    }, {
      key: "maskClick",
      value: function maskClick() {
        var maskClickClose = this.state.maskClickClose;
        if (this.isHiding) return;
        this.isHiding = true;
        if (maskClickClose) this.close();
      }
    }, {
      key: "hideModalAnimate",
      value: function hideModalAnimate() {
        var _this2 = this;

        var _state2 = this.state,
            slideValue = _state2.slideValue,
            hideValue = _state2.hideValue;
        slideValue.setValue(1);
        hideValue.setValue(0);

        _reactNative.Animated.parallel([_reactNative.Animated.timing(slideValue, {
          toValue: 0,
          duration: 500,
          easing: _reactNative.Easing.bezier(0.445, 0.05, 0.55, 0.95)
        }).start(), _reactNative.Animated.timing(hideValue, {
          toValue: 0,
          duration: 320,
          easing: _reactNative.Easing.bezier(0.42, 0, 0.58, 1)
        }).start(function (e) {
          if (e.finished) {
            _this2.closeWithoutAnimate();

            _this2.isHiding = false;
          }
        })]);
      }
    }, {
      key: "showModalAnimate",
      value: function showModalAnimate() {
        var slideValue = this.state.slideValue;
        slideValue.setValue(0);

        _reactNative.Animated.timing(slideValue, {
          toValue: 1,
          duration: 500,
          easing: _reactNative.Easing.bezier(0.2833, 0.99, 0.31833, 0.99)
        }).start();
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var _state3 = this.state,
            show = _state3.show,
            title = _state3.title,
            slideValue = _state3.slideValue;
        var _props = this.props,
            unit = _props.unit,
            minValue = _props.minValue,
            maxValue = _props.maxValue,
            defaultValue = _props.defaultValue,
            onChange = _props.onChange,
            step = _props.step,
            okTextStyle = _props.okTextStyle,
            cancelStyle = _props.cancelStyle;
        return _react2.default.createElement(
          _reactNative.Modal,
          {
            animationType: "fade",
            transparent: true,
            visible: show,
            onRequestClose: function onRequestClose() {
              _this3.close();
            },
            onShow: function onShow() {},
            __source: {
              fileName: _jsxFileName,
              lineNumber: 246
            }
          },
          _react2.default.createElement(
            _reactNative.View,
            {
              style: styles.backgroundMask,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 253
              }
            },
            _react2.default.createElement(
              _reactNative.Animated.View,
              {
                style: [styles.modal, {
                  transform: [{
                    translateY: slideValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0]
                    })
                  }]
                }],
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 254
                }
              },
              _react2.default.createElement(
                _reactNative.TouchableWithoutFeedback,
                {
                  onPress: function onPress() {
                    _this3.maskClick();
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 265
                  }
                },
                _react2.default.createElement(_reactNative.View, {
                  style: styles.modalMask,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 266
                  }
                })
              ),
              _react2.default.createElement(
                _reactNative.View,
                {
                  style: [styles.modalContent],
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 268
                  }
                },
                _react2.default.createElement(
                  _reactNative.Text,
                  {
                    numberOfLines: 1,
                    style: styles.title,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 269
                    }
                  },
                  title
                ),
                _react2.default.createElement(
                  _reactNative.View,
                  {
                    style: styles.borderTop,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 270
                    }
                  },
                  _react2.default.createElement(_ui.NumberSpinner, {
                    style: {
                      width: '100%',
                      height: 209
                    },
                    visible: show,
                    maxValue: maxValue,
                    minValue: minValue,
                    defaultValue: defaultValue,
                    unit: unit,
                    interval: step || 1,
                    onNumberChanged: function onNumberChanged(data) {
                      _this3.setState({
                        value: data
                      });

                      if (typeof onChange === 'function') onChange(data);
                    },
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 271
                    }
                  })
                ),
                _react2.default.createElement(
                  _reactNative.View,
                  {
                    style: [styles.row, styles.borderTop],
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 287
                    }
                  },
                  _react2.default.createElement(
                    _reactNative.Text,
                    {
                      suppressHighlighting: true,
                      style: [styles.Btn, styles.cancel, cancelStyle || {}],
                      onPress: function onPress() {
                        _this3.calcel();
                      },
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 288
                      }
                    },
                    _LHCommonFunction.LHCommonLocalizableString.common_cancel
                  ),
                  _react2.default.createElement(_reactNative.View, {
                    style: styles.borderLeft,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 289
                    }
                  }),
                  _react2.default.createElement(
                    _reactNative.Text,
                    {
                      suppressHighlighting: true,
                      style: [styles.Btn, styles.confirm, okTextStyle || {}],
                      onPress: function onPress() {
                        _this3.onSelected();
                      },
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 290
                      }
                    },
                    _LHCommonFunction.LHCommonLocalizableString.common_ok
                  )
                )
              )
            )
          )
        );
      }
    }]);
    return LHNumberModalPicker;
  }(_react2.default.Component);

  LHNumberModalPicker.defaultProps = {
    show: false,
    defaultValue: '',
    animated: true,
    maskClickClose: true,
    autoCloseWhenSelected: true,
    onRequestClose: function onRequestClose(modal) {
      modal.close();
    },
    onSelected: function onSelected() {},
    onClose: function onClose() {}
  };
  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHNumberModalPicker);
},85,[150,148,152,3],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/Components/Picker/LHNumberModalPicker.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getStore;

  var _redux = _require(_dependencyMap[0], "redux");

  var _reduxPromise = _require(_dependencyMap[1], "redux-promise");

  var _reduxPromise2 = babelHelpers.interopRequireDefault(_reduxPromise);

  var _Reducers = _require(_dependencyMap[2], "../Reducers");

  var _Reducers2 = babelHelpers.interopRequireDefault(_Reducers);

  function getStore() {
    return (0, _redux.createStore)((0, _Reducers2.default)(), undefined, (0, _redux.applyMiddleware)(_reduxPromise2.default));
  }
},86,[64,87,91],"projects/com.lumi.plug/Main/Redux/Stores/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = promiseMiddleware;

  var _isPromise = _interopRequireDefault(_require(_dependencyMap[0], "is-promise"));

  var _fluxStandardAction = _require(_dependencyMap[1], "flux-standard-action");

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function promiseMiddleware(_ref) {
    var dispatch = _ref.dispatch;
    return function (next) {
      return function (action) {
        if (!(0, _fluxStandardAction.isFSA)(action)) {
          return (0, _isPromise.default)(action) ? action.then(dispatch) : next(action);
        }

        return (0, _isPromise.default)(action.payload) ? action.payload.then(function (result) {
          return dispatch(_objectSpread({}, action, {
            payload: result
          }));
        }).catch(function (error) {
          dispatch(_objectSpread({}, action, {
            payload: error,
            error: true
          }));
          return Promise.reject(error);
        }) : next(action);
      };
    };
  }
},87,[88,89],"projects/com.lumi.plug/node_modules/redux-promise/lib/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  module.exports = isPromise;

  function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  }
},88,[],"projects/com.lumi.plug/node_modules/is-promise/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isFSA = isFSA;
  exports.isError = isError;

  var _lodash = _require(_dependencyMap[0], "lodash");

  function isFSA(action) {
    return (0, _lodash.isPlainObject)(action) && (0, _lodash.isString)(action.type) && Object.keys(action).every(isValidKey);
  }

  function isError(action) {
    return isFSA(action) && action.error === true;
  }

  function isValidKey(key) {
    return ['type', 'payload', 'error', 'meta'].indexOf(key) > -1;
  }
},89,[90],"projects/com.lumi.plug/node_modules/flux-standard-action/lib/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  /**
   * @license
   * Lodash <https://lodash.com/>
   * Copyright JS Foundation and other contributors <https://js.foundation/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */;
  (function () {
    var undefined;
    var VERSION = '4.17.11';
    var LARGE_ARRAY_SIZE = 200;
    var CORE_ERROR_TEXT = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
        FUNC_ERROR_TEXT = 'Expected a function';
    var HASH_UNDEFINED = '__lodash_hash_undefined__';
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = '__lodash_placeholder__';
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;
    var WRAP_BIND_FLAG = 1,
        WRAP_BIND_KEY_FLAG = 2,
        WRAP_CURRY_BOUND_FLAG = 4,
        WRAP_CURRY_FLAG = 8,
        WRAP_CURRY_RIGHT_FLAG = 16,
        WRAP_PARTIAL_FLAG = 32,
        WRAP_PARTIAL_RIGHT_FLAG = 64,
        WRAP_ARY_FLAG = 128,
        WRAP_REARG_FLAG = 256,
        WRAP_FLIP_FLAG = 512;
    var DEFAULT_TRUNC_LENGTH = 30,
        DEFAULT_TRUNC_OMISSION = '...';
    var HOT_COUNT = 800,
        HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1,
        LAZY_MAP_FLAG = 2,
        LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0,
        MAX_SAFE_INTEGER = 9007199254740991,
        MAX_INTEGER = 1.7976931348623157e+308,
        NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295,
        MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [['ary', WRAP_ARY_FLAG], ['bind', WRAP_BIND_FLAG], ['bindKey', WRAP_BIND_KEY_FLAG], ['curry', WRAP_CURRY_FLAG], ['curryRight', WRAP_CURRY_RIGHT_FLAG], ['flip', WRAP_FLIP_FLAG], ['partial', WRAP_PARTIAL_FLAG], ['partialRight', WRAP_PARTIAL_RIGHT_FLAG], ['rearg', WRAP_REARG_FLAG]];
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        asyncTag = '[object AsyncFunction]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        domExcTag = '[object DOMException]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        nullTag = '[object Null]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        proxyTag = '[object Proxy]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]',
        undefinedTag = '[object Undefined]',
        weakMapTag = '[object WeakMap]',
        weakSetTag = '[object WeakSet]';
    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';
    var reEmptyStringLeading = /\b__p \+= '';/g,
        reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
        reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
        reUnescapedHtml = /[&<>"']/g,
        reHasEscapedHtml = RegExp(reEscapedHtml.source),
        reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g,
        reEvaluate = /<%([\s\S]+?)%>/g,
        reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/,
        rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
        reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrim = /^\s+|\s+$/g,
        reTrimStart = /^\s+/,
        reTrimEnd = /\s+$/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
        reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
        reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff",
        rsComboMarksRange = "\\u0300-\\u036f",
        reComboHalfMarksRange = "\\ufe20-\\ufe2f",
        rsComboSymbolsRange = "\\u20d0-\\u20ff",
        rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
        rsDingbatRange = "\\u2700-\\u27bf",
        rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
        rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
        rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
        rsPunctuationRange = "\\u2000-\\u206f",
        rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",
        rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
        rsVarRange = "\\ufe0e\\ufe0f",
        rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]",
        rsAstral = '[' + rsAstralRange + ']',
        rsBreak = '[' + rsBreakRange + ']',
        rsCombo = '[' + rsComboRange + ']',
        rsDigits = '\\d+',
        rsDingbat = '[' + rsDingbatRange + ']',
        rsLower = '[' + rsLowerRange + ']',
        rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
        rsFitz = "\\ud83c[\\udffb-\\udfff]",
        rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
        rsNonAstral = '[^' + rsAstralRange + ']',
        rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
        rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
        rsUpper = '[' + rsUpperRange + ']',
        rsZWJ = "\\u200d";
    var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
        rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
        rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
        rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
        reOptMod = rsModifier + '?',
        rsOptVar = '[' + rsVarRange + ']?',
        rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
        rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
        rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
        rsSeq = rsOptVar + reOptMod + rsOptJoin,
        rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
        rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
    var reApos = RegExp(rsApos, 'g');
    var reComboMark = RegExp(rsCombo, 'g');
    var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
    var reUnicodeWord = RegExp([rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')', rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')', rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower, rsUpper + '+' + rsOptContrUpper, rsOrdUpper, rsOrdLower, rsDigits, rsEmoji].join('|'), 'g');
    var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = ['Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array', 'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object', 'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap', '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
      '\xc0': 'A',
      '\xc1': 'A',
      '\xc2': 'A',
      '\xc3': 'A',
      '\xc4': 'A',
      '\xc5': 'A',
      '\xe0': 'a',
      '\xe1': 'a',
      '\xe2': 'a',
      '\xe3': 'a',
      '\xe4': 'a',
      '\xe5': 'a',
      '\xc7': 'C',
      '\xe7': 'c',
      '\xd0': 'D',
      '\xf0': 'd',
      '\xc8': 'E',
      '\xc9': 'E',
      '\xca': 'E',
      '\xcb': 'E',
      '\xe8': 'e',
      '\xe9': 'e',
      '\xea': 'e',
      '\xeb': 'e',
      '\xcc': 'I',
      '\xcd': 'I',
      '\xce': 'I',
      '\xcf': 'I',
      '\xec': 'i',
      '\xed': 'i',
      '\xee': 'i',
      '\xef': 'i',
      '\xd1': 'N',
      '\xf1': 'n',
      '\xd2': 'O',
      '\xd3': 'O',
      '\xd4': 'O',
      '\xd5': 'O',
      '\xd6': 'O',
      '\xd8': 'O',
      '\xf2': 'o',
      '\xf3': 'o',
      '\xf4': 'o',
      '\xf5': 'o',
      '\xf6': 'o',
      '\xf8': 'o',
      '\xd9': 'U',
      '\xda': 'U',
      '\xdb': 'U',
      '\xdc': 'U',
      '\xf9': 'u',
      '\xfa': 'u',
      '\xfb': 'u',
      '\xfc': 'u',
      '\xdd': 'Y',
      '\xfd': 'y',
      '\xff': 'y',
      '\xc6': 'Ae',
      '\xe6': 'ae',
      '\xde': 'Th',
      '\xfe': 'th',
      '\xdf': 'ss',
      "\u0100": 'A',
      "\u0102": 'A',
      "\u0104": 'A',
      "\u0101": 'a',
      "\u0103": 'a',
      "\u0105": 'a',
      "\u0106": 'C',
      "\u0108": 'C',
      "\u010A": 'C',
      "\u010C": 'C',
      "\u0107": 'c',
      "\u0109": 'c',
      "\u010B": 'c',
      "\u010D": 'c',
      "\u010E": 'D',
      "\u0110": 'D',
      "\u010F": 'd',
      "\u0111": 'd',
      "\u0112": 'E',
      "\u0114": 'E',
      "\u0116": 'E',
      "\u0118": 'E',
      "\u011A": 'E',
      "\u0113": 'e',
      "\u0115": 'e',
      "\u0117": 'e',
      "\u0119": 'e',
      "\u011B": 'e',
      "\u011C": 'G',
      "\u011E": 'G',
      "\u0120": 'G',
      "\u0122": 'G',
      "\u011D": 'g',
      "\u011F": 'g',
      "\u0121": 'g',
      "\u0123": 'g',
      "\u0124": 'H',
      "\u0126": 'H',
      "\u0125": 'h',
      "\u0127": 'h',
      "\u0128": 'I',
      "\u012A": 'I',
      "\u012C": 'I',
      "\u012E": 'I',
      "\u0130": 'I',
      "\u0129": 'i',
      "\u012B": 'i',
      "\u012D": 'i',
      "\u012F": 'i',
      "\u0131": 'i',
      "\u0134": 'J',
      "\u0135": 'j',
      "\u0136": 'K',
      "\u0137": 'k',
      "\u0138": 'k',
      "\u0139": 'L',
      "\u013B": 'L',
      "\u013D": 'L',
      "\u013F": 'L',
      "\u0141": 'L',
      "\u013A": 'l',
      "\u013C": 'l',
      "\u013E": 'l',
      "\u0140": 'l',
      "\u0142": 'l',
      "\u0143": 'N',
      "\u0145": 'N',
      "\u0147": 'N',
      "\u014A": 'N',
      "\u0144": 'n',
      "\u0146": 'n',
      "\u0148": 'n',
      "\u014B": 'n',
      "\u014C": 'O',
      "\u014E": 'O',
      "\u0150": 'O',
      "\u014D": 'o',
      "\u014F": 'o',
      "\u0151": 'o',
      "\u0154": 'R',
      "\u0156": 'R',
      "\u0158": 'R',
      "\u0155": 'r',
      "\u0157": 'r',
      "\u0159": 'r',
      "\u015A": 'S',
      "\u015C": 'S',
      "\u015E": 'S',
      "\u0160": 'S',
      "\u015B": 's',
      "\u015D": 's',
      "\u015F": 's',
      "\u0161": 's',
      "\u0162": 'T',
      "\u0164": 'T',
      "\u0166": 'T',
      "\u0163": 't',
      "\u0165": 't',
      "\u0167": 't',
      "\u0168": 'U',
      "\u016A": 'U',
      "\u016C": 'U',
      "\u016E": 'U',
      "\u0170": 'U',
      "\u0172": 'U',
      "\u0169": 'u',
      "\u016B": 'u',
      "\u016D": 'u',
      "\u016F": 'u',
      "\u0171": 'u',
      "\u0173": 'u',
      "\u0174": 'W',
      "\u0175": 'w',
      "\u0176": 'Y',
      "\u0177": 'y',
      "\u0178": 'Y',
      "\u0179": 'Z',
      "\u017B": 'Z',
      "\u017D": 'Z',
      "\u017A": 'z',
      "\u017C": 'z',
      "\u017E": 'z',
      "\u0132": 'IJ',
      "\u0133": 'ij',
      "\u0152": 'Oe',
      "\u0153": 'oe',
      "\u0149": "'n",
      "\u017F": 's'
    };
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    var htmlUnescapes = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    var stringEscapes = {
      '\\': '\\',
      "'": "'",
      '\n': 'n',
      '\r': 'r',
      "\u2028": 'u2028',
      "\u2029": 'u2029'
    };
    var freeParseFloat = parseFloat,
        freeParseInt = parseInt;
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function('return this')();
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;

    var nodeUtil = function () {
      try {
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }();

    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
        nodeIsDate = nodeUtil && nodeUtil.isDate,
        nodeIsMap = nodeUtil && nodeUtil.isMap,
        nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
        nodeIsSet = nodeUtil && nodeUtil.isSet,
        nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);

        case 1:
          return func.call(thisArg, args[0]);

        case 2:
          return func.call(thisArg, args[0], args[1]);

        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }

      return func.apply(thisArg, args);
    }

    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        var value = array[index];
        setter(accumulator, value, iteratee(value), array);
      }

      return accumulator;
    }

    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }

      return array;
    }

    function arrayEachRight(array, iteratee) {
      var length = array == null ? 0 : array.length;

      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }

      return array;
    }

    function arrayEvery(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }

      return true;
    }

    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }

      return result;
    }

    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }

    function arrayIncludesWith(array, value, comparator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }

      return false;
    }

    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }

      return result;
    }

    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }

      return array;
    }

    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1,
          length = array == null ? 0 : array.length;

      if (initAccum && length) {
        accumulator = array[++index];
      }

      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }

      return accumulator;
    }

    function arrayReduceRight(array, iteratee, accumulator, initAccum) {
      var length = array == null ? 0 : array.length;

      if (initAccum && length) {
        accumulator = array[--length];
      }

      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }

      return accumulator;
    }

    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }

      return false;
    }

    var asciiSize = baseProperty('length');

    function asciiToArray(string) {
      return string.split('');
    }

    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }

    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function (value, key, collection) {
        if (predicate(value, key, collection)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }

      return -1;
    }

    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }

    function baseIndexOfWith(array, value, fromIndex, comparator) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (comparator(array[index], value)) {
          return index;
        }
      }

      return -1;
    }

    function baseIsNaN(value) {
      return value !== value;
    }

    function baseMean(array, iteratee) {
      var length = array == null ? 0 : array.length;
      return length ? baseSum(array, iteratee) / length : NAN;
    }

    function baseProperty(key) {
      return function (object) {
        return object == null ? undefined : object[key];
      };
    }

    function basePropertyOf(object) {
      return function (key) {
        return object == null ? undefined : object[key];
      };
    }

    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function (value, index, collection) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection);
      });
      return accumulator;
    }

    function baseSortBy(array, comparer) {
      var length = array.length;
      array.sort(comparer);

      while (length--) {
        array[length] = array[length].value;
      }

      return array;
    }

    function baseSum(array, iteratee) {
      var result,
          index = -1,
          length = array.length;

      while (++index < length) {
        var current = iteratee(array[index]);

        if (current !== undefined) {
          result = result === undefined ? current : result + current;
        }
      }

      return result;
    }

    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }

      return result;
    }

    function baseToPairs(object, props) {
      return arrayMap(props, function (key) {
        return [key, object[key]];
      });
    }

    function baseUnary(func) {
      return function (value) {
        return func(value);
      };
    }

    function baseValues(object, props) {
      return arrayMap(props, function (key) {
        return object[key];
      });
    }

    function cacheHas(cache, key) {
      return cache.has(key);
    }

    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1,
          length = strSymbols.length;

      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}

      return index;
    }

    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;

      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}

      return index;
    }

    function countHolders(array, placeholder) {
      var length = array.length,
          result = 0;

      while (length--) {
        if (array[length] === placeholder) {
          ++result;
        }
      }

      return result;
    }

    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);

    function escapeStringChar(chr) {
      return '\\' + stringEscapes[chr];
    }

    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }

    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }

    function iteratorToArray(iterator) {
      var data,
          result = [];

      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }

      return result;
    }

    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);
      map.forEach(function (value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    function overArg(func, transform) {
      return function (arg) {
        return func(transform(arg));
      };
    }

    function replaceHolders(array, placeholder) {
      var index = -1,
          length = array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value === placeholder || value === PLACEHOLDER) {
          array[index] = PLACEHOLDER;
          result[resIndex++] = index;
        }
      }

      return result;
    }

    function setToArray(set) {
      var index = -1,
          result = Array(set.size);
      set.forEach(function (value) {
        result[++index] = value;
      });
      return result;
    }

    function setToPairs(set) {
      var index = -1,
          result = Array(set.size);
      set.forEach(function (value) {
        result[++index] = [value, value];
      });
      return result;
    }

    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }

      return -1;
    }

    function strictLastIndexOf(array, value, fromIndex) {
      var index = fromIndex + 1;

      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }

      return index;
    }

    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }

    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }

    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;

      while (reUnicode.test(string)) {
        ++result;
      }

      return result;
    }

    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }

    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }

    var runInContext = function runInContext(context) {
      context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
      var Array = context.Array,
          Date = context.Date,
          Error = context.Error,
          Function = context.Function,
          Math = context.Math,
          Object = context.Object,
          RegExp = context.RegExp,
          String = context.String,
          TypeError = context.TypeError;
      var arrayProto = Array.prototype,
          funcProto = Function.prototype,
          objectProto = Object.prototype;
      var coreJsData = context['__core-js_shared__'];
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var idCounter = 0;

      var maskSrcKey = function () {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
        return uid ? 'Symbol(src)_1.' + uid : '';
      }();

      var nativeObjectToString = objectProto.toString;
      var objectCtorString = funcToString.call(Object);
      var oldDash = root._;
      var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
      var Buffer = moduleExports ? context.Buffer : undefined,
          Symbol = context.Symbol,
          Uint8Array = context.Uint8Array,
          allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
          getPrototype = overArg(Object.getPrototypeOf, Object),
          objectCreate = Object.create,
          propertyIsEnumerable = objectProto.propertyIsEnumerable,
          splice = arrayProto.splice,
          spreadableSymbol = Symbol ? typeof Symbol === "function" ? Symbol.isConcatSpreadable : "@@isConcatSpreadable" : undefined,
          symIterator = Symbol ? typeof Symbol === "function" ? Symbol.iterator : "@@iterator" : undefined,
          symToStringTag = Symbol ? typeof Symbol === "function" ? Symbol.toStringTag : "@@toStringTag" : undefined;

      var defineProperty = function () {
        try {
          var func = getNative(Object, 'defineProperty');
          func({}, '', {});
          return func;
        } catch (e) {}
      }();

      var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
          ctxNow = Date && Date.now !== root.Date.now && Date.now,
          ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
      var nativeCeil = Math.ceil,
          nativeFloor = Math.floor,
          nativeGetSymbols = Object.getOwnPropertySymbols,
          nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
          nativeIsFinite = context.isFinite,
          nativeJoin = arrayProto.join,
          nativeKeys = overArg(Object.keys, Object),
          nativeMax = Math.max,
          nativeMin = Math.min,
          nativeNow = Date.now,
          nativeParseInt = context.parseInt,
          nativeRandom = Math.random,
          nativeReverse = arrayProto.reverse;
      var DataView = getNative(context, 'DataView'),
          Map = getNative(context, 'Map'),
          Promise = getNative(context, 'Promise'),
          Set = getNative(context, 'Set'),
          WeakMap = getNative(context, 'WeakMap'),
          nativeCreate = getNative(Object, 'create');
      var metaMap = WeakMap && new WeakMap();
      var realNames = {};
      var dataViewCtorString = toSource(DataView),
          mapCtorString = toSource(Map),
          promiseCtorString = toSource(Promise),
          setCtorString = toSource(Set),
          weakMapCtorString = toSource(WeakMap);
      var symbolProto = Symbol ? typeof Symbol === "function" ? Symbol.prototype : "@@prototype" : undefined,
          symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
          symbolToString = symbolProto ? symbolProto.toString : undefined;

      function lodash(value) {
        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }

          if (hasOwnProperty.call(value, '__wrapped__')) {
            return wrapperClone(value);
          }
        }

        return new LodashWrapper(value);
      }

      var baseCreate = function () {
        function object() {}

        return function (proto) {
          if (!isObject(proto)) {
            return {};
          }

          if (objectCreate) {
            return objectCreate(proto);
          }

          object.prototype = proto;
          var result = new object();
          object.prototype = undefined;
          return result;
        };
      }();

      function baseLodash() {}

      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined;
      }

      lodash.templateSettings = {
        'escape': reEscape,
        'evaluate': reEvaluate,
        'interpolate': reInterpolate,
        'variable': '',
        'imports': {
          '_': lodash
        }
      };
      lodash.prototype = baseLodash.prototype;
      lodash.prototype.constructor = lodash;
      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;

      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }

      function lazyClone() {
        var result = new LazyWrapper(this.__wrapped__);
        result.__actions__ = copyArray(this.__actions__);
        result.__dir__ = this.__dir__;
        result.__filtered__ = this.__filtered__;
        result.__iteratees__ = copyArray(this.__iteratees__);
        result.__takeCount__ = this.__takeCount__;
        result.__views__ = copyArray(this.__views__);
        return result;
      }

      function lazyReverse() {
        if (this.__filtered__) {
          var result = new LazyWrapper(this);
          result.__dir__ = -1;
          result.__filtered__ = true;
        } else {
          result = this.clone();
          result.__dir__ *= -1;
        }

        return result;
      }

      function lazyValue() {
        var array = this.__wrapped__.value(),
            dir = this.__dir__,
            isArr = isArray(array),
            isRight = dir < 0,
            arrLength = isArr ? array.length : 0,
            view = getView(0, arrLength, this.__views__),
            start = view.start,
            end = view.end,
            length = end - start,
            index = isRight ? end : start - 1,
            iteratees = this.__iteratees__,
            iterLength = iteratees.length,
            resIndex = 0,
            takeCount = nativeMin(length, this.__takeCount__);

        if (!isArr || !isRight && arrLength == length && takeCount == length) {
          return baseWrapperValue(array, this.__actions__);
        }

        var result = [];

        outer: while (length-- && resIndex < takeCount) {
          index += dir;
          var iterIndex = -1,
              value = array[index];

          while (++iterIndex < iterLength) {
            var data = iteratees[iterIndex],
                iteratee = data.iteratee,
                type = data.type,
                computed = iteratee(value);

            if (type == LAZY_MAP_FLAG) {
              value = computed;
            } else if (!computed) {
              if (type == LAZY_FILTER_FLAG) {
                continue outer;
              } else {
                break outer;
              }
            }
          }

          result[resIndex++] = value;
        }

        return result;
      }

      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;

      function Hash(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;
        this.clear();

        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }

      function hashDelete(key) {
        var result = this.has(key) && delete this.__data__[key];
        this.size -= result ? 1 : 0;
        return result;
      }

      function hashGet(key) {
        var data = this.__data__;

        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? undefined : result;
        }

        return hasOwnProperty.call(data, key) ? data[key] : undefined;
      }

      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
      }

      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
        return this;
      }

      Hash.prototype.clear = hashClear;
      Hash.prototype['delete'] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;

      function ListCache(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;
        this.clear();

        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }

      function listCacheDelete(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);

        if (index < 0) {
          return false;
        }

        var lastIndex = data.length - 1;

        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }

        --this.size;
        return true;
      }

      function listCacheGet(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);
        return index < 0 ? undefined : data[index][1];
      }

      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }

      function listCacheSet(key, value) {
        var data = this.__data__,
            index = assocIndexOf(data, key);

        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }

        return this;
      }

      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype['delete'] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;

      function MapCache(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;
        this.clear();

        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          'hash': new Hash(),
          'map': new (Map || ListCache)(),
          'string': new Hash()
        };
      }

      function mapCacheDelete(key) {
        var result = getMapData(this, key)['delete'](key);
        this.size -= result ? 1 : 0;
        return result;
      }

      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }

      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }

      function mapCacheSet(key, value) {
        var data = getMapData(this, key),
            size = data.size;
        data.set(key, value);
        this.size += data.size == size ? 0 : 1;
        return this;
      }

      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype['delete'] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;

      function SetCache(values) {
        var index = -1,
            length = values == null ? 0 : values.length;
        this.__data__ = new MapCache();

        while (++index < length) {
          this.add(values[index]);
        }
      }

      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);

        return this;
      }

      function setCacheHas(value) {
        return this.__data__.has(value);
      }

      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;

      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }

      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }

      function stackDelete(key) {
        var data = this.__data__,
            result = data['delete'](key);
        this.size = data.size;
        return result;
      }

      function stackGet(key) {
        return this.__data__.get(key);
      }

      function stackHas(key) {
        return this.__data__.has(key);
      }

      function stackSet(key, value) {
        var data = this.__data__;

        if (data instanceof ListCache) {
          var pairs = data.__data__;

          if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }

          data = this.__data__ = new MapCache(pairs);
        }

        data.set(key, value);
        this.size = data.size;
        return this;
      }

      Stack.prototype.clear = stackClear;
      Stack.prototype['delete'] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;

      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value),
            isArg = !isArr && isArguments(value),
            isBuff = !isArr && !isArg && isBuffer(value),
            isType = !isArr && !isArg && !isBuff && isTypedArray(value),
            skipIndexes = isArr || isArg || isBuff || isType,
            result = skipIndexes ? baseTimes(value.length, String) : [],
            length = result.length;

        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isBuff && (key == 'offset' || key == 'parent') || isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || isIndex(key, length)))) {
            result.push(key);
          }
        }

        return result;
      }

      function arraySample(array) {
        var length = array.length;
        return length ? array[baseRandom(0, length - 1)] : undefined;
      }

      function arraySampleSize(array, n) {
        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
      }

      function arrayShuffle(array) {
        return shuffleSelf(copyArray(array));
      }

      function assignMergeValue(object, key, value) {
        if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }

      function assignValue(object, key, value) {
        var objValue = object[key];

        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }

      function assocIndexOf(array, key) {
        var length = array.length;

        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }

        return -1;
      }

      function baseAggregator(collection, setter, iteratee, accumulator) {
        baseEach(collection, function (value, key, collection) {
          setter(accumulator, value, iteratee(value), collection);
        });
        return accumulator;
      }

      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }

      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn(source), object);
      }

      function baseAssignValue(object, key, value) {
        if (key == '__proto__' && defineProperty) {
          defineProperty(object, key, {
            'configurable': true,
            'enumerable': true,
            'value': value,
            'writable': true
          });
        } else {
          object[key] = value;
        }
      }

      function baseAt(object, paths) {
        var index = -1,
            length = paths.length,
            result = Array(length),
            skip = object == null;

        while (++index < length) {
          result[index] = skip ? undefined : get(object, paths[index]);
        }

        return result;
      }

      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== undefined) {
            number = number <= upper ? number : upper;
          }

          if (lower !== undefined) {
            number = number >= lower ? number : lower;
          }
        }

        return number;
      }

      function baseClone(value, bitmask, customizer, key, object, stack) {
        var result,
            isDeep = bitmask & CLONE_DEEP_FLAG,
            isFlat = bitmask & CLONE_FLAT_FLAG,
            isFull = bitmask & CLONE_SYMBOLS_FLAG;

        if (customizer) {
          result = object ? customizer(value, key, object, stack) : customizer(value);
        }

        if (result !== undefined) {
          return result;
        }

        if (!isObject(value)) {
          return value;
        }

        var isArr = isArray(value);

        if (isArr) {
          result = initCloneArray(value);

          if (!isDeep) {
            return copyArray(value, result);
          }
        } else {
          var tag = getTag(value),
              isFunc = tag == funcTag || tag == genTag;

          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }

          if (tag == objectTag || tag == argsTag || isFunc && !object) {
            result = isFlat || isFunc ? {} : initCloneObject(value);

            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }

            result = initCloneByTag(value, tag, isDeep);
          }
        }

        stack || (stack = new Stack());
        var stacked = stack.get(value);

        if (stacked) {
          return stacked;
        }

        stack.set(value, result);

        if (isSet(value)) {
          value.forEach(function (subValue) {
            result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
          return result;
        }

        if (isMap(value)) {
          value.forEach(function (subValue, key) {
            result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
          });
          return result;
        }

        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? undefined : keysFunc(value);
        arrayEach(props || value, function (subValue, key) {
          if (props) {
            key = subValue;
            subValue = value[key];
          }

          assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
        return result;
      }

      function baseConforms(source) {
        var props = keys(source);
        return function (object) {
          return baseConformsTo(object, source, props);
        };
      }

      function baseConformsTo(object, source, props) {
        var length = props.length;

        if (object == null) {
          return !length;
        }

        object = Object(object);

        while (length--) {
          var key = props[length],
              predicate = source[key],
              value = object[key];

          if (value === undefined && !(key in object) || !predicate(value)) {
            return false;
          }
        }

        return true;
      }

      function baseDelay(func, wait, args) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        return setTimeout(function () {
          func.apply(undefined, args);
        }, wait);
      }

      function baseDifference(array, values, iteratee, comparator) {
        var index = -1,
            includes = arrayIncludes,
            isCommon = true,
            length = array.length,
            result = [],
            valuesLength = values.length;

        if (!length) {
          return result;
        }

        if (iteratee) {
          values = arrayMap(values, baseUnary(iteratee));
        }

        if (comparator) {
          includes = arrayIncludesWith;
          isCommon = false;
        } else if (values.length >= LARGE_ARRAY_SIZE) {
          includes = cacheHas;
          isCommon = false;
          values = new SetCache(values);
        }

        outer: while (++index < length) {
          var value = array[index],
              computed = iteratee == null ? value : iteratee(value);
          value = comparator || value !== 0 ? value : 0;

          if (isCommon && computed === computed) {
            var valuesIndex = valuesLength;

            while (valuesIndex--) {
              if (values[valuesIndex] === computed) {
                continue outer;
              }
            }

            result.push(value);
          } else if (!includes(values, computed, comparator)) {
            result.push(value);
          }
        }

        return result;
      }

      var baseEach = createBaseEach(baseForOwn);
      var baseEachRight = createBaseEach(baseForOwnRight, true);

      function baseEvery(collection, predicate) {
        var result = true;
        baseEach(collection, function (value, index, collection) {
          result = !!predicate(value, index, collection);
          return result;
        });
        return result;
      }

      function baseExtremum(array, iteratee, comparator) {
        var index = -1,
            length = array.length;

        while (++index < length) {
          var value = array[index],
              current = iteratee(value);

          if (current != null && (computed === undefined ? current === current && !isSymbol(current) : comparator(current, computed))) {
            var computed = current,
                result = value;
          }
        }

        return result;
      }

      function baseFill(array, value, start, end) {
        var length = array.length;
        start = toInteger(start);

        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }

        end = end === undefined || end > length ? length : toInteger(end);

        if (end < 0) {
          end += length;
        }

        end = start > end ? 0 : toLength(end);

        while (start < end) {
          array[start++] = value;
        }

        return array;
      }

      function baseFilter(collection, predicate) {
        var result = [];
        baseEach(collection, function (value, index, collection) {
          if (predicate(value, index, collection)) {
            result.push(value);
          }
        });
        return result;
      }

      function baseFlatten(array, depth, predicate, isStrict, result) {
        var index = -1,
            length = array.length;
        predicate || (predicate = isFlattenable);
        result || (result = []);

        while (++index < length) {
          var value = array[index];

          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result);
            } else {
              arrayPush(result, value);
            }
          } else if (!isStrict) {
            result[result.length] = value;
          }
        }

        return result;
      }

      var baseFor = createBaseFor();
      var baseForRight = createBaseFor(true);

      function baseForOwn(object, iteratee) {
        return object && baseFor(object, iteratee, keys);
      }

      function baseForOwnRight(object, iteratee) {
        return object && baseForRight(object, iteratee, keys);
      }

      function baseFunctions(object, props) {
        return arrayFilter(props, function (key) {
          return isFunction(object[key]);
        });
      }

      function baseGet(object, path) {
        path = castPath(path, object);
        var index = 0,
            length = path.length;

        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }

        return index && index == length ? object : undefined;
      }

      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result = keysFunc(object);
        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
      }

      function baseGetTag(value) {
        if (value == null) {
          return value === undefined ? undefinedTag : nullTag;
        }

        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
      }

      function baseGt(value, other) {
        return value > other;
      }

      function baseHas(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      }

      function baseHasIn(object, key) {
        return object != null && key in Object(object);
      }

      function baseInRange(number, start, end) {
        return number >= nativeMin(start, end) && number < nativeMax(start, end);
      }

      function baseIntersection(arrays, iteratee, comparator) {
        var includes = comparator ? arrayIncludesWith : arrayIncludes,
            length = arrays[0].length,
            othLength = arrays.length,
            othIndex = othLength,
            caches = Array(othLength),
            maxLength = Infinity,
            result = [];

        while (othIndex--) {
          var array = arrays[othIndex];

          if (othIndex && iteratee) {
            array = arrayMap(array, baseUnary(iteratee));
          }

          maxLength = nativeMin(array.length, maxLength);
          caches[othIndex] = !comparator && (iteratee || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined;
        }

        array = arrays[0];
        var index = -1,
            seen = caches[0];

        outer: while (++index < length && result.length < maxLength) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;
          value = comparator || value !== 0 ? value : 0;

          if (!(seen ? cacheHas(seen, computed) : includes(result, computed, comparator))) {
            othIndex = othLength;

            while (--othIndex) {
              var cache = caches[othIndex];

              if (!(cache ? cacheHas(cache, computed) : includes(arrays[othIndex], computed, comparator))) {
                continue outer;
              }
            }

            if (seen) {
              seen.push(computed);
            }

            result.push(value);
          }
        }

        return result;
      }

      function baseInverter(object, setter, iteratee, accumulator) {
        baseForOwn(object, function (value, key, object) {
          setter(accumulator, iteratee(value), key, object);
        });
        return accumulator;
      }

      function baseInvoke(object, path, args) {
        path = castPath(path, object);
        object = parent(object, path);
        var func = object == null ? object : object[toKey(last(path))];
        return func == null ? undefined : apply(func, object, args);
      }

      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }

      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }

      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }

      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }

        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }

        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }

      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object),
            othIsArr = isArray(other),
            objTag = objIsArr ? arrayTag : getTag(object),
            othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag,
            othIsObj = othTag == objectTag,
            isSameTag = objTag == othTag;

        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }

          objIsArr = true;
          objIsObj = false;
        }

        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }

        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
              othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object,
                othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }

        if (!isSameTag) {
          return false;
        }

        stack || (stack = new Stack());
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }

      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }

      function baseIsMatch(object, source, matchData, customizer) {
        var index = matchData.length,
            length = index,
            noCustomizer = !customizer;

        if (object == null) {
          return !length;
        }

        object = Object(object);

        while (index--) {
          var data = matchData[index];

          if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
          }
        }

        while (++index < length) {
          data = matchData[index];
          var key = data[0],
              objValue = object[key],
              srcValue = data[1];

          if (noCustomizer && data[2]) {
            if (objValue === undefined && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack();

            if (customizer) {
              var result = customizer(objValue, srcValue, key, object, source, stack);
            }

            if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
              return false;
            }
          }
        }

        return true;
      }

      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }

        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }

      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }

      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }

      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }

      function baseIteratee(value) {
        if (typeof value == 'function') {
          return value;
        }

        if (value == null) {
          return identity;
        }

        if (typeof value == 'object') {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }

        return property(value);
      }

      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }

        var result = [];

        for (var key in Object(object)) {
          if (hasOwnProperty.call(object, key) && key != 'constructor') {
            result.push(key);
          }
        }

        return result;
      }

      function baseKeysIn(object) {
        if (!isObject(object)) {
          return nativeKeysIn(object);
        }

        var isProto = isPrototype(object),
            result = [];

        for (var key in object) {
          if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
            result.push(key);
          }
        }

        return result;
      }

      function baseLt(value, other) {
        return value < other;
      }

      function baseMap(collection, iteratee) {
        var index = -1,
            result = isArrayLike(collection) ? Array(collection.length) : [];
        baseEach(collection, function (value, key, collection) {
          result[++index] = iteratee(value, key, collection);
        });
        return result;
      }

      function baseMatches(source) {
        var matchData = getMatchData(source);

        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }

        return function (object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }

      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }

        return function (object) {
          var objValue = get(object, path);
          return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }

      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }

        baseFor(source, function (srcValue, key) {
          if (isObject(srcValue)) {
            stack || (stack = new Stack());
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

            if (newValue === undefined) {
              newValue = srcValue;
            }

            assignMergeValue(object, key, newValue);
          }
        }, keysIn);
      }

      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key),
            srcValue = safeGet(source, key),
            stacked = stack.get(srcValue);

        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }

        var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
        var isCommon = newValue === undefined;

        if (isCommon) {
          var isArr = isArray(srcValue),
              isBuff = !isArr && isBuffer(srcValue),
              isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;

          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;

            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }

        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack['delete'](srcValue);
        }

        assignMergeValue(object, key, newValue);
      }

      function baseNth(array, n) {
        var length = array.length;

        if (!length) {
          return;
        }

        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array[n] : undefined;
      }

      function baseOrderBy(collection, iteratees, orders) {
        var index = -1;
        iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(getIteratee()));
        var result = baseMap(collection, function (value, key, collection) {
          var criteria = arrayMap(iteratees, function (iteratee) {
            return iteratee(value);
          });
          return {
            'criteria': criteria,
            'index': ++index,
            'value': value
          };
        });
        return baseSortBy(result, function (object, other) {
          return compareMultiple(object, other, orders);
        });
      }

      function basePick(object, paths) {
        return basePickBy(object, paths, function (value, path) {
          return hasIn(object, path);
        });
      }

      function basePickBy(object, paths, predicate) {
        var index = -1,
            length = paths.length,
            result = {};

        while (++index < length) {
          var path = paths[index],
              value = baseGet(object, path);

          if (predicate(value, path)) {
            baseSet(result, castPath(path, object), value);
          }
        }

        return result;
      }

      function basePropertyDeep(path) {
        return function (object) {
          return baseGet(object, path);
        };
      }

      function basePullAll(array, values, iteratee, comparator) {
        var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
            index = -1,
            length = values.length,
            seen = array;

        if (array === values) {
          values = copyArray(values);
        }

        if (iteratee) {
          seen = arrayMap(array, baseUnary(iteratee));
        }

        while (++index < length) {
          var fromIndex = 0,
              value = values[index],
              computed = iteratee ? iteratee(value) : value;

          while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
            if (seen !== array) {
              splice.call(seen, fromIndex, 1);
            }

            splice.call(array, fromIndex, 1);
          }
        }

        return array;
      }

      function basePullAt(array, indexes) {
        var length = array ? indexes.length : 0,
            lastIndex = length - 1;

        while (length--) {
          var index = indexes[length];

          if (length == lastIndex || index !== previous) {
            var previous = index;

            if (isIndex(index)) {
              splice.call(array, index, 1);
            } else {
              baseUnset(array, index);
            }
          }
        }

        return array;
      }

      function baseRandom(lower, upper) {
        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
      }

      function baseRange(start, end, step, fromRight) {
        var index = -1,
            length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
            result = Array(length);

        while (length--) {
          result[fromRight ? length : ++index] = start;
          start += step;
        }

        return result;
      }

      function baseRepeat(string, n) {
        var result = '';

        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result;
        }

        do {
          if (n % 2) {
            result += string;
          }

          n = nativeFloor(n / 2);

          if (n) {
            string += string;
          }
        } while (n);

        return result;
      }

      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + '');
      }

      function baseSample(collection) {
        return arraySample(values(collection));
      }

      function baseSampleSize(collection, n) {
        var array = values(collection);
        return shuffleSelf(array, baseClamp(n, 0, array.length));
      }

      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }

        path = castPath(path, object);
        var index = -1,
            length = path.length,
            lastIndex = length - 1,
            nested = object;

        while (nested != null && ++index < length) {
          var key = toKey(path[index]),
              newValue = value;

          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined;

            if (newValue === undefined) {
              newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }

          assignValue(nested, key, newValue);
          nested = nested[key];
        }

        return object;
      }

      var baseSetData = !metaMap ? identity : function (func, data) {
        metaMap.set(func, data);
        return func;
      };
      var baseSetToString = !defineProperty ? identity : function (func, string) {
        return defineProperty(func, 'toString', {
          'configurable': true,
          'enumerable': false,
          'value': constant(string),
          'writable': true
        });
      };

      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }

      function baseSlice(array, start, end) {
        var index = -1,
            length = array.length;

        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }

        end = end > length ? length : end;

        if (end < 0) {
          end += length;
        }

        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result = Array(length);

        while (++index < length) {
          result[index] = array[index + start];
        }

        return result;
      }

      function baseSome(collection, predicate) {
        var result;
        baseEach(collection, function (value, index, collection) {
          result = predicate(value, index, collection);
          return !result;
        });
        return !!result;
      }

      function baseSortedIndex(array, value, retHighest) {
        var low = 0,
            high = array == null ? low : array.length;

        if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = low + high >>> 1,
                computed = array[mid];

            if (computed !== null && !isSymbol(computed) && (retHighest ? computed <= value : computed < value)) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }

          return high;
        }

        return baseSortedIndexBy(array, value, identity, retHighest);
      }

      function baseSortedIndexBy(array, value, iteratee, retHighest) {
        value = iteratee(value);
        var low = 0,
            high = array == null ? 0 : array.length,
            valIsNaN = value !== value,
            valIsNull = value === null,
            valIsSymbol = isSymbol(value),
            valIsUndefined = value === undefined;

        while (low < high) {
          var mid = nativeFloor((low + high) / 2),
              computed = iteratee(array[mid]),
              othIsDefined = computed !== undefined,
              othIsNull = computed === null,
              othIsReflexive = computed === computed,
              othIsSymbol = isSymbol(computed);

          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed <= value : computed < value;
          }

          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }

        return nativeMin(high, MAX_ARRAY_INDEX);
      }

      function baseSortedUniq(array, iteratee) {
        var index = -1,
            length = array.length,
            resIndex = 0,
            result = [];

        while (++index < length) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          if (!index || !eq(computed, seen)) {
            var seen = computed;
            result[resIndex++] = value === 0 ? 0 : value;
          }
        }

        return result;
      }

      function baseToNumber(value) {
        if (typeof value == 'number') {
          return value;
        }

        if (isSymbol(value)) {
          return NAN;
        }

        return +value;
      }

      function baseToString(value) {
        if (typeof value == 'string') {
          return value;
        }

        if (isArray(value)) {
          return arrayMap(value, baseToString) + '';
        }

        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : '';
        }

        var result = value + '';
        return result == '0' && 1 / value == -INFINITY ? '-0' : result;
      }

      function baseUniq(array, iteratee, comparator) {
        var index = -1,
            includes = arrayIncludes,
            length = array.length,
            isCommon = true,
            result = [],
            seen = result;

        if (comparator) {
          isCommon = false;
          includes = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set = iteratee ? null : createSet(array);

          if (set) {
            return setToArray(set);
          }

          isCommon = false;
          includes = cacheHas;
          seen = new SetCache();
        } else {
          seen = iteratee ? [] : result;
        }

        outer: while (++index < length) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;
          value = comparator || value !== 0 ? value : 0;

          if (isCommon && computed === computed) {
            var seenIndex = seen.length;

            while (seenIndex--) {
              if (seen[seenIndex] === computed) {
                continue outer;
              }
            }

            if (iteratee) {
              seen.push(computed);
            }

            result.push(value);
          } else if (!includes(seen, computed, comparator)) {
            if (seen !== result) {
              seen.push(computed);
            }

            result.push(value);
          }
        }

        return result;
      }

      function baseUnset(object, path) {
        path = castPath(path, object);
        object = parent(object, path);
        return object == null || delete object[toKey(last(path))];
      }

      function baseUpdate(object, path, updater, customizer) {
        return baseSet(object, path, updater(baseGet(object, path)), customizer);
      }

      function baseWhile(array, predicate, isDrop, fromRight) {
        var length = array.length,
            index = fromRight ? length : -1;

        while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}

        return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
      }

      function baseWrapperValue(value, actions) {
        var result = value;

        if (result instanceof LazyWrapper) {
          result = result.value();
        }

        return arrayReduce(actions, function (result, action) {
          return action.func.apply(action.thisArg, arrayPush([result], action.args));
        }, result);
      }

      function baseXor(arrays, iteratee, comparator) {
        var length = arrays.length;

        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }

        var index = -1,
            result = Array(length);

        while (++index < length) {
          var array = arrays[index],
              othIndex = -1;

          while (++othIndex < length) {
            if (othIndex != index) {
              result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
            }
          }
        }

        return baseUniq(baseFlatten(result, 1), iteratee, comparator);
      }

      function baseZipObject(props, values, assignFunc) {
        var index = -1,
            length = props.length,
            valsLength = values.length,
            result = {};

        while (++index < length) {
          var value = index < valsLength ? values[index] : undefined;
          assignFunc(result, props[index], value);
        }

        return result;
      }

      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }

      function castFunction(value) {
        return typeof value == 'function' ? value : identity;
      }

      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }

        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }

      var castRest = baseRest;

      function castSlice(array, start, end) {
        var length = array.length;
        end = end === undefined ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }

      var clearTimeout = ctxClearTimeout || function (id) {
        return root.clearTimeout(id);
      };

      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }

        var length = buffer.length,
            result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result);
        return result;
      }

      function cloneArrayBuffer(arrayBuffer) {
        var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array(result).set(new Uint8Array(arrayBuffer));
        return result;
      }

      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }

      function cloneRegExp(regexp) {
        var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result.lastIndex = regexp.lastIndex;
        return result;
      }

      function cloneSymbol(symbol) {
        return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
      }

      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }

      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined,
              valIsNull = value === null,
              valIsReflexive = value === value,
              valIsSymbol = isSymbol(value);
          var othIsDefined = other !== undefined,
              othIsNull = other === null,
              othIsReflexive = other === other,
              othIsSymbol = isSymbol(other);

          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }

          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }

        return 0;
      }

      function compareMultiple(object, other, orders) {
        var index = -1,
            objCriteria = object.criteria,
            othCriteria = other.criteria,
            length = objCriteria.length,
            ordersLength = orders.length;

        while (++index < length) {
          var result = compareAscending(objCriteria[index], othCriteria[index]);

          if (result) {
            if (index >= ordersLength) {
              return result;
            }

            var order = orders[index];
            return result * (order == 'desc' ? -1 : 1);
          }
        }

        return object.index - other.index;
      }

      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1,
            argsLength = args.length,
            holdersLength = holders.length,
            leftIndex = -1,
            leftLength = partials.length,
            rangeLength = nativeMax(argsLength - holdersLength, 0),
            result = Array(leftLength + rangeLength),
            isUncurried = !isCurried;

        while (++leftIndex < leftLength) {
          result[leftIndex] = partials[leftIndex];
        }

        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result[holders[argsIndex]] = args[argsIndex];
          }
        }

        while (rangeLength--) {
          result[leftIndex++] = args[argsIndex++];
        }

        return result;
      }

      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1,
            argsLength = args.length,
            holdersIndex = -1,
            holdersLength = holders.length,
            rightIndex = -1,
            rightLength = partials.length,
            rangeLength = nativeMax(argsLength - holdersLength, 0),
            result = Array(rangeLength + rightLength),
            isUncurried = !isCurried;

        while (++argsIndex < rangeLength) {
          result[argsIndex] = args[argsIndex];
        }

        var offset = argsIndex;

        while (++rightIndex < rightLength) {
          result[offset + rightIndex] = partials[rightIndex];
        }

        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }

        return result;
      }

      function copyArray(source, array) {
        var index = -1,
            length = source.length;
        array || (array = Array(length));

        while (++index < length) {
          array[index] = source[index];
        }

        return array;
      }

      function copyObject(source, props, object, customizer) {
        var isNew = !object;
        object || (object = {});
        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

          if (newValue === undefined) {
            newValue = source[key];
          }

          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }

        return object;
      }

      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }

      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }

      function createAggregator(setter, initializer) {
        return function (collection, iteratee) {
          var func = isArray(collection) ? arrayAggregator : baseAggregator,
              accumulator = initializer ? initializer() : {};
          return func(collection, setter, getIteratee(iteratee, 2), accumulator);
        };
      }

      function createAssigner(assigner) {
        return baseRest(function (object, sources) {
          var index = -1,
              length = sources.length,
              customizer = length > 1 ? sources[length - 1] : undefined,
              guard = length > 2 ? sources[2] : undefined;
          customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined : customizer;
            length = 1;
          }

          object = Object(object);

          while (++index < length) {
            var source = sources[index];

            if (source) {
              assigner(object, source, index, customizer);
            }
          }

          return object;
        });
      }

      function createBaseEach(eachFunc, fromRight) {
        return function (collection, iteratee) {
          if (collection == null) {
            return collection;
          }

          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee);
          }

          var length = collection.length,
              index = fromRight ? length : -1,
              iterable = Object(collection);

          while (fromRight ? index-- : ++index < length) {
            if (iteratee(iterable[index], index, iterable) === false) {
              break;
            }
          }

          return collection;
        };
      }

      function createBaseFor(fromRight) {
        return function (object, iteratee, keysFunc) {
          var index = -1,
              iterable = Object(object),
              props = keysFunc(object),
              length = props.length;

          while (length--) {
            var key = props[fromRight ? length : ++index];

            if (iteratee(iterable[key], key, iterable) === false) {
              break;
            }
          }

          return object;
        };
      }

      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG,
            Ctor = createCtor(func);

        function wrapper() {
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }

        return wrapper;
      }

      function createCaseFirst(methodName) {
        return function (string) {
          string = toString(string);
          var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined;
          var chr = strSymbols ? strSymbols[0] : string.charAt(0);
          var trailing = strSymbols ? castSlice(strSymbols, 1).join('') : string.slice(1);
          return chr[methodName]() + trailing;
        };
      }

      function createCompounder(callback) {
        return function (string) {
          return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
        };
      }

      function createCtor(Ctor) {
        return function () {
          var args = arguments;

          switch (args.length) {
            case 0:
              return new Ctor();

            case 1:
              return new Ctor(args[0]);

            case 2:
              return new Ctor(args[0], args[1]);

            case 3:
              return new Ctor(args[0], args[1], args[2]);

            case 4:
              return new Ctor(args[0], args[1], args[2], args[3]);

            case 5:
              return new Ctor(args[0], args[1], args[2], args[3], args[4]);

            case 6:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);

            case 7:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }

          var thisBinding = baseCreate(Ctor.prototype),
              result = Ctor.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        };
      }

      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);

        function wrapper() {
          var length = arguments.length,
              args = Array(length),
              index = length,
              placeholder = getHolder(wrapper);

          while (index--) {
            args[index] = arguments[index];
          }

          var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
          length -= holders.length;

          if (length < arity) {
            return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, undefined, args, holders, undefined, undefined, arity - length);
          }

          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return apply(fn, this, args);
        }

        return wrapper;
      }

      function createFind(findIndexFunc) {
        return function (collection, predicate, fromIndex) {
          var iterable = Object(collection);

          if (!isArrayLike(collection)) {
            var iteratee = getIteratee(predicate, 3);
            collection = keys(collection);

            predicate = function predicate(key) {
              return iteratee(iterable[key], key, iterable);
            };
          }

          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
        };
      }

      function createFlow(fromRight) {
        return flatRest(function (funcs) {
          var length = funcs.length,
              index = length,
              prereq = LodashWrapper.prototype.thru;

          if (fromRight) {
            funcs.reverse();
          }

          while (index--) {
            var func = funcs[index];

            if (typeof func != 'function') {
              throw new TypeError(FUNC_ERROR_TEXT);
            }

            if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
              var wrapper = new LodashWrapper([], true);
            }
          }

          index = wrapper ? index : length;

          while (++index < length) {
            func = funcs[index];
            var funcName = getFuncName(func),
                data = funcName == 'wrapper' ? getData(func) : undefined;

            if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
            }
          }

          return function () {
            var args = arguments,
                value = args[0];

            if (wrapper && args.length == 1 && isArray(value)) {
              return wrapper.plant(value).value();
            }

            var index = 0,
                result = length ? funcs[index].apply(this, args) : value;

            while (++index < length) {
              result = funcs[index].call(this, result);
            }

            return result;
          };
        });
      }

      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG,
            isBind = bitmask & WRAP_BIND_FLAG,
            isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
            isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
            isFlip = bitmask & WRAP_FLIP_FLAG,
            Ctor = isBindKey ? undefined : createCtor(func);

        function wrapper() {
          var length = arguments.length,
              args = Array(length),
              index = length;

          while (index--) {
            args[index] = arguments[index];
          }

          if (isCurried) {
            var placeholder = getHolder(wrapper),
                holdersCount = countHolders(args, placeholder);
          }

          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }

          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }

          length -= holdersCount;

          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, thisArg, args, newHolders, argPos, ary, arity - length);
          }

          var thisBinding = isBind ? thisArg : this,
              fn = isBindKey ? thisBinding[func] : func;
          length = args.length;

          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }

          if (isAry && ary < length) {
            args.length = ary;
          }

          if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }

          return fn.apply(thisBinding, args);
        }

        return wrapper;
      }

      function createInverter(setter, toIteratee) {
        return function (object, iteratee) {
          return baseInverter(object, setter, toIteratee(iteratee), {});
        };
      }

      function createMathOperation(operator, defaultValue) {
        return function (value, other) {
          var result;

          if (value === undefined && other === undefined) {
            return defaultValue;
          }

          if (value !== undefined) {
            result = value;
          }

          if (other !== undefined) {
            if (result === undefined) {
              return other;
            }

            if (typeof value == 'string' || typeof other == 'string') {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }

            result = operator(value, other);
          }

          return result;
        };
      }

      function createOver(arrayFunc) {
        return flatRest(function (iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function (args) {
            var thisArg = this;
            return arrayFunc(iteratees, function (iteratee) {
              return apply(iteratee, thisArg, args);
            });
          });
        });
      }

      function createPadding(length, chars) {
        chars = chars === undefined ? ' ' : baseToString(chars);
        var charsLength = chars.length;

        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }

        var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join('') : result.slice(0, length);
      }

      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG,
            Ctor = createCtor(func);

        function wrapper() {
          var argsIndex = -1,
              argsLength = arguments.length,
              leftIndex = -1,
              leftLength = partials.length,
              args = Array(leftLength + argsLength),
              fn = this && this !== root && this instanceof wrapper ? Ctor : func;

          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }

          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }

          return apply(fn, isBind ? thisArg : this, args);
        }

        return wrapper;
      }

      function createRange(fromRight) {
        return function (start, end, step) {
          if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
            end = step = undefined;
          }

          start = toFinite(start);

          if (end === undefined) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }

          step = step === undefined ? start < end ? 1 : -1 : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }

      function createRelationalOperation(operator) {
        return function (value, other) {
          if (!(typeof value == 'string' && typeof other == 'string')) {
            value = toNumber(value);
            other = toNumber(other);
          }

          return operator(value, other);
        };
      }

      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG,
            newHolders = isCurry ? holders : undefined,
            newHoldersRight = isCurry ? undefined : holders,
            newPartials = isCurry ? partials : undefined,
            newPartialsRight = isCurry ? undefined : partials;
        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }

        var newData = [func, bitmask, thisArg, newPartials, newHolders, newPartialsRight, newHoldersRight, argPos, ary, arity];
        var result = wrapFunc.apply(undefined, newData);

        if (isLaziable(func)) {
          setData(result, newData);
        }

        result.placeholder = placeholder;
        return setWrapToString(result, func, bitmask);
      }

      function createRound(methodName) {
        var func = Math[methodName];
        return function (number, precision) {
          number = toNumber(number);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);

          if (precision) {
            var pair = (toString(number) + 'e').split('e'),
                value = func(pair[0] + 'e' + (+pair[1] + precision));
            pair = (toString(value) + 'e').split('e');
            return +(pair[0] + 'e' + (+pair[1] - precision));
          }

          return func(number);
        };
      }

      var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY) ? noop : function (values) {
        return new Set(values);
      };

      function createToPairs(keysFunc) {
        return function (object) {
          var tag = getTag(object);

          if (tag == mapTag) {
            return mapToArray(object);
          }

          if (tag == setTag) {
            return setToPairs(object);
          }

          return baseToPairs(object, keysFunc(object));
        };
      }

      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;

        if (!isBindKey && typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        var length = partials ? partials.length : 0;

        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined;
        }

        ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
        arity = arity === undefined ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;

        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials,
              holdersRight = holders;
          partials = holders = undefined;
        }

        var data = isBindKey ? undefined : getData(func);
        var newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

        if (data) {
          mergeData(newData, data);
        }

        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);

        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }

        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result = createPartial(func, bitmask, thisArg, partials);
        } else {
          result = createHybrid.apply(undefined, newData);
        }

        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result, newData), func, bitmask);
      }

      function customDefaultsAssignIn(objValue, srcValue, key, object) {
        if (objValue === undefined || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
          return srcValue;
        }

        return objValue;
      }

      function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
        if (isObject(objValue) && isObject(srcValue)) {
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
          stack['delete'](srcValue);
        }

        return objValue;
      }

      function customOmitClone(value) {
        return isPlainObject(value) ? undefined : value;
      }

      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
            arrLength = array.length,
            othLength = other.length;

        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }

        var stacked = stack.get(array);

        if (stacked && stack.get(other)) {
          return stacked == other;
        }

        var index = -1,
            result = true,
            seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
        stack.set(array, other);
        stack.set(other, array);

        while (++index < arrLength) {
          var arrValue = array[index],
              othValue = other[index];

          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
          }

          if (compared !== undefined) {
            if (compared) {
              continue;
            }

            result = false;
            break;
          }

          if (seen) {
            if (!arraySome(other, function (othValue, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result = false;
            break;
          }
        }

        stack['delete'](array);
        stack['delete'](other);
        return result;
      }

      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
              return false;
            }

            object = object.buffer;
            other = other.buffer;

          case arrayBufferTag:
            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
              return false;
            }

            return true;

          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);

          case errorTag:
            return object.name == other.name && object.message == other.message;

          case regexpTag:
          case stringTag:
            return object == other + '';

          case mapTag:
            var convert = mapToArray;

          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);

            if (object.size != other.size && !isPartial) {
              return false;
            }

            var stacked = stack.get(object);

            if (stacked) {
              return stacked == other;
            }

            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack['delete'](object);
            return result;

          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }

        }

        return false;
      }

      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
            objProps = getAllKeys(object),
            objLength = objProps.length,
            othProps = getAllKeys(other),
            othLength = othProps.length;

        if (objLength != othLength && !isPartial) {
          return false;
        }

        var index = objLength;

        while (index--) {
          var key = objProps[index];

          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }

        var stacked = stack.get(object);

        if (stacked && stack.get(other)) {
          return stacked == other;
        }

        var result = true;
        stack.set(object, other);
        stack.set(other, object);
        var skipCtor = isPartial;

        while (++index < objLength) {
          key = objProps[index];
          var objValue = object[key],
              othValue = other[key];

          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
          }

          if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result = false;
            break;
          }

          skipCtor || (skipCtor = key == 'constructor');
        }

        if (result && !skipCtor) {
          var objCtor = object.constructor,
              othCtor = other.constructor;

          if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
            result = false;
          }
        }

        stack['delete'](object);
        stack['delete'](other);
        return result;
      }

      function flatRest(func) {
        return setToString(overRest(func, undefined, flatten), func + '');
      }

      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }

      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn, getSymbolsIn);
      }

      var getData = !metaMap ? noop : function (func) {
        return metaMap.get(func);
      };

      function getFuncName(func) {
        var result = func.name + '',
            array = realNames[result],
            length = hasOwnProperty.call(realNames, result) ? array.length : 0;

        while (length--) {
          var data = array[length],
              otherFunc = data.func;

          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }

        return result;
      }

      function getHolder(func) {
        var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
        return object.placeholder;
      }

      function getIteratee() {
        var result = lodash.iteratee || iteratee;
        result = result === iteratee ? baseIteratee : result;
        return arguments.length ? result(arguments[0], arguments[1]) : result;
      }

      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
      }

      function getMatchData(object) {
        var result = keys(object),
            length = result.length;

        while (length--) {
          var key = result[length],
              value = object[key];
          result[length] = [key, value, isStrictComparable(value)];
        }

        return result;
      }

      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : undefined;
      }

      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag),
            tag = value[symToStringTag];

        try {
          value[symToStringTag] = undefined;
          var unmasked = true;
        } catch (e) {}

        var result = nativeObjectToString.call(value);

        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }

        return result;
      }

      var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
        if (object == null) {
          return [];
        }

        object = Object(object);
        return arrayFilter(nativeGetSymbols(object), function (symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function (object) {
        var result = [];

        while (object) {
          arrayPush(result, getSymbols(object));
          object = getPrototype(object);
        }

        return result;
      };
      var getTag = baseGetTag;

      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function getTag(value) {
          var result = baseGetTag(value),
              Ctor = result == objectTag ? value.constructor : undefined,
              ctorString = Ctor ? toSource(Ctor) : '';

          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;

              case mapCtorString:
                return mapTag;

              case promiseCtorString:
                return promiseTag;

              case setCtorString:
                return setTag;

              case weakMapCtorString:
                return weakMapTag;
            }
          }

          return result;
        };
      }

      function getView(start, end, transforms) {
        var index = -1,
            length = transforms.length;

        while (++index < length) {
          var data = transforms[index],
              size = data.size;

          switch (data.type) {
            case 'drop':
              start += size;
              break;

            case 'dropRight':
              end -= size;
              break;

            case 'take':
              end = nativeMin(end, start + size);
              break;

            case 'takeRight':
              start = nativeMax(start, end - size);
              break;
          }
        }

        return {
          'start': start,
          'end': end
        };
      }

      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }

      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);
        var index = -1,
            length = path.length,
            result = false;

        while (++index < length) {
          var key = toKey(path[index]);

          if (!(result = object != null && hasFunc(object, key))) {
            break;
          }

          object = object[key];
        }

        if (result || ++index != length) {
          return result;
        }

        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
      }

      function initCloneArray(array) {
        var length = array.length,
            result = new array.constructor(length);

        if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
          result.index = array.index;
          result.input = array.input;
        }

        return result;
      }

      function initCloneObject(object) {
        return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
      }

      function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;

        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);

          case boolTag:
          case dateTag:
            return new Ctor(+object);

          case dataViewTag:
            return cloneDataView(object, isDeep);

          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object, isDeep);

          case mapTag:
            return new Ctor();

          case numberTag:
          case stringTag:
            return new Ctor(object);

          case regexpTag:
            return cloneRegExp(object);

          case setTag:
            return new Ctor();

          case symbolTag:
            return cloneSymbol(object);
        }
      }

      function insertWrapDetails(source, details) {
        var length = details.length;

        if (!length) {
          return source;
        }

        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
        details = details.join(length > 2 ? ', ' : ' ');
        return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
      }

      function isFlattenable(value) {
        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }

      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
      }

      function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
          return false;
        }

        var type = typeof index;

        if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
          return eq(object[index], value);
        }

        return false;
      }

      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }

        var type = typeof value;

        if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
          return true;
        }

        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
      }

      function isKeyable(value) {
        var type = typeof value;
        return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
      }

      function isLaziable(func) {
        var funcName = getFuncName(func),
            other = lodash[funcName];

        if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
          return false;
        }

        if (func === other) {
          return true;
        }

        var data = getData(other);
        return !!data && func === data[0];
      }

      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }

      var isMaskable = coreJsData ? isFunction : stubFalse;

      function isPrototype(value) {
        var Ctor = value && value.constructor,
            proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
        return value === proto;
      }

      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }

      function matchesStrictComparable(key, srcValue) {
        return function (object) {
          if (object == null) {
            return false;
          }

          return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
        };
      }

      function memoizeCapped(func) {
        var result = memoize(func, function (key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }

          return key;
        });
        var cache = result.cache;
        return result;
      }

      function mergeData(data, source) {
        var bitmask = data[1],
            srcBitmask = source[1],
            newBitmask = bitmask | srcBitmask,
            isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;

        if (!(isCommon || isCombo)) {
          return data;
        }

        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }

        var value = source[3];

        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }

        value = source[5];

        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }

        value = source[7];

        if (value) {
          data[7] = value;
        }

        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }

        if (data[9] == null) {
          data[9] = source[9];
        }

        data[0] = source[0];
        data[1] = newBitmask;
        return data;
      }

      function nativeKeysIn(object) {
        var result = [];

        if (object != null) {
          for (var key in Object(object)) {
            result.push(key);
          }
        }

        return result;
      }

      function objectToString(value) {
        return nativeObjectToString.call(value);
      }

      function overRest(func, start, transform) {
        start = nativeMax(start === undefined ? func.length - 1 : start, 0);
        return function () {
          var args = arguments,
              index = -1,
              length = nativeMax(args.length - start, 0),
              array = Array(length);

          while (++index < length) {
            array[index] = args[start + index];
          }

          index = -1;
          var otherArgs = Array(start + 1);

          while (++index < start) {
            otherArgs[index] = args[index];
          }

          otherArgs[start] = transform(array);
          return apply(func, this, otherArgs);
        };
      }

      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }

      function reorder(array, indexes) {
        var arrLength = array.length,
            length = nativeMin(indexes.length, arrLength),
            oldArray = copyArray(array);

        while (length--) {
          var index = indexes[length];
          array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
        }

        return array;
      }

      function safeGet(object, key) {
        if (key == '__proto__') {
          return;
        }

        return object[key];
      }

      var setData = shortOut(baseSetData);

      var setTimeout = ctxSetTimeout || function (func, wait) {
        return root.setTimeout(func, wait);
      };

      var setToString = shortOut(baseSetToString);

      function setWrapToString(wrapper, reference, bitmask) {
        var source = reference + '';
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }

      function shortOut(func) {
        var count = 0,
            lastCalled = 0;
        return function () {
          var stamp = nativeNow(),
              remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;

          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }

          return func.apply(undefined, arguments);
        };
      }

      function shuffleSelf(array, size) {
        var index = -1,
            length = array.length,
            lastIndex = length - 1;
        size = size === undefined ? length : size;

        while (++index < size) {
          var rand = baseRandom(index, lastIndex),
              value = array[rand];
          array[rand] = array[index];
          array[index] = value;
        }

        array.length = size;
        return array;
      }

      var stringToPath = memoizeCapped(function (string) {
        var result = [];

        if (string.charCodeAt(0) === 46) {
            result.push('');
          }

        string.replace(rePropName, function (match, number, quote, subString) {
          result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
        });
        return result;
      });

      function toKey(value) {
        if (typeof value == 'string' || isSymbol(value)) {
          return value;
        }

        var result = value + '';
        return result == '0' && 1 / value == -INFINITY ? '-0' : result;
      }

      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {}

          try {
            return func + '';
          } catch (e) {}
        }

        return '';
      }

      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function (pair) {
          var value = '_.' + pair[0];

          if (bitmask & pair[1] && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }

      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }

        var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result.__actions__ = copyArray(wrapper.__actions__);
        result.__index__ = wrapper.__index__;
        result.__values__ = wrapper.__values__;
        return result;
      }

      function chunk(array, size, guard) {
        if (guard ? isIterateeCall(array, size, guard) : size === undefined) {
          size = 1;
        } else {
          size = nativeMax(toInteger(size), 0);
        }

        var length = array == null ? 0 : array.length;

        if (!length || size < 1) {
          return [];
        }

        var index = 0,
            resIndex = 0,
            result = Array(nativeCeil(length / size));

        while (index < length) {
          result[resIndex++] = baseSlice(array, index, index += size);
        }

        return result;
      }

      function compact(array) {
        var index = -1,
            length = array == null ? 0 : array.length,
            resIndex = 0,
            result = [];

        while (++index < length) {
          var value = array[index];

          if (value) {
            result[resIndex++] = value;
          }
        }

        return result;
      }

      function concat() {
        var length = arguments.length;

        if (!length) {
          return [];
        }

        var args = Array(length - 1),
            array = arguments[0],
            index = length;

        while (index--) {
          args[index - 1] = arguments[index];
        }

        return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
      }

      var difference = baseRest(function (array, values) {
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
      });
      var differenceBy = baseRest(function (array, values) {
        var iteratee = last(values);

        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined;
        }

        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2)) : [];
      });
      var differenceWith = baseRest(function (array, values) {
        var comparator = last(values);

        if (isArrayLikeObject(comparator)) {
          comparator = undefined;
        }

        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator) : [];
      });

      function drop(array, n, guard) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return [];
        }

        n = guard || n === undefined ? 1 : toInteger(n);
        return baseSlice(array, n < 0 ? 0 : n, length);
      }

      function dropRight(array, n, guard) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return [];
        }

        n = guard || n === undefined ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }

      function dropRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
      }

      function dropWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
      }

      function fill(array, value, start, end) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return [];
        }

        if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
          start = 0;
          end = length;
        }

        return baseFill(array, value, start, end);
      }

      function findIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return -1;
        }

        var index = fromIndex == null ? 0 : toInteger(fromIndex);

        if (index < 0) {
          index = nativeMax(length + index, 0);
        }

        return baseFindIndex(array, getIteratee(predicate, 3), index);
      }

      function findLastIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return -1;
        }

        var index = length - 1;

        if (fromIndex !== undefined) {
          index = toInteger(fromIndex);
          index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }

        return baseFindIndex(array, getIteratee(predicate, 3), index, true);
      }

      function flatten(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, 1) : [];
      }

      function flattenDeep(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, INFINITY) : [];
      }

      function flattenDepth(array, depth) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return [];
        }

        depth = depth === undefined ? 1 : toInteger(depth);
        return baseFlatten(array, depth);
      }

      function fromPairs(pairs) {
        var index = -1,
            length = pairs == null ? 0 : pairs.length,
            result = {};

        while (++index < length) {
          var pair = pairs[index];
          result[pair[0]] = pair[1];
        }

        return result;
      }

      function head(array) {
        return array && array.length ? array[0] : undefined;
      }

      function indexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return -1;
        }

        var index = fromIndex == null ? 0 : toInteger(fromIndex);

        if (index < 0) {
          index = nativeMax(length + index, 0);
        }

        return baseIndexOf(array, value, index);
      }

      function initial(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 0, -1) : [];
      }

      var intersection = baseRest(function (arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
      });
      var intersectionBy = baseRest(function (arrays) {
        var iteratee = last(arrays),
            mapped = arrayMap(arrays, castArrayLikeObject);

        if (iteratee === last(mapped)) {
          iteratee = undefined;
        } else {
          mapped.pop();
        }

        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee, 2)) : [];
      });
      var intersectionWith = baseRest(function (arrays) {
        var comparator = last(arrays),
            mapped = arrayMap(arrays, castArrayLikeObject);
        comparator = typeof comparator == 'function' ? comparator : undefined;

        if (comparator) {
          mapped.pop();
        }

        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined, comparator) : [];
      });

      function join(array, separator) {
        return array == null ? '' : nativeJoin.call(array, separator);
      }

      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : undefined;
      }

      function lastIndexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return -1;
        }

        var index = length;

        if (fromIndex !== undefined) {
          index = toInteger(fromIndex);
          index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }

        return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
      }

      function nth(array, n) {
        return array && array.length ? baseNth(array, toInteger(n)) : undefined;
      }

      var pull = baseRest(pullAll);

      function pullAll(array, values) {
        return array && array.length && values && values.length ? basePullAll(array, values) : array;
      }

      function pullAllBy(array, values, iteratee) {
        return array && array.length && values && values.length ? basePullAll(array, values, getIteratee(iteratee, 2)) : array;
      }

      function pullAllWith(array, values, comparator) {
        return array && array.length && values && values.length ? basePullAll(array, values, undefined, comparator) : array;
      }

      var pullAt = flatRest(function (array, indexes) {
        var length = array == null ? 0 : array.length,
            result = baseAt(array, indexes);
        basePullAt(array, arrayMap(indexes, function (index) {
          return isIndex(index, length) ? +index : index;
        }).sort(compareAscending));
        return result;
      });

      function remove(array, predicate) {
        var result = [];

        if (!(array && array.length)) {
          return result;
        }

        var index = -1,
            indexes = [],
            length = array.length;
        predicate = getIteratee(predicate, 3);

        while (++index < length) {
          var value = array[index];

          if (predicate(value, index, array)) {
            result.push(value);
            indexes.push(index);
          }
        }

        basePullAt(array, indexes);
        return result;
      }

      function reverse(array) {
        return array == null ? array : nativeReverse.call(array);
      }

      function slice(array, start, end) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return [];
        }

        if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
          start = 0;
          end = length;
        } else {
          start = start == null ? 0 : toInteger(start);
          end = end === undefined ? length : toInteger(end);
        }

        return baseSlice(array, start, end);
      }

      function sortedIndex(array, value) {
        return baseSortedIndex(array, value);
      }

      function sortedIndexBy(array, value, iteratee) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
      }

      function sortedIndexOf(array, value) {
        var length = array == null ? 0 : array.length;

        if (length) {
          var index = baseSortedIndex(array, value);

          if (index < length && eq(array[index], value)) {
            return index;
          }
        }

        return -1;
      }

      function sortedLastIndex(array, value) {
        return baseSortedIndex(array, value, true);
      }

      function sortedLastIndexBy(array, value, iteratee) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
      }

      function sortedLastIndexOf(array, value) {
        var length = array == null ? 0 : array.length;

        if (length) {
          var index = baseSortedIndex(array, value, true) - 1;

          if (eq(array[index], value)) {
            return index;
          }
        }

        return -1;
      }

      function sortedUniq(array) {
        return array && array.length ? baseSortedUniq(array) : [];
      }

      function sortedUniqBy(array, iteratee) {
        return array && array.length ? baseSortedUniq(array, getIteratee(iteratee, 2)) : [];
      }

      function tail(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 1, length) : [];
      }

      function take(array, n, guard) {
        if (!(array && array.length)) {
          return [];
        }

        n = guard || n === undefined ? 1 : toInteger(n);
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }

      function takeRight(array, n, guard) {
        var length = array == null ? 0 : array.length;

        if (!length) {
          return [];
        }

        n = guard || n === undefined ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, n < 0 ? 0 : n, length);
      }

      function takeRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
      }

      function takeWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
      }

      var union = baseRest(function (arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      var unionBy = baseRest(function (arrays) {
        var iteratee = last(arrays);

        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined;
        }

        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
      });
      var unionWith = baseRest(function (arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == 'function' ? comparator : undefined;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
      });

      function uniq(array) {
        return array && array.length ? baseUniq(array) : [];
      }

      function uniqBy(array, iteratee) {
        return array && array.length ? baseUniq(array, getIteratee(iteratee, 2)) : [];
      }

      function uniqWith(array, comparator) {
        comparator = typeof comparator == 'function' ? comparator : undefined;
        return array && array.length ? baseUniq(array, undefined, comparator) : [];
      }

      function unzip(array) {
        if (!(array && array.length)) {
          return [];
        }

        var length = 0;
        array = arrayFilter(array, function (group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function (index) {
          return arrayMap(array, baseProperty(index));
        });
      }

      function unzipWith(array, iteratee) {
        if (!(array && array.length)) {
          return [];
        }

        var result = unzip(array);

        if (iteratee == null) {
          return result;
        }

        return arrayMap(result, function (group) {
          return apply(iteratee, undefined, group);
        });
      }

      var without = baseRest(function (array, values) {
        return isArrayLikeObject(array) ? baseDifference(array, values) : [];
      });
      var xor = baseRest(function (arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });
      var xorBy = baseRest(function (arrays) {
        var iteratee = last(arrays);

        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined;
        }

        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
      });
      var xorWith = baseRest(function (arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == 'function' ? comparator : undefined;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
      });
      var zip = baseRest(unzip);

      function zipObject(props, values) {
        return baseZipObject(props || [], values || [], assignValue);
      }

      function zipObjectDeep(props, values) {
        return baseZipObject(props || [], values || [], baseSet);
      }

      var zipWith = baseRest(function (arrays) {
        var length = arrays.length,
            iteratee = length > 1 ? arrays[length - 1] : undefined;
        iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined;
        return unzipWith(arrays, iteratee);
      });

      function chain(value) {
        var result = lodash(value);
        result.__chain__ = true;
        return result;
      }

      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }

      function thru(value, interceptor) {
        return interceptor(value);
      }

      var wrapperAt = flatRest(function (paths) {
        var length = paths.length,
            start = length ? paths[0] : 0,
            value = this.__wrapped__,
            interceptor = function interceptor(object) {
          return baseAt(object, paths);
        };

        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }

        value = value.slice(start, +start + (length ? 1 : 0));

        value.__actions__.push({
          'func': thru,
          'args': [interceptor],
          'thisArg': undefined
        });

        return new LodashWrapper(value, this.__chain__).thru(function (array) {
          if (length && !array.length) {
            array.push(undefined);
          }

          return array;
        });
      });

      function wrapperChain() {
        return chain(this);
      }

      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }

      function wrapperNext() {
        if (this.__values__ === undefined) {
          this.__values__ = toArray(this.value());
        }

        var done = this.__index__ >= this.__values__.length,
            value = done ? undefined : this.__values__[this.__index__++];
        return {
          'done': done,
          'value': value
        };
      }

      function wrapperToIterator() {
        return this;
      }

      function wrapperPlant(value) {
        var result,
            parent = this;

        while (parent instanceof baseLodash) {
          var clone = wrapperClone(parent);
          clone.__index__ = 0;
          clone.__values__ = undefined;

          if (result) {
            previous.__wrapped__ = clone;
          } else {
            result = clone;
          }

          var previous = clone;
          parent = parent.__wrapped__;
        }

        previous.__wrapped__ = value;
        return result;
      }

      function wrapperReverse() {
        var value = this.__wrapped__;

        if (value instanceof LazyWrapper) {
          var wrapped = value;

          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }

          wrapped = wrapped.reverse();

          wrapped.__actions__.push({
            'func': thru,
            'args': [reverse],
            'thisArg': undefined
          });

          return new LodashWrapper(wrapped, this.__chain__);
        }

        return this.thru(reverse);
      }

      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }

      var countBy = createAggregator(function (result, value, key) {
        if (hasOwnProperty.call(result, key)) {
          ++result[key];
        } else {
          baseAssignValue(result, key, 1);
        }
      });

      function every(collection, predicate, guard) {
        var func = isArray(collection) ? arrayEvery : baseEvery;

        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined;
        }

        return func(collection, getIteratee(predicate, 3));
      }

      function filter(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }

      var find = createFind(findIndex);
      var findLast = createFind(findLastIndex);

      function flatMap(collection, iteratee) {
        return baseFlatten(map(collection, iteratee), 1);
      }

      function flatMapDeep(collection, iteratee) {
        return baseFlatten(map(collection, iteratee), INFINITY);
      }

      function flatMapDepth(collection, iteratee, depth) {
        depth = depth === undefined ? 1 : toInteger(depth);
        return baseFlatten(map(collection, iteratee), depth);
      }

      function forEach(collection, iteratee) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee, 3));
      }

      function forEachRight(collection, iteratee) {
        var func = isArray(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee, 3));
      }

      var groupBy = createAggregator(function (result, value, key) {
        if (hasOwnProperty.call(result, key)) {
          result[key].push(value);
        } else {
          baseAssignValue(result, key, [value]);
        }
      });

      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
        var length = collection.length;

        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }

        return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
      }

      var invokeMap = baseRest(function (collection, path, args) {
        var index = -1,
            isFunc = typeof path == 'function',
            result = isArrayLike(collection) ? Array(collection.length) : [];
        baseEach(collection, function (value) {
          result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result;
      });
      var keyBy = createAggregator(function (result, value, key) {
        baseAssignValue(result, key, value);
      });

      function map(collection, iteratee) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee, 3));
      }

      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }

        if (!isArray(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }

        orders = guard ? undefined : orders;

        if (!isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }

        return baseOrderBy(collection, iteratees, orders);
      }

      var partition = createAggregator(function (result, value, key) {
        result[key ? 0 : 1].push(value);
      }, function () {
        return [[], []];
      });

      function reduce(collection, iteratee, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce,
            initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
      }

      function reduceRight(collection, iteratee, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce,
            initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
      }

      function reject(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }

      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }

      function sampleSize(collection, n, guard) {
        if (guard ? isIterateeCall(collection, n, guard) : n === undefined) {
          n = 1;
        } else {
          n = toInteger(n);
        }

        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }

      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }

      function size(collection) {
        if (collection == null) {
          return 0;
        }

        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }

        var tag = getTag(collection);

        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }

        return baseKeys(collection).length;
      }

      function some(collection, predicate, guard) {
        var func = isArray(collection) ? arraySome : baseSome;

        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined;
        }

        return func(collection, getIteratee(predicate, 3));
      }

      var sortBy = baseRest(function (collection, iteratees) {
        if (collection == null) {
          return [];
        }

        var length = iteratees.length;

        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }

        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });

      var now = ctxNow || function () {
        return root.Date.now();
      };

      function after(n, func) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        n = toInteger(n);
        return function () {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }

      function ary(func, n, guard) {
        n = guard ? undefined : n;
        n = func && n == null ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
      }

      function before(n, func) {
        var result;

        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        n = toInteger(n);
        return function () {
          if (--n > 0) {
            result = func.apply(this, arguments);
          }

          if (n <= 1) {
            func = undefined;
          }

          return result;
        };
      }

      var bind = baseRest(function (func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;

        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }

        return createWrap(func, bitmask, thisArg, partials, holders);
      });
      var bindKey = baseRest(function (object, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;

        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey));
          bitmask |= WRAP_PARTIAL_FLAG;
        }

        return createWrap(key, bitmask, object, partials, holders);
      });

      function curry(func, arity, guard) {
        arity = guard ? undefined : arity;
        var result = createWrap(func, WRAP_CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
        result.placeholder = curry.placeholder;
        return result;
      }

      function curryRight(func, arity, guard) {
        arity = guard ? undefined : arity;
        var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
        result.placeholder = curryRight.placeholder;
        return result;
      }

      function debounce(func, wait, options) {
        var lastArgs,
            lastThis,
            maxWait,
            result,
            timerId,
            lastCallTime,
            lastInvokeTime = 0,
            leading = false,
            maxing = false,
            trailing = true;

        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        wait = toNumber(wait) || 0;

        if (isObject(options)) {
          leading = !!options.leading;
          maxing = 'maxWait' in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
          var args = lastArgs,
              thisArg = lastThis;
          lastArgs = lastThis = undefined;
          lastInvokeTime = time;
          result = func.apply(thisArg, args);
          return result;
        }

        function leadingEdge(time) {
          lastInvokeTime = time;
          timerId = setTimeout(timerExpired, wait);
          return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime,
              timeSinceLastInvoke = time - lastInvokeTime,
              timeWaiting = wait - timeSinceLastCall;
          return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }

        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime,
              timeSinceLastInvoke = time - lastInvokeTime;
          return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
        }

        function timerExpired() {
          var time = now();

          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }

          timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
          timerId = undefined;

          if (trailing && lastArgs) {
            return invokeFunc(time);
          }

          lastArgs = lastThis = undefined;
          return result;
        }

        function cancel() {
          if (timerId !== undefined) {
            clearTimeout(timerId);
          }

          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
          return timerId === undefined ? result : trailingEdge(now());
        }

        function debounced() {
          var time = now(),
              isInvoking = shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;

          if (isInvoking) {
            if (timerId === undefined) {
              return leadingEdge(lastCallTime);
            }

            if (maxing) {
              timerId = setTimeout(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }

          if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
          }

          return result;
        }

        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }

      var defer = baseRest(function (func, args) {
        return baseDelay(func, 1, args);
      });
      var delay = baseRest(function (func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });

      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }

      function memoize(func, resolver) {
        if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        var memoized = function memoized() {
          var args = arguments,
              key = resolver ? resolver.apply(this, args) : args[0],
              cache = memoized.cache;

          if (cache.has(key)) {
            return cache.get(key);
          }

          var result = func.apply(this, args);
          memoized.cache = cache.set(key, result) || cache;
          return result;
        };

        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }

      memoize.Cache = MapCache;

      function negate(predicate) {
        if (typeof predicate != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        return function () {
          var args = arguments;

          switch (args.length) {
            case 0:
              return !predicate.call(this);

            case 1:
              return !predicate.call(this, args[0]);

            case 2:
              return !predicate.call(this, args[0], args[1]);

            case 3:
              return !predicate.call(this, args[0], args[1], args[2]);
          }

          return !predicate.apply(this, args);
        };
      }

      function once(func) {
        return before(2, func);
      }

      var overArgs = castRest(function (func, transforms) {
        transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
        var funcsLength = transforms.length;
        return baseRest(function (args) {
          var index = -1,
              length = nativeMin(args.length, funcsLength);

          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }

          return apply(func, this, args);
        });
      });
      var partial = baseRest(function (func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
      });
      var partialRight = baseRest(function (func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
      });
      var rearg = flatRest(function (func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
      });

      function rest(func, start) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        start = start === undefined ? start : toInteger(start);
        return baseRest(func, start);
      }

      function spread(func, start) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function (args) {
          var array = args[start],
              otherArgs = castSlice(args, 0, start);

          if (array) {
            arrayPush(otherArgs, array);
          }

          return apply(func, this, otherArgs);
        });
      }

      function throttle(func, wait, options) {
        var leading = true,
            trailing = true;

        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }

        if (isObject(options)) {
          leading = 'leading' in options ? !!options.leading : leading;
          trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        return debounce(func, wait, {
          'leading': leading,
          'maxWait': wait,
          'trailing': trailing
        });
      }

      function unary(func) {
        return ary(func, 1);
      }

      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }

      function castArray() {
        if (!arguments.length) {
          return [];
        }

        var value = arguments[0];
        return isArray(value) ? value : [value];
      }

      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }

      function cloneWith(value, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }

      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }

      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }

      function conformsTo(object, source) {
        return source == null || baseConformsTo(object, source, keys(source));
      }

      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }

      var gt = createRelationalOperation(baseGt);
      var gte = createRelationalOperation(function (value, other) {
        return value >= other;
      });
      var isArguments = baseIsArguments(function () {
        return arguments;
      }()) ? baseIsArguments : function (value) {
        return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
      };
      var isArray = Array.isArray;
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;

      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }

      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }

      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
      }

      var isBuffer = nativeIsBuffer || stubFalse;
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
      }

      function isEmpty(value) {
        if (value == null) {
          return true;
        }

        if (isArrayLike(value) && (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }

        var tag = getTag(value);

        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }

        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }

        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }

        return true;
      }

      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }

      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined;
        var result = customizer ? customizer(value, other) : undefined;
        return result === undefined ? baseIsEqual(value, other, undefined, customizer) : !!result;
      }

      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }

        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag || typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value);
      }

      function isFinite(value) {
        return typeof value == 'number' && nativeIsFinite(value);
      }

      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }

        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }

      function isInteger(value) {
        return typeof value == 'number' && value == toInteger(value);
      }

      function isLength(value) {
        return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }

      function isObject(value) {
        var type = typeof value;
        return value != null && (type == 'object' || type == 'function');
      }

      function isObjectLike(value) {
        return value != null && typeof value == 'object';
      }

      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

      function isMatch(object, source) {
        return object === source || baseIsMatch(object, source, getMatchData(source));
      }

      function isMatchWith(object, source, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined;
        return baseIsMatch(object, source, getMatchData(source), customizer);
      }

      function isNaN(value) {
        return isNumber(value) && value != +value;
      }

      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error(CORE_ERROR_TEXT);
        }

        return baseIsNative(value);
      }

      function isNull(value) {
        return value === null;
      }

      function isNil(value) {
        return value == null;
      }

      function isNumber(value) {
        return typeof value == 'number' || isObjectLike(value) && baseGetTag(value) == numberTag;
      }

      function isPlainObject(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }

        var proto = getPrototype(value);

        if (proto === null) {
          return true;
        }

        var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
        return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }

      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }

      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

      function isString(value) {
        return typeof value == 'string' || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }

      function isSymbol(value) {
        return typeof value == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }

      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

      function isUndefined(value) {
        return value === undefined;
      }

      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }

      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }

      var lt = createRelationalOperation(baseLt);
      var lte = createRelationalOperation(function (value, other) {
        return value <= other;
      });

      function toArray(value) {
        if (!value) {
          return [];
        }

        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }

        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }

        var tag = getTag(value),
            func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
        return func(value);
      }

      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }

        value = toNumber(value);

        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }

        return value === value ? value : 0;
      }

      function toInteger(value) {
        var result = toFinite(value),
            remainder = result % 1;
        return result === result ? remainder ? result - remainder : result : 0;
      }

      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }

      function toNumber(value) {
        if (typeof value == 'number') {
          return value;
        }

        if (isSymbol(value)) {
          return NAN;
        }

        if (isObject(value)) {
          var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
          value = isObject(other) ? other + '' : other;
        }

        if (typeof value != 'string') {
          return value === 0 ? value : +value;
        }

        value = value.replace(reTrim, '');
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }

      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }

      function toSafeInteger(value) {
        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
      }

      function toString(value) {
        return value == null ? '' : baseToString(value);
      }

      var assign = createAssigner(function (object, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }

        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });
      var assignIn = createAssigner(function (object, source) {
        copyObject(source, keysIn(source), object);
      });
      var assignInWith = createAssigner(function (object, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object, customizer);
      });
      var assignWith = createAssigner(function (object, source, srcIndex, customizer) {
        copyObject(source, keys(source), object, customizer);
      });
      var at = flatRest(baseAt);

      function create(prototype, properties) {
        var result = baseCreate(prototype);
        return properties == null ? result : baseAssign(result, properties);
      }

      var defaults = baseRest(function (object, sources) {
        object = Object(object);
        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined;

        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }

        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;

          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object[key];

            if (value === undefined || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
              object[key] = source[key];
            }
          }
        }

        return object;
      });
      var defaultsDeep = baseRest(function (args) {
        args.push(undefined, customDefaultsMerge);
        return apply(mergeWith, undefined, args);
      });

      function findKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
      }

      function findLastKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
      }

      function forIn(object, iteratee) {
        return object == null ? object : baseFor(object, getIteratee(iteratee, 3), keysIn);
      }

      function forInRight(object, iteratee) {
        return object == null ? object : baseForRight(object, getIteratee(iteratee, 3), keysIn);
      }

      function forOwn(object, iteratee) {
        return object && baseForOwn(object, getIteratee(iteratee, 3));
      }

      function forOwnRight(object, iteratee) {
        return object && baseForOwnRight(object, getIteratee(iteratee, 3));
      }

      function functions(object) {
        return object == null ? [] : baseFunctions(object, keys(object));
      }

      function functionsIn(object) {
        return object == null ? [] : baseFunctions(object, keysIn(object));
      }

      function get(object, path, defaultValue) {
        var result = object == null ? undefined : baseGet(object, path);
        return result === undefined ? defaultValue : result;
      }

      function has(object, path) {
        return object != null && hasPath(object, path, baseHas);
      }

      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }

      var invert = createInverter(function (result, value, key) {
        if (value != null && typeof value.toString != 'function') {
          value = nativeObjectToString.call(value);
        }

        result[value] = key;
      }, constant(identity));
      var invertBy = createInverter(function (result, value, key) {
        if (value != null && typeof value.toString != 'function') {
          value = nativeObjectToString.call(value);
        }

        if (hasOwnProperty.call(result, value)) {
          result[value].push(key);
        } else {
          result[value] = [key];
        }
      }, getIteratee);
      var invoke = baseRest(baseInvoke);

      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }

      function keysIn(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }

      function mapKeys(object, iteratee) {
        var result = {};
        iteratee = getIteratee(iteratee, 3);
        baseForOwn(object, function (value, key, object) {
          baseAssignValue(result, iteratee(value, key, object), value);
        });
        return result;
      }

      function mapValues(object, iteratee) {
        var result = {};
        iteratee = getIteratee(iteratee, 3);
        baseForOwn(object, function (value, key, object) {
          baseAssignValue(result, key, iteratee(value, key, object));
        });
        return result;
      }

      var merge = createAssigner(function (object, source, srcIndex) {
        baseMerge(object, source, srcIndex);
      });
      var mergeWith = createAssigner(function (object, source, srcIndex, customizer) {
        baseMerge(object, source, srcIndex, customizer);
      });
      var omit = flatRest(function (object, paths) {
        var result = {};

        if (object == null) {
          return result;
        }

        var isDeep = false;
        paths = arrayMap(paths, function (path) {
          path = castPath(path, object);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object, getAllKeysIn(object), result);

        if (isDeep) {
          result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }

        var length = paths.length;

        while (length--) {
          baseUnset(result, paths[length]);
        }

        return result;
      });

      function omitBy(object, predicate) {
        return pickBy(object, negate(getIteratee(predicate)));
      }

      var pick = flatRest(function (object, paths) {
        return object == null ? {} : basePick(object, paths);
      });

      function pickBy(object, predicate) {
        if (object == null) {
          return {};
        }

        var props = arrayMap(getAllKeysIn(object), function (prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object, props, function (value, path) {
          return predicate(value, path[0]);
        });
      }

      function result(object, path, defaultValue) {
        path = castPath(path, object);
        var index = -1,
            length = path.length;

        if (!length) {
          length = 1;
          object = undefined;
        }

        while (++index < length) {
          var value = object == null ? undefined : object[toKey(path[index])];

          if (value === undefined) {
            index = length;
            value = defaultValue;
          }

          object = isFunction(value) ? value.call(object) : value;
        }

        return object;
      }

      function set(object, path, value) {
        return object == null ? object : baseSet(object, path, value);
      }

      function setWith(object, path, value, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined;
        return object == null ? object : baseSet(object, path, value, customizer);
      }

      var toPairs = createToPairs(keys);
      var toPairsIn = createToPairs(keysIn);

      function transform(object, iteratee, accumulator) {
        var isArr = isArray(object),
            isArrLike = isArr || isBuffer(object) || isTypedArray(object);
        iteratee = getIteratee(iteratee, 4);

        if (accumulator == null) {
          var Ctor = object && object.constructor;

          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          } else {
            accumulator = {};
          }
        }

        (isArrLike ? arrayEach : baseForOwn)(object, function (value, index, object) {
          return iteratee(accumulator, value, index, object);
        });
        return accumulator;
      }

      function unset(object, path) {
        return object == null ? true : baseUnset(object, path);
      }

      function update(object, path, updater) {
        return object == null ? object : baseUpdate(object, path, castFunction(updater));
      }

      function updateWith(object, path, updater, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined;
        return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
      }

      function values(object) {
        return object == null ? [] : baseValues(object, keys(object));
      }

      function valuesIn(object) {
        return object == null ? [] : baseValues(object, keysIn(object));
      }

      function clamp(number, lower, upper) {
        if (upper === undefined) {
          upper = lower;
          lower = undefined;
        }

        if (upper !== undefined) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }

        if (lower !== undefined) {
          lower = toNumber(lower);
          lower = lower === lower ? lower : 0;
        }

        return baseClamp(toNumber(number), lower, upper);
      }

      function inRange(number, start, end) {
        start = toFinite(start);

        if (end === undefined) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }

        number = toNumber(number);
        return baseInRange(number, start, end);
      }

      function random(lower, upper, floating) {
        if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
          upper = floating = undefined;
        }

        if (floating === undefined) {
          if (typeof upper == 'boolean') {
            floating = upper;
            upper = undefined;
          } else if (typeof lower == 'boolean') {
            floating = lower;
            lower = undefined;
          }
        }

        if (lower === undefined && upper === undefined) {
          lower = 0;
          upper = 1;
        } else {
          lower = toFinite(lower);

          if (upper === undefined) {
            upper = lower;
            lower = 0;
          } else {
            upper = toFinite(upper);
          }
        }

        if (lower > upper) {
          var temp = lower;
          lower = upper;
          upper = temp;
        }

        if (floating || lower % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower + rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1))), upper);
        }

        return baseRandom(lower, upper);
      }

      var camelCase = createCompounder(function (result, word, index) {
        word = word.toLowerCase();
        return result + (index ? capitalize(word) : word);
      });

      function capitalize(string) {
        return upperFirst(toString(string).toLowerCase());
      }

      function deburr(string) {
        string = toString(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
      }

      function endsWith(string, target, position) {
        string = toString(string);
        target = baseToString(target);
        var length = string.length;
        position = position === undefined ? length : baseClamp(toInteger(position), 0, length);
        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }

      function escape(string) {
        string = toString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
      }

      function escapeRegExp(string) {
        string = toString(string);
        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, '\\$&') : string;
      }

      var kebabCase = createCompounder(function (result, word, index) {
        return result + (index ? '-' : '') + word.toLowerCase();
      });
      var lowerCase = createCompounder(function (result, word, index) {
        return result + (index ? ' ' : '') + word.toLowerCase();
      });
      var lowerFirst = createCaseFirst('toLowerCase');

      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;

        if (!length || strLength >= length) {
          return string;
        }

        var mid = (length - strLength) / 2;
        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
      }

      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }

      function padStart(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }

      function parseInt(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }

        return nativeParseInt(toString(string).replace(reTrimStart, ''), radix || 0);
      }

      function repeat(string, n, guard) {
        if (guard ? isIterateeCall(string, n, guard) : n === undefined) {
          n = 1;
        } else {
          n = toInteger(n);
        }

        return baseRepeat(toString(string), n);
      }

      function replace() {
        var args = arguments,
            string = toString(args[0]);
        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }

      var snakeCase = createCompounder(function (result, word, index) {
        return result + (index ? '_' : '') + word.toLowerCase();
      });

      function split(string, separator, limit) {
        if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined;
        }

        limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;

        if (!limit) {
          return [];
        }

        string = toString(string);

        if (string && (typeof separator == 'string' || separator != null && !isRegExp(separator))) {
          separator = baseToString(separator);

          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }

        return string.split(separator, limit);
      }

      var startCase = createCompounder(function (result, word, index) {
        return result + (index ? ' ' : '') + upperFirst(word);
      });

      function startsWith(string, target, position) {
        string = toString(string);
        position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }

      function template(string, options, guard) {
        var settings = lodash.templateSettings;

        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined;
        }

        string = toString(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);
        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
            importsKeys = keys(imports),
            importsValues = baseValues(imports, importsKeys);
        var isEscaping,
            isEvaluating,
            index = 0,
            interpolate = options.interpolate || reNoMatch,
            source = "__p += '";
        var reDelimiters = RegExp((options.escape || reNoMatch).source + '|' + interpolate.source + '|' + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' + (options.evaluate || reNoMatch).source + '|$', 'g');
        var sourceURL = '//# sourceURL=' + ('sourceURL' in options ? options.sourceURL : 'lodash.templateSources[' + ++templateCounter + ']') + '\n';
        string.replace(reDelimiters, function (match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);
          source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }

          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }

          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }

          index = offset + match.length;
          return match;
        });
        source += "';\n";
        var variable = options.variable;

        if (!variable) {
          source = 'with (obj) {\n' + source + '\n}\n';
        }

        source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source).replace(reEmptyStringMiddle, '$1').replace(reEmptyStringTrailing, '$1;');
        source = 'function(' + (variable || 'obj') + ') {\n' + (variable ? '' : 'obj || (obj = {});\n') + "var __t, __p = ''" + (isEscaping ? ', __e = _.escape' : '') + (isEvaluating ? ', __j = Array.prototype.join;\n' + "function print() { __p += __j.call(arguments, '') }\n" : ';\n') + source + 'return __p\n}';
        var result = attempt(function () {
          return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);
        });
        result.source = source;

        if (isError(result)) {
          throw result;
        }

        return result;
      }

      function toLower(value) {
        return toString(value).toLowerCase();
      }

      function toUpper(value) {
        return toString(value).toUpperCase();
      }

      function trim(string, chars, guard) {
        string = toString(string);

        if (string && (guard || chars === undefined)) {
          return string.replace(reTrim, '');
        }

        if (!string || !(chars = baseToString(chars))) {
          return string;
        }

        var strSymbols = stringToArray(string),
            chrSymbols = stringToArray(chars),
            start = charsStartIndex(strSymbols, chrSymbols),
            end = charsEndIndex(strSymbols, chrSymbols) + 1;
        return castSlice(strSymbols, start, end).join('');
      }

      function trimEnd(string, chars, guard) {
        string = toString(string);

        if (string && (guard || chars === undefined)) {
          return string.replace(reTrimEnd, '');
        }

        if (!string || !(chars = baseToString(chars))) {
          return string;
        }

        var strSymbols = stringToArray(string),
            end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
        return castSlice(strSymbols, 0, end).join('');
      }

      function trimStart(string, chars, guard) {
        string = toString(string);

        if (string && (guard || chars === undefined)) {
          return string.replace(reTrimStart, '');
        }

        if (!string || !(chars = baseToString(chars))) {
          return string;
        }

        var strSymbols = stringToArray(string),
            start = charsStartIndex(strSymbols, stringToArray(chars));
        return castSlice(strSymbols, start).join('');
      }

      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH,
            omission = DEFAULT_TRUNC_OMISSION;

        if (isObject(options)) {
          var separator = 'separator' in options ? options.separator : separator;
          length = 'length' in options ? toInteger(options.length) : length;
          omission = 'omission' in options ? baseToString(options.omission) : omission;
        }

        string = toString(string);
        var strLength = string.length;

        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }

        if (length >= strLength) {
          return string;
        }

        var end = length - stringSize(omission);

        if (end < 1) {
          return omission;
        }

        var result = strSymbols ? castSlice(strSymbols, 0, end).join('') : string.slice(0, end);

        if (separator === undefined) {
          return result + omission;
        }

        if (strSymbols) {
          end += result.length - end;
        }

        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match,
                substring = result;

            if (!separator.global) {
              separator = RegExp(separator.source, toString(reFlags.exec(separator)) + 'g');
            }

            separator.lastIndex = 0;

            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }

            result = result.slice(0, newEnd === undefined ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result.lastIndexOf(separator);

          if (index > -1) {
            result = result.slice(0, index);
          }
        }

        return result + omission;
      }

      function unescape(string) {
        string = toString(string);
        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
      }

      var upperCase = createCompounder(function (result, word, index) {
        return result + (index ? ' ' : '') + word.toUpperCase();
      });
      var upperFirst = createCaseFirst('toUpperCase');

      function words(string, pattern, guard) {
        string = toString(string);
        pattern = guard ? undefined : pattern;

        if (pattern === undefined) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }

        return string.match(pattern) || [];
      }

      var attempt = baseRest(function (func, args) {
        try {
          return apply(func, undefined, args);
        } catch (e) {
          return isError(e) ? e : new Error(e);
        }
      });
      var bindAll = flatRest(function (object, methodNames) {
        arrayEach(methodNames, function (key) {
          key = toKey(key);
          baseAssignValue(object, key, bind(object[key], object));
        });
        return object;
      });

      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length,
            toIteratee = getIteratee();
        pairs = !length ? [] : arrayMap(pairs, function (pair) {
          if (typeof pair[1] != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }

          return [toIteratee(pair[0]), pair[1]];
        });
        return baseRest(function (args) {
          var index = -1;

          while (++index < length) {
            var pair = pairs[index];

            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }

      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }

      function constant(value) {
        return function () {
          return value;
        };
      }

      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }

      var flow = createFlow();
      var flowRight = createFlow(true);

      function identity(value) {
        return value;
      }

      function iteratee(func) {
        return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
      }

      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }

      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }

      var method = baseRest(function (path, args) {
        return function (object) {
          return baseInvoke(object, path, args);
        };
      });
      var methodOf = baseRest(function (object, args) {
        return function (path) {
          return baseInvoke(object, path, args);
        };
      });

      function mixin(object, source, options) {
        var props = keys(source),
            methodNames = baseFunctions(source, props);

        if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object;
          object = this;
          methodNames = baseFunctions(source, keys(source));
        }

        var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
            isFunc = isFunction(object);
        arrayEach(methodNames, function (methodName) {
          var func = source[methodName];
          object[methodName] = func;

          if (isFunc) {
            object.prototype[methodName] = function () {
              var chainAll = this.__chain__;

              if (chain || chainAll) {
                var result = object(this.__wrapped__),
                    actions = result.__actions__ = copyArray(this.__actions__);
                actions.push({
                  'func': func,
                  'args': arguments,
                  'thisArg': object
                });
                result.__chain__ = chainAll;
                return result;
              }

              return func.apply(object, arrayPush([this.value()], arguments));
            };
          }
        });
        return object;
      }

      function noConflict() {
        if (root._ === this) {
          root._ = oldDash;
        }

        return this;
      }

      function noop() {}

      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function (args) {
          return baseNth(args, n);
        });
      }

      var over = createOver(arrayMap);
      var overEvery = createOver(arrayEvery);
      var overSome = createOver(arraySome);

      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }

      function propertyOf(object) {
        return function (path) {
          return object == null ? undefined : baseGet(object, path);
        };
      }

      var range = createRange();
      var rangeRight = createRange(true);

      function stubArray() {
        return [];
      }

      function stubFalse() {
        return false;
      }

      function stubObject() {
        return {};
      }

      function stubString() {
        return '';
      }

      function stubTrue() {
        return true;
      }

      function times(n, iteratee) {
        n = toInteger(n);

        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }

        var index = MAX_ARRAY_LENGTH,
            length = nativeMin(n, MAX_ARRAY_LENGTH);
        iteratee = getIteratee(iteratee);
        n -= MAX_ARRAY_LENGTH;
        var result = baseTimes(length, iteratee);

        while (++index < n) {
          iteratee(index);
        }

        return result;
      }

      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }

        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }

      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }

      var add = createMathOperation(function (augend, addend) {
        return augend + addend;
      }, 0);
      var ceil = createRound('ceil');
      var divide = createMathOperation(function (dividend, divisor) {
        return dividend / divisor;
      }, 1);
      var floor = createRound('floor');

      function max(array) {
        return array && array.length ? baseExtremum(array, identity, baseGt) : undefined;
      }

      function maxBy(array, iteratee) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseGt) : undefined;
      }

      function mean(array) {
        return baseMean(array, identity);
      }

      function meanBy(array, iteratee) {
        return baseMean(array, getIteratee(iteratee, 2));
      }

      function min(array) {
        return array && array.length ? baseExtremum(array, identity, baseLt) : undefined;
      }

      function minBy(array, iteratee) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseLt) : undefined;
      }

      var multiply = createMathOperation(function (multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);
      var round = createRound('round');
      var subtract = createMathOperation(function (minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);

      function sum(array) {
        return array && array.length ? baseSum(array, identity) : 0;
      }

      function sumBy(array, iteratee) {
        return array && array.length ? baseSum(array, getIteratee(iteratee, 2)) : 0;
      }

      lodash.after = after;
      lodash.ary = ary;
      lodash.assign = assign;
      lodash.assignIn = assignIn;
      lodash.assignInWith = assignInWith;
      lodash.assignWith = assignWith;
      lodash.at = at;
      lodash.before = before;
      lodash.bind = bind;
      lodash.bindAll = bindAll;
      lodash.bindKey = bindKey;
      lodash.castArray = castArray;
      lodash.chain = chain;
      lodash.chunk = chunk;
      lodash.compact = compact;
      lodash.concat = concat;
      lodash.cond = cond;
      lodash.conforms = conforms;
      lodash.constant = constant;
      lodash.countBy = countBy;
      lodash.create = create;
      lodash.curry = curry;
      lodash.curryRight = curryRight;
      lodash.debounce = debounce;
      lodash.defaults = defaults;
      lodash.defaultsDeep = defaultsDeep;
      lodash.defer = defer;
      lodash.delay = delay;
      lodash.difference = difference;
      lodash.differenceBy = differenceBy;
      lodash.differenceWith = differenceWith;
      lodash.drop = drop;
      lodash.dropRight = dropRight;
      lodash.dropRightWhile = dropRightWhile;
      lodash.dropWhile = dropWhile;
      lodash.fill = fill;
      lodash.filter = filter;
      lodash.flatMap = flatMap;
      lodash.flatMapDeep = flatMapDeep;
      lodash.flatMapDepth = flatMapDepth;
      lodash.flatten = flatten;
      lodash.flattenDeep = flattenDeep;
      lodash.flattenDepth = flattenDepth;
      lodash.flip = flip;
      lodash.flow = flow;
      lodash.flowRight = flowRight;
      lodash.fromPairs = fromPairs;
      lodash.functions = functions;
      lodash.functionsIn = functionsIn;
      lodash.groupBy = groupBy;
      lodash.initial = initial;
      lodash.intersection = intersection;
      lodash.intersectionBy = intersectionBy;
      lodash.intersectionWith = intersectionWith;
      lodash.invert = invert;
      lodash.invertBy = invertBy;
      lodash.invokeMap = invokeMap;
      lodash.iteratee = iteratee;
      lodash.keyBy = keyBy;
      lodash.keys = keys;
      lodash.keysIn = keysIn;
      lodash.map = map;
      lodash.mapKeys = mapKeys;
      lodash.mapValues = mapValues;
      lodash.matches = matches;
      lodash.matchesProperty = matchesProperty;
      lodash.memoize = memoize;
      lodash.merge = merge;
      lodash.mergeWith = mergeWith;
      lodash.method = method;
      lodash.methodOf = methodOf;
      lodash.mixin = mixin;
      lodash.negate = negate;
      lodash.nthArg = nthArg;
      lodash.omit = omit;
      lodash.omitBy = omitBy;
      lodash.once = once;
      lodash.orderBy = orderBy;
      lodash.over = over;
      lodash.overArgs = overArgs;
      lodash.overEvery = overEvery;
      lodash.overSome = overSome;
      lodash.partial = partial;
      lodash.partialRight = partialRight;
      lodash.partition = partition;
      lodash.pick = pick;
      lodash.pickBy = pickBy;
      lodash.property = property;
      lodash.propertyOf = propertyOf;
      lodash.pull = pull;
      lodash.pullAll = pullAll;
      lodash.pullAllBy = pullAllBy;
      lodash.pullAllWith = pullAllWith;
      lodash.pullAt = pullAt;
      lodash.range = range;
      lodash.rangeRight = rangeRight;
      lodash.rearg = rearg;
      lodash.reject = reject;
      lodash.remove = remove;
      lodash.rest = rest;
      lodash.reverse = reverse;
      lodash.sampleSize = sampleSize;
      lodash.set = set;
      lodash.setWith = setWith;
      lodash.shuffle = shuffle;
      lodash.slice = slice;
      lodash.sortBy = sortBy;
      lodash.sortedUniq = sortedUniq;
      lodash.sortedUniqBy = sortedUniqBy;
      lodash.split = split;
      lodash.spread = spread;
      lodash.tail = tail;
      lodash.take = take;
      lodash.takeRight = takeRight;
      lodash.takeRightWhile = takeRightWhile;
      lodash.takeWhile = takeWhile;
      lodash.tap = tap;
      lodash.throttle = throttle;
      lodash.thru = thru;
      lodash.toArray = toArray;
      lodash.toPairs = toPairs;
      lodash.toPairsIn = toPairsIn;
      lodash.toPath = toPath;
      lodash.toPlainObject = toPlainObject;
      lodash.transform = transform;
      lodash.unary = unary;
      lodash.union = union;
      lodash.unionBy = unionBy;
      lodash.unionWith = unionWith;
      lodash.uniq = uniq;
      lodash.uniqBy = uniqBy;
      lodash.uniqWith = uniqWith;
      lodash.unset = unset;
      lodash.unzip = unzip;
      lodash.unzipWith = unzipWith;
      lodash.update = update;
      lodash.updateWith = updateWith;
      lodash.values = values;
      lodash.valuesIn = valuesIn;
      lodash.without = without;
      lodash.words = words;
      lodash.wrap = wrap;
      lodash.xor = xor;
      lodash.xorBy = xorBy;
      lodash.xorWith = xorWith;
      lodash.zip = zip;
      lodash.zipObject = zipObject;
      lodash.zipObjectDeep = zipObjectDeep;
      lodash.zipWith = zipWith;
      lodash.entries = toPairs;
      lodash.entriesIn = toPairsIn;
      lodash.extend = assignIn;
      lodash.extendWith = assignInWith;
      mixin(lodash, lodash);
      lodash.add = add;
      lodash.attempt = attempt;
      lodash.camelCase = camelCase;
      lodash.capitalize = capitalize;
      lodash.ceil = ceil;
      lodash.clamp = clamp;
      lodash.clone = clone;
      lodash.cloneDeep = cloneDeep;
      lodash.cloneDeepWith = cloneDeepWith;
      lodash.cloneWith = cloneWith;
      lodash.conformsTo = conformsTo;
      lodash.deburr = deburr;
      lodash.defaultTo = defaultTo;
      lodash.divide = divide;
      lodash.endsWith = endsWith;
      lodash.eq = eq;
      lodash.escape = escape;
      lodash.escapeRegExp = escapeRegExp;
      lodash.every = every;
      lodash.find = find;
      lodash.findIndex = findIndex;
      lodash.findKey = findKey;
      lodash.findLast = findLast;
      lodash.findLastIndex = findLastIndex;
      lodash.findLastKey = findLastKey;
      lodash.floor = floor;
      lodash.forEach = forEach;
      lodash.forEachRight = forEachRight;
      lodash.forIn = forIn;
      lodash.forInRight = forInRight;
      lodash.forOwn = forOwn;
      lodash.forOwnRight = forOwnRight;
      lodash.get = get;
      lodash.gt = gt;
      lodash.gte = gte;
      lodash.has = has;
      lodash.hasIn = hasIn;
      lodash.head = head;
      lodash.identity = identity;
      lodash.includes = includes;
      lodash.indexOf = indexOf;
      lodash.inRange = inRange;
      lodash.invoke = invoke;
      lodash.isArguments = isArguments;
      lodash.isArray = isArray;
      lodash.isArrayBuffer = isArrayBuffer;
      lodash.isArrayLike = isArrayLike;
      lodash.isArrayLikeObject = isArrayLikeObject;
      lodash.isBoolean = isBoolean;
      lodash.isBuffer = isBuffer;
      lodash.isDate = isDate;
      lodash.isElement = isElement;
      lodash.isEmpty = isEmpty;
      lodash.isEqual = isEqual;
      lodash.isEqualWith = isEqualWith;
      lodash.isError = isError;
      lodash.isFinite = isFinite;
      lodash.isFunction = isFunction;
      lodash.isInteger = isInteger;
      lodash.isLength = isLength;
      lodash.isMap = isMap;
      lodash.isMatch = isMatch;
      lodash.isMatchWith = isMatchWith;
      lodash.isNaN = isNaN;
      lodash.isNative = isNative;
      lodash.isNil = isNil;
      lodash.isNull = isNull;
      lodash.isNumber = isNumber;
      lodash.isObject = isObject;
      lodash.isObjectLike = isObjectLike;
      lodash.isPlainObject = isPlainObject;
      lodash.isRegExp = isRegExp;
      lodash.isSafeInteger = isSafeInteger;
      lodash.isSet = isSet;
      lodash.isString = isString;
      lodash.isSymbol = isSymbol;
      lodash.isTypedArray = isTypedArray;
      lodash.isUndefined = isUndefined;
      lodash.isWeakMap = isWeakMap;
      lodash.isWeakSet = isWeakSet;
      lodash.join = join;
      lodash.kebabCase = kebabCase;
      lodash.last = last;
      lodash.lastIndexOf = lastIndexOf;
      lodash.lowerCase = lowerCase;
      lodash.lowerFirst = lowerFirst;
      lodash.lt = lt;
      lodash.lte = lte;
      lodash.max = max;
      lodash.maxBy = maxBy;
      lodash.mean = mean;
      lodash.meanBy = meanBy;
      lodash.min = min;
      lodash.minBy = minBy;
      lodash.stubArray = stubArray;
      lodash.stubFalse = stubFalse;
      lodash.stubObject = stubObject;
      lodash.stubString = stubString;
      lodash.stubTrue = stubTrue;
      lodash.multiply = multiply;
      lodash.nth = nth;
      lodash.noConflict = noConflict;
      lodash.noop = noop;
      lodash.now = now;
      lodash.pad = pad;
      lodash.padEnd = padEnd;
      lodash.padStart = padStart;
      lodash.parseInt = parseInt;
      lodash.random = random;
      lodash.reduce = reduce;
      lodash.reduceRight = reduceRight;
      lodash.repeat = repeat;
      lodash.replace = replace;
      lodash.result = result;
      lodash.round = round;
      lodash.runInContext = runInContext;
      lodash.sample = sample;
      lodash.size = size;
      lodash.snakeCase = snakeCase;
      lodash.some = some;
      lodash.sortedIndex = sortedIndex;
      lodash.sortedIndexBy = sortedIndexBy;
      lodash.sortedIndexOf = sortedIndexOf;
      lodash.sortedLastIndex = sortedLastIndex;
      lodash.sortedLastIndexBy = sortedLastIndexBy;
      lodash.sortedLastIndexOf = sortedLastIndexOf;
      lodash.startCase = startCase;
      lodash.startsWith = startsWith;
      lodash.subtract = subtract;
      lodash.sum = sum;
      lodash.sumBy = sumBy;
      lodash.template = template;
      lodash.times = times;
      lodash.toFinite = toFinite;
      lodash.toInteger = toInteger;
      lodash.toLength = toLength;
      lodash.toLower = toLower;
      lodash.toNumber = toNumber;
      lodash.toSafeInteger = toSafeInteger;
      lodash.toString = toString;
      lodash.toUpper = toUpper;
      lodash.trim = trim;
      lodash.trimEnd = trimEnd;
      lodash.trimStart = trimStart;
      lodash.truncate = truncate;
      lodash.unescape = unescape;
      lodash.uniqueId = uniqueId;
      lodash.upperCase = upperCase;
      lodash.upperFirst = upperFirst;
      lodash.each = forEach;
      lodash.eachRight = forEachRight;
      lodash.first = head;
      mixin(lodash, function () {
        var source = {};
        baseForOwn(lodash, function (func, methodName) {
          if (!hasOwnProperty.call(lodash.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }(), {
        'chain': false
      });
      lodash.VERSION = VERSION;
      arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function (methodName) {
        lodash[methodName].placeholder = lodash;
      });
      arrayEach(['drop', 'take'], function (methodName, index) {
        LazyWrapper.prototype[methodName] = function (n) {
          n = n === undefined ? 1 : nativeMax(toInteger(n), 0);
          var result = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();

          if (result.__filtered__) {
            result.__takeCount__ = nativeMin(n, result.__takeCount__);
          } else {
            result.__views__.push({
              'size': nativeMin(n, MAX_ARRAY_LENGTH),
              'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
            });
          }

          return result;
        };

        LazyWrapper.prototype[methodName + 'Right'] = function (n) {
          return this.reverse()[methodName](n).reverse();
        };
      });
      arrayEach(['filter', 'map', 'takeWhile'], function (methodName, index) {
        var type = index + 1,
            isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

        LazyWrapper.prototype[methodName] = function (iteratee) {
          var result = this.clone();

          result.__iteratees__.push({
            'iteratee': getIteratee(iteratee, 3),
            'type': type
          });

          result.__filtered__ = result.__filtered__ || isFilter;
          return result;
        };
      });
      arrayEach(['head', 'last'], function (methodName, index) {
        var takeName = 'take' + (index ? 'Right' : '');

        LazyWrapper.prototype[methodName] = function () {
          return this[takeName](1).value()[0];
        };
      });
      arrayEach(['initial', 'tail'], function (methodName, index) {
        var dropName = 'drop' + (index ? '' : 'Right');

        LazyWrapper.prototype[methodName] = function () {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });

      LazyWrapper.prototype.compact = function () {
        return this.filter(identity);
      };

      LazyWrapper.prototype.find = function (predicate) {
        return this.filter(predicate).head();
      };

      LazyWrapper.prototype.findLast = function (predicate) {
        return this.reverse().find(predicate);
      };

      LazyWrapper.prototype.invokeMap = baseRest(function (path, args) {
        if (typeof path == 'function') {
          return new LazyWrapper(this);
        }

        return this.map(function (value) {
          return baseInvoke(value, path, args);
        });
      });

      LazyWrapper.prototype.reject = function (predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };

      LazyWrapper.prototype.slice = function (start, end) {
        start = toInteger(start);
        var result = this;

        if (result.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result);
        }

        if (start < 0) {
          result = result.takeRight(-start);
        } else if (start) {
          result = result.drop(start);
        }

        if (end !== undefined) {
          end = toInteger(end);
          result = end < 0 ? result.dropRight(-end) : result.take(end - start);
        }

        return result;
      };

      LazyWrapper.prototype.takeRightWhile = function (predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };

      LazyWrapper.prototype.toArray = function () {
        return this.take(MAX_ARRAY_LENGTH);
      };

      baseForOwn(LazyWrapper.prototype, function (func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
            isTaker = /^(?:head|last)$/.test(methodName),
            lodashFunc = lodash[isTaker ? 'take' + (methodName == 'last' ? 'Right' : '') : methodName],
            retUnwrapped = isTaker || /^find/.test(methodName);

        if (!lodashFunc) {
          return;
        }

        lodash.prototype[methodName] = function () {
          var value = this.__wrapped__,
              args = isTaker ? [1] : arguments,
              isLazy = value instanceof LazyWrapper,
              iteratee = args[0],
              useLazy = isLazy || isArray(value);

          var interceptor = function interceptor(value) {
            var result = lodashFunc.apply(lodash, arrayPush([value], args));
            return isTaker && chainAll ? result[0] : result;
          };

          if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
            isLazy = useLazy = false;
          }

          var chainAll = this.__chain__,
              isHybrid = !!this.__actions__.length,
              isUnwrapped = retUnwrapped && !chainAll,
              onlyLazy = isLazy && !isHybrid;

          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result = func.apply(value, args);

            result.__actions__.push({
              'func': thru,
              'args': [interceptor],
              'thisArg': undefined
            });

            return new LodashWrapper(result, chainAll);
          }

          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }

          result = this.thru(interceptor);
          return isUnwrapped ? isTaker ? result.value()[0] : result.value() : result;
        };
      });
      arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function (methodName) {
        var func = arrayProto[methodName],
            chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
            retUnwrapped = /^(?:pop|shift)$/.test(methodName);

        lodash.prototype[methodName] = function () {
          var args = arguments;

          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }

          return this[chainName](function (value) {
            return func.apply(isArray(value) ? value : [], args);
          });
        };
      });
      baseForOwn(LazyWrapper.prototype, function (func, methodName) {
        var lodashFunc = lodash[methodName];

        if (lodashFunc) {
          var key = lodashFunc.name + '',
              names = realNames[key] || (realNames[key] = []);
          names.push({
            'name': methodName,
            'func': lodashFunc
          });
        }
      });
      realNames[createHybrid(undefined, WRAP_BIND_KEY_FLAG).name] = [{
        'name': 'wrapper',
        'func': undefined
      }];
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;
      lodash.prototype.at = wrapperAt;
      lodash.prototype.chain = wrapperChain;
      lodash.prototype.commit = wrapperCommit;
      lodash.prototype.next = wrapperNext;
      lodash.prototype.plant = wrapperPlant;
      lodash.prototype.reverse = wrapperReverse;
      lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
      lodash.prototype.first = lodash.prototype.head;

      if (symIterator) {
        lodash.prototype[symIterator] = wrapperToIterator;
      }

      return lodash;
    };

    var _ = runInContext();

    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      root._ = _;
      define(function () {
        return _;
      });
    } else if (freeModule) {
        (freeModule.exports = _)._ = _;
        freeExports._ = _;
      } else {
        root._ = _;
      }
  }).call(this);
},90,[],"projects/com.lumi.plug/node_modules/lodash/lodash.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getReducers;

  var _redux = _require(_dependencyMap[0], "redux");

  var _PlugIconType = _require(_dependencyMap[1], "./PlugIconType");

  var _PlugIconType2 = babelHelpers.interopRequireDefault(_PlugIconType);

  function getReducers() {
    return (0, _redux.combineReducers)({
      ReplaceIconReducers: _PlugIconType2.default
    });
  }
},91,[64,92],"projects/com.lumi.plug/Main/Redux/Reducers/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reduxActions = _require(_dependencyMap[0], "redux-actions");

  var _LHReplaceIconPageData = _require(_dependencyMap[1], "../../../Page/ReplaceIconPage/LHReplaceIconPageData");

  var _LHReplaceIconPageData2 = babelHelpers.interopRequireDefault(_LHReplaceIconPageData);

  var _ActionTypes = _require(_dependencyMap[2], "../../Actions/ActionTypes");

  exports.default = (0, _reduxActions.handleActions)(babelHelpers.defineProperty({}, _ActionTypes.PLUG_ICON_TYPE, {
    next: function next(state, action) {
      console.log(action.payload);
      return babelHelpers.extends({}, state, {
        plugIconItem: action.payload
      });
    },
    throw: function _throw(state, action) {
      console.log(action.payload);
      return state;
    }
  }), {
    plugIconItem: _LHReplaceIconPageData2.default.defaultItem
  });
},92,[93,128,132],"projects/com.lumi.plug/Main/Redux/Reducers/PlugIconType/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;

  var _combineActions = _interopRequireDefault(_require(_dependencyMap[0], "./combineActions"));

  exports.combineActions = _combineActions.default;

  var _createAction = _interopRequireDefault(_require(_dependencyMap[1], "./createAction"));

  exports.createAction = _createAction.default;

  var _createActions = _interopRequireDefault(_require(_dependencyMap[2], "./createActions"));

  exports.createActions = _createActions.default;

  var _createCurriedAction = _interopRequireDefault(_require(_dependencyMap[3], "./createCurriedAction"));

  exports.createCurriedAction = _createCurriedAction.default;

  var _handleAction = _interopRequireDefault(_require(_dependencyMap[4], "./handleAction"));

  exports.handleAction = _handleAction.default;

  var _handleActions = _interopRequireDefault(_require(_dependencyMap[5], "./handleActions"));

  exports.handleActions = _handleActions.default;

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }
},93,[94,101,104,120,122,124],"projects/com.lumi.plug/node_modules/redux-actions/lib/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = combineActions;

  var _invariant = _interopRequireDefault(_require(_dependencyMap[0], "invariant"));

  var _isFunction = _interopRequireDefault(_require(_dependencyMap[1], "./utils/isFunction"));

  var _isSymbol = _interopRequireDefault(_require(_dependencyMap[2], "./utils/isSymbol"));

  var _isEmpty = _interopRequireDefault(_require(_dependencyMap[3], "./utils/isEmpty"));

  var _toString = _interopRequireDefault(_require(_dependencyMap[4], "./utils/toString"));

  var _isString = _interopRequireDefault(_require(_dependencyMap[5], "./utils/isString"));

  var _constants = _require(_dependencyMap[6], "./constants");

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function isValidActionType(type) {
    return (0, _isString.default)(type) || (0, _isFunction.default)(type) || (0, _isSymbol.default)(type);
  }

  function isValidActionTypes(types) {
    if ((0, _isEmpty.default)(types)) {
      return false;
    }

    return types.every(isValidActionType);
  }

  function combineActions() {
    for (var _len = arguments.length, actionsTypes = new Array(_len), _key = 0; _key < _len; _key++) {
      actionsTypes[_key] = arguments[_key];
    }

    (0, _invariant.default)(isValidActionTypes(actionsTypes), 'Expected action types to be strings, symbols, or action creators');
    var combinedActionType = actionsTypes.map(_toString.default).join(_constants.ACTION_TYPE_DELIMITER);
    return {
      toString: function toString() {
        return combinedActionType;
      }
    };
  }
},94,[60,95,96,97,98,99,100],"projects/com.lumi.plug/node_modules/redux-actions/lib/combineActions.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return typeof value === 'function';
  };

  exports.default = _default;
},95,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isFunction.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return typeof value === 'symbol' || typeof value === 'object' && Object.prototype.toString.call(value) === '[object Symbol]';
  };

  exports.default = _default;
},96,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isSymbol.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return value.length === 0;
  };

  exports.default = _default;
},97,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isEmpty.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return value.toString();
  };

  exports.default = _default;
},98,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/toString.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return typeof value === 'string';
  };

  exports.default = _default;
},99,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isString.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.ACTION_TYPE_DELIMITER = exports.DEFAULT_NAMESPACE = void 0;
  var DEFAULT_NAMESPACE = '/';
  exports.DEFAULT_NAMESPACE = DEFAULT_NAMESPACE;
  var ACTION_TYPE_DELIMITER = '||';
  exports.ACTION_TYPE_DELIMITER = ACTION_TYPE_DELIMITER;
},100,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/constants.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = createAction;

  var _invariant = _interopRequireDefault(_require(_dependencyMap[0], "invariant"));

  var _isFunction = _interopRequireDefault(_require(_dependencyMap[1], "./utils/isFunction"));

  var _identity = _interopRequireDefault(_require(_dependencyMap[2], "./utils/identity"));

  var _isNull = _interopRequireDefault(_require(_dependencyMap[3], "./utils/isNull"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function createAction(type, payloadCreator, metaCreator) {
    if (payloadCreator === void 0) {
      payloadCreator = _identity.default;
    }

    (0, _invariant.default)((0, _isFunction.default)(payloadCreator) || (0, _isNull.default)(payloadCreator), 'Expected payloadCreator to be a function, undefined or null');
    var finalPayloadCreator = (0, _isNull.default)(payloadCreator) || payloadCreator === _identity.default ? _identity.default : function (head) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return head instanceof Error ? head : payloadCreator.apply(void 0, [head].concat(args));
    };
    var hasMeta = (0, _isFunction.default)(metaCreator);
    var typeString = type.toString();

    var actionCreator = function actionCreator() {
      var payload = finalPayloadCreator.apply(void 0, arguments);
      var action = {
        type: type
      };

      if (payload instanceof Error) {
        action.error = true;
      }

      if (payload !== undefined) {
        action.payload = payload;
      }

      if (hasMeta) {
        action.meta = metaCreator.apply(void 0, arguments);
      }

      return action;
    };

    actionCreator.toString = function () {
      return typeString;
    };

    return actionCreator;
  }
},101,[60,95,102,103],"projects/com.lumi.plug/node_modules/redux-actions/lib/createAction.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return value;
  };

  exports.default = _default;
},102,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/identity.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return value === null;
  };

  exports.default = _default;
},103,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isNull.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = createActions;

  var _invariant = _interopRequireDefault(_require(_dependencyMap[0], "invariant"));

  var _isPlainObject = _interopRequireDefault(_require(_dependencyMap[1], "./utils/isPlainObject"));

  var _isFunction = _interopRequireDefault(_require(_dependencyMap[2], "./utils/isFunction"));

  var _identity = _interopRequireDefault(_require(_dependencyMap[3], "./utils/identity"));

  var _isArray = _interopRequireDefault(_require(_dependencyMap[4], "./utils/isArray"));

  var _isString = _interopRequireDefault(_require(_dependencyMap[5], "./utils/isString"));

  var _isNil = _interopRequireDefault(_require(_dependencyMap[6], "./utils/isNil"));

  var _getLastElement = _interopRequireDefault(_require(_dependencyMap[7], "./utils/getLastElement"));

  var _camelCase = _interopRequireDefault(_require(_dependencyMap[8], "./utils/camelCase"));

  var _arrayToObject = _interopRequireDefault(_require(_dependencyMap[9], "./utils/arrayToObject"));

  var _flattenActionMap = _interopRequireDefault(_require(_dependencyMap[10], "./utils/flattenActionMap"));

  var _unflattenActionCreators = _interopRequireDefault(_require(_dependencyMap[11], "./utils/unflattenActionCreators"));

  var _createAction = _interopRequireDefault(_require(_dependencyMap[12], "./createAction"));

  var _constants = _require(_dependencyMap[13], "./constants");

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function createActions(actionMap) {
    for (var _len = arguments.length, identityActions = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      identityActions[_key - 1] = arguments[_key];
    }

    var options = (0, _isPlainObject.default)((0, _getLastElement.default)(identityActions)) ? identityActions.pop() : {};
    (0, _invariant.default)(identityActions.every(_isString.default) && ((0, _isString.default)(actionMap) || (0, _isPlainObject.default)(actionMap)), 'Expected optional object followed by string action types');

    if ((0, _isString.default)(actionMap)) {
      return actionCreatorsFromIdentityActions([actionMap].concat(identityActions), options);
    }

    return _objectSpread({}, actionCreatorsFromActionMap(actionMap, options), actionCreatorsFromIdentityActions(identityActions, options));
  }

  function actionCreatorsFromActionMap(actionMap, options) {
    var flatActionMap = (0, _flattenActionMap.default)(actionMap, options);
    var flatActionCreators = actionMapToActionCreators(flatActionMap);
    return (0, _unflattenActionCreators.default)(flatActionCreators, options);
  }

  function actionMapToActionCreators(actionMap, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        prefix = _ref.prefix,
        _ref$namespace = _ref.namespace,
        namespace = _ref$namespace === void 0 ? _constants.DEFAULT_NAMESPACE : _ref$namespace;

    function isValidActionMapValue(actionMapValue) {
      if ((0, _isFunction.default)(actionMapValue) || (0, _isNil.default)(actionMapValue)) {
        return true;
      }

      if ((0, _isArray.default)(actionMapValue)) {
        var _actionMapValue$ = actionMapValue[0],
            payload = _actionMapValue$ === void 0 ? _identity.default : _actionMapValue$,
            meta = actionMapValue[1];
        return (0, _isFunction.default)(payload) && (0, _isFunction.default)(meta);
      }

      return false;
    }

    return (0, _arrayToObject.default)(Object.keys(actionMap), function (partialActionCreators, type) {
      var _objectSpread2;

      var actionMapValue = actionMap[type];
      (0, _invariant.default)(isValidActionMapValue(actionMapValue), 'Expected function, undefined, null, or array with payload and meta ' + ("functions for " + type));
      var prefixedType = prefix ? "" + prefix + namespace + type : type;
      var actionCreator = (0, _isArray.default)(actionMapValue) ? _createAction.default.apply(void 0, [prefixedType].concat(actionMapValue)) : (0, _createAction.default)(prefixedType, actionMapValue);
      return _objectSpread({}, partialActionCreators, (_objectSpread2 = {}, _objectSpread2[type] = actionCreator, _objectSpread2));
    });
  }

  function actionCreatorsFromIdentityActions(identityActions, options) {
    var actionMap = (0, _arrayToObject.default)(identityActions, function (partialActionMap, type) {
      var _objectSpread3;

      return _objectSpread({}, partialActionMap, (_objectSpread3 = {}, _objectSpread3[type] = _identity.default, _objectSpread3));
    });
    var actionCreators = actionMapToActionCreators(actionMap, options);
    return (0, _arrayToObject.default)(Object.keys(actionCreators), function (partialActionCreators, type) {
      var _objectSpread4;

      return _objectSpread({}, partialActionCreators, (_objectSpread4 = {}, _objectSpread4[(0, _camelCase.default)(type)] = actionCreators[type], _objectSpread4));
    });
  }
},104,[60,105,95,102,106,99,107,108,109,113,114,119,101,100],"projects/com.lumi.plug/node_modules/redux-actions/lib/createActions.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    if (typeof value !== 'object' || value === null) return false;
    var proto = value;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(value) === proto;
  };

  exports.default = _default;
},105,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isPlainObject.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return Array.isArray(value);
  };

  exports.default = _default;
},106,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isArray.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return value === null || value === undefined;
  };

  exports.default = _default;
},107,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isNil.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(array) {
    return array[array.length - 1];
  };

  exports.default = _default;
},108,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/getLastElement.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _toCamelCase = _interopRequireDefault(_require(_dependencyMap[0], "to-camel-case"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var namespacer = '/';

  var _default = function _default(type) {
    return type.indexOf(namespacer) === -1 ? (0, _toCamelCase.default)(type) : type.split(namespacer).map(_toCamelCase.default).join(namespacer);
  };

  exports.default = _default;
},109,[110],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/camelCase.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  var space = _require(_dependencyMap[0], 'to-space-case');

  module.exports = toCamelCase;

  function toCamelCase(string) {
    return space(string).replace(/\s(\w)/g, function (matches, letter) {
      return letter.toUpperCase();
    });
  }
},110,[111],"projects/com.lumi.plug/node_modules/to-camel-case/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  var clean = _require(_dependencyMap[0], 'to-no-case');

  module.exports = toSpaceCase;

  function toSpaceCase(string) {
    return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
      return match ? ' ' + match : '';
    }).trim();
  }
},111,[112],"projects/com.lumi.plug/node_modules/to-space-case/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  module.exports = toNoCase;
  var hasSpace = /\s/;
  var hasSeparator = /(_|-|\.|:)/;
  var hasCamel = /([a-z][A-Z]|[A-Z][a-z])/;

  function toNoCase(string) {
    if (hasSpace.test(string)) return string.toLowerCase();
    if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase();
    if (hasCamel.test(string)) return uncamelize(string).toLowerCase();
    return string.toLowerCase();
  }

  var separatorSplitter = /[\W_]+(.|$)/g;

  function unseparate(string) {
    return string.replace(separatorSplitter, function (m, next) {
      return next ? ' ' + next : '';
    });
  }

  var camelSplitter = /(.)([A-Z]+)/g;

  function uncamelize(string) {
    return string.replace(camelSplitter, function (m, previous, uppers) {
      return previous + ' ' + uppers.toLowerCase().split('').join(' ');
    });
  }
},112,[],"projects/com.lumi.plug/node_modules/to-no-case/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(array, callback) {
    return array.reduce(function (partialObject, element) {
      return callback(partialObject, element);
    }, {});
  };

  exports.default = _default;
},113,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/arrayToObject.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _isPlainObject = _interopRequireDefault(_require(_dependencyMap[0], "./isPlainObject"));

  var _flattenWhenNode = _interopRequireDefault(_require(_dependencyMap[1], "./flattenWhenNode"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _default = (0, _flattenWhenNode.default)(_isPlainObject.default);

  exports.default = _default;
},114,[105,115],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/flattenActionMap.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _constants = _require(_dependencyMap[0], "../constants");

  var _ownKeys = _interopRequireDefault(_require(_dependencyMap[1], "./ownKeys"));

  var _get = _interopRequireDefault(_require(_dependencyMap[2], "./get"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _default = function _default(predicate) {
    return function flatten(map, _temp, partialFlatMap, partialFlatActionType) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$namespace = _ref.namespace,
          namespace = _ref$namespace === void 0 ? _constants.DEFAULT_NAMESPACE : _ref$namespace,
          prefix = _ref.prefix;

      if (partialFlatMap === void 0) {
        partialFlatMap = {};
      }

      if (partialFlatActionType === void 0) {
        partialFlatActionType = '';
      }

      function connectNamespace(type) {
        var _ref2;

        if (!partialFlatActionType) return type;
        var types = type.toString().split(_constants.ACTION_TYPE_DELIMITER);
        var partials = partialFlatActionType.split(_constants.ACTION_TYPE_DELIMITER);
        return (_ref2 = []).concat.apply(_ref2, partials.map(function (p) {
          return types.map(function (t) {
            return "" + p + namespace + t;
          });
        })).join(_constants.ACTION_TYPE_DELIMITER);
      }

      function connectPrefix(type) {
        if (partialFlatActionType || !prefix || prefix && new RegExp("^" + prefix + namespace).test(type)) {
          return type;
        }

        return "" + prefix + namespace + type;
      }

      (0, _ownKeys.default)(map).forEach(function (type) {
        var nextNamespace = connectPrefix(connectNamespace(type));
        var mapValue = (0, _get.default)(type, map);

        if (predicate(mapValue)) {
          flatten(mapValue, {
            namespace: namespace,
            prefix: prefix
          }, partialFlatMap, nextNamespace);
        } else {
          partialFlatMap[nextNamespace] = mapValue;
        }
      });
      return partialFlatMap;
    };
  };

  exports.default = _default;
},115,[100,116,118],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/flattenWhenNode.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = ownKeys;

  var _isMap = _interopRequireDefault(_require(_dependencyMap[0], "./isMap"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function ownKeys(object) {
    if ((0, _isMap.default)(object)) {
      return Array.from(object.keys());
    }

    if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
      return Reflect.ownKeys(object);
    }

    var keys = Object.getOwnPropertyNames(object);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      keys = keys.concat(Object.getOwnPropertySymbols(object));
    }

    return keys;
  }
},116,[117],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/ownKeys.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return typeof Map !== 'undefined' && value instanceof Map;
  };

  exports.default = _default;
},117,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isMap.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = get;

  var _isMap = _interopRequireDefault(_require(_dependencyMap[0], "./isMap"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function get(key, x) {
    return (0, _isMap.default)(x) ? x.get(key) : x[key];
  }
},118,[117],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/get.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = unflattenActionCreators;

  var _constants = _require(_dependencyMap[0], "../constants");

  var _isEmpty = _interopRequireDefault(_require(_dependencyMap[1], "./isEmpty"));

  var _camelCase = _interopRequireDefault(_require(_dependencyMap[2], "./camelCase"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function unflattenActionCreators(flatActionCreators, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$namespace = _ref.namespace,
        namespace = _ref$namespace === void 0 ? _constants.DEFAULT_NAMESPACE : _ref$namespace,
        prefix = _ref.prefix;

    function unflatten(flatActionType, partialNestedActionCreators, partialFlatActionTypePath) {
      var nextNamespace = (0, _camelCase.default)(partialFlatActionTypePath.shift());

      if ((0, _isEmpty.default)(partialFlatActionTypePath)) {
        partialNestedActionCreators[nextNamespace] = flatActionCreators[flatActionType];
      } else {
        if (!partialNestedActionCreators[nextNamespace]) {
          partialNestedActionCreators[nextNamespace] = {};
        }

        unflatten(flatActionType, partialNestedActionCreators[nextNamespace], partialFlatActionTypePath);
      }
    }

    var nestedActionCreators = {};
    Object.getOwnPropertyNames(flatActionCreators).forEach(function (type) {
      var unprefixedType = prefix ? type.replace("" + prefix + namespace, '') : type;
      return unflatten(type, nestedActionCreators, unprefixedType.split(namespace));
    });
    return nestedActionCreators;
  }
},119,[100,97,109],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/unflattenActionCreators.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _justCurryIt = _interopRequireDefault(_require(_dependencyMap[0], "just-curry-it"));

  var _createAction = _interopRequireDefault(_require(_dependencyMap[1], "./createAction"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _default = function _default(type, payloadCreator) {
    return (0, _justCurryIt.default)((0, _createAction.default)(type, payloadCreator), payloadCreator.length);
  };

  exports.default = _default;
},120,[121,101],"projects/com.lumi.plug/node_modules/redux-actions/lib/createCurriedAction.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  module.exports = curry;

  function curry(fn, arity) {
    return function curried() {
      if (arity == null) {
        arity = fn.length;
      }

      var args = [].slice.call(arguments);

      if (args.length >= arity) {
        return fn.apply(this, args);
      } else {
        return function () {
          return curried.apply(this, args.concat([].slice.call(arguments)));
        };
      }
    };
  }
},121,[],"projects/com.lumi.plug/node_modules/just-curry-it/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = handleAction;

  var _invariant = _interopRequireDefault(_require(_dependencyMap[0], "invariant"));

  var _isFunction = _interopRequireDefault(_require(_dependencyMap[1], "./utils/isFunction"));

  var _isPlainObject = _interopRequireDefault(_require(_dependencyMap[2], "./utils/isPlainObject"));

  var _identity = _interopRequireDefault(_require(_dependencyMap[3], "./utils/identity"));

  var _isNil = _interopRequireDefault(_require(_dependencyMap[4], "./utils/isNil"));

  var _isUndefined = _interopRequireDefault(_require(_dependencyMap[5], "./utils/isUndefined"));

  var _toString = _interopRequireDefault(_require(_dependencyMap[6], "./utils/toString"));

  var _constants = _require(_dependencyMap[7], "./constants");

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function handleAction(type, reducer, defaultState) {
    if (reducer === void 0) {
      reducer = _identity.default;
    }

    var types = (0, _toString.default)(type).split(_constants.ACTION_TYPE_DELIMITER);
    (0, _invariant.default)(!(0, _isUndefined.default)(defaultState), "defaultState for reducer handling " + types.join(', ') + " should be defined");
    (0, _invariant.default)((0, _isFunction.default)(reducer) || (0, _isPlainObject.default)(reducer), 'Expected reducer to be a function or object with next and throw reducers');

    var _ref = (0, _isFunction.default)(reducer) ? [reducer, reducer] : [reducer.next, reducer.throw].map(function (aReducer) {
      return (0, _isNil.default)(aReducer) ? _identity.default : aReducer;
    }),
        nextReducer = _ref[0],
        throwReducer = _ref[1];

    return function (state, action) {
      if (state === void 0) {
        state = defaultState;
      }

      var actionType = action.type;

      if (!actionType || types.indexOf((0, _toString.default)(actionType)) === -1) {
        return state;
      }

      return (action.error === true ? throwReducer : nextReducer)(state, action);
    };
  }
},122,[60,95,105,102,107,123,98,100],"projects/com.lumi.plug/node_modules/redux-actions/lib/handleAction.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _default = function _default(value) {
    return value === undefined;
  };

  exports.default = _default;
},123,[],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/isUndefined.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = handleActions;

  var _reduceReducers = _interopRequireDefault(_require(_dependencyMap[0], "reduce-reducers"));

  var _invariant = _interopRequireDefault(_require(_dependencyMap[1], "invariant"));

  var _isPlainObject = _interopRequireDefault(_require(_dependencyMap[2], "./utils/isPlainObject"));

  var _isMap = _interopRequireDefault(_require(_dependencyMap[3], "./utils/isMap"));

  var _ownKeys = _interopRequireDefault(_require(_dependencyMap[4], "./utils/ownKeys"));

  var _flattenReducerMap = _interopRequireDefault(_require(_dependencyMap[5], "./utils/flattenReducerMap"));

  var _handleAction = _interopRequireDefault(_require(_dependencyMap[6], "./handleAction"));

  var _get = _interopRequireDefault(_require(_dependencyMap[7], "./utils/get"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function handleActions(handlers, defaultState, options) {
    if (options === void 0) {
      options = {};
    }

    (0, _invariant.default)((0, _isPlainObject.default)(handlers) || (0, _isMap.default)(handlers), 'Expected handlers to be a plain object.');
    var flattenedReducerMap = (0, _flattenReducerMap.default)(handlers, options);
    var reducers = (0, _ownKeys.default)(flattenedReducerMap).map(function (type) {
      return (0, _handleAction.default)(type, (0, _get.default)(type, flattenedReducerMap), defaultState);
    });

    var reducer = _reduceReducers.default.apply(void 0, reducers.concat([defaultState]));

    return function (state, action) {
      if (state === void 0) {
        state = defaultState;
      }

      return reducer(state, action);
    };
  }
},124,[125,60,105,117,116,126,122,118],"projects/com.lumi.plug/node_modules/redux-actions/lib/handleActions.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var initialState = typeof args[args.length - 1] !== 'function' && args.pop();
    var reducers = args;

    if (typeof initialState === 'undefined') {
      throw new TypeError('The initial state may not be undefined. If you do not want to set a value for this reducer, you can use null instead of undefined.');
    }

    return function (prevState, value) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var prevStateIsUndefined = typeof prevState === 'undefined';
      var valueIsUndefined = typeof value === 'undefined';

      if (prevStateIsUndefined && valueIsUndefined && initialState) {
        return initialState;
      }

      return reducers.reduce(function (newState, reducer) {
        return reducer.apply(undefined, [newState, value].concat(args));
      }, prevStateIsUndefined && !valueIsUndefined && initialState ? initialState : prevState);
    };
  };

  module.exports = exports['default'];
},125,[],"projects/com.lumi.plug/node_modules/reduce-reducers/lib/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = void 0;

  var _isPlainObject = _interopRequireDefault(_require(_dependencyMap[0], "./isPlainObject"));

  var _isMap = _interopRequireDefault(_require(_dependencyMap[1], "./isMap"));

  var _hasGeneratorInterface = _interopRequireDefault(_require(_dependencyMap[2], "./hasGeneratorInterface"));

  var _flattenWhenNode = _interopRequireDefault(_require(_dependencyMap[3], "./flattenWhenNode"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _default = (0, _flattenWhenNode.default)(function (node) {
    return ((0, _isPlainObject.default)(node) || (0, _isMap.default)(node)) && !(0, _hasGeneratorInterface.default)(node);
  });

  exports.default = _default;
},126,[105,117,127,115],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/flattenReducerMap.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  "use strict";

  exports.__esModule = true;
  exports.default = hasGeneratorInterface;

  var _ownKeys = _interopRequireDefault(_require(_dependencyMap[0], "./ownKeys"));

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function hasGeneratorInterface(handler) {
    var keys = (0, _ownKeys.default)(handler);
    var hasOnlyInterfaceNames = keys.every(function (ownKey) {
      return ownKey === 'next' || ownKey === 'throw';
    });
    return keys.length && keys.length <= 2 && hasOnlyInterfaceNames;
  }
},127,[116],"projects/com.lumi.plug/node_modules/redux-actions/lib/utils/hasGeneratorInterface.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.IconDataSource = exports.LHReplaceIconPageData = undefined;

  var _Resources = _require(_dependencyMap[0], "Resources");

  var _Resources2 = babelHelpers.interopRequireDefault(_Resources);

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var _LHLocalizableString = _require(_dependencyMap[2], "../../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var ReplaceIconStorageKey = 'ReplaceIconStorageKey_';
  var IconDataSource = [{
    id: 8,
    type: 'tablelamp',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_tablelamp'],
    image: _Resources2.default.replaceIconPage.tablelamp,
    main: {
      on: _Resources2.default.MainPage.tablelamp.on,
      off: _Resources2.default.MainPage.tablelamp.off
    }
  }, {
    id: 12,
    type: 'waterheater',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_waterheater'],
    image: _Resources2.default.replaceIconPage.waterheater,
    main: {
      on: _Resources2.default.MainPage.waterheater.on,
      off: _Resources2.default.MainPage.waterheater.off
    }
  }, {
    id: 3,
    type: 'drinking',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_drinking'],
    image: _Resources2.default.replaceIconPage.drinking,
    main: {
      on: _Resources2.default.MainPage.drinking.on,
      off: _Resources2.default.MainPage.drinking.off
    }
  }, {
    id: 11,
    type: 'tv',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_tv'],
    image: _Resources2.default.replaceIconPage.tv,
    main: {
      on: _Resources2.default.MainPage.tv.on,
      off: _Resources2.default.MainPage.tv.off
    }
  }, {
    id: 4,
    type: 'fan',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_fan'],
    image: _Resources2.default.replaceIconPage.fan,
    main: {
      on: _Resources2.default.MainPage.fan.on,
      off: _Resources2.default.MainPage.fan.off
    }
  }, {
    id: 13,
    type: 'book',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_book'],
    image: _Resources2.default.replaceIconPage.book,
    main: {
      on: _Resources2.default.MainPage.book.on,
      off: _Resources2.default.MainPage.book.off
    }
  }, {
    id: 9,
    type: 'tank',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_tank'],
    image: _Resources2.default.replaceIconPage.tank,
    main: {
      on: _Resources2.default.MainPage.tank.on,
      off: _Resources2.default.MainPage.tank.off
    }
  }, {
    id: 5,
    type: 'humidifier',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_humidifier'],
    image: _Resources2.default.replaceIconPage.humidifier,
    main: {
      on: _Resources2.default.MainPage.humidifier.on,
      off: _Resources2.default.MainPage.humidifier.off
    }
  }, {
    id: 7,
    type: 'sound',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_sound'],
    image: _Resources2.default.replaceIconPage.sound,
    main: {
      on: _Resources2.default.MainPage.sound.on,
      off: _Resources2.default.MainPage.sound.off
    }
  }, {
    id: 1,
    type: 'cooker',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_cooker'],
    image: _Resources2.default.replaceIconPage.cooker,
    main: {
      on: _Resources2.default.MainPage.cooker.on,
      off: _Resources2.default.MainPage.cooker.off
    }
  }, {
    id: 6,
    type: 'router',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_router'],
    image: _Resources2.default.replaceIconPage.router,
    main: {
      on: _Resources2.default.MainPage.router.on,
      off: _Resources2.default.MainPage.router.off
    }
  }, {
    id: 10,
    type: 'tram',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_tram'],
    image: _Resources2.default.replaceIconPage.tram,
    main: {
      on: _Resources2.default.MainPage.tram.on,
      off: _Resources2.default.MainPage.tram.off
    }
  }, {
    id: 2,
    type: 'default',
    title: _LHLocalizableString2.default['lumi_plug_replaceIcon_default'],
    image: _Resources2.default.replaceIconPage.default,
    main: {
      on: _Resources2.default.MainPage.default.on,
      off: _Resources2.default.MainPage.default.off
    }
  }];

  var LHReplaceIconPageData = function () {
    function LHReplaceIconPageData() {
      babelHelpers.classCallCheck(this, LHReplaceIconPageData);
    }

    babelHelpers.createClass(LHReplaceIconPageData, null, [{
      key: "defaultItem",
      get: function get() {
        return {
          id: 2,
          type: 'default',
          title: _LHLocalizableString2.default['lumi_plug_replaceIcon_default'],
          image: _Resources2.default.replaceIconPage.default,
          main: {
            on: _Resources2.default.MainPage.default.on,
            off: _Resources2.default.MainPage.default.off
          }
        };
      }
    }]);
    return LHReplaceIconPageData;
  }();

  LHReplaceIconPageData.blankData = {
    id: null,
    title: null,
    image: null
  };

  LHReplaceIconPageData.getCurrentItem = function (_ref) {
    var did = _ref.did;
    return new Promise(function (reslove, reject) {
      _LHCommonFunction.LHMiServer.GetHostStorage(ReplaceIconStorageKey + did).then(function (value) {
        var item = value;

        if (typeof item !== 'number' || !item) {
          item = LHReplaceIconPageData.defaultItem.id;
        }

        reslove(item);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  LHReplaceIconPageData.setCurrentItem = function (_ref2) {
    var did = _ref2.did,
        val = _ref2.val;
    return _LHCommonFunction.LHMiServer.SetHostStorage(ReplaceIconStorageKey + did, val);
  };

  exports.default = LHReplaceIconPageData;
  exports.LHReplaceIconPageData = LHReplaceIconPageData;
  exports.IconDataSource = IconDataSource;
},128,[174,3,129],"projects/com.lumi.plug/Main/Page/ReplaceIconPage/LHReplaceIconPageData.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _LHCommonFunction = _require(_dependencyMap[0], "LHCommonFunction");

  var _en = _require(_dependencyMap[1], "./Language/en");

  var _en2 = babelHelpers.interopRequireDefault(_en);

  var _zhHans = _require(_dependencyMap[2], "./Language/zh-Hans");

  var _zhHans2 = babelHelpers.interopRequireDefault(_zhHans);

  var languagePacket = {
    en: _en2.default,
    zh: _zhHans2.default
  };

  _LHCommonFunction.LHCommonLocalizableString.adjustLanguagePacket(languagePacket);

  var LHLocalizableString = new _LHCommonFunction.LHLocalizedStrings(languagePacket);
  exports.default = LHLocalizableString;
},129,[3,130,131],"projects/com.lumi.plug/Main/Localized/LHLocalizableString.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var en = {
    "lumi_plug_setting_replaceIcon": "Replace icon",
    "lumi_plug_setting_maxPower": "Maximum power limit",
    "lumi_plug_setting_cutOff": "Power outage memory",
    "lumi_plug_setting_cutOff_tps": "When the plug is on again, it restores the settings before the power outage.",
    "lumi_plug_setting_indecateLight": "Turn off indicator",
    "lumi_plug_setting_indecateLight_tips": "Turn off the indicator from 21:00 to 09:00",
    "lumi_plug_replaceIcon_book": "Notebook PC",
    "lumi_plug_replaceIcon_cooker": "Rice cooker",
    "lumi_plug_replaceIcon_default": "Default",
    "lumi_plug_replaceIcon_drinking": "Water dispenser",
    "lumi_plug_replaceIcon_fan": "Fan",
    "lumi_plug_replaceIcon_humidifier": "Humidifier",
    "lumi_plug_replaceIcon_router": "Router",
    "lumi_plug_replaceIcon_sound": "Speaker",
    "lumi_plug_replaceIcon_tablelamp": "Lamp",
    "lumi_plug_replaceIcon_tank": "Fish tank",
    "lumi_plug_replaceIcon_tram": "Electric vehicle",
    "lumi_plug_replaceIcon_tv": "TV",
    "lumi_plug_replaceIcon_waterheater": "Water heater",
    "lumi_plug_main_elec_removed": "The electric appliance is not plugged in properly",
    "lumi_plug_countdown": "Countdown",
    "lumi_plug_timer": "Schedule",
    "lumi_plug_detect_unplug": "It is detected that the electric appliance is not plugged in properly",
    "lumi_plug_long_blue": "Press and hold the button for more than 5 seconds, and then release it when the blue light blinks.",
    "lumi_plug_opened": "Turned on",
    "lumi_plug_closed": "Turned off",
    "lumi_plug_plug_open": "The plug has been turned on",
    "lumi_plug_plug_close": "The plug has been turned off",
    "lumi_plug_close_later_min": "Turn off in %02d min",
    "lumi_plug_close_later_hour_min": "Turn off in %02d h %02d min",
    "lumi_plug_open_later_min": "Turn on in %02d min",
    "lumi_plug_open_later_hour_min": "Turn on in %02d h %02d min",
    "lumi_plug_today_elec": "Today",
    "lumi_plug_month_elec": "Month",
    "lumi_plug_current_power": "Current",
    "lumi_plug_plug_plugin": "Electric appliance plugged in",
    "lumi_plug_plug_plugout": "No electric appliances plugged in",
    "lumi_plug_network_error": "Network connection not available",
    "lumi_plug_electricity": "Electricity statistics",
    "lumi_plug_power_history": "Power history record",
    "lumi_plug_kwh": "kWh",
    "lumi_plug_W": "W",
    "lumi_plug_day": "Day",
    "lumi_plug_week": "Week",
    "lumi_plug_month": "Month",
    "lumi_plug_year": "Year",
    "lumi_plug_charging_protect": "Charging protection",
    "lumi_plug_close_overload": "If the power is less than 2 W for half an hour, the plug will be turned off automatically",
    "lumi_plug_off_when_overload": "The plug will be powered off automatically when exceeding the maximum power limit.",
    "lumi_plug_blanket": "Electric blanket",
    "lumi_plug_brush": "Electric toothbrush",
    "lumi_plug_repeller": "Electric mosquito repeller",
    "lumi_plug_discard_operation": "Discard the current operation?",
    "lumi_plug_cancel": "Cancel",
    "lumi_plug_confirm": "OK",
    "lumi_plug_on": "Turn on",
    "lumi_plug_off": "Turn off",
    "lumi_plug_onoff": "Turn on/off",
    "lumi_plug_oning": "On",
    "lumi_plug_offing": "Off",
    "lumi_plug_overheat": "The plug is overheated",
    "lumi_plug_overload": "The plug is overload",
    "lumi_plug_check_error": "The plug is cut off automatically and goes into safe mode. Please check if there're any errors."
  };
  exports.default = en;
},130,[],"projects/com.lumi.plug/Main/Localized/Language/en.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var zhHans = {
    "lumi_plug_setting_replaceIcon": "更换图标",
    "lumi_plug_setting_maxPower": "最大功率限制",
    "lumi_plug_setting_cutOff": "断电记忆",
    "lumi_plug_setting_cutOff_tps": "来电后，插座保持断电之前的状态",
    "lumi_plug_setting_indecateLight": "关闭指示灯",
    "lumi_plug_setting_indecateLight_tips": "每天21:00至09:00关闭指示灯",
    "lumi_plug_replaceIcon_book": "笔记本",
    "lumi_plug_replaceIcon_cooker": "电饭煲",
    "lumi_plug_replaceIcon_default": "默认",
    "lumi_plug_replaceIcon_drinking": "饮水机",
    "lumi_plug_replaceIcon_fan": "风扇",
    "lumi_plug_replaceIcon_humidifier": "加湿器",
    "lumi_plug_replaceIcon_router": "路由器",
    "lumi_plug_replaceIcon_sound": "音响",
    "lumi_plug_replaceIcon_tablelamp": "台灯",
    "lumi_plug_replaceIcon_tank": "鱼缸",
    "lumi_plug_replaceIcon_tram": "电动车",
    "lumi_plug_replaceIcon_tv": "电视",
    "lumi_plug_replaceIcon_waterheater": "热水器",
    "lumi_plug_main_elec_removed": "插入的电器脱离",
    "lumi_plug_countdown": "倒计时",
    "lumi_plug_timer": "定时",
    "lumi_plug_detect_unplug": "检测到插入的电器已脱离插座",
    "lumi_plug_long_blue": "请长按按键5秒以上，直至蓝色指示灯快速闪烁后松开",
    "lumi_plug_opened": "已开启",
    "lumi_plug_closed": "已关闭",
    "lumi_plug_plug_open": "插座已开启",
    "lumi_plug_plug_close": "插座已关闭",
    "lumi_plug_close_later_min": "%02d分钟后关闭",
    "lumi_plug_close_later_hour_min": "%02d小时%02d分钟后关闭",
    "lumi_plug_open_later_min": "%02d分钟后开启",
    "lumi_plug_open_later_hour_min": "%02d小时%02d分钟后开启",
    "lumi_plug_today_elec": "今日用电",
    "lumi_plug_month_elec": "当月用电",
    "lumi_plug_current_power": "当前功率",
    "lumi_plug_plug_plugin": "插孔已插入电器",
    "lumi_plug_plug_plugout": "插孔未插入电器",
    "lumi_plug_network_error": "网络连接不可用",
    "lumi_plug_electricity": "电量统计",
    "lumi_plug_power_history": "功率历史记录",
    "lumi_plug_kwh": "度",
    "lumi_plug_W": "W",
    "lumi_plug_day": "日",
    "lumi_plug_week": "周",
    "lumi_plug_month": "月",
    "lumi_plug_year": "年",
    "lumi_plug_charging_protect": "充电保护",
    "lumi_plug_close_overload": "半小时内功率低于2W，自动关闭插座",
    "lumi_plug_off_when_overload": "超过最大功率则自动断电",
    "lumi_plug_blanket": "电热毯",
    "lumi_plug_brush": "电动牙刷",
    "lumi_plug_repeller": "电蚊香",
    "lumi_plug_discard_operation": "放弃当前操作？",
    "lumi_plug_cancel": "取消",
    "lumi_plug_confirm": "确认",
    "lumi_plug_on": "开启",
    "lumi_plug_off": "关闭",
    "lumi_plug_onoff": "开启/关闭",
    "lumi_plug_oning": "开着",
    "lumi_plug_offing": "关着",
    "lumi_plug_overheat": "插座温度过高",
    "lumi_plug_overload": "插座超负荷",
    "lumi_plug_check_error": "插座已开启安全保护，功能已停用，请检查插座有无异常"
  };
  exports.default = zhHans;
},131,[],"projects/com.lumi.plug/Main/Localized/Language/zh-Hans.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var PLUG_ICON_TYPE = 'PLUG_ICON_TYPE';
  exports.PLUG_ICON_TYPE = PLUG_ICON_TYPE;
},132,[],"projects/com.lumi.plug/Main/Redux/Actions/ActionTypes/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/LHMainPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _reactRedux = _require(_dependencyMap[2], "react-redux");

  var _redux = _require(_dependencyMap[3], "redux");

  var _miot = _require(_dependencyMap[4], "miot");

  var _Card = _require(_dependencyMap[5], "miot/ui/Card");

  var _Card2 = babelHelpers.interopRequireDefault(_Card);

  var _LHCommonFunction = _require(_dependencyMap[6], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[7], "LHCommonUI");

  var _Resources = _require(_dependencyMap[8], "Resources");

  var _Resources2 = babelHelpers.interopRequireDefault(_Resources);

  var _LHDeviceConfig = _require(_dependencyMap[9], "./LHDeviceConfig");

  var _LHCommonStyle = _require(_dependencyMap[10], "./Styles/LHCommonStyle");

  var _LHCommonStyle2 = babelHelpers.interopRequireDefault(_LHCommonStyle);

  var _LHMainPageStyle = _require(_dependencyMap[11], "./Styles/Page/LHMainPageStyle");

  var _LHMainPageStyle2 = babelHelpers.interopRequireDefault(_LHMainPageStyle);

  var _LHPolicyLicenseUtils = _require(_dependencyMap[12], "./Utils/LHPolicyLicenseUtils");

  var _LHPolicyLicenseUtils2 = babelHelpers.interopRequireDefault(_LHPolicyLicenseUtils);

  var _PlugIconType = _require(_dependencyMap[13], "./Redux/Actions/PlugIconType");

  var _PlugIconType2 = babelHelpers.interopRequireDefault(_PlugIconType);

  var _LHLocalizableString = _require(_dependencyMap[14], "./Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var plugStatus = {
    isOn: false,
    indicateLight: false,
    isPlugged: true,
    loadVoltage: 0,
    todayElec: null,
    monthElec: null,
    loadPower: null,
    powerDate: null
  };
  var onColor = _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray;
  var offColor = '#434A51';

  var MainPage = function (_React$Component) {
    babelHelpers.inherits(MainPage, _React$Component);

    function MainPage(props) {
      babelHelpers.classCallCheck(this, MainPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (MainPage.__proto__ || Object.getPrototypeOf(MainPage)).call(this, props));

      var navigation = _this.props.navigation;
      navigation.setParams({
        deviceName: _miot.Device.name
      });
      _this.state = babelHelpers.extends({}, plugStatus);
      return _this;
    }

    babelHelpers.createClass(MainPage, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        var _this2 = this;

        this.msgSubscription = null;
        var _LHDeviceConfig$prop = _LHDeviceConfig.LHDeviceConfig.prop,
            onoff = _LHDeviceConfig$prop.onoff,
            isPlugged = _LHDeviceConfig$prop.isPlugged,
            loadPower = _LHDeviceConfig$prop.loadPower;

        var prOnOff = _LHDeviceConfig.LHDeviceConfig.propPrefix(onoff);

        var prIsPlugged = _LHDeviceConfig.LHDeviceConfig.propPrefix(isPlugged);

        var prLoadPower = _LHDeviceConfig.LHDeviceConfig.propPrefix(loadPower);

        var plugDetection = _LHDeviceConfig.LHDeviceConfig.event.plugDetection;

        var preplugDetection = _LHDeviceConfig.LHDeviceConfig.eventPrefix(plugDetection);

        _miot.Device.getDeviceWifi().subscribeMessages(prOnOff, prIsPlugged, prLoadPower, preplugDetection).then(function (subcription) {
          _this2.msgSubscription = subcription;
        });

        this.subscription = _miot.DeviceEvent.deviceReceivedMessages.addListener(function (device, messages) {
          var navigation = _this2.props.navigation;

          if (!navigation.isFocused()) {
            return;
          }

          if (messages.has(prOnOff)) {
            var _messages$get = messages.get(prOnOff),
                _messages$get2 = babelHelpers.slicedToArray(_messages$get, 1),
                neutral0 = _messages$get2[0];

            plugStatus.isOn = neutral0 === 'on';
          }

          if (messages.has(prIsPlugged)) {
            var _messages$get3 = messages.get(prIsPlugged),
                _messages$get4 = babelHelpers.slicedToArray(_messages$get3, 1),
                power = _messages$get4[0];

            plugStatus.isPlugged = power === 'on';
          }

          if (messages.has(prLoadPower)) {
            var _messages$get5 = messages.get(prLoadPower),
                _messages$get6 = babelHelpers.slicedToArray(_messages$get5, 1),
                loadPowerv = _messages$get6[0];

            plugStatus.loadPower = loadPowerv;
            plugStatus.powerDate = _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd hh:mm:ss', new Date().getTime());
          }

          if (messages.has(preplugDetection)) {
            var _messages$get7 = messages.get(preplugDetection),
                _messages$get8 = babelHelpers.slicedToArray(_messages$get7, 1),
                plugDetectionv = _messages$get8[0];

            plugStatus.isPlugged = plugDetectionv === 'plug_in';
          }

          console.log(plugStatus);

          _this2.updateUI();
        });
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this3 = this;

        this.deviceNameChangedListener = _miot.DeviceEvent.deviceNameChanged.addListener(function (event) {
          var navigation = _this3.props.navigation;
          navigation.setParams({
            deviceName: event.name
          });
        });
        this.checkAuthorization();
        this.getElectricityData();
        var GetIconTypeItem = this.props.GetIconTypeItem;
        GetIconTypeItem();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.subscription.remove();
        if (this.msgSubscription) this.msgSubscription.remove();
      }
    }, {
      key: "getInfoData",
      value: function getInfoData() {
        var _state = this.state,
            loadPower = _state.loadPower,
            todayElec = _state.todayElec,
            monthElec = _state.monthElec;

        var formatElectricityNumber = function formatElectricityNumber(number) {
          if (!number && typeof number === 'object') {
            return '--';
          }

          return _LHCommonFunction.LHElectricityDataManager.formatElectricityNumber(number);
        };

        var formatPowerNumber = function formatPowerNumber(number) {
          if (!number && typeof number === 'object') {
            return '--';
          }

          return _LHCommonFunction.LHElectricityDataManager.formatPowerNumber(number);
        };

        var formatUnit = function formatUnit(elec, unit) {
          if (!elec && typeof elec === 'object') {
            return '';
          }

          return unit;
        };

        return [{
          title: _LHLocalizableString2.default.lumi_plug_today_elec,
          unit: formatUnit(todayElec, 'kWh'),
          value: formatElectricityNumber(todayElec)
        }, {
          title: _LHLocalizableString2.default.lumi_plug_month_elec,
          unit: formatUnit(monthElec, 'kWh'),
          value: formatElectricityNumber(monthElec)
        }, {
          title: _LHLocalizableString2.default.lumi_plug_current_power,
          unit: formatUnit(loadPower, 'W'),
          value: formatPowerNumber(loadPower)
        }];
      }
    }, {
      key: "checkAuthorization",
      value: function checkAuthorization() {
        var _this4 = this;

        var onSuccess = function onSuccess() {
          _this4.getDeviceStatus(false);
        };

        if (_miot.Device.isShared) {
          onSuccess();
          return;
        }

        var policyLicenseUrl = _LHPolicyLicenseUtils2.default.GexPolicyLicenseUrl();

        this.authorizationCancelListener = _LHCommonFunction.LHAuthorizationUtils.Authorization({
          licenseTitle: _LHCommonFunction.LHCommonLocalizableString['common_setting_user_agreement'],
          licenseUrl: policyLicenseUrl.licenseUrl,
          policyTitle: _LHCommonFunction.LHCommonLocalizableString['common_setting_privacy_policy'],
          policyUrl: policyLicenseUrl.policyUrl,
          authorizationSucc: function authorizationSucc() {
            onSuccess();
          }
        });
      }
    }, {
      key: "getDeviceStatus",
      value: function getDeviceStatus() {
        var _this5 = this;

        var isShowLoading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (isShowLoading) {
          _LHCommonFunction.LHDialogUtils.LoadingDialogShow({
            title: _LHCommonFunction.LHCommonLocalizableString['common_log_loading']
          });
        }

        _LHDeviceConfig.LHDeviceConfig.restoreDeviceStatus().then(function () {
          var isOn = _LHDeviceConfig.DeviceProperty.isOn;
          babelHelpers.extends(plugStatus, {
            isOn: isOn
          });
          console.log('TCL: getDeviceStatus -> restoreDeviceStatus plugStatus', plugStatus);

          _this5.updateUI();
        }).catch(function (err) {
          console.log('TCL: getDeviceStatus -> restoreDeviceStatus err', err);
        });

        _LHDeviceConfig.LHDeviceConfig.getLastPluginStatus().then(function () {
          var isPlugged = _LHDeviceConfig.DeviceProperty.isPlugged;
          babelHelpers.extends(plugStatus, {
            isPlugged: isPlugged
          });
          console.log('TCL: getDeviceStatus -> getLastPluginStatus plugStatus', plugStatus);

          _this5.updateUI();
        }).catch(function (err) {
          console.log('TCL: getDeviceStatus -> getLastPluginStatus err', err);
        });

        _LHDeviceConfig.LHDeviceConfig.fetchStatusData().then(function (status) {
          if (isShowLoading) _LHCommonFunction.LHDialogUtils.LoadingDialogHide();
          babelHelpers.extends(plugStatus, status);
          console.log(plugStatus);

          _this5.updateUI();
        }).catch(function (err) {
          if (isShowLoading) {
            _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

            _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString['common_tips_loading_failed']);
          }

          console.log('error: ', err);
        });
      }
    }, {
      key: "setDevicePlugOn",
      value: function setDevicePlugOn() {
        var isShowLoading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (isShowLoading) {
          _LHCommonFunction.LHDialogUtils.LoadingDialogShow({
            title: _LHCommonFunction.LHCommonLocalizableString['common_tips_setting']
          });
        }

        var isOn = plugStatus.isOn;

        _LHDeviceConfig.LHDeviceConfig.setDevicePlugOn(!isOn).then(function (res) {
          if (isShowLoading) _LHCommonFunction.LHDialogUtils.LoadingDialogHide();
          console.log('toggle_plug success: ', res, plugStatus);
          plugStatus.isOn = !isOn;
        }).catch(function (err) {
          if (isShowLoading) {
            _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

            _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString['common_tips_setting_failed']);
          }

          console.log('toggle_plug fail: ', err);
        });
      }
    }, {
      key: "updateUI",
      value: function updateUI() {
        var _console;

        var isOn = plugStatus.isOn;
        this.setState(babelHelpers.extends({}, plugStatus));
        this.updateNavigationerWithPlugOn(isOn);

        (_console = console).log.apply(_console, babelHelpers.toConsumableArray(plugStatus));
      }
    }, {
      key: "renderInfoItem",
      value: function renderInfoItem(item, index) {
        var _this6 = this;

        return _react2.default.createElement(
          _reactNative.View,
          {
            key: 'infoItem_' + index,
            style: [_LHMainPageStyle2.default.infoItemWrap, _LHMainPageStyle2.default.flex],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 324
            }
          },
          _react2.default.createElement(
            _reactNative.TouchableOpacity,
            {
              style: _LHMainPageStyle2.default.infoItem,
              onPress: function onPress() {
                console.log(item);

                _this6.jumpToChart(item);
              },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 325
              }
            },
            _react2.default.createElement(
              _reactNative.Text,
              {
                style: _LHMainPageStyle2.default.infoTitle,
                numberOfLines: 2,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 332
                }
              },
              item.title
            ),
            _react2.default.createElement(
              _reactNative.Text,
              {
                style: _LHMainPageStyle2.default.infoValue,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 333
                }
              },
              item.value + item.unit
            )
          ),
          _react2.default.createElement(_reactNative.View, {
            style: _LHMainPageStyle2.default.infoLine,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 335
            }
          })
        );
      }
    }, {
      key: "jumpToChart",
      value: function jumpToChart(item) {
        var navigation = this.props.navigation;
        var _state2 = this.state,
            loadPower = _state2.loadPower,
            powerDate = _state2.powerDate;

        switch (item.title) {
          case _LHLocalizableString2.default.lumi_plug_today_elec:
            navigation.navigate('LHBatteryPage', {
              dateActive: 0
            });
            break;

          case _LHLocalizableString2.default.lumi_plug_month_elec:
            navigation.navigate('LHBatteryPage', {
              dateActive: 2
            });
            break;

          case _LHLocalizableString2.default.lumi_plug_current_power:
            navigation.navigate('LHPowerPage', {
              powerValue: loadPower,
              dateValue: powerDate
            });
            break;

          default:
            break;
        }
      }
    }, {
      key: "renderInfoInnerView",
      value: function renderInfoInnerView() {
        var _this7 = this;

        return _react2.default.createElement(
          _reactNative.View,
          {
            style: _LHMainPageStyle2.default.infoItemWrap,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 360
            }
          },
          this.getInfoData().map(function (item, index) {
            return _this7.renderInfoItem(item, index);
          })
        );
      }
    }, {
      key: "updateNavigationerWithPlugOn",
      value: function updateNavigationerWithPlugOn() {
        var isOn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var navigation = this.props.navigation;
        navigation.setParams({
          isPlugOn: isOn
        });
      }
    }, {
      key: "getElectricityData",
      value: function getElectricityData() {
        var _this8 = this;

        _LHCommonFunction.LHElectricityDataManager.fetchTodayElectricityData().then(function (res) {
          babelHelpers.extends(plugStatus, {
            todayElec: res / 1000
          });

          _this8.setState.apply(_this8, babelHelpers.toConsumableArray(plugStatus));
        }).catch(function (err) {
          console.log('TCL: getElectricityData -> err', err);
        });

        _LHCommonFunction.LHElectricityDataManager.fetchMonthElectricityData().then(function (res) {
          babelHelpers.extends(plugStatus, {
            monthElec: res / 1000
          });

          _this8.setState.apply(_this8, babelHelpers.toConsumableArray(plugStatus));
        }).catch(function (err) {
          console.log('TCL: getElectricityData -> err', err);
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this9 = this;

        var _state3 = this.state,
            isOn = _state3.isOn,
            isPlugged = _state3.isPlugged;
        var ReplaceIconReducers = this.props.ReplaceIconReducers;
        var plugIconItem = ReplaceIconReducers.plugIconItem;
        var image = isOn ? plugIconItem.main.on : plugIconItem.main.off;
        return _react2.default.createElement(
          _reactNative.ScrollView,
          {
            style: isOn ? _LHMainPageStyle2.default.scrollView : _LHMainPageStyle2.default.mainPageDarkBg,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 401
            }
          },
          _react2.default.createElement(
            _reactNative.View,
            {
              style: isOn ? _LHCommonStyle2.default.pageGrayStyle : _LHMainPageStyle2.default.mainPageDarkBg,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 402
              }
            },
            _react2.default.createElement(
              _reactNative.View,
              {
                style: [_LHMainPageStyle2.default.alignItemsCenter, _LHMainPageStyle2.default.iconPadding],
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 403
                }
              },
              _react2.default.createElement(
                _reactNative.TouchableOpacity,
                {
                  style: _LHMainPageStyle2.default.plugOnIcon,
                  onPress: function onPress() {
                    _this9.setDevicePlugOn(false);
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 404
                  }
                },
                _react2.default.createElement(_reactNative.Image, {
                  style: _LHMainPageStyle2.default.plugOnIcon,
                  source: image,
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 411
                  }
                })
              )
            ),
            _react2.default.createElement(_LHCommonUI.LHCardBase, {
              visible: !isPlugged,
              data: [{
                title: _LHLocalizableString2.default['lumi_plug_main_elec_removed'],
                titleNumberOfLines: 2,
                iconSource: _Resources2.default.MainPage.plugAbnormal,
                rightIconStyle: _LHMainPageStyle2.default.closeIcon,
                rightIconPress: function rightIconPress() {
                  _this9.setState({
                    isPlugged: true
                  });
                },
                titleStyle: _LHMainPageStyle2.default.titleStyle
              }],
              cardStyle: {
                height: 60
              },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 417
              }
            }),
            _react2.default.createElement(_Card2.default, {
              visible: true,
              cardStyle: _reactNative.StyleSheet.flatten(_LHMainPageStyle2.default.cardStyle),
              innerView: this.renderInfoInnerView(),
              __source: {
                fileName: _jsxFileName,
                lineNumber: 434
              }
            }),
            _react2.default.createElement(_LHCommonUI.LHCardBase, {
              data: [{
                title: _LHLocalizableString2.default.lumi_plug_onoff,
                iconSource: isOn ? _Resources2.default.MainPage.plugOff : _Resources2.default.MainPage.plugOn,
                hideRightIcon: true,
                onPress: function onPress() {
                  _this9.setDevicePlugOn(false);
                }
              }],
              cardStyle: {
                height: 80,
                marginTop: 10
              },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 439
              }
            }),
            _react2.default.createElement(_LHCommonUI.LHCardBase, {
              data: [{
                title: _LHLocalizableString2.default.lumi_plug_timer,
                iconSource: _Resources2.default.MainPage.plugTimer,
                onPress: function onPress() {
                  if (_miot.Device.isShared) {
                    _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString.common_tips_shared_no_promision);

                    return;
                  }

                  var onoff = _LHDeviceConfig.LHDeviceConfig.prop.onoff;

                  _miot.Host.ui.openTimerSettingPageWithVariousTypeParams('toggle_plug', [onoff, 'on'], 'toggle_plug', [onoff, 'off']);
                }
              }, {
                title: _LHLocalizableString2.default.lumi_plug_countdown,
                iconSource: _Resources2.default.MainPage.plugCountDown,
                onPress: function onPress() {
                  if (_miot.Device.isShared) {
                    _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString.common_tips_shared_no_promision);

                    return;
                  }

                  var onoff = _LHDeviceConfig.LHDeviceConfig.prop.onoff;
                  var isOn1 = _this9.state.isOn;
                  var setting_ios = {
                    onMethod: 'toggle_plug',
                    offMethod: 'toggle_plug',
                    onParam: [onoff, 'on'],
                    offParam: [onoff, 'off']
                  };
                  var setting_android = {
                    onMethod: 'toggle_plug',
                    offMethod: 'toggle_plug',
                    onParam: JSON.stringify([onoff, 'on']),
                    offParam: JSON.stringify([onoff, 'off'])
                  };

                  _miot.Host.ui.openCountDownPage(isOn1, _reactNative.Platform.OS === 'android' ? setting_android : setting_ios);
                }
              }],
              cardStyle: {
                height: 160,
                marginTop: 10
              },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 451
              }
            })
          ),
          _react2.default.createElement(_reactNative.View, {
            style: _LHMainPageStyle2.default.pageBottom,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 494
            }
          })
        );
      }
    }]);
    return MainPage;
  }(_react2.default.Component);

  MainPage.navigationOptions = function (_ref) {
    var navigation = _ref.navigation;
    console.log(navigation);
    var isPlugOn = navigation.getParam('isPlugOn');
    var deviceName = navigation.getParam('deviceName');
    console.log(isPlugOn);
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          style: {
            backgroundColor: 'transparent'
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 62
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          statusBarStyle: isPlugOn ? 'dark' : 'light',
          title: deviceName,
          titleStyle: !isPlugOn ? {
            color: '#fff'
          } : null,
          style: {
            backgroundColor: isPlugOn ? onColor : offColor
          },
          onPressLeft: function onPressLeft() {
            _miot.Package.exit();
          },
          backBtnIcon: isPlugOn ? 'black' : 'white',
          rightButtons: [{
            type: 'deafultMoreBtn',
            backBtnIcon: isPlugOn ? 'black' : 'white',
            press: function press() {
              if (_miot.Device.isShared) {
                _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString.common_tips_shared_no_promision);

                return;
              }

              navigation.navigate('LHSettingPage');
            }
          }],
          __source: {
            fileName: _jsxFileName,
            lineNumber: 63
          }
        })
      )
    };
  };

  exports.default = (0, _reactRedux.connect)(function (state) {
    return {
      ReplaceIconReducers: state.ReplaceIconReducers
    };
  }, function (dispatch) {
    return (0, _redux.bindActionCreators)(_PlugIconType2.default, dispatch);
  })((0, _LHCommonFunction.LHPureRenderDecorator)(MainPage));
},133,[150,148,40,64,147,172,3,75,174,134,135,136,137,138,129],"projects/com.lumi.plug/Main/LHMainPage.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LHDeviceConfig = exports.DeviceProperty = undefined;

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _miot = _require(_dependencyMap[1], "miot");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var plug_prop_base = {
    onoff: 'channel_0',
    loadVoltage: 'load_voltage',
    loadPower: 'load_power',
    isPlugged: 'power',
    maxPower: 'max_power',
    powerOffMemory: 'poweroff_memory',
    chargeProtect: 'charge_protect',
    indicateLight: 'en_night_tip_light',
    chargeProtectThreshold: 'charge_protect_threshold'
  };
  var plug_event_base = {
    plugDetection: 'plug_detection'
  };
  var DeviceProperty = {
    isOn: false,
    indicateLight: false,
    isPlugged: true,
    loadVoltage: 0,
    loadPower: 0,
    maxPower: 2500,
    powerOffMemory: false
  };
  var PlugDeviceStatusKey = 'PlugDeviceStatusKey';

  var LHDeviceConfig = function (_React$Component) {
    babelHelpers.inherits(LHDeviceConfig, _React$Component);

    function LHDeviceConfig() {
      babelHelpers.classCallCheck(this, LHDeviceConfig);
      return babelHelpers.possibleConstructorReturn(this, (LHDeviceConfig.__proto__ || Object.getPrototypeOf(LHDeviceConfig)).apply(this, arguments));
    }

    babelHelpers.createClass(LHDeviceConfig, null, [{
      key: "getCallMethod",
      value: function getCallMethod(status, actions) {
        var extraPayload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var extraArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
        var device = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _miot.Device;
        return new Promise(function (resolve, reject) {
          if (!actions.length) reject(new Error('invalid input'));
          var method = actions[0].getMethod;
          var params = extraArray.concat(actions.reduce(function (pre, now) {
            return pre.concat(now.getParams());
          }, []));
          device.getDeviceWifi().callMethod(method, params, extraPayload).then(function (res) {
            var reducer = function reducer(prestatus, action, currentIndex) {
              return action.paraseParams(prestatus, res.result[currentIndex]);
            };

            var newStatus = actions.reduce(reducer, status);
            resolve(newStatus);
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "setDevicePlugOn",
      value: function setDevicePlugOn() {
        var isOn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return new Promise(function (resolve, reject) {
          var onoff = LHDeviceConfig.prop.onoff;

          _miot.Device.getDeviceWifi().callMethod('toggle_plug', [onoff, isOn ? 'on' : 'off'], {
            sid: _miot.Device.deviceID
          }).then(function () {
            resolve(babelHelpers.extends(DeviceProperty, {
              isOn: isOn
            }));
            LHDeviceConfig.saveDeviceStatus();
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "setDeviceTipLight",
      value: function setDeviceTipLight() {
        var isTipLight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return new Promise(function (resolve, reject) {
          _miot.Device.getDeviceWifi().callMethod('set_device_prop', {
            sid: _miot.Device.deviceID,
            en_night_tip_light: isTipLight ? 1 : 0
          }).then(function () {
            resolve(babelHelpers.extends(DeviceProperty, {
              indicateLight: isTipLight
            }));
            LHDeviceConfig.saveDeviceStatus();
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "setDeviceIsMemoryOn",
      value: function setDeviceIsMemoryOn() {
        var isMemoryOn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return new Promise(function (resolve, reject) {
          _miot.Device.getDeviceWifi().callMethod('set_device_prop', {
            sid: _miot.Device.deviceID,
            poweroff_memory: isMemoryOn ? 1 : 0
          }).then(function () {
            resolve(babelHelpers.extends(DeviceProperty, {
              powerOffMemory: isMemoryOn
            }));
            LHDeviceConfig.saveDeviceStatus();
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "setDeviceMaxPower",
      value: function setDeviceMaxPower() {
        var maxPower = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2500;
        return new Promise(function (resolve, reject) {
          _miot.Device.getDeviceWifi().callMethod('set_device_prop', {
            sid: _miot.Device.deviceID,
            max_power: maxPower
          }).then(function () {
            resolve(babelHelpers.extends(DeviceProperty, {
              maxPower: maxPower
            }));
            LHDeviceConfig.saveDeviceStatus();
          }).catch(function (err) {
            reject(err);
          });
        });
      }
    }, {
      key: "prop",
      get: function get() {
        for (var i = 0; i < LHDeviceConfig.devicesProfile.length; i += 1) {
          if (_miot.Device.model === LHDeviceConfig.devicesProfile[i].model) {
            return LHDeviceConfig.devicesProfile[i].prop;
          }
        }

        return plug_prop_base;
      }
    }, {
      key: "event",
      get: function get() {
        for (var i = 0; i < LHDeviceConfig.devicesProfile.length; i += 1) {
          if (_miot.Device.model === LHDeviceConfig.devicesProfile[i].model) {
            return LHDeviceConfig.devicesProfile[i].event;
          }
        }

        return plug_event_base;
      }
    }]);
    return LHDeviceConfig;
  }(_react2.default.Component);

  LHDeviceConfig.devicesProfile = [{
    model: 'lumi.plug.maus01',
    prop: plug_prop_base,
    event: plug_event_base
  }, {
    model: 'lumi.plug.v1',
    prop: babelHelpers.extends({}, plug_prop_base, {
      onoff: 'neutral_0'
    }),
    event: plug_event_base
  }, {
    model: 'lumi.plug.maeu01',
    prop: babelHelpers.extends({}, plug_prop_base),
    event: plug_event_base
  }, {
    model: 'lumi.plug.mmeu01',
    prop: babelHelpers.extends({}, plug_prop_base),
    event: plug_event_base
  }];

  LHDeviceConfig.propPrefix = function (prop) {
    return 'prop.' + prop;
  };

  LHDeviceConfig.eventPrefix = function (event) {
    return 'event.' + event;
  };

  LHDeviceConfig.loadPower = {
    key: 'loadPower',
    defaultValue: 0,
    getMethod: 'get_prop_plug',
    getParams: function getParams() {
      var loadPower = LHDeviceConfig.prop.loadPower;
      return [loadPower];
    },
    paraseParams: function paraseParams(status, res) {
      var temp = {};
      temp.loadPower = res;
      return babelHelpers.extends({}, status, temp);
    }
  };
  LHDeviceConfig.isOn = {
    key: 'isOn',
    defaultValue: false,
    getMethod: 'get_prop_plug',
    getParams: function getParams() {
      var onoff = LHDeviceConfig.prop.onoff;
      return [onoff];
    },
    paraseParams: function paraseParams(status, res) {
      var temp = {};
      temp.isOn = res === 'on';
      return babelHelpers.extends({}, status, temp);
    },
    setMethod: 'toggle_plug',
    setParams: function setParams(isOn) {
      var onoff = LHDeviceConfig.prop.onoff;
      return [onoff, isOn ? 'on' : 'off'];
    }
  };
  LHDeviceConfig.indicateLight = {
    key: 'indicateLight',
    defaultValue: false,
    getMethod: 'get_device_prop',
    getParams: function getParams() {
      var indicateLight = LHDeviceConfig.prop.indicateLight;
      return [indicateLight];
    },
    paraseParams: function paraseParams(status, res) {
      var temp = {};
      temp.indicateLight = res === 1;
      return babelHelpers.extends({}, status, temp);
    },
    setMethod: 'set_device_prop',
    setParams: function setParams(newValue) {
      var indicateLight = LHDeviceConfig.prop.indicateLight;
      return [indicateLight, newValue ? 1 : 0];
    }
  };
  LHDeviceConfig.powerOffMemory = {
    key: 'powerOffMemory',
    defaultValue: false,
    getMethod: 'get_device_prop',
    getParams: function getParams() {
      var powerOffMemory = LHDeviceConfig.prop.powerOffMemory;
      return [powerOffMemory];
    },
    paraseParams: function paraseParams(status, res) {
      var temp = {};
      temp.powerOffMemory = res === 1;
      return babelHelpers.extends({}, status, temp);
    },
    setMethod: 'set_device_prop',
    setParams: function setParams(newValue) {
      var powerOffMemory = LHDeviceConfig.prop.powerOffMemory;
      return [powerOffMemory, newValue ? 1 : 0];
    }
  };
  LHDeviceConfig.maxPower = {
    key: 'max_power',
    defaultValue: 2500,
    getMethod: 'get_device_prop',
    getParams: function getParams() {
      var maxPower = LHDeviceConfig.prop.maxPower;
      return [maxPower];
    },
    paraseParams: function paraseParams(status, res) {
      var temp = {};
      temp.maxPower = res;
      return babelHelpers.extends({}, status, temp);
    },
    setMethod: 'set_device_prop',
    setParams: function setParams(newValue) {
      var maxPower = LHDeviceConfig.prop.maxPower;
      return [maxPower, newValue];
    }
  };

  LHDeviceConfig.fetchStatusData = function () {
    return new Promise(function (resolve, reject) {
      LHDeviceConfig.getCallMethod(DeviceProperty, [LHDeviceConfig.isOn, LHDeviceConfig.loadPower], {
        sid: _miot.Device.deviceID
      }).then(function (status) {
        resolve(babelHelpers.extends(DeviceProperty, status));
        LHDeviceConfig.saveDeviceStatus();
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  LHDeviceConfig.fetchSettingData = function () {
    var paramsActions = [LHDeviceConfig.indicateLight, LHDeviceConfig.powerOffMemory, LHDeviceConfig.maxPower];
    return new Promise(function (resolve, reject) {
      LHDeviceConfig.getCallMethod(DeviceProperty, paramsActions, {}, [_miot.Device.deviceID], _miot.Device.parentDevice).then(function (status) {
        resolve(babelHelpers.extends(DeviceProperty, status));
        LHDeviceConfig.saveDeviceStatus();
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  LHDeviceConfig.getLastPluginStatus = function () {
    var plugDetection = LHDeviceConfig.event.plugDetection;
    return _LHCommonFunction.LHElectricityDataManager.GetLatestLog({
      key: plugDetection,
      type: 'event'
    }).then(function (res) {
      console.log('TCL: getLastPluginStatus -> res', res);
      var value = res.value;
      return babelHelpers.extends(DeviceProperty, {
        isPlugged: typeof value === 'string' ? value.indexOf('plug_in') > -1 : false
      });
    });
  };

  LHDeviceConfig.restoreDeviceStatus = function () {
    return new Promise(function (reslove, reject) {
      _LHCommonFunction.LHMiServer.GetHostStorage(PlugDeviceStatusKey + _miot.Device.deviceID).then(function (value) {
        babelHelpers.extends(DeviceProperty, value || {});
        reslove(value);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  LHDeviceConfig.saveDeviceStatus = function () {
    return _LHCommonFunction.LHMiServer.SetHostStorage(PlugDeviceStatusKey + _miot.Device.deviceID, DeviceProperty);
  };

  exports.DeviceProperty = DeviceProperty;
  exports.LHDeviceConfig = LHDeviceConfig;
},134,[150,147,3],"projects/com.lumi.plug/Main/LHDeviceConfig.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var LHCommonStyles = _reactNative.StyleSheet.create({
    navigatorWithBorderBotoom: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite,
      borderBottomWidth: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      borderBottomColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor
    },
    navigatorWithoutBorderBotoom: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    },
    pageGrayStyle: {
      flex: 1,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
    },
    pageWhiteStyle: {
      flex: 1,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaWhite
    }
  });

  exports.default = LHCommonStyles;
},135,[148,3],"projects/com.lumi.plug/Main/Styles/LHCommonStyle.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
      width = _Dimensions$get.width;

  var styles = _reactNative.StyleSheet.create({
    flex: {
      flex: 1
    },
    cardStyle: {
      height: 80,
      width: width - 10 * 2,
      borderRadius: 10,
      marginLeft: 10
    },
    titleStyle: {
      color: '#FF9900',
      fontSize: 15
    },
    closeIcon: {
      width: 10,
      height: 10
    },
    mainPageDarkBg: {
      backgroundColor: '#434A51'
    },
    scrollView: {
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
    },
    pageBottom: {
      height: _LHCommonFunction.LHUiUtils.GetPx(10) + _LHCommonFunction.LHDeviceUtils.AppHomeIndicatorHeight
    },
    alignItemsCenter: {
      alignItems: 'center'
    },
    plugOnIcon: {
      width: _LHCommonFunction.LHUiUtils.GetPx(213),
      height: _LHCommonFunction.LHUiUtils.GetPx(213)
    },
    iconPadding: {
      paddingVertical: _LHCommonFunction.LHUiUtils.GetPx(57)
    },
    infoItemWrap: {
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center'
    },
    infoItem: {
      flex: 1,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center'
    },
    infoLine: {
      height: 20,
      width: _LHCommonFunction.LHUiUtils.MiJiaBorderWidth,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaLineColor
    },
    infoValue: {
      marginTop: 4,
      fontSize: 15,
      letterSpacing: 0,
      width: '100%',
      color: '#000',
      textAlign: 'center'
    },
    infoTitle: {
      fontSize: 10,
      lineHeight: 13,
      letterSpacing: 0,
      width: '100%',
      color: '#333',
      textAlign: 'center'
    },
    ctrlViewWrap: {
      flexDirection: 'row',
      paddingHorizontal: _LHCommonFunction.LHUiUtils.GetPx(36)
    },
    flexView: {
      flex: 1,
      justifyContent: 'center'
    }
  });

  exports.default = styles;
},136,[148,3],"projects/com.lumi.plug/Main/Styles/Page/LHMainPageStyle.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LHLocalizableString = _require(_dependencyMap[0], "../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var LHPolicyLicenseUtils = function () {
    function LHPolicyLicenseUtils() {
      babelHelpers.classCallCheck(this, LHPolicyLicenseUtils);
    }

    babelHelpers.createClass(LHPolicyLicenseUtils, null, [{
      key: "GexPolicyLicenseUrl",
      value: function GexPolicyLicenseUrl() {
        var urls = {
          licenseUrl_en: _require(_dependencyMap[1], '../../Resources/html/agreement_en.html'),
          licenseUrl_zh: _require(_dependencyMap[2], '../../Resources/html/agreement_zh.html'),
          policyUrl_en: _require(_dependencyMap[3], '../../Resources/html/policy_en.html'),
          policyUrl_zh: _require(_dependencyMap[4], '../../Resources/html/policy_zh.html')
        };
        return {
          licenseUrl: urls['licenseUrl_' + _LHLocalizableString2.default.language],
          policyUrl: urls['policyUrl_' + _LHLocalizableString2.default.language]
        };
      }
    }]);
    return LHPolicyLicenseUtils;
  }();

  exports.default = LHPolicyLicenseUtils;
},137,[129,175,176,177,178],"projects/com.lumi.plug/Main/Utils/LHPolicyLicenseUtils.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reduxActions = _require(_dependencyMap[0], "redux-actions");

  var _miot = _require(_dependencyMap[1], "miot");

  var _LHReplaceIconPageData = _require(_dependencyMap[2], "../../../Page/ReplaceIconPage/LHReplaceIconPageData");

  var _ActionTypes = _require(_dependencyMap[3], "../ActionTypes");

  var GetIconTypeItem = (0, _reduxActions.createAction)(_ActionTypes.PLUG_ICON_TYPE, function () {
    return new Promise(function (resolve, reject) {
      _LHReplaceIconPageData.LHReplaceIconPageData.getCurrentItem({
        did: _miot.Device.deviceID
      }).then(function (res) {
        console.log(res);
        var selectedItem = null;

        _LHReplaceIconPageData.IconDataSource.map(function (item) {
          if (res === item.id) {
            selectedItem = item;
          }

          return item;
        });

        resolve(selectedItem);
      }).catch(function (err) {
        reject(err.message);
      });
    });
  });
  var SetIconTypeItem = (0, _reduxActions.createAction)(_ActionTypes.PLUG_ICON_TYPE, function (item) {
    var id = item.id;

    _LHReplaceIconPageData.LHReplaceIconPageData.setCurrentItem({
      did: _miot.Device.deviceID,
      val: id
    });

    return item;
  });
  var IconTypeActions = {
    GetIconTypeItem: GetIconTypeItem,
    SetIconTypeItem: SetIconTypeItem
  };
  exports.default = IconTypeActions;
},138,[93,147,128,132],"projects/com.lumi.plug/Main/Redux/Actions/PlugIconType/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/Page/SettingPage/LHSettingPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _miot = _require(_dependencyMap[2], "miot");

  var _LHCommonFunction = _require(_dependencyMap[3], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[4], "LHCommonUI");

  var _LHCommonStyle = _require(_dependencyMap[5], "../../Styles/LHCommonStyle");

  var _LHCommonStyle2 = babelHelpers.interopRequireDefault(_LHCommonStyle);

  var _LHPolicyLicenseUtils = _require(_dependencyMap[6], "../../Utils/LHPolicyLicenseUtils");

  var _LHPolicyLicenseUtils2 = babelHelpers.interopRequireDefault(_LHPolicyLicenseUtils);

  var _LHLocalizableString = _require(_dependencyMap[7], "../../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var _LHDeviceConfig = _require(_dependencyMap[8], "../../LHDeviceConfig");

  var _PluginConfig = _require(_dependencyMap[9], "../../PluginConfig");

  var _PluginConfig2 = babelHelpers.interopRequireDefault(_PluginConfig);

  var plugSetting = {
    indicateLight: false,
    powerOffMemory: true,
    maxPower: 2500
  };

  var SettingPage = function (_React$Component) {
    babelHelpers.inherits(SettingPage, _React$Component);

    function SettingPage(props, context) {
      babelHelpers.classCallCheck(this, SettingPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (SettingPage.__proto__ || Object.getPrototypeOf(SettingPage)).call(this, props, context));

      _this.state = babelHelpers.extends({
        deviceName: _miot.Device.name
      }, plugSetting);
      return _this;
    }

    babelHelpers.createClass(SettingPage, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        var _this2 = this;

        this.deviceNameChangedListener = _miot.DeviceEvent.deviceNameChanged.addListener(function (event) {
          _this2.setState({
            deviceName: event.name
          });
        });
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        this.fetchPlugSetting(false);
      }
    }, {
      key: "fetchPlugSetting",
      value: function fetchPlugSetting() {
        var _this3 = this;

        var isShowLoading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (isShowLoading) {
          _LHCommonFunction.LHDialogUtils.LoadingDialogShow({
            title: _LHCommonFunction.LHCommonLocalizableString['common_log_loading']
          });
        }

        _LHDeviceConfig.LHDeviceConfig.restoreDeviceStatus().then(function () {
          var indicateLight = _LHDeviceConfig.DeviceProperty.indicateLight,
              powerOffMemory = _LHDeviceConfig.DeviceProperty.powerOffMemory,
              maxPower = _LHDeviceConfig.DeviceProperty.maxPower;
          babelHelpers.extends(plugSetting, {
            indicateLight: indicateLight,
            powerOffMemory: powerOffMemory,
            maxPower: maxPower
          });
          console.log('TCL: fetchPlugSetting -> restoreDeviceStatus plugStatus', plugSetting);

          _this3.updateUI();
        }).catch(function (err) {
          console.log('TCL: fetchPlugSetting -> restoreDeviceStatus err', err);
        });

        _LHDeviceConfig.LHDeviceConfig.fetchSettingData().then(function (res) {
          if (isShowLoading) _LHCommonFunction.LHDialogUtils.LoadingDialogHide();
          console.log('success: ', res);
          babelHelpers.extends(plugSetting, res);
          console.log(plugSetting);

          _this3.updateUI();
        }).catch(function (err) {
          if (isShowLoading) {
            _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

            _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString['common_tips_loading_failed']);
          }

          console.log('error: ', err);
        });
      }
    }, {
      key: "updateUI",
      value: function updateUI() {
        this.setState(babelHelpers.extends({}, plugSetting));
      }
    }, {
      key: "onMaxPowerPress",
      value: function onMaxPowerPress() {
        this.setState({
          showPicker: true
        });
      }
    }, {
      key: "getPageData",
      value: function getPageData() {
        var _this4 = this;

        var _state = this.state,
            deviceName = _state.deviceName,
            maxPower = _state.maxPower,
            indicateLight = _state.indicateLight,
            powerOffMemory = _state.powerOffMemory;
        var items = [{
          title: _LHCommonFunction.LHCommonLocalizableString['common_setting_feature_setting'],
          data: [{
            title: _LHLocalizableString2.default['lumi_plug_setting_maxPower'],
            rightDescription: maxPower + 'W',
            press: function press() {
              _this4.onMaxPowerPress();
            }
          }, {
            title: _LHLocalizableString2.default['lumi_plug_setting_indecateLight'],
            description: _LHLocalizableString2.default['lumi_plug_setting_indecateLight_tips'],
            hideRightArrow: true,
            hasSwitch: true,
            switchValue: indicateLight,
            onSwitchChange: function onSwitchChange(isOn) {
              _this4.setState({
                indicateLight: isOn
              });

              _LHCommonFunction.LHDialogUtils.LoadingDialogShow({
                title: _LHCommonFunction.LHCommonLocalizableString['common_tips_setting']
              });

              _LHDeviceConfig.LHDeviceConfig.setDeviceTipLight(isOn).then(function () {
                _LHCommonFunction.LHDialogUtils.LoadingDialogHide();
              }).catch(function (err) {
                _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

                _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString['common_tips_setting_failed']);

                _this4.setState({
                  indicateLight: !isOn
                });

                console.log(err);
              });
            }
          }, {
            title: _LHLocalizableString2.default['lumi_plug_setting_cutOff'],
            description: _LHLocalizableString2.default['lumi_plug_setting_cutOff_tps'],
            hideRightArrow: true,
            hasSwitch: true,
            switchValue: powerOffMemory,
            onSwitchChange: function onSwitchChange(isOn) {
              _this4.setState({
                powerOffMemory: isOn
              });

              _LHCommonFunction.LHDialogUtils.LoadingDialogShow({
                title: _LHCommonFunction.LHCommonLocalizableString['common_tips_setting']
              });

              _LHDeviceConfig.LHDeviceConfig.setDeviceIsMemoryOn(isOn).then(function () {
                _LHCommonFunction.LHDialogUtils.LoadingDialogHide();
              }).catch(function (err) {
                _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

                _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString['common_tips_setting_failed']);

                _this4.setState({
                  powerOffMemory: !isOn
                });

                console.log(err);
              });
            }
          }, {
            title: _LHLocalizableString2.default['lumi_plug_setting_replaceIcon'],
            press: function press() {
              var navigation = _this4.props.navigation;
              navigation.navigate('LHReplaceIconPage');
            }
          }, {
            title: _LHCommonFunction.LHCommonLocalizableString.common_log_title,
            press: function press() {
              var navigation = _this4.props.navigation;
              navigation.navigate('LHLogPage');
            }
          }, _LHCommonFunction.LHSettingItem.getSettingItem('plugIn', {
            rightDescription: _PluginConfig2.default.PluginVersion
          })]
        }];
        var conmonSettings = {
          title: _LHCommonFunction.LHCommonLocalizableString['common_setting_general_setting'],
          data: [_LHCommonFunction.LHSettingItem.getSettingItem('deviceName', {
            rightDescription: deviceName
          }), _LHCommonFunction.LHSettingItem.roomManagementItem, _LHCommonFunction.LHSettingItem.shareDeviceItem, _LHCommonFunction.LHSettingItem.firmwareUpgrateItem, _LHCommonFunction.LHSettingItem.getSettingItem('moreSetting', {
            press: function press() {
              var navigation = _this4.props.navigation;
              navigation.navigate('LHMoreSettingPage');
            }
          }), _LHCommonFunction.LHSettingItem.addToDesktopItem, _LHCommonFunction.LHSettingItem.getSettingItem('privacyLicense', {
            press: function press() {
              SettingPage.openPrivacyLicense();
            }
          })]
        };

        for (var i = 0; i < conmonSettings.data.length; i += 1) {
          if (!conmonSettings.data[i]) {
            conmonSettings.data.splice(i, 1);
            i -= 1;
          }
        }

        items.push(conmonSettings);
        items.push({
          title: 'type:bottomButton',
          data: [_LHCommonFunction.LHSettingItem.deleteDeviceItem]
        });
        return items;
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        var pageData = this.getPageData();
        var _state2 = this.state,
            showPicker = _state2.showPicker,
            maxPower = _state2.maxPower;
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: _LHCommonStyle2.default.pageGrayStyle,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 244
            }
          },
          _react2.default.createElement(_LHCommonUI.LHStandardList, {
            contentContainerStyle: {
              paddingBottom: _LHCommonFunction.LHDeviceUtils.AppHomeIndicatorHeight + 30
            },
            data: pageData,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 245
            }
          }),
          _react2.default.createElement(_LHCommonUI.LHNumberModalPicker, {
            title: _LHLocalizableString2.default['lumi_plug_setting_maxPower'],
            show: showPicker || false,
            maxValue: 2500,
            minValue: 100,
            step: 100,
            defaultValue: maxPower || 2500,
            unit: "W",
            okTextStyle: {
              color: '#00BE7E'
            },
            onSelected: function onSelected(data) {
              _LHCommonFunction.LHDialogUtils.LoadingDialogShow({
                title: _LHCommonFunction.LHCommonLocalizableString['common_tips_setting']
              });

              _LHDeviceConfig.LHDeviceConfig.setDeviceMaxPower(data.newValue).then(function (res) {
                _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

                babelHelpers.extends(plugSetting, res);

                _this5.setState({
                  maxPower: plugSetting.maxPower
                });
              }).catch(function (err) {
                _LHCommonFunction.LHDialogUtils.LoadingDialogHide();

                _LHCommonFunction.LHToastUtils.showShortToast(_LHCommonFunction.LHCommonLocalizableString['common_tips_setting_failed']);

                console.log(err);
              });
            },
            onClose: function onClose() {
              _this5.setState({
                showPicker: false
              });
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 249
            }
          })
        );
      }
    }]);
    return SettingPage;
  }(_react2.default.Component);

  SettingPage.navigationOptions = function (_ref) {
    var navigation = _ref.navigation;
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 32
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: _LHCommonFunction.LHCommonLocalizableString['common_setting_title'],
          style: [_LHCommonStyle2.default.navigatorWithBorderBotoom],
          onPressLeft: function onPressLeft() {
            navigation.goBack();
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 33
          }
        })
      )
    };
  };

  SettingPage.openPrivacyLicense = function () {
    var policyLicenseUrl = _LHPolicyLicenseUtils2.default.GexPolicyLicenseUrl();

    _miot.Host.ui.privacyAndProtocolReview(_LHCommonFunction.LHCommonLocalizableString['common_setting_user_agreement'], policyLicenseUrl.licenseUrl, _LHCommonFunction.LHCommonLocalizableString['common_setting_privacy_policy'], policyLicenseUrl.policyUrl);
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(SettingPage);
},139,[150,148,147,3,75,135,137,129,134,140],"projects/com.lumi.plug/Main/Page/SettingPage/LHSettingPage.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var PluginConfig = function PluginConfig() {
    babelHelpers.classCallCheck(this, PluginConfig);
  };

  PluginConfig.PluginVersion = '0.1.0';
  exports.default = PluginConfig;
},140,[],"projects/com.lumi.plug/Main/PluginConfig/index.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/Page/ReplaceIconPage/LHReplaceIconPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[3], "LHCommonUI");

  var _reactRedux = _require(_dependencyMap[4], "react-redux");

  var _redux = _require(_dependencyMap[5], "redux");

  var _LHLocalizableString = _require(_dependencyMap[6], "../../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var _LHCommonStyle = _require(_dependencyMap[7], "../../Styles/LHCommonStyle");

  var _LHCommonStyle2 = babelHelpers.interopRequireDefault(_LHCommonStyle);

  var _LHReplaceIconPageData = _require(_dependencyMap[8], "./LHReplaceIconPageData");

  var _LHReplaceIconPageStyle = _require(_dependencyMap[9], "../../Styles/Page/LHReplaceIconPageStyle");

  var _LHReplaceIconPageStyle2 = babelHelpers.interopRequireDefault(_LHReplaceIconPageStyle);

  var _PlugIconType = _require(_dependencyMap[10], "../../Redux/Actions/PlugIconType");

  var _PlugIconType2 = babelHelpers.interopRequireDefault(_PlugIconType);

  var formatData = function formatData(data, numColums) {
    var numberOfFullRows = Math.floor(data.length / numColums);
    var numberOfElementsLastRow = data.length - numberOfFullRows * numColums;

    while (numberOfElementsLastRow !== numColums && numberOfElementsLastRow !== 0) {
      data.push(_LHReplaceIconPageData.LHReplaceIconPageData.blankData);
      numberOfElementsLastRow += 1;
    }

    return data;
  };

  var Instance = void 0;

  var LHReplaceIconPage = function (_React$Component) {
    babelHelpers.inherits(LHReplaceIconPage, _React$Component);

    function LHReplaceIconPage() {
      babelHelpers.classCallCheck(this, LHReplaceIconPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHReplaceIconPage.__proto__ || Object.getPrototypeOf(LHReplaceIconPage)).call(this));

      _this.renderItem = function (_ref) {
        var item = _ref.item,
            index = _ref.index;

        if (item.image === null && item.title === null) {
          return _react2.default.createElement(_reactNative.View, {
            style: [_LHReplaceIconPageStyle2.default.itemShape, _LHReplaceIconPageStyle2.default.itemInvisible],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 89
            }
          });
        }

        var selectedItem = _this.state.selectedItem;
        var ReplaceIconReducers = _this.props.ReplaceIconReducers;
        var plugIconItem = ReplaceIconReducers.plugIconItem;
        if (!selectedItem) selectedItem = plugIconItem;
        var isItemSelected = selectedItem && item.id === selectedItem.id;
        return _react2.default.createElement(
          _reactNative.TouchableOpacity,
          {
            style: [_LHReplaceIconPageStyle2.default.itemShape, _LHReplaceIconPageStyle2.default.cellView, isItemSelected ? _LHReplaceIconPageStyle2.default.selectedCellView : null],
            onPress: function onPress() {
              _this.onCellPress(item, index);
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 98
            }
          },
          _react2.default.createElement(_reactNative.Image, {
            style: [_LHReplaceIconPageStyle2.default.cellImage, isItemSelected ? _LHReplaceIconPageStyle2.default.selectedCellImage : null],
            source: item.image,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 104
            }
          }),
          _react2.default.createElement(
            _reactNative.Text,
            {
              style: [_LHReplaceIconPageStyle2.default.cellTitle, isItemSelected ? _LHReplaceIconPageStyle2.default.selectedCellTitle : null],
              __source: {
                fileName: _jsxFileName,
                lineNumber: 108
              }
            },
            item.title
          )
        );
      };

      Instance = _this;
      _this.state = {
        dataSource: _LHReplaceIconPageData.IconDataSource,
        selectedItem: null
      };
      return _this;
    }

    babelHelpers.createClass(LHReplaceIconPage, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        this.getStoragedCurrentItem();
      }
    }, {
      key: "onCellPress",
      value: function onCellPress(item, index) {
        console.log(item.title, index);
        this.setState({
          selectedItem: item
        });
      }
    }, {
      key: "onDone",
      value: function onDone() {
        var selectedItem = this.state.selectedItem;
        var SetIconTypeItem = this.props.SetIconTypeItem;
        SetIconTypeItem(selectedItem);
        var navigation = this.props.navigation;
        navigation.goBack();
      }
    }, {
      key: "getStoragedCurrentItem",
      value: function getStoragedCurrentItem() {
        var GetIconTypeItem = this.props.GetIconTypeItem;
        GetIconTypeItem();
      }
    }, {
      key: "render",
      value: function render() {
        var dataSource = this.state.dataSource;
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: [_LHCommonStyle2.default.pageWhiteStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 116
            }
          },
          _react2.default.createElement(_reactNative.FlatList, {
            style: _LHReplaceIconPageStyle2.default.MainContainer,
            contentContainerStyle: {
              paddingBottom: 100
            },
            data: formatData(dataSource, 3),
            renderItem: this.renderItem,
            numColumns: 3,
            extraData: this.state,
            keyExtractor: function keyExtractor(_, index) {
              return index.toString();
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 117
            }
          })
        );
      }
    }]);
    return LHReplaceIconPage;
  }(_react2.default.Component);

  LHReplaceIconPage.navigationOptions = function (_ref2) {
    var navigation = _ref2.navigation;
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 34
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: _LHLocalizableString2.default['lumi_plug_setting_replaceIcon'],
          style: [_LHCommonStyle2.default.navigatorWithBorderBotoom],
          leftButtons: [{
            source: _LHCommonUI.LHCommonIcon.navigation.cancel.normal,
            style: _LHReplaceIconPageStyle2.default.navigateButton,
            press: function press() {
              navigation.goBack();
            }
          }],
          rightButtons: [{
            source: _LHCommonUI.LHCommonIcon.navigation.confirm.normal,
            style: _LHReplaceIconPageStyle2.default.navigateButton,
            press: function press() {
              Instance.onDone();
            }
          }],
          __source: {
            fileName: _jsxFileName,
            lineNumber: 35
          }
        })
      )
    };
  };

  exports.default = (0, _reactRedux.connect)(function (state) {
    return {
      ReplaceIconReducers: state.ReplaceIconReducers
    };
  }, function (dispatch) {
    return (0, _redux.bindActionCreators)(_PlugIconType2.default, dispatch);
  })((0, _LHCommonFunction.LHPureRenderDecorator)(LHReplaceIconPage));
},141,[150,148,3,75,40,64,129,135,128,142,138],"projects/com.lumi.plug/Main/Page/ReplaceIconPage/LHReplaceIconPage.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _reactNative = _require(_dependencyMap[0], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var styles = _reactNative.StyleSheet.create({
    MainContainer: {
      flex: 1,
      padding: 10.5,
      backgroundColor: _LHCommonFunction.LHUiUtils.MiJiaBackgroundGray
    },
    itemShape: {
      margin: 6.5,
      aspectRatio: 1.0
    },
    itemInvisible: {
      flex: 1,
      backgroundColor: 'transparent'
    },
    cellTitle: {
      marginTop: 14,
      width: '100%',
      textAlign: 'center',
      color: '#000'
    },
    selectedCellTitle: {
      color: '#fff'
    },
    cellImage: {
      height: 40,
      width: 40
    },
    selectedCellImage: {
      tintColor: '#fff'
    },
    cellView: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      borderRadius: 4
    },
    selectedCellView: {
      backgroundColor: '#878DFF'
    },
    navigateButton: {
      height: 28,
      width: 28
    }
  });

  exports.default = styles;
},142,[148,3],"projects/com.lumi.plug/Main/Styles/Page/LHReplaceIconPageStyle.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/Page/PowerPage/LHPowerPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var _reactNative = _require(_dependencyMap[2], "react-native");

  var _LHCommonUI = _require(_dependencyMap[3], "LHCommonUI");

  var _LHCurve = _require(_dependencyMap[4], "LHCommonUI/LHCurve/LHCurve");

  var _LHCurve2 = babelHelpers.interopRequireDefault(_LHCurve);

  var _LHLocalizableString = _require(_dependencyMap[5], "../../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var _LHCommonStyle = _require(_dependencyMap[6], "../../Styles/LHCommonStyle");

  var _LHCommonStyle2 = babelHelpers.interopRequireDefault(_LHCommonStyle);

  var LHPowerPage = function (_React$Component) {
    babelHelpers.inherits(LHPowerPage, _React$Component);

    function LHPowerPage(props) {
      babelHelpers.classCallCheck(this, LHPowerPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHPowerPage.__proto__ || Object.getPrototypeOf(LHPowerPage)).call(this, props));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHPowerPage, [{
      key: "componentDidMount",
      value: function componentDidMount() {}
    }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: [_LHCommonStyle2.default.pageWhiteStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 38
            }
          },
          _react2.default.createElement(_LHCurve2.default, {
            type: "power",
            __source: {
              fileName: _jsxFileName,
              lineNumber: 39
            }
          })
        );
      }
    }]);
    return LHPowerPage;
  }(_react2.default.Component);

  LHPowerPage.navigationOptions = function (_ref) {
    var navigation = _ref.navigation;
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 13
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: _LHLocalizableString2.default.lumi_plug_power_history,
          style: [_LHCommonStyle2.default.navigatorWithBorderBotoom],
          onPressLeft: function onPressLeft() {
            navigation.goBack();
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 14
          }
        })
      )
    };
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHPowerPage);
},143,[150,3,148,75,144,129,135],"projects/com.lumi.plug/Main/Page/PowerPage/LHPowerPage.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/LHCurve/LHCurve.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var LHCurve = function (_React$Component) {
    babelHelpers.inherits(LHCurve, _React$Component);

    function LHCurve(props, context) {
      babelHelpers.classCallCheck(this, LHCurve);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHCurve.__proto__ || Object.getPrototypeOf(LHCurve)).call(this, props, context));

      _this.tranlateStrToNum = function (numStrValue) {
        if (numStrValue) {
          var newStrValue = JSON.parse(numStrValue);

          if (newStrValue.length) {
            var numStr = newStrValue[0];
            return Number(numStr.toFixed(2));
          }
        }

        return 0;
      };

      _this.tranlateResValue = function (res) {
        if (!res.length) return [];
        var temp = [];

        for (var i = 0; i < res.length; i += 1) {
          var resItem = res[i];
          temp.push({
            time: resItem.time,
            value: _this.tranlateStrToNum(resItem.value)
          });
        }

        console.log('tranlateResValue', temp);
        return temp;
      };

      _this.fetchPowerDatas = function (data, params) {
        _LHCommonFunction.LHElectricityDataManager.fetchPowerData(params).then(function (res) {
          console.log('fetchPowerDatas', JSON.stringify(_this.tranlateResValue(res)));

          _this.webview.postMessage(JSON.stringify({
            onSuccess: data.onSuccess,
            data: _this.tranlateResValue(res)
          }));
        }).catch(function (err) {
          _this.webview.postMessage(JSON.stringify({
            onFailed: data.onFailed
          }));

          console.log(err);
        });
      };

      _this.fetchBatteryDatas = function (data, params) {
        _LHCommonFunction.LHElectricityDataManager.fetchElectricityData(params).then(function (res) {
          console.log('fetchBatteryDatas', JSON.stringify(res || []));

          _this.webview.postMessage(JSON.stringify({
            onSuccess: data.onSuccess,
            data: _this.tranlateResValue(res)
          }));
        }).catch(function (err) {
          _this.webview.postMessage(JSON.stringify({
            onFailed: data.onFailed
          }));

          console.log(err);
        });
      };

      _this.fetchHtDatas = function (data, params) {
        _LHCommonFunction.LHElectricityDataManager.FetchHtData(params).then(function (res) {
          console.log('fetchHtDatas', JSON.stringify(res || []));

          _this.webview.postMessage(JSON.stringify({
            onSuccess: data.onSuccess,
            data: res || []
          }));
        }).catch(function (err) {
          _this.webview.postMessage(JSON.stringify({
            onFailed: data.onFailed
          }));

          console.log(err);
        });
      };

      _this.fetchPressureDatas = function (data, params) {
        _LHCommonFunction.LHElectricityDataManager.fetchPressureDatas(params).then(function (res) {
          console.log('fetchPressureDatas', JSON.stringify(res || []));

          _this.webview.postMessage(JSON.stringify({
            onSuccess: data.onSuccess,
            data: res || []
          }));
        }).catch(function (err) {
          _this.webview.postMessage(JSON.stringify({
            onFailed: data.onFailed
          }));

          console.log(err);
        });
      };

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHCurve, [{
      key: "componentWillMount",
      value: function componentWillMount() {}
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {}
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {}
    }, {
      key: "fetchPowerData",
      value: function fetchPowerData(data) {
        var type = this.props.type;
        var params = {
          start_date: _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd', data.startTime),
          end_date: _LHCommonFunction.LHDateUtils.DateFormat('yyyy/MM/dd', Math.ceil(data.endTime / (24 * 60 * 60)) * 24 * 60 * 60),
          data_type: data.data_type
        };
        console.log('fetchPowerData', params, data.startTime, Math.ceil(data.endTime / (24 * 60 * 60)) * 24 * 60 * 60);

        if (type === 'power') {
          this.fetchPowerDatas(data, params);
        } else if (type === 'electricity') {
          this.fetchBatteryDatas(data, params);
        } else {
          params.time_start = data.startTime;
          params.time_end = data.endTime;

          if (type === 'ht') {
            this.fetchHtDatas(data, params);
          } else if (type === 'pressure') {
            this.fetchPressureDatas(data, params);
          }
        }
      }
    }, {
      key: "webViewMessage",
      value: function webViewMessage(e) {
        console.log(e.nativeEvent.data);
        this.fetchPowerData(JSON.parse(e.nativeEvent.data));
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _props = this.props,
            type = _props.type,
            dateActive = _props.dateActive;
        var dateConfig = LHCurve.getDateConfig(type);
        console.log(dateConfig);
        var chartType = LHCurve.getChartType(type);
        var injectedJavaScript = 'document.querySelector("html").setAttribute("curve-type", "' + chartType + '");' + 'document.querySelector("html").setAttribute("date-active", "' + (dateActive || 0) + '");' + 'document.querySelector("html").setAttribute("date-config", "' + dateConfig + '");' + 'document.querySelector("html").setAttribute("html-font-size", "' + _LHCommonFunction.LHUiUtils.GetPx(50) + '");' + 'document.querySelector("html").setAttribute("curve-name", "' + type + '");' + 'document.querySelector("html").setAttribute("no-data-text", "' + _LHCommonFunction.LHCommonLocalizableString.common_log_no_data + '");' + 'document.querySelector("html").setAttribute("loading-text", "' + _LHCommonFunction.LHCommonLocalizableString.common_log_loading + '");' + 'document.querySelector("html").setAttribute("loading-failed", "' + _LHCommonFunction.LHCommonLocalizableString.common_tips_loading_failed_retry + '");' + 'document.querySelector("html").classList.add("' + type + '");' + 'document.documentElement.style.fontSize= "' + _LHCommonFunction.LHUiUtils.GetPx(50) + 'px";';
        return _react2.default.createElement(_reactNative.WebView, {
          ref: function ref(webview) {
            _this2.webview = webview;
          },
          onMessage: function onMessage(e) {
            _this2.webViewMessage(e);
          },
          javaScriptEnabled: true,
          bounces: false,
          scrollEnabled: false,
          source: _require(_dependencyMap[3], './index.html'),
          style: {
            flex: 1
          },
          injectedJavaScript: injectedJavaScript,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 190
          }
        });
      }
    }]);
    return LHCurve;
  }(_react2.default.Component);

  LHCurve.getDateConfig = function (type) {
    var dayItem = _LHCommonFunction.LHCommonLocalizableString.common_date_day + '_' + 0;
    var weektem = _LHCommonFunction.LHCommonLocalizableString.common_date_week + '_' + 1;
    var monyhItem = _LHCommonFunction.LHCommonLocalizableString.common_date_month + '_' + 2;
    var dateList = [dayItem, weektem, monyhItem];

    if (type === 'power') {
      dateList = [dayItem, weektem];
    } else if (type === 'electricity') {
      dateList = [dayItem, monyhItem];
    }

    return dateList.join(',');
  };

  LHCurve.getChartType = function (type) {
    var allType = {
      electricity: 'bar',
      power: 'line',
      ht: 'line',
      pressure: 'line'
    };
    return allType[type] || 'line';
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHCurve);
},144,[150,148,3,179],"projects/com.lumi.plug/Modules/Mijia-CommonUI-Modules/LHCurve/LHCurve.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/Page/BatteryPage/LHBatteryPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _LHCommonFunction = _require(_dependencyMap[1], "LHCommonFunction");

  var _reactNative = _require(_dependencyMap[2], "react-native");

  var _LHCommonUI = _require(_dependencyMap[3], "LHCommonUI");

  var _LHCurve = _require(_dependencyMap[4], "LHCommonUI/LHCurve/LHCurve");

  var _LHCurve2 = babelHelpers.interopRequireDefault(_LHCurve);

  var _LHLocalizableString = _require(_dependencyMap[5], "../../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var _LHCommonStyle = _require(_dependencyMap[6], "../../Styles/LHCommonStyle");

  var _LHCommonStyle2 = babelHelpers.interopRequireDefault(_LHCommonStyle);

  var LHBatteryPage = function (_React$Component) {
    babelHelpers.inherits(LHBatteryPage, _React$Component);

    function LHBatteryPage(props) {
      babelHelpers.classCallCheck(this, LHBatteryPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHBatteryPage.__proto__ || Object.getPrototypeOf(LHBatteryPage)).call(this, props));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHBatteryPage, [{
      key: "componentDidMount",
      value: function componentDidMount() {}
    }, {
      key: "render",
      value: function render() {
        var navigation = this.props.navigation;
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: [_LHCommonStyle2.default.pageWhiteStyle],
            __source: {
              fileName: _jsxFileName,
              lineNumber: 38
            }
          },
          _react2.default.createElement(_LHCurve2.default, {
            type: "electricity",
            dateActive: navigation.getParam('dateActive'),
            __source: {
              fileName: _jsxFileName,
              lineNumber: 39
            }
          })
        );
      }
    }]);
    return LHBatteryPage;
  }(_react2.default.Component);

  LHBatteryPage.navigationOptions = function (_ref) {
    var navigation = _ref.navigation;
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 13
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: _LHLocalizableString2.default.lumi_plug_electricity,
          style: [_LHCommonStyle2.default.navigatorWithBorderBotoom],
          onPressLeft: function onPressLeft() {
            navigation.goBack();
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 14
          }
        })
      )
    };
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHBatteryPage);
},145,[150,3,148,75,144,129,135],"projects/com.lumi.plug/Main/Page/BatteryPage/LHBatteryPage.js");
__d(function (global, _require, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _jsxFileName = "/Users/qinliduan/miot-plugin-sdk-plug/projects/com.lumi.plug/Main/Page/LogPage/LHLogPage.js";

  var _react = _require(_dependencyMap[0], "react");

  var _react2 = babelHelpers.interopRequireDefault(_react);

  var _reactNative = _require(_dependencyMap[1], "react-native");

  var _LHCommonFunction = _require(_dependencyMap[2], "LHCommonFunction");

  var _LHCommonUI = _require(_dependencyMap[3], "LHCommonUI");

  var _LHCommonStyle = _require(_dependencyMap[4], "../../Styles/LHCommonStyle");

  var _LHCommonStyle2 = babelHelpers.interopRequireDefault(_LHCommonStyle);

  var _LHLocalizableString = _require(_dependencyMap[5], "../../Localized/LHLocalizableString");

  var _LHLocalizableString2 = babelHelpers.interopRequireDefault(_LHLocalizableString);

  var _LHDeviceConfig = _require(_dependencyMap[6], "../../LHDeviceConfig");

  var LHLogPage = function (_React$Component) {
    babelHelpers.inherits(LHLogPage, _React$Component);
    babelHelpers.createClass(LHLogPage, null, [{
      key: "getLogContent",
      value: function getLogContent(data) {
        var value = data.value && JSON.parse(data.value)[0];

        var _JSON$parse = JSON.parse(value),
            _JSON$parse2 = babelHelpers.slicedToArray(_JSON$parse, 2),
            _JSON$parse2$ = babelHelpers.slicedToArray(_JSON$parse2[1], 2),
            key = _JSON$parse2$[0],
            _JSON$parse2$$ = babelHelpers.slicedToArray(_JSON$parse2$[1], 1),
            val = _JSON$parse2$$[0];

        if (key === _LHDeviceConfig.LHDeviceConfig.propPrefix(_LHDeviceConfig.LHDeviceConfig.prop.onoff)) {
          return {
            context: val === 'on' ? _LHLocalizableString2.default.lumi_plug_on : _LHLocalizableString2.default.lumi_plug_off,
            logType: 'normal'
          };
        }

        if (key === _LHDeviceConfig.LHDeviceConfig.eventPrefix(_LHDeviceConfig.LHDeviceConfig.event.plugDetection)) {
          return {
            context: val === 'plug_in' ? _LHLocalizableString2.default.lumi_plug_plug_plugin : _LHLocalizableString2.default.lumi_plug_main_elec_removed,
            logType: val === 'plug_in' ? 'normal' : 'error'
          };
        }

        return {};
      }
    }]);

    function LHLogPage(props, context) {
      babelHelpers.classCallCheck(this, LHLogPage);

      var _this = babelHelpers.possibleConstructorReturn(this, (LHLogPage.__proto__ || Object.getPrototypeOf(LHLogPage)).call(this, props, context));

      _this.state = {};
      return _this;
    }

    babelHelpers.createClass(LHLogPage, [{
      key: "componentWillMount",
      value: function componentWillMount() {}
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {}
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {}
    }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement(
          _reactNative.View,
          {
            style: _LHCommonStyle2.default.pageGrayStyle,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 65
            }
          },
          _react2.default.createElement(_LHCommonUI.LHStandardLog, {
            extraParam: {
              key: 'device_log',
              type: 'prop',
              limit: 50
            },
            dataMap: function dataMap(data) {
              return LHLogPage.getLogContent(data);
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 66
            }
          })
        );
      }
    }]);
    return LHLogPage;
  }(_react2.default.Component);

  LHLogPage.navigationOptions = function (_ref) {
    var navigation = _ref.navigation;
    return {
      header: _react2.default.createElement(
        _reactNative.View,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 20
          }
        },
        _react2.default.createElement(_LHCommonUI.LHTitleBarCustom, {
          title: _LHCommonFunction.LHCommonLocalizableString.common_log_title,
          style: _LHCommonStyle2.default.navigatorWithBorderBotoom,
          onPressLeft: function onPressLeft() {
            navigation.goBack();
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 21
          }
        })
      )
    };
  };

  exports.default = (0, _LHCommonFunction.LHPureRenderDecorator)(LHLogPage);
},146,[150,148,3,75,135,129,134],"projects/com.lumi.plug/Main/Page/LogPage/LHLogPage.js");
require(2);