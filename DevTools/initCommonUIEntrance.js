
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const pathConfigFile = path.join(__dirname,'../../Mijia-CommonUI-Modules/pathConfig.js');
const commonUIConfigFile = path.join(__dirname,'../../../commonUIConfig.json');
let pathConfig;
fs.exists(pathConfigFile, function (exists) {
	if (exists) {
		pathConfig = require(pathConfigFile);
		const allComponents = getComponents(pathConfig)
		fs.exists(commonUIConfigFile, function (isExist) {
			console.log(isExist);
			if (isExist) {
				const projectConfig = require(commonUIConfigFile);
				const componentsConfig = getProjectComponents(pathConfig, projectConfig);
				outputFile(getComponents(componentsConfig));
			} else {
				outputFile(allComponents);
			}
		});
	} else {
		throw new Error('请将commonUI模块更新到最新');
	}
});

function getProjectComponents(allComponents, projectConfig) {
	const components = {};
	for (let i = 0, len = projectConfig.length; i < len; i += 1) {
		if (!allComponents[projectConfig[i]]) throw new Error('commonUIConfig配置的' + projectConfig[i] + '未在commonUI模块pathConfig配置');
		components[projectConfig[i]] = allComponents[projectConfig[i]];
		getDependencies(components, pathConfig[projectConfig[i]].dependencies || [], false)
	}
	return components;
}

function getComponents(config) {
	const keys = Object.keys(config);
	const components = {};
	for (let i = 0, len = keys.length; i < len; i += 1) {
		components[keys[i]] = config[keys[i]].path;
		if (config[keys[i]].dependencies && config[keys[i]].dependencies.length > 0) {
			getDependencies(components, config[keys[i]].dependencies, true);
		}
	}
	return components;
}

function getDependencies(components, dependencies, returnPath) {
	for (let m = 0, len = dependencies.length; m < len; m += 1) {
		const keys = Object.keys(dependencies[m]);
		for (let i = 0, len = keys.length; i < len; i += 1) {
			components[keys[i]] = returnPath ? dependencies[m][keys[i]].path : dependencies[m][keys[i]];
			getDependencies(components, pathConfig[keys[i]].dependencies || [], returnPath)
			if (dependencies[m][keys[i]].dependencies && dependencies[m][keys[i]].dependencies.length > 0) {
				getDependencies(components, dependencies[m][keys[i]].dependencies, returnPath);
			}
		}
	}
}

function outputFile(components) {
	const keys = Object.keys(components);
	let exportObjectStr = '{\n';
	let parts = '';
	for (let i = 0, len = keys.length; i < len; i += 1) {
		exportObjectStr += '  ' + keys[i] + (i === len - 1 ? '\n' : ',\n');
		parts += 'import ' + keys[i] + ' from \'' + components[keys[i]] + '\';\n';
	}
	exportObjectStr += '};';
	fse.outputFile(path.join(__dirname,'../../Mijia-CommonUI-Modules/index.js'), parts + '\nexport ' + exportObjectStr, function(err) {
    console.log(err);
  })
}