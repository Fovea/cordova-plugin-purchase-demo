cordova-plugin-purchase-demo
============================

Demo of the Purchase Plugin for Cordova

usage
-----

 1. retrive from git
  
 2. add platforms and plugins:
```
    cordova platform add ios
    cordova platform add android
    cordova plugin add org.apache.cordova.console
```
 3. add the purchase plugin:
```
    cordova plugin add "git@github.com:j3k0/PhoneGap-InAppPurchase-iOS.git#unified"
```
 4. setup for ios
   - setup your app-id, provisioning profile, in-app-purchases.

 5. compile for ios
```
    cordova build ios
```
 6. test on your ios device
   - the best is to run directly using XCode, as you may have some
     provisioning profile issues XCode will be able to address.

 7. setup for android
   - https://github.com/poiuytrez/AndroidInAppBilling/blob/master/v3/README.md#finish-setting-up-your-app

 8. compile for android
```
    cordova build android --release
```
 9. sign using your release key and test on your device.

during plugin development
-------------------------

While working on the plugin itself, the demo project is useful too.

You can install from your local disk:
```
    cordova plugin add "../cordova-plugin-purchase"
```
To refresh to the latest local version, remove it first with:
```
    cordova plugin remove cc.fovea.cordova.purchase
```
