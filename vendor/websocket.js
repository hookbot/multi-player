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
                this.clientObj = new clientClass(game);
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
            this.eurecaClient.exports = this.clientObj;
            var WS = this;
            this.eurecaClient.exports.callback = function (method,argsArray) {
                if (method) {
                    // Wrapper around real method
                    return WS.clientObj[method].apply(WS.clientObj,argsArray);
                }
            };
            this.eurecaClient._WebSocketObj = this;
            this.eurecaClient.ready(function (proxy) {
                console.log("WebSocket client is ready!");
                this._WebSocketObj.eurecaServer = proxy;
                this._WebSocketObj.readyWS = true;
            });
        };

        return fn;
    })();

}
else {
    // This must be NodeJS loaded by gulp on the server side
    // i.e., such as: require("../vendor/websocket.js").init({server:express,clienthooks:ch,serverhooks:sh});
    console.log("WebSocket Server Compiling ...");

    exports.EurecaObj = require('eureca.io');
    exports.init = function(args) {
        var server = args.server;
        // XXX: Can clienthooks be abstracted out enough NOT to be required by the server?
        args.clienthooks = args.clienthooks || {};
        var allow = Object.keys(args.clienthooks);
        allow.push('callback');
        this.Server = new this.EurecaObj.Server({allow:allow});
        args.serverhooks = args.serverhooks || {};
        args.serverhooks._internal = args.serverhooks._internal || {};
        for (var method in args.serverhooks._internal) this.Server[method](args.serverhooks._internal[method]);
        delete args.serverhooks._internal;
        this.Server.exports = args.serverhooks;

        // Attach Eureca to express server
        this.Server.attach(server);
        return this.Server;
    };
}
