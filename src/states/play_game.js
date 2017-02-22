// namespace
var App = App || {};

App.PlayGameState = (function () {
    "use strict";

    console.log("PlayGameState Compiling ...");
    var fn = function (game) {
        console.log("PlayGameState.constructor Running...");
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        console.log("PlayGameState.init Running ...");
        this.game.asset_manager = new App.AssetManager(this.game);
    };

    fn.prototype.preload = function () {
        console.log("PlayGameState.preload Running ...");
        // load assets
        this.game.asset_manager.loadAssets();
    };

    fn.prototype.create = function () {
        console.log("PlayGameState.create Running ...");

        // init assets
        this.game.asset_manager.initAssets();

        // Clean up mob objects, if needed
        // XXX: This stupid hacking is needed because I can't figure out how to force the Objects to be good at the time the WebSocket is connected:
        for (var c in this.game.global.mob) {
            if (!this.game.global.mob[c].body) {
                // Found broken mob?
                console.log("[DEBUG] REPAIRING HORKED USER OBJECT",c);
                var mobx = this.game.global.mob[c].x;
                var moby = this.game.global.mob[c].y;
                // Wipe
                exports.unspawn(c);
                // Re-add fresh
                exports.spawn(c,mobx,moby);
            }
        }

        // our forest tilemap
        this.game.global.forest = this.game.asset_manager.get_tilemap('forest');

        this.game.world.sendToBack(this.game.global.forest.layers.backgroundLayer);

        // resize world to fit the layers
        this.game.global.forest.layers.backgroundLayer.resizeWorld();

        this.game.global.player = this.game.add.existing(new App.Player(this.game, 140, 160));
        this.game.world.bringToTop(this.game.global.forest.layers.foregroundLayerTop);
        this.key1 = game.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH);
        this.key1.onDown.add(fn.prototype.enterMessage, this);

        /*this.game.add.existing(new App.FlagGreenLeft(this.game, 0, 0));
        this.game.add.existing(new App.FlagGreenRight(this.game, 100, 0));
        this.game.add.existing(new App.FlagOrangeLeft(this.game, 200, 0));
        this.game.add.existing(new App.FlagOrangeRight(this.game, 300, 0));*/
    };

    fn.prototype.update = function () {

    };

    fn.prototype.doLogin = function (name) {
        var p = game.global.player;
        game.global.eurecaServer.login(name,p.body.position.x,p.body.position.y).onReady(function (result) {
            //console.log("[DEBUG] server.login(" + name + ") = " + result);
            if (result) {
                p.playerName = name;
                p.usernameText.text = name;
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
                // XXX: Should we require a password too?
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
