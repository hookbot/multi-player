#!/usr/bin/env node
"use strict";

//module dependencies.
var express = require("express");
var app     = express();
var path    = require("path");
var debug   = require("debug")("express:server");
var http    = require("http");
var api     = require("./api.js");

//get port from environment and store in Express.
var port = normalizePort(process.env.PORT || 8888);
app.set("port", port);

//setup static files
app.use("/src", express.static(path.join(__dirname, "../src")));
app.use("/assets", express.static(path.join(__dirname, "../assets")));
app.use("/vendor", express.static(path.join(__dirname, "../vendor")));

//api
app.get("/api/test", api.test);
app.post("/api/create", api.create);

//setup routing
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "../", "index.html"));
});

//create http server
var server = http.createServer(app);

//listen on provided ports
server.listen(port);

// Attach Eureca to express server
var Eureca = require('eureca.io');
var eurecaServer = new Eureca.Server({allow:['setId']});
eurecaServer.attach(server);

//add error handler
server.on("error", onError);

//start listening on port
server.on("listening", onListening);

var connections = {};

eurecaServer.onConnect(function (connection) {
    console.log('NEW Connection ', connection.id, connection.eureca.remoteAddress);
    var client = eurecaServer.getClient(connection.id);
    connections[connection.id] = { name:null, client:client };
    // Run client.exports.setId function
    client.setId(connection.id);
});

eurecaServer.onDisconnect(function (connection) {
    console.log('END Connection ', connection.id);
    delete connections[connection.id];
});

eurecaServer.exports.handshake = function() {
    var id = this.user.clientId;
    console.log('HANDSHAKE from Client ID ' + id);
};

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
}
