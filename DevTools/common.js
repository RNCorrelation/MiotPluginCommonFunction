const path = require('path');
const fse = require('fs-extra');
const commonLocalizedPath = path.resolve(__dirname, '../Config/Localized');
const localizedPath = path.resolve(__dirname, '../../../Main/Localized');
const tinify = require("tinify");

class LHCommon {
  static creatLocalized(type, callback) {
    if (typeof callback !== 'function') callback = () => {};
    // 打包的时候把最长的语言筛选出来的那个文件删掉
    if (type === 'build') {
      const longestPath = path.join(localizedPath, 'Language/longest.js');
      console.log(longestPath);
      if (fse.existsSync(longestPath)) {
        fse.removeSync(longestPath);
      }
    }
    fse.exists(localizedPath).then((isExist) => {
      if (isExist) {
        fse.readdir(localizedPath + '/Language', (err, files) => {
          if (err) return;
          console.log(files)
          if (files.length === 0) {
            callback();
            return
          }
          const fileNames = LHCommon.getLanguageKey(files);
          console.log(fileNames);
          const useLongestLanguage = type === 'dev-longestLanguage' && fse.existsSync(localizedPath + '/Language/longest.js')
          LHCommon.creatLocalizableStringFile(useLongestLanguage, fileNames)
          callback();
        });
      } else {
        console.log(localizedPath + '不存在')
        callback()
      }
    });
  }

  static creatCommonLocalized(type, callback) {
    if (typeof callback !== 'function') callback = () => {};
    // 打包的时候把最长的语言筛选出来的那个文件删掉
    if (type === 'build') {
      const longestPath = path.join(commonLocalizedPath, 'Language/longest.js');
      console.log(longestPath);
      if (fse.existsSync(longestPath)) {
        fse.removeSync(longestPath);
      }
    }
    fse.exists(localizedPath).then((isExist) => {
      const useLongestLanguage = type === 'dev-longestLanguage' && fse.existsSync(commonLocalizedPath + '/Language/longest.js')
      if (isExist) {
        fse.readdir(localizedPath + '/Language', (err, files) => {
          if (err) return;
          const fileNames = LHCommon.getLanguageKey(files);
          console.log(fileNames);
          LHCommon.readCommonLocalizedDir(useLongestLanguage, fileNames, callback);
        });
      } else {
        LHCommon.readCommonLocalizedDir(useLongestLanguage, [], callback);
      }
    });
  }

  static readCommonLocalizedDir(useLongestLanguage, localizedFileNames, callback) {
    fse.exists(commonLocalizedPath).then((isExist) => {
      if (isExist) {
        fse.readdir(commonLocalizedPath + '/Language', (err, files) => {
          if (err) return;
          const fileNames = LHCommon.getLanguageKey(files);
          console.log(fileNames);
          LHCommon.creatCommonLocalizableStringFile(useLongestLanguage, localizedFileNames, fileNames);
          callback();
        });
      } else {
        throw new Error('请安装子模块');
      }
    });
  }

  static getLanguageKey(fileNames) {
    const result = [];
    for (let i = 0, len = fileNames.length; i < len; i += 1) {
      if (fileNames[i].indexOf('.js') > -1 && fileNames[i].indexOf('forCompare_') === -1) {
        const name = fileNames[i].split('.')[0];
        result.push(name);
      }
    }
    return result;
  }

  static getfileNameAndLanguageKeyDifference() {
    return {
      'zh-Hant-HK': 'zh_hk',
      'zh-Hans': 'zh',
      'zh-Hant': 'zh_tw'
    };
  }

  static creatLocalizableStringFile(useLongestLanguage, fileNames) {
    let content = '\/*eslint-disable*\/\n';
    content += 'import { LHLocalizedStrings } from \'LHCommonFunction\';\n';
    // 只映射文件名和语言键值不同的部分
    const fileNameMapLanguageKey = LHCommon.getfileNameAndLanguageKeyDifference();
    let languagePacket = '{\n';
    for (let i = 0, len = fileNames.length; i < len; i += 1) {
      const name = fileNames[i];
      const exportName = name.split('-').join('');
      content += 'import ' + exportName + ' from \'./Language/' + name + '\';\n';
      languagePacket += '  ' + [fileNameMapLanguageKey[name] || name] + ': ' + (useLongestLanguage ? 'longest' : exportName) + ',\n';
    }
    languagePacket += '}';
    content += 'const LHLocalizableString = new LHLocalizedStrings(' + languagePacket + ');\n';
    content += 'export { LHLocalizableString as default };';
    console.log(content);
    const path = localizedPath + '/LHLocalizableString.js';
    fse.outputFile(path, content, function(err) {
      console.log(err);
    })
  }

