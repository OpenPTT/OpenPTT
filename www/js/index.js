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
    bbsCore: null,
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
        window.addEventListener('load', this.onLoad, false);
        window.addEventListener('unload', this.onUnload, false);
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('offline', this.onOffline, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.bbsCore = new BBSCore();
        app.bbsCore.connect();
        
    },
    showData: function() {
        if(app.bbsCore)
          app.bbsCore.addTask('getFavoriteList', this.onMessage.bind(this));
    },

    onMessage: function(data) {
      console.log(data);
        /*
        var span = document.getElementById('message');
        for(var i=0;i<24;++i){
          span.innerHTML += (app.bbsCore.buf.getText(i, 0, 79, false, true, false) + '\n');
        }
        */
    },
    
    onLoad: function() {
        app.receivedEvent('load');
        var btn = document.getElementById('showData');
        btn.addEventListener('click', app.showData.bind(app), false);
    },
    onOffline: function() {
        app.receivedEvent('unload');
        //TODO: disconnect
    },
//    onOnline: function() {
//        app.receivedEvent('online');
//    },
//    onOffline: function() {
//        app.receivedEvent('offline');
//    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        */
        console.log('Received Event: ' + id);
    }
};

app.initialize();