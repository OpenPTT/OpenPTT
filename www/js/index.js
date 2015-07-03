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
(function () {
    "use strict";
        
    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', this.onPause.bind(this), false );
        document.addEventListener( 'resume', this.onResume.bind(this), false );
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }

    function onLoad() {

    }
    function onUnload() {
        //TODO: disconnect
    }
    
    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    window.addEventListener('load', onLoad.bind(this), false);
    window.addEventListener('unload', onUnload.bind(this), false);
    
    window.app = {
        bbsCore: null
    }
    
} )();
