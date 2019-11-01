'use strict'
const xlsx = require('node-xlsx');
var fs = require('fs');
const argv = require('yargs').argv;
if (!argv.file) throw new Error('请指定js文件，形如：node js2xlsx.js --file js文件;该文件导出的数据遵循node语法');
const data = require(argv.file);
var buffer = xlsx.build([{name: "Translation", data: dealEscape(data.data)}]);
fs.writeFileSync(argv.output || './Translation.xlsx', buffer, {'encoding':'utf8'});

function dealEscape(data) {
	// for (let i = 0, len = data.length; i < len; i += 1) {
	// 	for (let j = 0, len1 = data[i].length; j < len1; j += 1) {
	// 		console.log(data[i][j])
	// 		data[i][j] = data[i][j].replace('\\', '\\\\');
	// 	}
	// }

	return JSON.parse(JSON.stringify(data));
}