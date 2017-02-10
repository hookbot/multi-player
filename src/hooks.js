// Export all Client callback routines here for the WebSocket Server to use.

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
