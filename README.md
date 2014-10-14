cordova-plugin-purchase-demo
============================

Demo of the Purchase Plugin for Cordova

usage
-----

  1. retrive from git
  
  2. add platforms and plugins:

    cordova platform add ios
    cordova platform add android
    cordova plugin add org.apache.cordova.console

  3. add the purchase plugin:

    cordova plugin add "git@github.com:j3k0/PhoneGap-InAppPurchase-iOS.git#unified"

  4. compile

    cordova build ios

  5. test on your device

during plugin development
-------------------------

While working on the plugin itself, the demo project is useful too.

You can install from your local disk:

    cordova plugin add "../cordova-plugin-purchase"

To refresh to the latest local version, remove it first with:

    cordova plugin remove cc.fovea.cordova.purchase

