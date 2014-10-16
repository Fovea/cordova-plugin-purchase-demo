/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function log(arg) { app.log(arg); }

var app = {

    log: function(arg) {
        try {
            if (typeof arg !== 'string')
                arg = JSON.stringify(arg);
            console.log(arg);
            document.getElementById('log').innerHTML += '<div>' + arg + '</div>';
        } catch (e) {}
    },

    // Application Constructor
    initialize: function() {
        log('initialize');
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        log('bindEvents');
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
 
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        log('onDeviceReady');
        app.initializeIAP();
    },

    initializeIAP: function() {
        if (!window.store) {
            log('Store not available');
            return;
        }

        store.debug = store.DEBUG;

        log('registerProducts');
        store.registerProducts([{
            id:    'cc.fovea.purchase.consumable1',
            alias: 'extra life',
            type:   store.CONSUMABLE
        }, {
            id:    'cc.fovea.purchase.nonconsumable1',
            alias: 'full version',
            type:   store.NON_CONSUMABLE
        }]);

        store.ask("full version").then(function (p) {
            log("full version loaded");
        }).error(function (err, p) {
            log("full version loaded with error");
        });

        // When any product gets updated, refresh the HTML.
        store.when("product").updated(function (p) {
            app.renderIAP(p);
        });

        store.error(function(error) {
            log('ERROR ' + error.code + ': ' + error.message);
        });

        store.when("extra life").approved(function (order) {
            log("EXTRA LIFE!");
            order.finish();
        });

        store.when("full version").approved(function (order) {
            log('Unlocking FULL VERSION!');
            order.finish();
        });

        log('refresh');
        store.refresh();
    },

    renderIAP: function(p) {

        var elId = p.id.split(".")[3];

        var el = document.getElementById(elId + '-purchase');
        if (!el) return;

        if (!p.loaded) {
            el.innerHTML = '<h3>...</h3>';
        }
        else if (!p.valid) {
            el.innerHTML = '<h3>' + p.alias + ' Invalid</h3>';
        }
        else if (p.valid) {
            var buttonStyle = "display:inline-block; padding: 5px 20px; border: 1px solid black";
            var html = "<h3>" + p.title + "</h3>" + "<p>" + p.description + "</p>";
            if (p.canPurchase) {
                html += "<div style='" + buttonStyle + "' id='buy-" + p.id + "' productId='" + p.id + "' type='button'>" + p.price + "</div>";
            }
            el.innerHTML = html;
            if (p.canPurchase) {
                document.getElementById("buy-" + p.id).onclick = function (event) {
                    var pid = this.getAttribute("productId");
                    store.order(pid);
                };
            }
        }
    }
};

app.initialize();
