var fb  = require("./firebaselogin.js");
var db  = fb.database();
var ref = db.ref();
var glob = require('glob');

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

exports.include = function(req, res) {
    if (req.query.files &&
        req.query.files.match(/^(?:src|vendor)\//) &&
        !req.query.files.match(/\.\./)) {
        glob(req.query.files, function( err, files ) {
            var html = '';
            for (var f in files) {
                var path = files[f];
                html = html + 'document.write(\'<script src="' + path + '"></script>\\n\');\n';
            }
            res.send(html);
        });
    }
    else {
        res.send("alert('Broken (files) input');");
    }
};
