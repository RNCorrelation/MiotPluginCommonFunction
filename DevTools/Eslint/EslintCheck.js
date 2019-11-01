/*eslint-disable*/
const exec = require('child_process').exec;
const CLIEngine = require('eslint').CLIEngine;
const cli = new CLIEngine({});
const fs = require("fs")
const path = require('path');

function getErrorLevel(number) {
    switch (number) {
        case 2:
            return 'error';
        case 1:
            return 'warn';
        default:
    }
    return 'undefined';
}
let pass = 0;
const projectPath = path.resolve(__dirname, '../../../../');
exec('git diff HEAD --name-only| grep .js$', (error, stdout) => {
    if (stdout.length) {
        const array = stdout.split('\n')
        array.pop()
        const files = [];
        // 处理删除的文件
        for (let i = 0, len = array.length; i < len; i += 1) {
            if (fs.existsSync(path.join(projectPath, array[i]))) {
              files.push(array[i])
            }
        }
        const results = cli.executeOnFiles(files).results
        let errorCount = 0
        let warningCount = 0
        results.forEach((result) => {
            // 开发目录和语言包目录不校验
            if (result.filePath.indexOf('DevTools') > -1 || result.filePath.indexOf('/Localized/') > -1) {
              return;
            }
            errorCount += result.errorCount
            warningCount += result.warningCount
            if (result.messages.length > 0) {
                console.log('\n')
                console.log(result.filePath)
                result.messages.forEach((obj) => {
                    const level = getErrorLevel(obj.severity)
                    console.log(`   ${obj.line}:${obj.column}  ${level}  ${obj.message}  ${obj.ruleId}`)
                    pass = 1
                })
            }
        })
        if (warningCount > 0 || errorCount > 0) {
            console.log(`\n   ${errorCount + warningCount} problems (${errorCount} ${'errors'} ${warningCount} warnings)`)
        }
        process.exit(pass)
    }
    if (error !== null) {
        console.log(`exec error: ${error}`)
    }
})