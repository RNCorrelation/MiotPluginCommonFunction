# 语言包管理工具

## 安装依赖
在项目跟目录依次执行：

- npm install yargs -save-dev

- npm install fs-extra -save-dev

- npm install node-xlsx -save-dev

## 一、xlsx2js 将xlsx文件转换成语言包

### 命令 node xlsx2js.js文件路径 --file xls文件 --output 输出路径
如公共模块语言包（网关项目）： node ./Tool/xlsx2js.js --file /Users/qinliduan/miot-plugin-sdk-hub/projects/Mijia-Hub-Plugin/Modules/Mijia-CommonFunction-Modules/Config/Localized/xlsx/LHCommonLanguage.xlsx --output /Users/qinliduan/miot-plugin-sdk-hub/projects/Mijia-Hub-Plugin/Modules/Mijia-CommonFunction-Modules/Config/Localized/Language 

### 说明

- xlsx文件第一列为键值；若第一行第一列为keyName，则以该行对应的值为文件名生成的语言包文件，且作为里面导出的变量名（若遇到带中划线的值，导出的变量名为去掉中划线），如zh-Hans，导出文件名zh-Hans.js,导出的变量为zhHans

- <p style="color: red;">forCompare_*.js文件是xlsx内容，主要用于对比差异，导回xlsx文件，可用于冲突解决，因为excel文件不好对比差异和解决冲突</p>

## 二、js2xlsx js文件转换成xlsx（js文件要遵循node语法）

### 命令 node js2xlsx.js文件路径 --file js文件 --output 输出文件（路径+文件名.xlsx）
如公共模块语言包（网关项目）：node ./Tool/js2xlsx.js --file /Users/qinliduan/miot-plugin-sdk-hub/projects/Mijia-Hub-Plugin/Modules/Mijia-CommonFunction-Modules/Config/Localized/Language/forCompare_0.js --output /Users/qinliduan/miot-plugin-sdk-hub/projects/Mijia-Hub-Plugin/Modules/Mijia-CommonFunction-Modules/Config/Localized/xlsx/LHCommonLanguage.xlsx

# Mijia-CommonUI-Modules 按需加载脚本
### 需要修改的内容

修改插件根目录(xxx/projects/com.lumi.xxx/package.json)下的 `package.json` ，添加以下内容：

```
"dev": "python Modules/Mijia-CommonFunction-Modules/DevTools/initPlugCommonUIConfig.py && node Modules/Mijia-CommonFunction-Modules/DevTools/initCommonUIEntrance.js && node ../../bin/runProject.js --reset-cache",
"build": "python Modules/Mijia-CommonFunction-Modules/DevTools/initPlugCommonUIConfig.py && node Modules/Mijia-CommonFunction-Modules/DevTools/initCommonUIEntrance.js && node ../../bin/publishProject.js com.lumi.detectionSensor"
```

### 注意事项

1. 注意要将 build 命令的 com.lumi.detectionSensor 修改成对应项目包名；
2. 如果你需要在 Mijia-CommonUI-Modules 下添加新的组件，需要修改`Mijia-CommonUI-Modules/pathConfig.js ` 这个文件，否则脚本无法找到对应的组件路径。(编写规则直接查看该文件的内容，对照着写就可以了)；

### 如何使用

如果你想使用脚本，直接在插件根目录  (xxx/projects/com.lumi.xxx/) 下运行：

运行项目： npm run dev

打包项目： npm run build

## 隐私协议新规则
根据新的隐私规范,我们需要根据登陆国和语言相结合显示相应的隐私协议，为此新定义了一个api,用法如下：
1、首页：如果没有按照此规范，则会抛出异常（LHAuthorizationUtils: params policy resource is undefine!）
this.authorizationCancelListener = LHAuthorizationUtils.Authorization({
      licenseTitle: LHCommonLocalizableString.common_setting_user_agreement,
      policyResource: Resources.PolicyLicense, // Resource html文件夹下的html文件
      policyTitle: LHCommonLocalizableString.common_setting_privacy_policy,
      authorizationSucc: () => {    
      }
});
2、设置页,直接传Resources.PolicyLicense即可
<LHSetting
          navigation={navigation}
          PolicyLicenseUrl={Resources.PolicyLicense}
          settingItems={pageData}
          showShare
          hideGatewayShare={false}
          showIftt
          showFirmwareUpgrate
          showIsHomeKitDevice
          needFirmwareUpgrateDot
        />
3、其他配置：
LHPolicyLicenseUtils 插件要适配的国家列表如果在LanguageArray没有，则需要往里面添加，格式是：国家名: 官方语言名(该列表的官方语言名缩写对应了
Resource html下面的后缀缩写，如果出美国和英国外的其他官方语言是英文，则使用该国家的缩写)
const LanguageArray = {
  cn: 'zh', // 中国
};
区分英文的配置：现有七个服务器，不同的服务器对应了不同的英文，因此需要此配置 中国大陆：CN 新加坡：SG 印度：in 俄罗斯：RU 美国：us (欧洲)德国: de 韩国：kr
LHPolicyLicenseUtils SeverEn 现有的配置列表
const SeverEn = {
  cn: 'en', // 通用英文版
  sg: 'us_en', // 美国版
  ru: 'us_en', // 美国版
  us: 'us_en', // 美国版
  de: 'eu_en' // 欧洲GDPR版
};
