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
        this.game.assetManager.spawn(this.game.assetManager.assets.Config);
        // Connect to WebSocket server
        console.log("Connecting to WebSocket server...");
        this.game.ws = new App.WebSocket(this.game,App.WebSocketClientHooks);
    };

    fn.prototype.preload = function () {
        console.log("PlayGameState.preload Running ...");
    };

    fn.prototype.create = function () {
        console.log("PlayGameState.create Running ...");

        // our forest tilemap
        this.game.global.forest = this.game.assetManager.assets.tilemap.forest;

        this.game.world.sendToBack(this.game.global.forest.layers.BackGround);

        // resize world to fit the layers
        this.game.global.forest.layers.BackGround.resizeWorld();

        this.game.world.bringToTop(this.game.global.forest.layers.ForeGroundTop);
        this.key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH);
        this.key1.onDown.add(fn.prototype.enterMessage, this);

        /*this.game.add.existing(new App.FlagGreenLeft(this.game, 0, 0));
        this.game.add.existing(new App.FlagGreenRight(this.game, 100, 0));
        this.game.add.existing(new App.FlagOrangeLeft(this.game, 200, 0));
        this.game.add.existing(new App.FlagOrangeRight(this.game, 300, 0));*/
    };

    fn.prototype.update = function () {

    };

    fn.prototype.doLogin = function (name) {
        var p = this.game.global.player;
        this.game.ws.server.login(name,p.body.position.x,p.body.position.y, function (result) {
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
        this.game.ws.server.chat(message, function (result) {
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
                this.doLogin(contents[1]);
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
                this.doChat(message);
            }
        }
    }

    return fn;
})();
