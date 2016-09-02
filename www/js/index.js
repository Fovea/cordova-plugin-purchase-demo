/*
 * Copyright (c) 2014, Jean-Christophe Hoelt <hoelt@fovea.cc>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Our application's global object
var app = {};

app.nonHostedContentUrl = "http://ge.tt/api/1/files/3JSfJhL2/0/blob?download";

//
// Constructor
// -----------
//

app.initialize = function() {
    log('initialize');

    // Listen to the deviceready event.
    // Make sure the score of 'this' isn't lost.
    document.addEventListener('deviceready', this.bind(this.onDeviceReady), false);
};

//
// Methods
// -------
//

// deviceready event handler.
//
// will just initialize the Purchase plugin
app.onDeviceReady = function() {
    log('onDeviceReady');
    this.initStore();
};

// initialize the purchase plugin if available
app.initStore = function() {

    if (!window.store) {
        log('Store not available');
        return;
    }

    app.platform = device.platform.toLowerCase();
    document.getElementsByTagName('body')[0].className = app.platform;

    // Enable maximum logging level
    store.verbosity = store.DEBUG;

    // Enable remote receipt validation
    store.validator = "https://api.fovea.cc:1982/check-purchase";

    // Inform the store of your products
    log('registerProducts');
    store.register({
        id:    'consumable1', // id without package name!
        alias: 'extra life',
        type:   store.CONSUMABLE
    });

    store.register({
        id:    'nonconsumable1', // id without package name!
        alias: 'full version',
        type:   store.NON_CONSUMABLE
    });

    store.register({
        id:    'subscription1', // id without package name!
        alias: 'subscription1',
        type:  store.PAID_SUBSCRIPTION
    });

    store.register({
        id:    'nonconsumablenonhosted1', // id without package name!
        alias: 'non-hosted content download',
        type:   store.NON_CONSUMABLE
    });

    if(app.platform === "ios"){
        store.register({
            id:    'nonconsumablehosted1', // id without package name!
            alias: 'hosted content download',
            type:   store.NON_CONSUMABLE
        });
    }


    // When any product gets updated, refresh the HTML.
    store.when("product").updated(function (p) {
        app.renderIAP(p);
    });

    store.when("subscription1").approved(function(p) {
        log("verify subscription");
        p.verify();
    });
    store.when("subscription1").verified(function(p) {
        log("subscription verified");
        p.finish();
    });
    store.when("subscription1").unverified(function(p) {
        log("subscription unverified");
    });
    store.when("subscription1").updated(function(p) {
        if (p.owned) {
            document.getElementById('subscriber-info').innerHTML = 'You are a lucky subscriber!';
        }
        else {
            document.getElementById('subscriber-info').innerHTML = 'You are not subscribed';
        }
    });

    // Log all errors
    store.error(function(error) {
        log('ERROR ' + error.code + ': ' + error.message);
    });

    // When purchase of an extra life is approved,
    // deliver it... by displaying logs in the console.
    store.when("extra life").approved(function (order) {
        log("You got an EXTRA LIFE!");
        order.finish();
    });

    // When purchase of the full version is approved,
    // show some logs and finish the transaction.
    store.when("full version").approved(function (order) {
        log('You just unlocked the FULL VERSION!');
        order.finish();
    });

    // The play button can only be accessed when the user
    // owns the full version.
    store.when("full version").updated(function (product) {
        document.getElementById("access-full-version-button").style.display =
            product.owned ? "block" : "none";
    });

    /*
     * iOS Apple-hosted content
     */

    // When purchase of the downloadable content is approved,
    // show some logs.
    store.when("hosted content download").approved(function (product) {
        log("You've purchased the content for " + product.id + " - it will now download to your device!");
    });

    // Show progress during hosted content download
    store.when("hosted content download").downloading(function(product) {
        var html = 'Downloading content: ' + product.progress + '%';
        document.getElementById('non-consumable-hosted-content-download').innerHTML = html;
    });

    // When hosted content download is complete, finish the transaction
    store.when("hosted content download").downloaded(function(product) {
        product.finish();
    });

    // If the product content is downloading or downloaded, display the downloaded content
    store.when("hosted content download").updated(function (product) {
        var displayEl = document.getElementById("non-consumable-hosted-content-download");
        if(product.downloading || product.downloaded){
            displayEl.style.display = "block";
        }else{
            displayEl.style.display = "none";
        }
        if(product.downloaded){
            var productName = product.id.split(".").pop();
            displayDownloadedContent(cordova.file.documentsDirectory + productName, displayEl);
        }
    });

    /*
     * Non-hosted (self-hosted) content
     */

    // When purchase of the downloadable content is approved,
    // show some logs.
    store.when("non-hosted content download").approved(function (product) {
        log("You've purchased the content for " + product.id + " - it will now download to your device!");
        downloadNonHostedContent(product);
    });

    // Show progress during hosted content download
    store.when("non-hosted content download").downloading(function(product) {
        var html = 'Downloading content';
         if(product.progress >= 0){
            html += ': ' + product.progress + '%';
         }
         document.getElementById('non-consumable-non-hosted-content-download').innerHTML = html;
    });

    // When hosted content download is complete, finish the transaction
    store.when("non-hosted content download").downloaded(function(product) {
        product.finish();
    });

    // Show download element if the product content is downloading or downloaded
    // When hosted content download is complete, display the downloaded content and finish the transaction
    store.when("non-hosted content download").updated(function (product) {
        var displayEl = document.getElementById("non-consumable-non-hosted-content-download");
        if(product.downloading || product.downloaded){
            displayEl.style.display = "block";
        }else{
            displayEl.style.display = "none";
        }
        if(product.downloaded){
            var productName = product.id.split(".").pop();
            displayDownloadedContent(cordova.file.dataDirectory + productName, displayEl);
        }
    });

    // When the store is ready (i.e. all products are loaded and in their "final"
    // state), we hide the "loading" indicator.
    //
    // Note that the "ready" function will be called immediately if the store
    // is already ready.
    store.ready(function() {
        var el = document.getElementById("loading-indicator");
        if (el)
            el.style.display = 'none';
    });

    // When store is ready, activate the "refresh" button;
    store.ready(function() {
        var el = document.getElementById('refresh-button');
        if (el) {
            el.style.display = 'block';
            el.onclick = function(ev) {
                store.refresh();
            };
        }
    });

    // Alternatively, it's technically feasible to have a button that
    // is always visible, but shows an alert if the full version isn't
    // owned.
    // ... but your app may be rejected by Apple if you do it this way.
    //
    // Here is the pseudo code for illustration purpose.

    // myButton.onclick = function() {
    //   store.ready(function() {
    //     if (store.get("full version").owned) {
    //       // access the awesome feature
    //     }
    //     else {
    //       // display an alert
    //     }
    //   });
    // };


    // Refresh the store.
    //
    // This will contact the server to check all registered products
    // validity and ownership status.
    //
    // It's fine to do this only at application startup, as it could be
    // pretty expensive.
    log('refresh');
    store.refresh();
};

