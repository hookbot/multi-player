// EXAMPLE SYNTAX: this.game.webSocket = new App.WebSocket(this.game,App.WebSocketClientHooks);

// Export all Client callback routines here for the WebSocket Server to use.
// In order for the Server to run these callbacks, they must be defined here.
// For example:
// exports.FUNCTION_NAME = function (arg1, arg2) {
//   ...
//   return result;
// };
//
// and can be invoked from the Server:
// var f = connections[this.user.clientId].client.FUNCTION_NAME(arg1,arg2);
//
// The Server can (optionally) operate on the return result using the onReady
// hook, which will be executed once the result is sent back from the Client:
// f.onReady(function (result) {
//   console.log("Got result: FUNCTION_NAME(" + arg1 + ", " + arg2 + ") = " + result);
// });

// NOTE: You can use "game", but DO NOT try to use the "this" variable!

var App = App || {};

App.WebSocketClientHooks = (function () {
    "use strict";

    var fn = function (game) {
        this.game = game;
    };

    fn.prototype.setId = function(id) {
        console.log("Server assigned myID: " + id);
        game.global.myID = id;
        for (var c in game.global.mob) {
            // Clear out any old mobs before handshake() reloads them all back
            exports.unspawn(c);
        }
        game.global.eurecaServer.handshake();

        var p = game.global.player;
        if (p) {
            var name = p.playerName;
            if (name) {
                p.playerName = '';
                game.state.states.PlayGame.doLogin(name);
            }
        }
        else {
            // use arcade physics
            game.physics.startSystem(Phaser.Physics.ARCADE);

            game.state.start('PlayGame',false,false);
        }
    };

    fn.prototype.message = function(str) {
        console.log("<< " + str);
    };

    fn.prototype.spawn = function(username, x, y) {
        console.log("CREATE MOB [" + username + "] @ (" + x + "," + y + ")");
        game.global.mob = game.global.mob || {};
        game.global.mob[username] = game.add.existing(new App.Mob(game, username, x, y));
        return 1;
    };

    fn.prototype.unspawn = function(username) {
        if (game.global.mob[username]) {
            game.global.mob[username].usernameText.kill();
            game.global.mob[username].kill();
            console.log("DESTROY MOB [" + username + "] SUCCESS");
            delete game.global.mob[username];
        }
        else {
            console.log("DESTROY MOB [" + username + "] FAILED");
        }
        return 1;
    };

    fn.prototype.updateMob = function(username, args) {
        if (game.global.mob[username]) {
            var o = game.global.mob[username];
            o.x = args.x;
            o.y = args.y;
            o.body.velocity.x = args.vx;
            o.body.velocity.y = args.vy;
            o.update();
            console.log("UPDATE MOB [" + username + "] SUCCESS", args);
        }
        else {
            console.log("UPDATE MOB [" + username + "] FAILED");
        }
        return 1;
    };

    return fn;
})();

if (typeof(exports) !== 'undefined') {
    console.log("DEBUG: NodeJS Server side is loading Client methods");
    console.log("App",App);
    console.log("CLASS",App.WebSocketClientHooks);
    for (var method in App.WebSocketClientHooks.prototype) {
        exports[method] = function () { "dummy" };
    }
}
else {
    console.log("DEBUG: Phaser Client side is loading Client methods");
    var exports = exports || {};

    for (var method in App.WebSocketClientHooks.prototype) {
        exports[method] = App.WebSocketClientHooks.prototype[method];
    }
}
