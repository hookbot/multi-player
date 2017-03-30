// This is the scaffling glue for the websocket protocol.
// This file is intended to be loaded by both the client and the server.

// ==== CLIENT SYNTAX ====
//
// EXAMPLE HTML:
// <script src="vendor/phaser.js"></script>
// <script src="vendor/websocket.js"></script>
// <script src="eureca.js"></script>
// <script src="src/objects/websocket.js"></script>
//
// EXAMPLE PHASER STATE INITIALIZATION:
// fn.prototype.init = function () { // Phaser.State.init runs once
//     this.game.webSocket = new App.WebSocket(this.game,App.WebSocketClientClass);
// };
//
// EXAMPLE WebSocketClientClass HOOK (such as src/objects/websocket.js):
// App.WebSocketClientClass = function (game) {
//     this.game = game;
// };
// App.WebSocketClientClass.prototype.setClientID = function(id) {
//     console.log("Server assigned my ID: " + id);
//     this.game.webSocket.server.handshake(); // Run Server Side Hook
// };
// App.WebSocketClientClass.prototype.message = function(msg) {
//     console.log("Server Says: " + msg);
// };
// NOTE: You can use "this" to correspond to the instance of the WebSocketClientClass object

// ==== SERVER SYNTAX ====
//
// EXAMPLE GULP INITIALIZATION (such as server/index.js):
// var server = http.createServer(app);
// server.listen(port);
// require("../vendor/websocket.js").init({
//     server: server,
//     serverhooks: require("../server/websocket.js"),
// });
//
// EXAMPLE serverhooks HOOK (such as server/websocket.js):
// var connections = {};
// exports._internal = {};
// exports._internal.onConnect = function (connection) {
//     console.log('NEW Connection ', connection.id, connection.eureca.remoteAddress);
//     connections[connection.id] = { client:connection.clientProxy };
//     connection.clientProxy.setClientID(connection.id); // Run Client Side Hook
// };
// exports.handshake = function() {
//     console.log('HANDSHAKE from Client ID ' + this.user.clientId);
//     connection[this.user.clientId].client.message("Handshake complete"); // Run Client Side Hook
// };
// NOTE: The _internal methods can use "this" to access the main eurecaServer object
// NOTE: The other callbacks hooks can use "this" to access the client Socket object.
// The this.user.clientId is always the key in the connections[] hash
// The this.connection.clientProxy object is the same as connections[this.user.clientId].client object
// which contains all the callback methods (defined in WebSocketClientClass) ready to execute on the client

if (typeof(exports) === 'undefined') {
    // This appears to be HTML loaded by Phaser on the Client side
    // i.e., such as: <script src="vendor/websocket.js"></script>

    var App = App || {};
    App.WebSocket = (function () {
        "use strict";

        // constructor
        var fn = function (game, clientClass) {
            console.log("WebSocket.constructor Running...");
            if (typeof(Eureca) === 'undefined') {
                console.warn("WARNING: It appears that /eureca.js has not been loaded?");
                alert("Missing /eureca.js?");
            }
            else {
                this.game = game;
                // Instantiate a real object from the Class
                this.client = new clientClass(game);
                // Run One-Time Initialization
                this.init();
            }
        };

        fn.prototype.init = function () {
            // Initialization

            // Connect to WebSocket server
            console.log("Connecting to WebSocket server...");
            this.readyWS = false;
            this.eurecaClient = new Eureca.Client();
            this.eurecaClient.exports = {};
            this.eurecaClient.exports.callback = (function (method,argsArray) {
                if (method) {
                    // Wrapper around real method
                    return this[method].apply(this,argsArray);
                }
                else {
                    // Special invocation to give a list of available Client methods to the Server
                    var methods = [];
                    for (var m in this) {
                        if ('function' === typeof this[m]) {
                            methods.push(m);
                        }
                    }
                    return methods;
                }
            }).bind(this.client);
            this.eurecaClient._WebSocketObj = this;
            this.eurecaClient.ready(function (proxy) {
                console.log("WebSocket client is ready!");
                this._WebSocketObj.proxy = proxy;
                var wrappers = {};
                for (var m in proxy) {
                    // Create fake wrapper to pretend like this is a real Server method
                    wrappers[m] = (function() {
                        var args = [].slice.call(arguments);
                        var then = null;
                        if (args.length > 0 && 'function' == typeof args[args.length-1])
                            then = args.pop();
                        var run = this.func.apply(this, args);
                        if (then) run.then(then);
                        return run;
                    }).bind({func: proxy[m]});
                }
                this._WebSocketObj.server = wrappers;
                this._WebSocketObj.readyWS = true;
            });
        };

        return fn;
    })();

}
else {
    // This appears to be NodeJS loaded by gulp on the Server side
    // i.e., such as: require("../vendor/websocket.js");
    console.log("WebSocket Server Compiling ...");

    exports.Eureca = require('eureca.io');
    exports.init = function(args) {
        var server = args.server;
        var eurecaServer = new this.Eureca.Server({allow:['callback']});
        this.server = eurecaServer;
        args.serverhooks = args.serverhooks || {};
        eurecaServer.importRemoteMethods = function(client,methods) {
            for (var i in methods) {
                var m = methods[i];
                if (m !== 'callback') {
                    // Create fake wrapper to pretend like this is a real Client method
                    client[m] = (function () {
                        var args = [].slice.call(arguments);
                        var then = null;
                        if (args.length > 0 && 'function' == typeof args[args.length-1])
                            then = args.pop();
                        var run = client.callback(this.method,args);
                        if (then) run.then(then);
                        return run;
                    }).bind({method: m});
                }
            }
        };
        args.serverhooks._internal = args.serverhooks._internal || {};
        // Decorate onConnect to import client callback hooks first
        var onConnect = args.serverhooks._internal.onConnect || function (connection) {};
        args.serverhooks._internal.onConnect = function (connection) {
            var client = connection.clientProxy;
            if (eurecaServer._clientMethodsCache) {
                // Someone else must have already revealed the Client methods.
                // Just use that same cached list.
                eurecaServer.importRemoteMethods(client,eurecaServer._clientMethodsCache);
                return onConnect(connection);
            }
            // This is the first client to connect.
            // Ask for a list of possible Client methods.
            client.callback().then(function (methods) {
                // Passing no arguments to "callback" forces it to reveal its methods
                // Cache this list before creating the remote method hooks:
                eurecaServer._clientMethodsCache = methods;
                eurecaServer.importRemoteMethods(client,methods);
                // Finally it's safe to run the original onConnect routine
                return onConnect(connection);
            });
            return;
        };
        for (var method in args.serverhooks._internal) this.server[method](args.serverhooks._internal[method]);
        delete args.serverhooks._internal;
        this.server.exports = args.serverhooks;

        // Attach Eureca to express server
        this.server.attach(server);
        return this.server;
    };
}