app.renderIAP = function(p) {

    var parts = p.id.split(".");
    var elId = parts[parts.length-1];

    var el = document.getElementById(elId + '-purchase');
    if (!el) return;

    if (!p.loaded) {
        el.innerHTML = '<h3>...</h3>';
    }
    else if (!p.valid) {
        el.innerHTML = '<h3>' + p.alias + ' Invalid</h3>';
    }
    else if (p.valid) {
        var html = "<h3>" + p.title + "</h3>" + "<p>" + p.description + "</p>";
        if (p.canPurchase) {
            html += "<div class='button' id='buy-" + p.id + "' productId='" + p.id + "' type='button'>" + p.price + "</div>";
        }
        el.innerHTML = html;
        if (p.canPurchase) {
            document.getElementById("buy-" + p.id).onclick = function (event) {
                var pid = this.getAttribute("productId");
                store.order(pid);
            };
        }
    }
};


//
// Internal functions
// ------------------
//

function displayDownloadedContent(contentPath, displayEl){
    var failedFileReadCallback = function(error){
        log("Error reading downloaded content: "+JSON.stringify(error));
    };
    window.resolveLocalFileSystemURL(contentPath, function(dir){
        dir.getFile("payload.txt", {create: false}, function (fileEntry) {
            fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    if(evt.target.error){
                        failedFileReadCallback(evt.target.error)
                    }else if(evt.target.result){
                        displayEl.innerHTML = evt.target.result;
                    }else{
                        failedFileReadCallback("No file contents found");
                    }

                };
                reader.readAsText(file);
            }, failedFileReadCallback);
        }, failedFileReadCallback);
    },failedFileReadCallback);
}

function downloadNonHostedContent(product){

    var fileTransfer = new FileTransfer();
    fileTransfer.onprogress = function(progressEvent) {
        if (progressEvent.lengthComputable) {
            var percentage = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            product.set({
                progress: percentage,
                state: store.DOWNLOADING
            });
            product.stateChanged();
        }else{
            product.set("state", store.DOWNLOADING);
        }
    };

    product.name = product.id.split(".").pop();
    var sourceURI = encodeURI(app.nonHostedContentUrl);
    var targetFilePath = cordova.file.cacheDirectory + product.name;

    fileTransfer.download(
        sourceURI,
        targetFilePath,
        function(fileEntry) {
            log("Download complete: " + fileEntry.toURL());
            deployNonHostedContent(product, fileEntry);
        },
        function(error) {
            if(error.source){
                log("download error source " + error.source);
            }
            if(error.target){
                log("download error target " + error.target);
            }
        },
        true
    );
}

function deployNonHostedContent(product, zipFileEntry){
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dataDirectory){
        dataDirectory.getDirectory(product.name, {create: true}, function(targetDirectory) {
            zip.unzip(zipFileEntry.toURL(), targetDirectory.toURL(), function(result) {
                if(result === 0){
                    log("Content unpacking complete: " + targetDirectory.toURL());
                    product.set("state", store.DOWNLOADED);
                }else{
                    log("Error unzipping content zip");
                }
            });
        }, function(error){
            log("Error creating directory for product content: "+JSON.stringify(error));
        });
    },function(error){
        log("Error resolving data directory location: "+JSON.stringify(error));
    });
}

// 
// Utilities
// ---------
//

// shortcut to the app logging function.
function log(arg) { app.log(arg); }

// log both in the console and in the HTML #log element.
app.log = function(arg) {
    try {
        if (typeof arg !== 'string')
            arg = JSON.stringify(arg);
        console.log(arg);
        document.getElementById('log').innerHTML += '<div>' + arg + '</div>';
    } catch (e) {}
};

// make sure fn will be called with app as 'this'
app.bind = function(fn) {
    return function() {
        fn.call(app, arguments);
    };
};

app.initialize();
