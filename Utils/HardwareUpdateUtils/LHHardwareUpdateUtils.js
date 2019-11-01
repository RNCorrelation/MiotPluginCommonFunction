import {
  Host,
  Package,
  PackageEvent
} from 'miot';

import {
  LHDialogUtils,
  CommonMethod,
  LHCommonLocalizableString,
  LHMiServer
} from 'LHCommonFunction';

let instance = null;
export default class LHHardwareUpdateUtils {
  constructor(offDialog) {
    if (instance) {
      return instance;
    }
    this.offDialog = offDialog;
    this.mCallback = [];
    this.needCheck = false;
    this.serverData = null;
    this.hasNewVersion = false;
    instance = this;
    this.addViewWillAppearListener();
    return instance;
  }

  addCallback(callback) {
    this.mCallback.push(callback);
    return {
      remove: () => {
        const index = this.mCallback.indexOf(callback);
        if (index > -1) {
          this.mCallback.splice(index, 1);
        }
      }
    };
  }

  addViewWillAppearListener() {
    this.packageViewWillAppearListener = PackageEvent.packageViewWillAppear.addListener(() => {
      console.log('packageViewWillAppear');
      if (this.needCheck) {
        this.checkHardwareUpdate();
      }
    });
  }

  removeViewWillAppearListener() {
    if (this.packageViewWillAppearListener) {
      this.packageViewWillAppearListener.remove();
      this.packageViewWillAppearListener = null;
    }
  }

  checkHardwareUpdate() {
    LHMiServer.UpdateDeviceHardware((res) => {
      console.log(res);
      if (!res) {
        return;
      }
      this.needCheck = false;
      this.serverData = res;
      this.hasNewVersion = !res.isLatest;
      const title = CommonMethod.CreatCacheKey(res.newVersion);
      if (res.hasNewFirmware) {
        for (let i = 0; i < this.mCallback.length; i += 1) {
          this.mCallback[i](res);
        }
        if (this.offDialog) return;
        if (res.isForce) {
          let config = {
            message: LHCommonLocalizableString.common_hardware_update_isforce.replace('{version}', res.newVersion),
            confirm: LHCommonLocalizableString.common_hardware_update,
            cancel: LHCommonLocalizableString.common_out,
            onCancel: () => {
              Package.exit();
            },
            onConfirm: () => {
              this.needCheck = true;
              Host.ui.openDeviceUpgradePage();
            }
          };
          if (res.isUpdating) {
            config = Object.assign(config, {
              message: LHCommonLocalizableString.common_hardware_update_updating,
              confirm: LHCommonLocalizableString.common_hardware_checkupdate
            });
          }
          LHDialogUtils.MessageDialogShow(config);
        } else {
          LHMiServer.GetHostStorage(title).then((data) => {
            if (!data) {
              LHMiServer.SetHostStorage(title, true);
              LHDialogUtils.MessageDialogShow({
                message: LHCommonLocalizableString.common_hardware_update_default.replace('{version}', res.newVersion),
                confirm: LHCommonLocalizableString.common_hardware_update,
                cancel: LHCommonLocalizableString.common_cancel,
                onCancel: () => {
                },
                onConfirm: () => {
                  this.needCheck = false;
                  Host.ui.openDeviceUpgradePage();
                }
              });
            }
          }).catch((suberr) => {
            console.log(suberr);
          });
        }
      } else {
        for (let i = 0; i < this.mCallback.length; i += 1) {
          this.mCallback[i](res);
        }
      }
    }, (err) => {
      console.log(err);
    });
  }
}