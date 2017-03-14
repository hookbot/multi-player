// namespace
var App = App || {};

App.Mob = (function () {
    "use strict";

    var fn = function (game, username, x, y) {
        // Just steal attributes from App.Player
        var p = game.global.player;
        Phaser.Sprite.call(this, game, x, y, p.key);
        this.width = p.width;
        this.height = p.height;
        for (var n in p.animations._anims) {
            var c = p.animations._anims[n];
            this.animations.add(n, c._frames, 1000/c.delay, true);
        }
        //this.animations.play('right');
        this.game.physics.arcade.enable(this);
        this.collideWorldBounds = true;
        this.playerName = username;
        this.usernameText = game.add.text(20, 20, username, { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.usernameText.x = this.x;
        this.usernameText.y = this.y + 60;
    };

    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.update = function () {
        this.usernameText.x = this.x;
        this.usernameText.y = this.y + 60;
        if (this.body.velocity.x < 0) {
            this.animations.play(this.orient = 'left');
        }
        else if (this.body.velocity.x > 0) {
            this.animations.play(this.orient = 'right');
        }
        var playerMoving = this.body.velocity.x != 0 || this.body.velocity.y != 0;
        if (!playerMoving) {
            this.animations.stop();
        }
        if (this.game.global.forest) {
            this.game.physics.arcade.collide(this, this.game.global.forest.layers.Collisions);
        }
    };

    return fn;
})();
