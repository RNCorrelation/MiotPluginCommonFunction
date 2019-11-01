

const fse = require('fs-extra');
const xlsx = require('node-xlsx');
const { argv } = require('yargs');

if (!argv.file) throw new Error('请指定xlsx文件，形如：node xlsx2js.js --file xlsx文件');
const sheets = xlsx.parse(argv.file); // 待解决问题：excel修改后读取失败问题
let output = argv.output || './output/';
if (output[output.length - 1] !== '/') {
  output += '/';
}

function getStringLength(str) {
  if (!str) return 0;
  let length = 0;
  for (let i = 0, len = str.length; i < len; i += 1) {
    const c = str.charAt(i);
    if (/^[\u0000-\u00ff]$/.test(c)) {
      length += 1;
    } else {
      length += 2;
    }
  }
  return length;
}

function getLongestString(data) {
  let strLength = 0;
  let result = '';
  for (let i = 1, len = data.length; i < len; i += 1) {
    const strL = getStringLength(data[i]);
    if (strLength < strL) {
      result = data[i];
      strLength = strL;
    }
  }
  return result;
}

// 删除原有的
if (fse.existsSync(output)) fse.emptyDirSync(output);

sheets.forEach((sheet, index) => {
  if (sheet) {
    // excel无法用对比工具对比差异，转成js用作对比
    fse.outputFile(output + 'forCompare_' + index + '.js', '/*eslint-disable*/\nmodule.exports = ' + JSON.stringify(sheet, null, 2).replace('\\\\', '\\'), (err) => {
      console.log(err);
    });
  }
  const { data } = sheet;
  const result = {
    language_longest: {
      key: 'longest',
      data: {}
    }
  };
  for (let i = 0, len = data.length; i < len; i += 1) {
    const rowData = data[i];
    if (i === 0) { // keyName处理
      if (rowData[0] === 'keyName') {
        for (let j = 1; j < rowData.length; j += 1) {
          result[j] = {
            key: rowData[j],
            data: {}
          };
        }
      } else {
        for (let j = 1; j < rowData.length; j += 1) {
          const keyValue = {};
          keyValue[rowData[0]] = typeof rowData[j] === 'undefined' ? '' : rowData[j];
          result[j] = {
            key: 'language_' + j,
            data: keyValue
          };
        }
      }
    } else {
      for (let j = 1; j < rowData.length; j += 1) {
        // 检测重复键值抛出错误
        if (typeof result[j].data[rowData[0]] !== 'undefined') throw new Error('检测到重复键值：' + rowData[0]);
        result[j].data[rowData[0]] = typeof rowData[j] === 'undefined' ? '' : rowData[j];
      }
    }
    // 获取最长的文案
    result.language_longest.data[rowData[0]] = getLongestString(rowData);
  }

  for (const i in result) {
    const data = JSON.stringify(result[i].data, null, 2);
    fse.outputFile(output + result[i].key + '.js', '/*eslint-disable*/\nconst ' + result[i].key.split('-').join('') + ' = ' + data.replace('\\\\', '\\') + ';\nexport { ' + result[i].key.split('-').join('') + ' as default };', (err) => {
      console.log(err);
    });
  }
});