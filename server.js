var express = require("express");
var app = express();
var PORT = process.argv[2] || 8000;

app.use("/public",express.static(__dirname + "/public"));

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});
