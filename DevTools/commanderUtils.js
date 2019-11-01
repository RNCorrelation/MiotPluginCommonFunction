const { exec } = require('child_process');
const fse = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const LHCommon = require('./common');
const LHinitEslintConfig = require('./initEslintConfig');
const InitPackage = require('./initPackage');
const SubModulesPreCommit = require('./Eslint/addSubModulesPreCommit');
function build() {
  // 添加 build 黑名单
  runAddBlackListCmd('build', () => {
    // 生成CommonUI index.js
    initCommonUIIndex(() => {
      // 生成通用模块语言包和项目语言包配置
      creatLocalized('build',() => {
        // 版本号加1
        LHCommon.creatPluginVersion(() => {
          // 生成隐私政策和用户协议url
          LHCommon.creatPolicyLicense(() => {
            runBuildCmd();
          })
        })
      })
    })
  })
}

function dev() {
  // 写eslint校验规则
  LHinitEslintConfig.writeEslintrc();
  // 添加运行黑名单
  runAddBlackListCmd('run', () => {
    // 生成CommonUI index.js
    initCommonUIIndex(() => {
      // 生成通用模块语言包和项目语言包配置
      creatLocalized('dev', () => {
        // 生成隐私政策和用户协议url
        LHCommon.creatPolicyLicense(() => {
        
        })
      })
    })
  })
}
// 运行使用最长语言包
function devLongestLanguage() {
  // 添加运行黑名单
  runAddBlackListCmd('run', () => {
    // 生成CommonUI index.js
    initCommonUIIndex(() => {
      // 生成通用模块语言包和项目语言包配置
      creatLocalized('dev-longestLanguage', () => {
        // 生成隐私政策和用户协议url
        LHCommon.creatPolicyLicense(() => {
        
        })
      })
    })
  })
}

function creatLocalized(type ,callback) {
  LHCommon.creatCommonLocalized(type, () => {
    LHCommon.creatLocalized(type, () => {
      callback()
    })
  })
}

function initCommonUIIndex(callback) {
  runInitPlugCommonUIConfigCmd(() => {
    runInitCommonUIEntranceCmd(() => {
      if (typeof callback === 'function') callback();
    })
  })
}

function runAddBlackListCmd(cmdType, callback) {
  if (!cmdType) {
      if (typeof callback === 'function') callback();
  }
    exec('python ' + path.resolve(__dirname, './addBlackList.py' + ' ' + cmdType), [], (err, stdout, stderr) => {
      if(err) {
          console.log(err);
          return;
      }
  });
  if (typeof callback === 'function') callback();
}

function runInitPlugCommonUIConfigCmd(callback) {
  exec('python ' + path.resolve(__dirname, './initPlugCommonUIConfig.py'), [], (err, stdout, stderr) => {
      if(err) {
          console.log(err);
          return;
      }
  });
  if (typeof callback === 'function') callback();
}

function runInitCommonUIEntranceCmd(callback) {
  exec('node ' + path.resolve(__dirname, './initCommonUIEntrance.js'), [], (err, stdout, stderr) => {
      if(err) {
          console.log(err);
          return;
      }
      if (typeof callback === 'function') callback();
  });
}

function runBuildCmd() {
  exec('node ' + path.resolve(__dirname, './buildProject/build.js'), [], (err, stdout, stderr) => {
      if(err) {
          console.log(err);
          return;
      }
  });
}

function runDevCmd(callback) {
  exec('node ' + path.resolve(__dirname, '../../../../../bin/runProject.js' + ' --reset-cache'), [], (err, stdout, stderr) => {
      if(err) {
          console.log(err);
          return;
      }
  });
}

function js2xlsxCommon() {
  exec('node ' + path.resolve(__dirname, './js2xlsx.js')
    + ' --file ' + path.resolve(__dirname, '../Config/Localized/Language/forCompare_0.js')
    + ' --output ' + path.resolve(__dirname, '../Config/Localized/xlsx/Translation_common.xlsx'), [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
  });
}

function xlsx2jsCommon(callback) {
  exec('node ' + path.resolve(__dirname, './xlsx2js.js')
    + ' --file ' + path.resolve(__dirname, '../Config/Localized/xlsx/Translation_common.xlsx')
    + ' --output ' + path.resolve(__dirname, '../Config/Localized/Language'), [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    if (typeof callback === 'function') callback();
  });
}

function js2xlsx() {
  exec('node ' + path.resolve(__dirname, './js2xlsx.js')
    + ' --file ' + path.resolve(__dirname, '../../../Main/Localized/Language/forCompare_0.js')
    + ' --output ' + path.resolve(__dirname, '../../../Main/Localized/xlsx/Translation.xlsx'), [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
  });
}

function xlsx2js(callback) {
  exec('node ' + path.resolve(__dirname, './xlsx2js.js')
    + ' --file ' + path.resolve(__dirname, '../../../Main/Localized/xlsx/Translation.xlsx')
    + ' --output ' + path.resolve(__dirname, '../../../Main/Localized/Language'), [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    if (typeof callback === 'function') callback();
  });
}


if (argv.type === 'dev') {
  InitPackage.init();
  SubModulesPreCommit.AddScript();
  dev();
} else if (argv.type === 'dev-longestLanguage') {
  xlsx2js(() => {
    xlsx2jsCommon(() => {
      devLongestLanguage();
    });
  })
} else if (argv.type === 'build') {
  build();
} else if (argv.type === 'js2xlsxCommon') {
  js2xlsxCommon();
} else if (argv.type === 'xlsx2jsCommon') {
  xlsx2jsCommon();
} else if (argv.type === 'js2xlsx') {
  js2xlsx();
} else if (argv.type === 'xlsx2js') {
  xlsx2js();
} else if (argv.type === 'tinypng') {
  LHCommon.tinypng();
}
