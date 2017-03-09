// namespace
var App = App || {};

App.Flag = (function () {
    "use strict";

    var fn = function (game, x, y, key, frame) {
        Phaser.Sprite.call(this, game, x, y, key, frame);

        this.frames = this.frames || this.findKeyFrames(key, frame);
        this.frames = this.frames || this.findFrames(frame);

        this.animations.add('wave', this.frames, 4, true);

        this.animations.play('wave');

        this.game.physics.arcade.enable(this);

        this.following = null;
    };

    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.findKeyFrames = function (key, frame) {
        var frameData = game.cache.getItem(key,Phaser.Cache.IMAGE,'findKeyFrames','frameData');
        var matches = undefined;
        if (frame in frameData._frameNames) {
            var prefix = frame.replace(/_\d+$/,'_');
            matches = [];
            for (var frame_name in frameData._frameNames) {
                if (frame_name.substr(0,prefix.length) == prefix) {
                    matches.push(frame_name);
                }
            }
        }
        return matches;
    }

    fn.prototype.getFrameLegend = function () { return this.frame_legend || {}; };

    fn.prototype.findFrames = function (frame) {
        var frame_legend     = this.getFrameLegend();
        var frame_legend_key = _.reduce(_.keys(this.getFrameLegend()), (function (final, key) {
            return frame.match(new RegExp(key, 'i')) ? key : final;
        }).bind(this));

        return frame_legend[frame_legend_key];
    };

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
