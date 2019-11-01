var fs = require("fs")
const fse = require('fs-extra');
const path = require('path');
const commonFunctionPreCommit = path.resolve(__dirname, '../../../../.git/modules/Modules/Mijia-CommonFunction-Modules/hooks/pre-commit');
const commonUIPreCommit = path.resolve(__dirname, '../../../../.git/modules/Modules/Mijia-CommonUI-Modules/hooks/pre-commit');
const preCommit = path.resolve(__dirname, './pre-commit');
class SubModulesPreCommit {
  static AddScript() {
    fs.exists(commonFunctionPreCommit, (isExists) => {
      if (!isExists) {
        fse.copy(preCommit, commonFunctionPreCommit);
      }
    })
    fs.exists(commonUIPreCommit, (isExists) => {
      if (!isExists) {
        fse.copy(preCommit, commonUIPreCommit);
      }
    })
  }
}
module.exports = SubModulesPreCommit;