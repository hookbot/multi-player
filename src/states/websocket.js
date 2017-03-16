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
        this.game.ws = new App.WebSocket(this.game,App.WebSocketClientHooks);
    };

    return fn;
})();
