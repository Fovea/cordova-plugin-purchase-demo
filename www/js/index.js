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
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.initializeIAP();
    },

    initializeIAP: function() {
        if (!window.store) {
            console.log(' not available');
            return;
        }

        store.debug = true;

        store.registerProducts([{
            id: 'babygooinapp1',
            alias: 'full version',
            type: store.NON_CONSUMABLE
        }]);

        store.ask("full version").then(function (p) {
            console.log('Loaded IAP(' + p.id + ').' +
                        ' title:' + p.title +
                        ' description:' + p.description +
                        ' price:' + p.localizedPrice +
                        ' id:' + p.id);
            app.renderIAP(p, null);
        }).error(function (err, p) {
            app.renderIAP(p, err);
        });

        store.process();
    },

    renderIAP: function(p, error) {
        var el = document.getElementById(p.id + '-purchase');
        if (error) {
            el.innerHTML = '<div class="error">ERROR: ' + error.code + ', ' + error.message + '</div>';
        }
        else {
            var buttonStyle = "display:inline-block; padding: 5px 20px; border: 1px solid black";
            el.innerHTML = "<h3>" + p.title + "</h3>" +
                "<p>" + p.description + "</p>" +
                "<div style='" + buttonStyle + "' id='buy-" + p.id + "' productId='" + p.id + "' type='button'>" + p.price + "</div>";
            document.getElementById("buy-" + p.id).onclick = function (event) {
                var pid = this.getAttribute("productId");
                store.order(pid);
            };
        }
    }
};

app.initialize();
