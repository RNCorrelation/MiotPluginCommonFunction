import {
  Device,
  BluetoothEvent
} from 'miot';
import Bluetooth from 'miot/Bluetooth';
// import {
//   DeviceEventEmitter
// } from 'react-native';
import {
  CommonMethod
} from 'LHCommonFunction';

export default class LHBluetoothUtils {
  static ActiveCallback(callbacks, res) {
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
      if (typeof callbacks[i] === 'function') callbacks[i](res);
    }
  }

  static getRemainList(list, index) {
    const result = [];
    for (let i = index, len = list.length; i < len; i += 1) {
      result.push(list[i]);
    }
    return result;
  }

  constructor(config) {
    Object.assign(this, config || {});
    this.Queue = [];
    this.reportQueue = [];
    this.BluetoothLE = Device.getBluetoothLE();
    this.charactersObject = {};
    this.initListener();
  }

  addTaskToList(startIndex, task, callback) {
    const list = LHBluetoothUtils.getRemainList(this.Queue, startIndex);
    const index = CommonMethod.Find(list, 'cmds', task.cmds);
    if (index > -1) {
      if (this.Queue[startIndex + index].data === task.data) {
        this.Queue[startIndex + index].callbacks.push(callback);
      } else {
        this.addTaskToList(startIndex + index + 1, task, callback);
      }
    } else {
      this.Queue.push({
        isLoading: false,
        callbacks: [callback],
        timeout: task.nextLongReply ? 30000 : 5000,
        ...task
      });
    }
  }

  send(params, callback) {
    this.addTaskToList(0, params, callback);
    console.log(this.Queue);
    this.next();
    // todo remove
  }

  addReportListener(cmds, callback) {
    const cmdsArray = cmds.split(',');
    for (let i = 0, len = cmdsArray.length; i < len; i += 1) {
      const index = CommonMethod.Find(this.reportQueue, 'cmds', cmdsArray[i]);
      if (index > -1) {
        this.reportQueue[index].callbacks.push(callback);
      } else {
        this.reportQueue.push({
          cmds: cmdsArray[i],
          callbacks: [callback]
        });
      }
    }
    return {
      remove: () => {
        for (let i = 0, len = cmdsArray.length; i < len; i += 1) {
          const rIndex = CommonMethod.Find(this.reportQueue, 'cmds', cmdsArray[i]);
          if (rIndex > -1) {
            const callbackIndex = this.reportQueue[rIndex].callbacks.indexOf(callback);
            if (callbackIndex > -1) {
              this.reportQueue[rIndex].callbacks.splice(callbackIndex, 1);
              if (this.reportQueue[rIndex].callbacks.length === 0) this.reportQueue.splice(rIndex, 1);
            }
          }
        }
      }
    };
  }

  next() {
    if (this.Queue.length === 0) return null;
    // 检查队首是否还在加载中
    const item = this.Queue[0];
    if (item.isLoading) return null;
    item.isLoading = true;
    // 开始发送数据
    let msg = item.cmds + item.data || '';
    msg += CommonMethod.CRC16String(msg);
    if (!item.noEncrypt) {
      const mianMsg = msg.substring(0, 2);
      const decryptedMsg = msg.substring(2);
      const { isOta } = item;
      console.log('加密前发送的数据：' + msg);
      this.encryptMessageXiaoMiBLE(decryptedMsg, (data) => {
        console.log('加密后发送的数据：' + mianMsg + data);
        if (item.nextLongReply) this.longDataCache = [];
        this.writeWithoutResponse(mianMsg + data, isOta);
      });
    } else {
      console.log('加密前发送的数据：' + msg);
      if (item.nextLongReply) this.longDataCache = [];
      this.writeWithoutResponse(msg, item.isOta);
    }
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      if (this.Queue.length === 0) return null;
      LHBluetoothUtils.ActiveCallback(item.callbacks, {
        code: 9999,
        msg: 'timeout',
        data: ''
      });
      const index = CommonMethod.Find(this.Queue, 'cmds', item.cmds);
      if (index > -1) {
        this.Queue.splice(index, 1);
      }
      this.next();
      return null;
    }, item.timeout);
    return null;
  }

  encryptMessageXiaoMiBLE(decryptedMsg, callback) {
    this.BluetoothLE.securityLock.encryptMessage(decryptedMsg).then((decrypted) => {
      callback(decrypted);
    }).catch((err) => {
      console.log(err);
      // callback(true)
    });
  }

  decryptMessageXiaoMiBLE(decryptedMsg, callback) {
    this.BluetoothLE.securityLock.decryptMessage(decryptedMsg).then((decrypted) => {
      callback(decrypted);
    }).catch((err) => {
      console.log(err);
      // callback(true)
    });
  }

  disconnectCurrentDevice(time) {
    this.BluetoothLE.disconnect(time || 0);
  }

  initListener() {
    this.bluetoothSeviceDiscoveredListener = BluetoothEvent.bluetoothSeviceDiscovered.addListener((blut, services) => {
      console.log('发现服务：');
      console.log(services);
      if (this.BluetoothLE.isConnected) {
        services.forEach((s) => {
          if (s.UUID.toUpperCase().indexOf(this.LUMI_UUID_SERVICE) > -1) {
            s.startDiscoverCharacteristics(this.LUMI_WRITE_UUID_NOTIFY, this.LUMI_READ_UUID_NOTIFY, this.OTA_WRITE_UUID_NOTIFY, this.OTA_READ_UUID_NOTIFY);
          }
        });
      } else {
        // this.connect();
      }
    });

    this.bluetoothCharacteristicDiscoveredListener = BluetoothEvent.bluetoothCharacteristicDiscovered.addListener((bluetooth, service, characters) => {
      console.log('发现特征值：');
      console.log(characters);
      if (this.BluetoothLE.isConnected) {
        characters.forEach((c) => {
          const UUID = c.UUID.toUpperCase();
          if (UUID === this.LUMI_READ_UUID_NOTIFY || UUID === this.OTA_READ_UUID_NOTIFY) {
            c.setNotify(true);
          } else if (UUID === this.LUMI_WRITE_UUID_NOTIFY || UUID === this.OTA_WRITE_UUID_NOTIFY) {
            this.charactersObject[UUID] = c;
          }
        });
        if (this.loginCallback) {
          this.loginCallback({
            type: 'succ',
            data: '打开蓝牙通知成功'
          });
          this.loginCallback = null;
        }
      } else {
        // this.connect();
      }
    });

    this.bluetoothCharacteristicValueChangedListener = BluetoothEvent.bluetoothCharacteristicValueChanged.addListener((bluetooth, service, character, value) => {
      console.log('监听UpdateValue蓝牙body:' + value);
      const msgData = (value && value.toUpperCase());
      if (msgData && msgData.indexOf('3F') === 0) { // 长包
        const decryptedMsg = msgData.substring(6);
        const prevMsgData = msgData.substr(0, 6);
        if (this.longDataCache && CommonMethod.Find(this.longDataCache, 'prevMsgData', prevMsgData) === -1 && msgData.substr(4, 2) !== 'FF') {
          this.longDataCache.push({
            data: decryptedMsg,
            number: parseInt(msgData.substr(4, 2), 16),
            prevMsgData
          });
        }
        if (msgData && msgData.substr(4, 2) === 'FF' && this.longDataCache && CommonMethod.Find(this.longDataCache, 'prevMsgData', prevMsgData) === -1) {
          this.longDataCache.push({
            data: decryptedMsg,
            number: parseInt(msgData.substr(4, 2), 16),
            prevMsgData
          });
          CommonMethod.QuickSort(this.longDataCache, 'number');
          const encryptMsg = this.longDataCache.map((item) => {
            return item.data;
          });
          console.log(encryptMsg.join(''));
          this.decryptMessageXiaoMiBLE(encryptMsg.join(''), (data) => {
            console.log(data);
            console.log(this.longPacketLength);
            if (data && data.length === this.longPacketLength) {
              const index = CommonMethod.Find(this.Queue, 'nextLongReply', msgData.substring(0, 4));
              if (index > -1) {
                LHBluetoothUtils.ActiveCallback(this.Queue[index].callbacks, {
                  code: 0,
                  msg: 'succ',
                  data
                });
                this.Queue.splice(index, 1);
                if (this.timeoutId) {
                  clearTimeout(this.timeoutId);
                }
                this.next();
              }
            }
          });
        }
      } else {
        const mianCmd = msgData.substring(0, 2);
        const decryptedMsg = msgData.substring(2);
        console.log('解密前的数据：' + msgData);
        this.decryptMessageXiaoMiBLE(decryptedMsg, (data) => {
          const upperCaseData = data.toUpperCase();
          console.log('解密后的数据：' + upperCaseData);
          const index = CommonMethod.Find(this.Queue, 'replyCmds', mianCmd + upperCaseData.substring(0, 2));
          const reportIndex = CommonMethod.Find(this.reportQueue, 'cmds', mianCmd + upperCaseData.substring(0, 2));
          if (index > -1) { // 短包指令回复
            if (this.Queue[index].nextLongReply) {
              this.longPacketLength = parseInt(CommonMethod.bigEndianStrToLittleEndianString(upperCaseData.substr(4, 4)), 16) * 2;
              if (typeof this.Queue[index].shortCallback === 'function') {
                this.Queue[index].shortCallback(this, upperCaseData);
              }
            } else {
              LHBluetoothUtils.ActiveCallback(this.Queue[index].callbacks, {
                code: 0,
                msg: 'succ',
                data: upperCaseData
              });
              this.Queue.splice(index, 1);
              if (this.timeoutId) {
                clearTimeout(this.timeoutId);
              }
              this.next();
            }
          } else if (reportIndex > -1) { // 上报指令
            LHBluetoothUtils.ActiveCallback(this.reportQueue[reportIndex].callbacks, {
              code: 0,
              msg: 'succ',
              data: upperCaseData
            });
          }
        });
      }
    });
  }

  loginXiaoMiBLE(params, callback) {
    this.loginCallback = null;
    this.BluetoothLE.connect((params && params.type) || 1, { timeout: (params && params.timeout) || 10000 }).then((data) => {
      console.log('connected', data);
      this.loginCallback = callback;
      this.BluetoothLE.startDiscoverServices(this.LUMI_UUID_SERVICE);
    }).catch((data) => {
      callback(data);
    });
  }

  writeWithoutResponse(value, isOta) {
    const charactersObject = this.charactersObject[isOta ? this.OTA_WRITE_UUID_NOTIFY : this.LUMI_WRITE_UUID_NOTIFY];
    if (charactersObject) charactersObject.writeWithoutResponse(value);
  }

  // eslint-disable-next-line
  isEnabled(callback) {
    Bluetooth.checkBluetoothIsEnabled().then((res) => {
      callback(res);
    }).catch(() => {
      // callback(false)
    });
  }
}