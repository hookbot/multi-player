// namespace
var App = App || {};

App.Flag = (function () {
    "use strict";

    var fn = function (game, x, y, key, frame) {
        // child classes should define this property
        this.frames = this.frames || [frame];

        Phaser.Sprite.call(this, game, x, y, key, frame);

        this.animations.add('wave', this.frames, 8, true);

        this.animations.play('wave');
    };

    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;

    return fn;
})();
