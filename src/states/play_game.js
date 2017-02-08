// namespace
var App = App || {};

App.PlayGameState = (function () {
    "use strict";

    var fn = function (game) {
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        this.asset_manager = new App.AssetManager(this.game);
    };

    fn.prototype.preload = function () {
        // load assets
        this.asset_manager.loadAssets();
    };

    fn.prototype.create = function () {
        // init assets
        this.asset_manager.initAssets();

        // our forest tilemap
        this.forest = this.asset_manager.get_tilemap('forest');

        this.game.world.sendToBack(this.forest.layers.backgroundLayer);

        // resize world to fit the layers
        this.forest.layers.backgroundLayer.resizeWorld();
    };

    fn.prototype.update = function () {

    };

    return fn;
})();
