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

    };

    fn.prototype.preload = function () {
        // Load images and json level files
        this.load.image('RPG_32', 'assets/images/RPGpack_sheet_32.png');
        this.load.tilemap('forest', 'assets/json/Forest.json', null, Phaser.Tilemap.TILED_JSON);
    };

    fn.prototype.create = function () {

        // Create a tilemap object and link it to the tileset in the json
        this.map = this.add.tilemap('forest');
        this.map.addTilesetImage('Kenny_terrain_32', 'RPG_32');

        // Create tile layers (must be named what they are named in the json
        this.backgroundLayer = this.map.createLayer('BackGround');
        this.collisionLayer = this.map.createLayer('Collisions');
        this.foregroundLayer = this.map.createLayer('ForeGround');

        this.game.world.sendToBack(this.backgroundLayer);

        // Turn on the collisions
        this.map.setCollisionBetween(1, 226, true, 'Collisions');

        // resize world to fit the layers
        this.backgroundLayer.resizeWorld();

    };

    fn.prototype.update = function () {

    };

    return fn;
})();
