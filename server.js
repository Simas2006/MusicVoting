var fs = require("fs");
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var PORT = process.argv[2] || 8000;
var songFile;
var songFileDirty = false;

app.use("/public",express.static(__dirname + "/public"));

io.on("connection",function(socket) {
  fs.readFile(__dirname + "/videos.json",function(err,data) {
    if ( err ) throw err;
    socket.emit("get-songs",JSON.parse(data.toString()));
  });
  socket.on("vote-song",function(id,magnitude) {
    if ( magnitude < -2 || magnitude > 2 ) return;
    if ( ! songFile[id] ) return;
    songFile[id].votes += magnitude;
    songFileDirty = true;
    socket.emit("get-songs",songFile);
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
