// Export all Server callback routines here for the WebSocket Client to use.
// In order for the client to run these callbacks, they must be defined here.
// For example:
// exports.FUNCTION_NAME = function (arg1, arg2) {
//   ...
//   return result;
// };
//
// and can be invoked from the Client:
// var f = game.global.eurecaServer.FUNCTION_NAME(arg1,arg2);
//
// The Client can (optionally) operate on the return result using the onReady
// hook, which will be executed once the result is sent back from the Server:
// f.onReady(function (result) {
//   console.log("Got result: FUNCTION_NAME(" + arg1 + ", " + arg2 + ") = " + result);
// });

var exports = exports || {};

var connections = {};

// The _internal methods can use "this" to access the main eurecaServer object
exports._internal = {};
exports._internal.onConnect = function (connection) {
    console.log('NEW Connection ', connection.id, connection.eureca.remoteAddress);
    var client = connection.clientProxy; //this.getClient(connection.id);
    //console.log("REAL CLIENT",client);
    connections[connection.id] = { name:null, client:client };
    // Run client.exports.setId function
    client.setId(connection.id);
    exports.broadcast('[DEBUG] NEW connection from [' + connection.eureca.remoteAddress.ip + ']');
};

exports._internal.onDisconnect = function (connection) {
    console.log('END Connection ', connection.id);
    var conn = connections[connection.id];
    console.log('[DEBUG] Ending obj',conn);
    var who = (conn && conn.name) ? conn.name : '[Never logged in]';
    var ip = connection.eureca.remoteAddress.ip;
    delete connections[connection.id];
    exports.broadcast('[DEBUG] END connection from [' + ip + '] ' + who);
};

// These other callbacks hooks can use "this" to access client Socket object.
// The this.user.clientId is always the key in the connections[] hash
// The this.connection.clientProxy object is the same as connections[this.user.clientId].client object
// which contains all the callback methods (defined in hooks.js) ready to execute on the client

exports.handshake = function() {
    var id = this.user.clientId;
    var conn = connections[id];
    if (conn) {
        var client = conn.client;
        client.message("[SYSTEM] Handshake complete!");
    }
    console.log('HANDSHAKE from Client ID ' + id);
};

exports.login = function(name) {
    var id = this.user.clientId;
    var conn = connections[id];
    if (conn) {
        var client = conn.client;
        if (name.match(/^\w+$/)) {
            console.log('Name smells fine: ' + name);
            conn.name = client.name = name;
            console.log('ClientID ' + id + ' logged in as: ' + name);
            client.message("[SYSTEM] You logged in as: " + name);
            exports.broadcast(name + ' just logged in');
            return 1;
        }
        console.log('ClientID ' + id + ' attempted to login with stank name: ' + name);
        client.message("[SYSTEM] Login name too stank: " + name);
    }
    else {
        console.log('ClientID ' + id + ' does not exist?');
    }
    return 0;
};

exports.broadcast = function(message) {
    console.log('<BC> ' + message);
    for (var c in connections) {
        connections[c].client.message(message);
    }
    return 1;
}

exports.chat = function(message) {
    var id = this.user.clientId;
    var conn = connections[id];
    if (conn) {
        var client = conn.client;
        if (client.name) {
            console.log('[' + id + '] ' + client.name + ' says: ' + message);
            exports.broadcast(client.name + " says: " + message);
            return 1;
        }
    }
    console.log('[ClientID ' + id + '] BLOCKED FROM SAYING: ' + message);
    return 0;
};
