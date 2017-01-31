// namespace
var App = App || {};

App.LoadingState = (function () {
    "use strict";

    var fn = function (game) {
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        // font loading
        this.are_fonts_loaded = false;

        //var loading_text = "Loading..."; # no need, loads to fast
        var loading_text = "";

        var text = this.add.text(0, 0, loading_text, {
            font: "Helvetica, Arial, Sans-Serif",
            fill: "#ffffff",
            fontSize: 48,
            boundsAlignH: "center",
            boundsAlignV: "middle"
        });

        text.setTextBounds(0,0,this.world.width,this.world.height);
    };

    fn.prototype.preload = function () {
        // load json configuration files
        this.load.json('assetsConfig', '/assets/json/assets.json');
        this.load.json('controlsConfig', '/assets/json/controls.json');
        this.load.json('mainMenuConfig', '/assets/json/main_menu.json');
        this.load.json('playerConfig', '/assets/json/player.json');
        this.load.json('botsConfig', '/assets/json/bots.json');

        // load web fonts
        WebFont.load({
            active: (function () {
                this.webfontloaded();
            }).bind(this),
            custom: {
                families: ['Exo2 SemiBold'],
                urls: ['assets/css/fonts.css']
            }
        });
    };

    fn.prototype.create = function () {
        // use p2 for ships
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.setImpactEvents(true);
        this.game.physics.p2.restitution = 0.8;

        // use arcade physics for weapons
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // setup collision manager for p2 physics collisions
        this.game.global.collision_manager = new App.CollisionManager(this.game);

        // setup player object
        this.game.global.player = new App.Player(this.game);
    };

    fn.prototype.webfontloaded = function () {
        this.are_fonts_loaded = true;
    };

    fn.prototype.update = function () {
        if (this.are_fonts_loaded) {
            //this.state.start('PlayMission');
        }
    };

    return fn;
})();