  static creatCommonLocalizableStringFile(useLongestLanguage, localizedFileNames, commonLocalizedFileNames) {
    let content = '\/*eslint-disable*\/\n';
    content += 'import LHLocalizedStrings from \'./LHLocalizedStrings\';\n';
    // 只映射文件名和语言键值不同的部分
    const fileNameMapLanguageKey = LHCommon.getfileNameAndLanguageKeyDifference();
    let languagePacket = '{\n';
    // 主工程语言包没有读取到文件
    // if (localizedFileNames.length === 0) {
    //   for (let i = 0, len = commonLocalizedFileNames.length; i < len; i += 1) {
    //     const name = commonLocalizedFileNames[i];
    //     const exportName = name.split('-').join('');
    //     content += 'import ' + exportName + ' from \'./Language/' + name + '\';\n';
    //     languagePacket += '  ' + [fileNameMapLanguageKey[name] || name] + ': ' + (useLongestLanguage ? 'longest' : exportName) + ',\n';
    //   }
    // } else {
    //   for (let i = 0, len = localizedFileNames.length; i < len; i += 1) {
    //     let name = localizedFileNames[i];
    //     let exportName = name.split('-').join('');
    //     if (commonLocalizedFileNames.indexOf(name) === -1) {
    //       exportName = 'en';
    //     } else {
    //       content += 'import ' + exportName + ' from \'./Language/' + name + '\';\n';
    //     }
    //     languagePacket += '  ' + [fileNameMapLanguageKey[name] || name] + ': ' + (useLongestLanguage ? 'longest' : exportName) + ',\n';
    //   }
    // }
    for (let i = 0, len = commonLocalizedFileNames.length; i < len; i += 1) {
      const name = commonLocalizedFileNames[i];
      const exportName = name.split('-').join('');
      content += 'import ' + exportName + ' from \'./Language/' + name + '\';\n';
      languagePacket += '  ' + [fileNameMapLanguageKey[name] || name] + ': ' + (useLongestLanguage ? 'longest' : exportName) + ',\n';
    }
    languagePacket += '}';
    content += 'const LHCommonLocalizableString = new LHLocalizedStrings(' + languagePacket + ');\n';
    content += 'export { LHCommonLocalizableString as default };';
    console.log(content);
    const path = commonLocalizedPath + '/LHCommonLocalizableString.js';
    fse.outputFile(path, content, function(err) {
      console.log(err);
    })
  }

  static creatPluginVersion(callback) {
    const pluginConfigFile = path.resolve(__dirname, '../../../Main/PluginConfig/index.js');
    if (typeof callback !== 'function') callback = () => {};
    fse.exists(pluginConfigFile).then((isExist) => {
      if (isExist) {
        fse.readFile(pluginConfigFile, 'utf8', function(err, data) {
          if (err) {
            console.log('PluginConfig文件读取失败');
            callback();
            return;
          }
          const trimData = Trim(data);
          const numberMatch = trimData.match(/\d+\.\d+\.\d+/g);
          if (numberMatch) {
            let flag = false;
            for (let i = 0, len = numberMatch.length; i < len; i += 1) {
              const curVersion = numberMatch[i];
              const pluginVersionIndex = trimData.indexOf('staticPluginVersion=');
              if (pluginVersionIndex > -1 && trimData.indexOf(curVersion) - pluginVersionIndex < 25) {
                flag = true;
                const versionArr = curVersion.split('.');
                versionArr[2] = Number(versionArr[2]) + 1;
                const version = versionArr.join('.');
                console.log('#####\n#####\n#####\n#####\n#####\n#####\n当前打包的版本：' + version)
                fse.outputFile(pluginConfigFile, data.replace(curVersion, version), function(err) {
                  callback();
                })
              }
            }
            if (!flag) callback();
          } else {
            console.log('PluginConfig文件中未匹配到版本号');
            callback();
          }
        })
      } else {
        callback();
      }
    });
  }

  static tinypng() {
    tinify.key = 'M8D0lAs0K2x1jr5ooFXrVjDJXd7GV2M7';
    function dealFolder(folder) {
      fse.readdir(folder, (err, files) => {
        if (err) return;
        for(let i = 0, len = files.length; i < len; i += 1) {
          const fileName = path.join(folder, files[i]);
          fse.stat(fileName, (err, stats) => {
            if (err) return;
            if (stats.isFile()) {
              if (fileName.indexOf('.png') > -1 || fileName.indexOf('.jpg') > -1) {
                const source = tinify.fromFile(fileName);
                source.toFile(fileName);
              }
            } else {
              dealFolder(fileName);
            }
          })
        }
      })
    }
    const resourcesPath = path.resolve(__dirname, '../../../Resources');
    dealFolder(resourcesPath);
  }

  static creatPolicyLicense(callback) {
    if (typeof callback !== 'function') callback = () => {};
    const resourcesPath = path.resolve(__dirname, '../../../Resources');
    const htmlPath = path.join(resourcesPath, 'html');
    fse.exists(htmlPath).then((isExist) => {
      if (isExist) {
        fse.readdir(htmlPath, (err, files) => {
          if (err) {
            callback();
            return
          };
          let content = '\/*eslint-disable*\/\n';
          content += 'const PolicyLicenseUrl = {\n';
          for(let i = 0, len = files.length; i < len; i += 1) {
            if (files[i].indexOf('.html') > -1) {
              const name = files[i].split('.')[0];
              const nameArr = name.split('_');
              content += nameArr[0] === 'policy' ? '  "policyUrl_' : '  "licenseUrl_';
              nameArr.shift();
              const key = nameArr.join('_');
              content += key + '": ' + 'require(\'./html/' + name + '.html\'),\n';
            }
          }
          content += '}\n';
          content += 'export { PolicyLicenseUrl };\n';
          fse.outputFile(path.join(resourcesPath, 'policyLicenseUrl.js'), content, function(err) {
            callback();
          })
        })
      } else {
        callback();
      }
    })
  }
}
function Trim(str) { 
  return str.replace(/\s*/g, '');
}
module.exports = LHCommon;