// namespace
var App = App || {};

App.Player = (function () {
    "use strict";

    var fn = function (game, x, y, args) {
        Phaser.Sprite.call(this, game, x, y, args.image_key);
        args.init(this, args);

        this.game.global.player = this;
        this.game.physics.arcade.enable(this);
        this.frame = 0;
        this.dpad = this.game.input.keyboard.createCursorKeys();
        this.runKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.collideWorldBounds = true;
        this.speed = 150;
        this.game.global.vx = 0;
        this.game.global.vy = 0;
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
        this.usernameText = this.game.add.text(20, 20, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
    };


    fn.prototype = Object.create(Phaser.Sprite.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.update = function () {
        var playerMoving = false;
        var speed = this.speed;
        this.debugText.text = "";
        this.debugText.x = this.x;
        this.debugText.y = this.y - 20;
        this.usernameText.x = this.x;
        this.usernameText.y = this.y + 60;

        if (this.ability.run.stamina < this.ability.run.maxStamina) {
            this.ability.run.stamina += this.ability.run.recovery * (this.game.time.elapsedMS / 1000);
            if (this.ability.run.stamina > this.ability.run.maxStamina)
                this.ability.run.stamina = this.ability.run.maxStamina;
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
            if (this.ability.run.stamina < 0) this.ability.run.stamina = 0;
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
        this.game.physics.arcade.collide(this, this.game.global.forest.layers.Collisions);
        var g = this.game.global;
        var p = g.player.body;
        if (g.player.playerName && (g.vx != p.velocity.x || g.vy != p.velocity.y)) {
            // Already logged in and my Velocity changed.
            // Inform the server.
            g.vx  = p.velocity.x;
            g.vy  = p.velocity.y;
            this.game.ws.server.updatePlayer({ x: p.position.x, y: p.position.y, vx: g.vx, vy: g.vy });
        }
    };

    return fn;
})();
