// Export all Server callback routines here for the WebSocket Client to use.
// In order for the client to run these callbacks, they must be defined here.
// For example:
// exports.FUNCTION_NAME = function (arg1, arg2) {
//   ...
//   return result;
// };
//
// and can be invoked from the Client:
// game.global.ws.server.FUNCTION_NAME(arg1,arg2);
//
// The Client can (optionally) operate on the return result by passing any
// function as the last argument, which will be executed once the result
// is returned from the Server:
// game.global.ws.server.FUNCION_NAME(arg1,arg2, function(result){
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
    connections[connection.id] = { name:null, x:0, y:0, client:client };
    // Run game.ws.client.setId function
    client.setId(connection.id);
    exports.broadcast('[DEBUG] NEW connection from [' + connection.eureca.remoteAddress.ip + ']');
};

exports._internal.onDisconnect = function (connection) {
    console.log('END Connection ', connection.id);
    var conn = connections[connection.id];
    console.log('[DEBUG] Ending obj',conn);
    if (conn.name) {
        for (var c in connections) {
            if (c != connection.id) {
                connections[c].client.unspawn(conn.name);
            }
        }
    }
    var who = (conn && conn.name) ? conn.name : '[Never logged in]';
    var ip = connection.eureca.remoteAddress.ip;
    delete connections[connection.id];
    exports.broadcast('[DEBUG] END connection from [' + ip + '] ' + who);
};

// These other callbacks hooks can use "this" to access client Socket object.
// The this.user.clientId is always the key in the connections[] hash
// The this.connection.clientProxy object is the same as connections[this.user.clientId].client object
// which contains all the callback methods (defined in WebSocketClientClass) ready to execute on the client

exports.handshake = function() {
    var id = this.user.clientId;
    var conn = connections[id];
    if (conn) {
        var client = conn.client;
        for (var c in connections) {
            if (c != id) {
                var o = connections[c];
                if (o.name) {
                    client.spawn(o.name,o.x,o.y);
                }
            }
        }
        client.message("[SYSTEM] Handshake complete!");
    }
    console.log('HANDSHAKE from Client ID ' + id);
};

exports.login = function(name, x, y) {
    var id = this.user.clientId;
    var conn = connections[id];
    if (conn) {
        var client = conn.client;
        if (conn.name) {
            console.log('Player [' + conn.name + '] tried to login again as [' + name + ']?');
            client.message('[SYSTEM] Sorry! You are already logged in as ' + conn.name);
            return 0;
        }
        for (var c in connections) {
            if (c != id &&
                connections[c].name &&
                connections[c].name == name) {
                // This user is already online.
                // XXX: Should the old user get booted once we honor password authentication?
                console.log('Name [' + name + '] already used for Client ID [' + c + ']');
                client.message('[SYSTEM] User is already logged in: ' + name);
                return 0;
            }
        }
        if (name.match(/^\w+$/)) {
            console.log('Name smells fine: ' + name);
            conn.name = client.name = name;
            conn.x = x;
            conn.y = y;
            console.log('ClientID ' + id + ' logged in as: ' + name + ' @ (' + x + ',' + y + ')');
            client.message("[SYSTEM] You logged in as: " + name);
            exports.broadcast(name + ' just logged in');
            for (var c in connections) {
                if (c != id) {
                    connections[c].client.spawn(name, x, y);
                }
            }
            return 1;
        }
        console.log('ClientID ' + id + ' attempted to login with stank name: ' + name);
        client.message("[SYSTEM] Login name too stank: " + name);
        return 0;
    }
    else {
        console.log('ClientID ' + id + ' does not exist?');
        return 0;
    }
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

exports.updatePlayer = function(args) {
    var id = this.user.clientId;
    var conn = connections[id];
    console.log("ClientID", id, "updatePlayer", args);
    if (conn.name) {
        // Player is logged in so update coords in memory
        conn.x = args.x;
        conn.y = args.y;
        // Notify other clients of the move
        for (var c in connections) {
            if (c != id) {
                connections[c].client.updateMob(conn.name,args);
            }
        }
    }
};
