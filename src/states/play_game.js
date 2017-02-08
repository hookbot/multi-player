// namespace
var App = App || {};

App.PlayGameState = (function () {
    "use strict";

    var fn = function (game) {
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        this.asset_manager = new App.AssetManager(this.game);
    };

    fn.prototype.preload = function () {
        // load assets
        this.asset_manager.loadAssets();
        this.game.load.spritesheet('alienBlue', 'assets/images/alienBlue_sheet.png', 66, 96);

    };

    fn.prototype.create = function () {
        // init assets
        this.asset_manager.initAssets();

        // our forest tilemap
        this.forest = this.asset_manager.get_tilemap('forest');

        this.game.world.sendToBack(this.forest.layers.backgroundLayer);

        // resize world to fit the layers
        this.forest.layers.backgroundLayer.resizeWorld();

        this.alienBlue = this.game.add.existing(new App.Player(this.game, 140, 160));
		this.game.world.bringToTop(this.forest.layers.foregroundLayer);

        /*this.game.add.existing(new App.FlagGreenLeft(this.game, 0, 0));
        this.game.add.existing(new App.FlagGreenRight(this.game, 100, 0));
        this.game.add.existing(new App.FlagOrangeLeft(this.game, 200, 0));
        this.game.add.existing(new App.FlagOrangeRight(this.game, 300, 0));*/
    };

    fn.prototype.update = function () {
		this.game.physics.arcade.collide(this.alienBlue, this.forest.layers.collisionLayer);

    };

    return fn;
})();
