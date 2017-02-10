// Export all Server callback routines here for the WebSocket Client to use.

var exports = exports || {};

// NOTE: You can use "this" to access the main eurecaServer object

var connections = {};

exports._internal = {};
exports._internal.onConnect = function (connection) {
    console.log('NEW Connection ', connection.id, connection.eureca.remoteAddress);
    var client = connection.clientProxy; //this.getClient(connection.id);
    //console.log("REAL CLIENT",client);
    connections[connection.id] = { name:null, client:client };
    // Run client.exports.setId function
    client.setId(connection.id);
};

exports._internal.onDisconnect = function (connection) {
    console.log('END Connection ', connection.id);
    delete connections[connection.id];
};

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
        client.name = name;
        console.log('ClientID ' + id + ' logged in as: ' + name);
        client.message("[SYSTEM] Logged in as: " + name);
        return 1;
    }
    else {
        console.log('ClientID ' + id + ' does not exist');
        return 0;
    }
};
