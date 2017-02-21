// namespace
var App = App || {};

App.WebSocketState = (function () {
    "use strict";

    console.log("WebSocketState.create Compiling ...");
    var fn = function (game) {
        Phaser.State.call(this, game);
        console.log("WebSocketState.constructor Running...");
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        console.log("WebSocketState.init Running...");
    };

    fn.prototype.preload = function () {
        console.log("WebSocketState.preload Running...");
        // load assets
        this.game.asset_manager.loadAssets();
    };

    fn.prototype.create = function () {
        console.log("WebSocketState.create Running...");
        var game = this.game;

        // Connect to WebSocket server
        console.log("Connecting to WebSocket server...");
        game.global.readyWS = false;
        game.global.eurecaClient = new Eureca.Client();
        game.global.eurecaClient.exports = exports; // Defined in hooks.js
        game.global.eurecaClient.ready(function (proxy) {
            console.log("WebSocket client is ready!");
            game.global.eurecaServer = proxy;
            game.global.readyWS = true;
        });
    };

    return fn;
})();
