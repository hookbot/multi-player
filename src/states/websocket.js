// namespace
var App = App || {};

App.WebSocketState = (function () {
    "use strict";

    console.log("WebSocketState Compiling ...");
    var fn = function (game) {
        console.log("WebSocketState.constructor Running...");
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        console.log("WebSocketState.init Running...");
    };

    fn.prototype.preload = function () {
        console.log("WebSocketState.preload Running...");
    };

    fn.prototype.create = function () {
        console.log("WebSocketState.create Running...");

        // Connect to WebSocket server
        console.log("Connecting to WebSocket server...");
        this.game.global.readyWS = false;
        this.game.global.eurecaClient = new Eureca.Client();
        // Defined in objects/websocket.js
        this.game.global.eurecaClient.exports = exports;
        this.game.global.eurecaClient.ready(function (proxy) {
            console.log("WebSocket client is ready!");
            game.global.eurecaServer = proxy;
            game.global.readyWS = true;
        });
    };

    return fn;
})();
