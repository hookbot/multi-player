
if (typeof(exports) === 'undefined') {
    // This must be Phaser client side
    // i.e., such as: <script src="vendor/websocket.js"></script>

    // EXAMPLE USAGE:
    // this.game.webSocket = new App.WebSocket(this.game,App.WebSocketClientClass);
    // this.game.webSocket.server.METHOD(args);
    alert("WebSocket Client not implemented");
}
else {
    // This must be NodeJS loaded by gulp on the server side
    // i.e., such as: require("websocket.js");

    console.log("WebSocket Server Compiling ...");

    exports.EurecaObj = require('eureca.io');
    console.log("DEBUG: EurecaObj0:",exports.EurecaObj);
    exports.init = function(args) {
        var server = args.server;
        // XXX: Can clienthooks be abstracted out enough NOT to be required by the server?
        args.clienthooks = args.clienthooks || {};
        var allow = Object.keys(args.clienthooks);
        this.Server = new this.EurecaObj.Server({allow:allow});
        args.serverhooks = args.serverhooks || {};
        args.serverhooks._internal = args.serverhooks._internal || {};
        for (var method in args.serverhooks._internal) {
            console.log("DEBUG: Defining method [" + method + "]: ",args.serverhooks._internal[method]);
            this.Server[method](args.serverhooks._internal[method]);
        }
        delete args.serverhooks._internal;
        this.Server.exports = args.serverhooks;
        // Attach Eureca to express server
        this.Server.attach(server);
        return this.Server;
    };
}
