// namespace
var App = App || {};

App.Flag = (function () {
    "use strict";

    var fn = function (game, x, y, args) {
        Phaser.Sprite.call(this, game, x, y, args.image_key);

        // Create animation linked to this object
        if (args.init) args.init(this, args);

        // If there exists any animation, then play it.
        var anim = _.keys(this.animations._anims)[0];
        if (anim) this.animations.play(anim);

        this.game.physics.arcade.enable(this);

        this.following = null;
    };

    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.update = function () {
        if (this.game.global.player && ! this.following) {
            if (this.game.physics.arcade.collide(this.game.global.player, this) ) {
                this.following = this.game.global.player;
            }
        }

        if (this.following) {
            this.x = this.following.x;
            this.y = this.following.y;
        }
    };

    return fn;
})();
