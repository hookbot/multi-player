// namespace
var App = App || {};

App.LoadingState = (function () {
    "use strict";

    console.log("LoadingState Compiling ...");
    var fn = function (game) {
        console.log("LoadingState.constructor Running...");
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        this.game.global.mob = {};
    };

    fn.prototype.preload = function () {
        console.log("LoadingState.preload Running...");
    };

    fn.prototype.create = function () {
        console.log("LoadingState.create Running...");
        this.game.assetManager = new App.AssetManager (this.game,{
            "assetsConfig":"assets/json/assets.json",
            "nextState":"WebSocket"
        });
    };

    return fn;
})();
