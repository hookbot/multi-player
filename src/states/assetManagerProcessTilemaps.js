var App = App || {};
App.AssetManager = App.AssetManager || {};

App.AssetManager.ProcessTilemapsState = (function () {
    "use strict";

    var fn = function (game) {
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {

    };

    fn.prototype.preload = function () {

    };

    fn.prototype.create = function () {
        // fire off next state
        this.game.state.start('PlayGame');
    }
    
    return fn;
})();
