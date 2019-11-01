var fs = require("fs")
const path = require('path');
const packageJsonPath = path.resolve(__dirname, '../../../package.json');
const projectJsonPath = path.resolve(__dirname, '../../../project.json');
class InitPackage {
  static init() {
    fs.exists(packageJsonPath, (isExists) => {
      const defaultPackage = getDefaultPackage();
      defaultPackage.name = getProjectName()
      if (isExists) { // 当前工程下有package.json
          fs.readFile(packageJsonPath, 'utf8', (error, res) => {
            const data = JSON.parse(res);
            data.name = defaultPackage.name;
            data.devDependencies = Object.assign(data.devDependencies, defaultPackage.devDependencies);
            data.devDependencies = Object.assign(data.devDependencies, defaultPackage.devDependencies);
            data.scripts = Object.assign(data.scripts, defaultPackage.scripts);
            data['pre-commit'] = Object.assign(data['pre-commit'] || [], defaultPackage['pre-commit']);
            data.dependencies = Object.assign(data.dependencies, defaultPackage.dependencies);
            // 当前工程下PluginConfig目录下没有index.js和package.json
            if (!fs.existsSync(path.resolve(__dirname, '../../../Main/PluginConfig/index.js')) && !fs.existsSync(path.resolve(__dirname, '../../../Main/PluginConfig/packgae.json'))) delete data.dependencies.PluginConfig;
            // 当前工程下Resources目录下没有index.js和package.json
            if (!fs.existsSync(path.resolve(__dirname, '../../../Resources/index.js')) && !fs.existsSync(path.resolve(__dirname, '../../../Resources/packgae.json'))) delete data.dependencies.Resources;
            fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2));
          })
      } else { // 当前工程下未找到package.json，用默认的生成
        fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackage, null, 2));
      }
    })

    // 初始化project.json
    fs.exists(projectJsonPath, (isExists) => {
      if (isExists) { // 当前工程下有package.json
          fs.readFile(projectJsonPath, 'utf8', (error, res) => {
            const data = JSON.parse(res);
            data.package_path = getProjectName();
            fs.writeFileSync(projectJsonPath, JSON.stringify(data, null, 2));
          })
      } else { // 当前工程下未找到package.json，用默认的生成
        fs.writeFileSync(projectJsonPath, JSON.stringify({
          "package_path": getProjectName(),
          "min_sdk_api_level": 10025,
          "version_code": 1,
          "entrance":{
            "scene":{
              "trigger_ids":[],
              "action_ids":[]
            }
          }
        }, null, 2));
      }
    })
  }
}


function getProjectName() {
  const pathSplit = path.resolve(__dirname, '../../../').split('/');
  return pathSplit[pathSplit.length - 1];
}

function  getDefaultPackage() {
  return {
    "name": "",
    "version": "1.0.0",
    "scripts": {
      "xlsx2js": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type xlsx2js",
      "js2xlsx": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type js2xlsx",
      "xlsx2jsCommon": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type xlsx2jsCommon",
      "js2xlsxCommon": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type js2xlsxCommon",
      "dev": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type dev && node ../../bin/runProject.js --reset-cache",
      "build": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type build",
      "tinypng": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type tinypng",
      "longest": "node Modules/Mijia-CommonFunction-Modules/DevTools/commanderUtils.js --type dev-longestLanguage && node ../../bin/runProject.js --reset-cache",
      "pre-lint": "node Modules/Mijia-CommonFunction-Modules/DevTools/Eslint/EslintCheck.js"
    },
    "pre-commit": [
      "pre-lint"
    ],
    "dependencies": {
      "LHCommonFunction": "file:./Modules/Mijia-CommonFunction-Modules",
      "LHCommonUI": "file:./Modules/Mijia-CommonUI-Modules",
      "PluginConfig": "file:./Main/PluginConfig",
      "Resources": "file:./Resources",
      "react-native-root-toast": "~3.0.2",
      "react-native-scrollable-tab-view": "^0.10.0",
      "react-redux": "^6.0.0",
      "redux": "^4.0.1",
      "redux-actions": "^2.6.4",
      "redux-promise": "^0.6.0"
    },
    "devDependencies": {
      "fs-extra": "^7.0.1",
      "node-xlsx": "^0.14.1",
      "tinify": "^1.6.0-beta.2",
      "tinypng": "^0.1.1",
      "yargs": "^13.2.2",
      "pre-commit": "^1.2.2"
    }
  }
}
module.exports = InitPackage;