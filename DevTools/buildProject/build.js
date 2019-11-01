/* eslint-disable */
const Metro = require('./metro/src/index.js');
const path = require('path');
const fse = require('fs-extra');
const ModuleCache = require('./ModuleCache.js');
const MiPublish = require('./miPublishProject.js');

const config = Metro.loadMetroConfig();
const sdkRootPath = path.resolve(__dirname, '../../../../../../');
const projectRootPath = path.resolve(__dirname, '../../../../');
const buildRootPath = path.resolve(__dirname, '../../../../build/');
const projectCopyToRootPath = buildRootPath + '/' + getProjectName();
const entry = path.join(__dirname, '../../../../index.js');
const output = path.join(__dirname, '../../../../build/output.js');
if (!fse.existsSync(buildRootPath)) fse.mkdirSync(buildRootPath);
// const miSdkCommon = require(sdkRootPath + '/bin/config/common.js');

config.getProjectRoots = () => [sdkRootPath]
deleteCopyProjectFolder((err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log('delete old copy succ')
	metroBuild();
})

function metroBuild() {
	Metro.runBuild({
		config,
		dev: 'development',
		entry: entry,
		out: output,
		minify: false,
		platform: 'ios',
		sourceMap: false,
		onBegin: () => {
			ModuleCache.clear();
			ModuleCache.addModule(entry);
		}
	}).then((res) => {
		const sources = ModuleCache.getModules();
		copyProjectFiles(sources);
		copyPackageJsonFiles()
	})
}

// 需要把项目下所有目录的packgae.json文件都拷贝
function copyPackageJsonFiles() {
	getPackageJsonPath(projectRootPath, (files) => {
		debugger
		for(let i = 0, len = files.length; i < len; i+= 1) {
			copyProjectFile(files[i]);
		}
		setTimeout(() => {
			MiPublish.build(() => {
				deleteCopyProjectFolder();
					// 删除output.js
				if (fse.existsSync(output)) fse.removeSync(output)
				const outputMeta = path.join(__dirname, '../../../../build/output.js.meta')
				if (fse.existsSync(outputMeta)) fse.removeSync(outputMeta)
			})
		}, 1000)
	})
}

function getPackageJsonPath(path, callback) {
	const jsonPaths = [];
	function readdir(path, cb) {
		fse.readdir(path + '/', (err, files) => {
			if (files && files.length === 0) { // 空目录
				cb();
				return;
			}
			// console.log(files);
			const filesLength = files.length;
			let pathIndex = 0;
			function isFile(filePath) {
				fse.stat(filePath, (err, stats) => {
					if(!stats) debugger
				  if (stats.isFile()) {
				  	if (filePath.indexOf('package.json') > -1) {
				  		jsonPaths.push(filePath);
				  	}
				  	if (pathIndex < filesLength - 1) {
				  		pathIndex++;
				  		if (files[pathIndex] === '.git' || files[pathIndex] === '.cache') {
				  			pathIndex++;
				  			if (pathIndex >= filesLength - 1) {
				  				cb();
				  				return;
				  			}
				  		}
				  		isFile(path + '/' + files[pathIndex])
				  	} else {
				  		cb()
				  	}
				  } else { // 文件夹
				  	readdir(filePath, () => {
				  		if (pathIndex < filesLength - 1) {
				  			pathIndex++;
				  			if (files[pathIndex] === '.git' || files[pathIndex] === '.cache') {
				  				pathIndex++;
				  				if (pathIndex >= filesLength - 1) {
				  					cb();
				  					return;
				  				}
				  			}
				  			isFile(path + '/' + files[pathIndex])
				  		} else {
				  			cb()
				  		}
				  	})
				  }
				})
			}
			if (files[pathIndex] === '.git' || files[pathIndex] === '.cache') {
				pathIndex++;
				if (pathIndex >= filesLength - 1) {
					cb();
					return;
				}
			}
			isFile(path + '/' + files[pathIndex]);
		})
	}
	readdir(path, () => {
		callback(jsonPaths)
	})
}

function copyProjectFiles(paths) {
	for (let i = 0, len = paths.length; i < len; i += 1) {
		dealPlatformFiles(paths[i])
	}
}
// 处理可能的平台文件，如.ios.js，.android.js等
function dealPlatformFiles(path) {
	const pathArr = path.split('.');
	const fileType = pathArr.pop();
	if (fileType === 'js') {
		if (pathArr[pathArr.length - 1] === 'ios') {
			pathArr.pop();
		}
		const pathJoin = pathArr.join('.');
		const paths = {
			path: pathJoin + '.js',
			iosPath: pathJoin + '.ios.js',
			androidPath: pathJoin + '.android.js'
		}
		Object.keys(paths).map((item) => {
			fse.exists(paths[item]).then((isExist) => {
				if (isExist) {
					copyProjectFile(paths[item]);
				}
			});
		})
	} else {
		copyProjectFile(path);
	}
}

function copyProjectFile(path) {
	if (path.indexOf(projectRootPath) === 0) {
		const projectRelativePath = getProjectRelativePath(path);
		fse.copy(path, projectCopyToRootPath + projectRelativePath);
	}
}

function getProjectName() {
	const pathSplit = projectRootPath.split('/');
	return pathSplit[pathSplit.length - 1];
}

function getProjectRelativePath(path) {
	return path.replace(projectRootPath, '');
}

// 删除拷贝出来的项目
function deleteCopyProjectFolder(callback) {
	fse.emptyDir(projectCopyToRootPath, typeof callback === 'function' ? callback() : () => {})
}


// 直接复制resources目录，
function copyAResourcesFolder() {
	const commonUIResourcesFolderRelativePath = '/Modules/Mijia-CommonUI-Modules/Resources/';
	const commonUIResourcesFolderPath = projectRootPath + commonUIResourcesFolderRelativePath;
	const commonUIResourcesFolderCopyToPath = projectCopyToRootPath + commonUIResourcesFolderRelativePath;
	const resourcesFolderRelativePath = '/Resources/';
	const resourcesFolderPath = projectRootPath + resourcesFolderRelativePath;
	const resourcesFolderCopyToPath = projectCopyToRootPath + resourcesFolderRelativePath;
	fse.copy(commonUIResourcesFolderPath, commonUIResourcesFolderCopyToPath);
	fse.copy(resourcesFolderPath, resourcesFolderCopyToPath);
}