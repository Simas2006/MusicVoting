var fs = require("fs");
var crypto = require("crypto");
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var PORT = process.argv[2] || 8000;

var homeNsp = io.of("/home");
var playerNsp = io.of("/player");
var songFile;
var songFileDirty = false;

app.use("/public",express.static(__dirname + "/public"));

homeNsp.on("connection",function(socket) {
  socket.emit("get-songs",songFile);
  socket.on("vote-song",function(id,magnitude) {
    if ( magnitude < -2 || magnitude > 2 ) return;
    if ( ! songFile[id] ) return;
    songFile[id].votes += magnitude;
    songFileDirty = true;
    socket.emit("get-songs",songFile);
  });
  socket.on("submit-song",function(songObj,callback) {
    if ( songObj.url.length != 11 || ! /^[a-zA-Z0-9\-_]+$/.test(songObj.url) ) return;
    if ( ! /^[a-zA-Z]+@[a-z]+\.[a-z]{3}$/.test(songObj.email) ) return;
    if ( ! songObj.title ) return;
    fs.readFile(__dirname + "/email_domain.txt",function(err,emailDomain) {
      if ( err ) throw err;
      emailDomain = emailDomain.toString().trim();
      if ( ! songObj.email.endsWith(`@${emailDomain}`) ) {
        callback(false,"incorrect-email");
        return;
      }
      var id = crypto.randomBytes(16).toString("hex");
      songObj.votes = 1;
      songObj.reports = 0;
      songFile[id] = songObj;
      songFileDirty = true;
      callback(true,id,songFile);
    });
  });
});

playerNsp.on("connection",function(socket) {
  var ids = Object.keys(songFile).sort((a,b) => songFile[b].votes - songFile[a].votes);
  var nextSongIndex = 0;
  socket.on("get-song",function(callback) {
    while ( nextSongIndex < ids.length && songFile[ids[nextSongIndex]].reports ) {
      nextSongIndex++;
    }
    if ( nextSongIndex < ids.length ) {
      callback(songFile[ids[nextSongIndex++]]);
    } else {
      callback(null);
    }
  });
});

function saveToFile(callback) {
  console.log("Saving to file...");
  fs.writeFile(__dirname + "/videos.json",JSON.stringify(songFile),function(err) {
    if ( err ) throw err;
    songFileDirty = false;
    callback();
  });
}

fs.readFile(__dirname + "/videos.json",function(err,data) {
  if ( err ) throw err;
  songFile = JSON.parse(data.toString());
});

process.on("SIGINT",function() {
  saveToFile(function() {
    process.exit();
  });
});

http.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  songFileDirty = true;
  setInterval(function() {
    if ( songFileDirty ) saveToFile(Function.prototype);
  },600000);
});
