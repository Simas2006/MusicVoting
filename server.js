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
});

function saveToFile() {
  console.log("Saving to file...");
  fs.writeFile(__dirname + "/videos.json",JSON.stringify(songFile),function(err) {
    if ( err ) throw err;
    songFileDirty = false;
  });
}

fs.readFile(__dirname + "/videos.json",function(err,data) {
  songFile = JSON.parse(data.toString());
});

process.on("SIGINT",function() {
  saveToFile();
  process.exit();
});

http.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  songFileDirty = true;
  setInterval(function() {
    if ( songFileDirty ) saveToFile();
  },600000);
});
