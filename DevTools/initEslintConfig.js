var fs = require("fs")
const path = require('path');
const eslintrcPath = path.resolve(__dirname, '../../../.eslintrc.js');

function getDefaultConfig() {
  return {
    "extends": "airbnb",
    "parser": "babel-eslint",
    "env": {
      browser: true
    },
    "globals": {
      __DEV__: true
    },
    "rules": {
      "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
      "react/prefer-stateless-function": [0, { "ignorePureComponents": true }],
      "no-debugger": "off", 
      "eol-last": 0, // 文件以单一的换行符结束, 0关闭
      "comma-dangle": [2, "never"], // 对象字面量项尾不能有逗号
      "import/no-extraneous-dependencies": [0, { devDependencies: true }],
      "arrow-body-style": ["error", "always"],
      "react/prop-types": 0,
      "no-console": "off",
      "global-require": 0,
      "no-else-return": 0,
      "no-nested-ternary": 0,
      "prefer-template": 0,
      "max-len": ["error", { code: 250, tabWidth: 2, "ignoreComments": true }],
      "react/sort-comp": 0
    }
  }
}

class LHinitEslintConfig {
  static writeEslintrc() {
    const defaultPackage = getDefaultConfig();
    fs.writeFileSync(eslintrcPath, 'module.exports = ' + JSON.stringify(defaultPackage, null, 2));
  }
}

module.exports = LHinitEslintConfig;
