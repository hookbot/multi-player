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

        this.game.global = {};
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

        this.game.global.player = this.alienBlue = this.game.add.existing(new App.Player(this.game, 140, 160));
        this.game.world.bringToTop(this.forest.layers.foregroundLayer);
        this.key1 = game.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH);
        this.key1.onDown.add(enterMessage, this);

        /*this.game.add.existing(new App.FlagGreenLeft(this.game, 0, 0));
        this.game.add.existing(new App.FlagGreenRight(this.game, 100, 0));
        this.game.add.existing(new App.FlagOrangeLeft(this.game, 200, 0));
        this.game.add.existing(new App.FlagOrangeRight(this.game, 300, 0));*/
    };

    fn.prototype.update = function () {
        this.game.physics.arcade.collide(this.alienBlue, this.forest.layers.collisionLayer);
    };

    function enterMessage () {
        //console.log(this.game.global.eurecaClient);
        var defaultPrompt = this.alienBlue.playerName ? 'talk' : '/login';
        var message = prompt("Type command or message", defaultPrompt);
        if (message) {
            var contents = message.split(" ");
            if (contents[0] == '/login') {
                this.game.eurecaClient.
                this.alienBlue.playerName = contents[1];
                console.log("Logged in as "+this.alienBlue.playerName);
            }
            else if (contents[0] == '/tell') {
                var realMessage = message.replace(/^\/tell\s+(\S+)\s*(.+)/gi, '$1');
                console.log(this.alienBlue.playerName+" tells "+contents[1]+" the message '"+realMessage+"'");
                // Once Multiplayer is working, then pass the message to the other player's console
            }
            if (contents[0] == '/logout') {
                this.alienBlue.playerName = '';
                console.log("You are now logged out");
            }
        }
    }

    return fn;
})();
