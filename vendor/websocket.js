// This is the scaffling glue for the websocket protocol.
// This file is intended to be loaded by both the client and the server.

var App = App || {};

if (typeof(exports) === 'undefined') {
    // This must be Phaser client side
    // i.e., such as: <script src="vendor/websocket.js"></script>

    // EXAMPLE USAGE:
    // this.game.webSocket = new App.WebSocket(this.game,App.WebSocketClientClass);
    // this.game.webSocket.eurecaServer.METHOD(args);
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
                this._WebSocketObj.server = proxy;
                this._WebSocketObj.readyWS = true;
            });
        };

        return fn;
    })();

}
else {
    // This must be NodeJS loaded by gulp on the server side
    // i.e., such as: require("../vendor/websocket.js").init({server:express,serverhooks:sh});
    console.log("WebSocket Server Compiling ...");

    exports.EurecaObj = require('eureca.io');
    exports.init = function(args) {
        var server = args.server;
        this.server = new this.EurecaObj.Server({allow:['callback']});
        args.serverhooks = args.serverhooks || {};
        args.serverhooks._internal = args.serverhooks._internal || {};
        // Decorate onConnect to import client callback hooks first
        var onConnect = args.serverhooks._internal.onConnect || function (connection) {};
        args.serverhooks._internal.onConnect = function (connection) {
            var client = connection.clientProxy;
            client.callback().onReady(function (methods) {
                // Passing no arguments to "callback" forces it to reveal its methods
                for (var i in methods) {
                    var m = methods[i];
                    if (m !== 'callback') {
                        // Create fake wrapper to pretend like this is a real Client method
                        client[m] = (function () {
                            return client.callback(this.method,[].slice.call(arguments));
                        }).bind({method: m});
                    }
                }
                // Finally it's safe to run the original onConnect routine
                return onConnect(connection);
            });
        };
        for (var method in args.serverhooks._internal) this.server[method](args.serverhooks._internal[method]);
        delete args.serverhooks._internal;
        this.server.exports = args.serverhooks;

        // Attach Eureca to express server
        this.server.attach(server);
        return this.server;
    };
}
