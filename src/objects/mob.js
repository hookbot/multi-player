// namespace
var App = App || {};

App.Mob = (function () {
    "use strict";

    var fn = function (game, username, x, y) {
        Phaser.Sprite.call(this, game, x, y, 'alienBlue');
        this.game.physics.arcade.enable(this);
        this.frame = 0;
        this.scale.setTo(.7, .7);
        this.animations.add('right', [0, 1, 2], 8, true);
        this.animations.add('left', [3, 4, 5], 8, true);
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
