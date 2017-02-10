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

        this.game.global.player = this.alienBlue = this.game.add.existing(new App.Player(this.game, 140, 160));
        this.game.world.bringToTop(this.forest.layers.foregroundLayerTop);
        this.key1 = game.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH);
        this.key1.onDown.add(fn.prototype.enterMessage, this);

        /*this.game.add.existing(new App.FlagGreenLeft(this.game, 0, 0));
        this.game.add.existing(new App.FlagGreenRight(this.game, 100, 0));
        this.game.add.existing(new App.FlagOrangeLeft(this.game, 200, 0));
        this.game.add.existing(new App.FlagOrangeRight(this.game, 300, 0));*/
    };

    fn.prototype.update = function () {
        this.game.physics.arcade.collide(this.game.global.player, this.forest.layers.collisionLayer);
    };

    fn.prototype.doLogin = function (name) {
        game.global.eurecaServer.login(name).onReady(function (result) {
            //console.log("[DEBUG] server.login(" + name + ") = " + result);
            if (result) {
                game.global.player.playerName = name;
                console.log("Logged in as: " + name);
            }
            else {
                console.log("FAILED TO LOGIN AS: " + name);
            }
        });
    };

    fn.prototype.doChat = function (message) {
        game.global.eurecaServer.chat(message).onReady(function (result) {
            //console.log("[DEBUG] server.chat(" + message + ") = " + result);
            if (!result) {
                console.log("Please /login before chatting.");
            }
        });
    };

    fn.prototype.enterMessage = function () {
        var defaultPrompt = this.game.global.player.playerName ? 'blah' : '/login ';
        var message = prompt("Type command or message", defaultPrompt);
        if (message) {
            var contents = message.split(" ");
            if (contents[0] == '/login') {
                fn.prototype.doLogin(contents[1]);
            }
            else if (contents[0] == '/tell') {
                var realMessage = message.replace(/^\/tell\s+(\S+)\s*(.+)/gi, '$1');
                console.log(this.game.global.player.playerName+" tells "+contents[1]+" the message '"+realMessage+"'");
                // Once Multiplayer is working, then pass the message to the other player's console
            }
            else if (contents[0] == '/logout') {
                this.game.global.player.playerName = '';
                console.log("You are now logged out");
            }
            else if (contents[0].substr(0,1) == '/') {
                console.log("Unknown command: " + contents[0]);
            }
            else {
                // Client is speaking. Send message to server.
                fn.prototype.doChat(message);
            }
        }
    }

    return fn;
})();
