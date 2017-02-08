// namespace
var App = App || {};

App.Flag = (function () {
    "use strict";

    var fn = function (game, x, y, key, frame) {
        Phaser.Sprite.call(this, game, x, y, key, frame);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    return fn;
})();
