let _moduleCache = [];
class ModuleCache {
	static clear() {
		_moduleCache = [];
	}

	static getModules() {
		return _moduleCache;
	}

	static addModule(path) {
		if (_moduleCache.indexOf(path) === -1) {
			_moduleCache.push(path);
		}
	}
}
module.exports = ModuleCache;