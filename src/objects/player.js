// namespace
var App = App || {};

App.Player = (function () {
    "use strict";

    var fn = function (game, x, y) {

        Phaser.Sprite.call(this, game, x, y, 'alienBlue');
		this.game.physics.arcade.enable(this);
        this.frame = 0;
        this.scale.setTo(.7, .7);
        this.animations.add('right', [0, 4, 2], 8, true);
        this.animations.add('left', [1, 5, 3], 8, true);
		this.dpad = this.game.input.keyboard.createCursorKeys();
		this.collideWorldBounds = true;
//		this.game.world.bringToTop(this.foregroundLayer);
		this.collideWorldBounds = true;
		this.speed = 200;
    };


    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;
	
    fn.prototype.update = function () {
        var playerMoving = false;

		this.game.camera.follow(this);
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (this.dpad.left.isDown) {
            this.animations.play('left');
            this.body.velocity.x = -this.speed;
            this.orient = 'left';
            playerMoving = true;
        } 
        else if (this.dpad.right.isDown) {
            this.animations.play('right');
            this.body.velocity.x = this.speed;
            this.orient = 'right';
            playerMoving = true;
        }
        if (this.dpad.up.isDown) {
            this.animations.play(this.orient);
            this.body.velocity.y = -this.speed;
            playerMoving = true;
        }
        else if (this.dpad.down.isDown) {
            this.animations.play(this.orient);
            this.body.velocity.y = this.speed;
            playerMoving = true;
        }

        if (!playerMoving) {
            this.animations.stop();
        }

    };
	
    return fn;
})();
