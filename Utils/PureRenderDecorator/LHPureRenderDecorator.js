
const maxDep = 6; // 比较的最大深度

const jsType = [
  'Boolean',
  'Number',
  'String',
  'Function',
  'Array',
  'Date',
  'RegExp',
  'Object',
  'Error'
];
const dUtil = {};
for (let i = 0; i < jsType.length; i += 1) {
  dUtil['is' + jsType[i]] = (obj) => {
    return Object.prototype.toString.call(obj) === '[object ' + jsType[i] + ']';
  };
}

function skipKeys(key) {
  const keyMaps = {
    $$typeof: 1,
    _owner: 1,
    _store: 1,
    _self: 1,
    _source: 1
  };

  if (keyMaps[key]) {
    return true;
  }
  return false;
}

function deepEqual(objA, objB, depth) {
  if (depth > maxDep) {
    return false;
  }
  // eslint-disable-next-line
  depth += 1;
  if (!dUtil.isObject(objA) && !dUtil.isArray(objB)) {
    // eslint-disable-next-line
    if (!valCompare(objA, objB)) {
      return false;
    }
  }
  const keysA = Object.keys(objA || {});
  const keysB = Object.keys(objB || {});
  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i += 1) {
    const comPareValA = objA[keysA[i]];
    const comPareValB = objB[keysB[i]];
    if (keysA[0] === '$$typeof' && keysA[i] === 'children') {
      return true;
    } else if (keysA[0] === '$$typeof' && skipKeys(keysA[i])) {
      // eslint-disable-next-line
      continue;
    }
    // eslint-disable-next-line
    if (!objB.hasOwnProperty(keysA[i])) {
      return false;
    }
    // eslint-disable-next-line
    if (!valCompare(comPareValA, comPareValB, depth)) {
      return false;
    }
  }
  return true;
}

function valCompare(valA, valB, depth) {
  if (dUtil.isFunction(valA)) {
    if (
      // eslint-disable-next-line
      valA.hasOwnProperty('name')
      // eslint-disable-next-line
      && valB.hasOwnProperty('name')
      && valA.name === valB.name) {
      return true;
    }
    return false;
  }

  if (dUtil.isString(valA) || dUtil.isNumber(valA) || dUtil.isBoolean(valA)) {
    if (valA !== valB) {
      return false;
    }
    return true;
  }

  if (dUtil.isDate(valA)) {
    if (valA.getTime() !== valB.getTime()) {
      return false;
    }

    return true;
  }

  if (dUtil.isObject(valA) || dUtil.isArray(valA)) {
    return deepEqual(valA, valB, depth);
  }

  if (valA !== valB) {
    return false;
  }

  return true;
}

export function deepCompare(instance, nextProps, nextState) {
  const result = !deepEqual(
    instance.props,
    nextProps,
    1
  ) || !deepEqual(instance.state, nextState, 1);
  return result;
}

function shouldComponentUpdate(nextProps, nextState) {
  return deepCompare(this, nextProps, nextState);
}

/**
* @module LHPureRenderDecorator
* @description 性能优化组件，重写shouldComponentUpdate判断，尽可能少调用render方法
* @param {component} component 组件
* @return {component} 优化后的组件
* @example
* import {
*   LHPureRenderDecorator
* } from 'LHCommonFunction';
*
* LHPureRenderDecorator(component);
*/
function LHPureRenderDecorator(component) {
  // eslint-disable-next-line
  component.prototype.shouldComponentUpdate = shouldComponentUpdate;
  return component;
}

export default LHPureRenderDecorator;
