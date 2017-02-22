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
        // load json configuration files
        this.game.load.json('assetsConfig', 'assets/json/assets.json');
        this.game.load.spritesheet('alienBlue', 'assets/images/alienBlue_sheet.png', 66, 96);
    };

    fn.prototype.create = function () {
        console.log("LoadingState.create Running...");
        this.game.asset_manager = new App.AssetManager(this.game);
        this.game.state.start('WebSocket');
    };

    return fn;
})();
