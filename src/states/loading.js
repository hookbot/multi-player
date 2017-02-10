// namespace
var App = App || {};

App.LoadingState = (function () {
    "use strict";

    var fn = function (game) {
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {

    };

    fn.prototype.preload = function () {
        // load json configuration files
        this.load.json('assetsConfig', 'assets/json/assets.json');
    };

    fn.prototype.create = function () {

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
