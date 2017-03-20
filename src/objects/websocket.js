// EXAMPLE SYNTAX: this.game.webSocket = new App.WebSocket(this.game,App.WebSocketClientHooks);

// Export all Client callback routines here for the WebSocket Server to use.
// In order for the Server to run these callbacks, they must be defined here.
// For example:
// fn.prototype.FUNCTION_NAME = function (arg1, arg2) {
//   ...
//   return result;
// };
//
// and can be invoked from the Server:
// connections[this.user.clientId].client.FUNCTION_NAME(arg1,arg2);
//
// The Client can (optionally) operate on the return result by passing any
// function as the last argument, which will be executed once the result
// is returned from the Client:
// connections[this.user.clientId].client.FUNCTION_NAME(arg1,arg2, function (result) {
//   console.log("Got result: FUNCTION_NAME(" + arg1 + ", " + arg2 + ") = " + result);
// });

// NOTE: You should use this.game to access the main Phaser object.

var App = App || {};

App.WebSocketClientHooks = (function () {
    "use strict";

    // constructor
    var fn = function (game) {
        this.game = game;
    };

    fn.prototype.setId = function(id) {
        console.log("Server assigned myID: " + id);
        this.game.global.myID = id;
        for (var c in this.game.global.mob) {
            // Clear out any old mobs before handshake() reloads them all back
            this.unspawn(c);
        }
        this.game.ws.server.handshake();

        var p = this.game.global.player;
        if (p) {
            var name = p.playerName;
            if (name) {
                // Client thought he was already logged in, so force logout
                p.playerName = '';
                // Then tell server to login again using the same name as before
                this.game.state.states.PlayGame.doLogin(name);
            }
        }
    };

    fn.prototype.message = function(str) {
        console.log("<< " + str);
    };

    fn.prototype.spawn = function(username, x, y) {
        console.log("CREATE MOB [" + username + "] @ (" + x + "," + y + ")");
        this.game.global.mob = this.game.global.mob || {};
        this.game.global.mob[username] = this.game.add.existing(new App.Mob(this.game, username, x, y));
        return 1;
    };

    fn.prototype.unspawn = function(username) {
        if (this.game.global.mob[username]) {
            this.game.global.mob[username].usernameText.kill();
            this.game.global.mob[username].kill();
            console.log("DESTROY MOB [" + username + "] SUCCESS");
            delete this.game.global.mob[username];
        }
        else {
            console.log("DESTROY MOB [" + username + "] FAILED");
        }
        return 1;
    };

    fn.prototype.updateMob = function(username, args) {
        if (this.game.global.mob[username]) {
            var o = this.game.global.mob[username];
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
    for (var method in App.WebSocketClientHooks.prototype) {
        exports[method] = function () { "dummy" };
    }
}
else {
    console.log("DEBUG: Phaser Client side is loading Client methods");
}
