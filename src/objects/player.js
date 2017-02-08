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
        this.runKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.collideWorldBounds = true;
//		this.game.world.bringToTop(this.foregroundLayer);
		this.collideWorldBounds = true;
		this.speed = 150;
        this.ability = {
            run : {
                maxStamina: 100,
                multiplier : 2.25,
                recovery : 8,
                cost: 20,
                stamina : 50,
                staggered : false,
                staggeredLowLimit : 5,
                staggeredRecover: 20,
            }
        }
        this.debugText = this.game.add.text(20, 20, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
    };


    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;
	
    fn.prototype.update = function () {
        var playerMoving = false;
        var speed = this.speed;
        this.debugText.text = "";
        this.debugText.x = this.x;
        this.debugText.y = this.y - 20;

        if (this.ability.run.stamina < this.ability.run.maxStamina) {
            this.ability.run.stamina += this.ability.run.recovery * (this.game.time.elapsedMS / 1000);
        }

        if (this.ability.run.stamina > this.ability.run.staggeredRecover) {
            this.ability.run.staggered = false;
        }


        if (this.ability.run.staggered) {
            this.debugText.text += "STAGGERED ";
            speed *= 0.5;
        }

        this.debugText.text += Math.floor( (this.ability.run.stamina/this.ability.run.maxStamina) *100) + "% ";

		this.game.camera.follow(this);
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (this.runKey.isDown && !this.ability.run.staggered) {
            if (this.ability.run.stamina < this.ability.run.staggeredLowLimit) {
                this.ability.run.staggered = true;
            }
            this.ability.run.stamina -= this.ability.run.cost * (this.game.time.elapsedMS / 1000);
            speed *= this.ability.run.multiplier;
            this.debugText.text += "Running ";
        }

        if (this.dpad.left.isDown) {
            this.animations.play('left');
            this.body.velocity.x = -speed;
            this.orient = 'left';
            playerMoving = true;
        } 
        else if (this.dpad.right.isDown) {
            this.animations.play('right');
            this.body.velocity.x = speed;
            this.orient = 'right';
            playerMoving = true;
        }
        if (this.dpad.up.isDown) {
            this.animations.play(this.orient);
            this.body.velocity.y = -speed;
            playerMoving = true;
        }
        else if (this.dpad.down.isDown) {
            this.animations.play(this.orient);
            this.body.velocity.y = speed;
            playerMoving = true;
        }

        if (!playerMoving) {
            this.animations.stop();
        }
    };
	
    return fn;
})();
