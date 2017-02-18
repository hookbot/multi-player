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

var exports = exports || {};

// NOTE: You can use "game", but DO NOT try to use the "this" variable!

exports.setId = function(id) {
    console.log("Server assigned myID: " + id);
    game.global.myID = id;
    game.global.eurecaServer.handshake();

    var p = game.global.player;
    if (p) {
        var name = p.playerName;
        if (name) {
            p.playerName = '';
            App.PlayGameState.prototype.doLogin(name);
        }
    }
    else {
        // use arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.state.start('PlayGame');
    }
};

exports.message = function(str) {
    console.log("<< " + str);
};

exports.spawn = function(username, x, y) {
    console.log("PRE MOB",game.global.mob);
    console.log("CREATE MOB [" + username + "] @ (" + x + "," + y + ")");
    game.global.mob[username] = game.add.existing(new App.Mob(game, username, x, y));
    return 1;
};

exports.unspawn = function(username) {
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
