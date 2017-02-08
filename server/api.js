var express = require('express');
var app = express();
var fb  = require("./firebaselogin.js");
var db  = fb.database();
var ref = db.ref();

exports.test = function(req, res) {
    ref.on("value", function(snapshot) {
        res.send(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
};

exports.create = function(req, res) {
    var username = req.query.username;
    var userRef = ref.child("user/"+username);
    userRef.set({
        date_of_birth: "Jan 24 1993",
        full_name: "Alan Turting"
    });
};
