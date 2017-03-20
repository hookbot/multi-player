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
app.get("/include", api.include);
app.get("/api/test", api.test);
app.post("/api/create", api.create);

//setup routing
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "../", "index.html"));
});

//favico
app.get('/favicon.ico', function(req, res) {
  res.sendFile(path.join(__dirname, "../", "favicon.ico"));
});

//create http server
var server = http.createServer(app);

//listen on provided ports
server.listen(port);

//add error handler
server.on("error", onError);

//start listening on port
server.on("listening", onListening);

require("../vendor/websocket.js").init({
    server: server,
    serverhooks: require("../server/websocket.js"), // server callbacks
});

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
