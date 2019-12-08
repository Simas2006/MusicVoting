var socket,player;
var apiReady = false;
var initComplete = false;

function createPlayer(firstSong) {
  player = new YT.Player('player', {
    width: "800",
    height: "488",
    videoId: firstSong,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
  initComplete = true;
}

function requestNextSong() {
  socket.emit("get-song",function(songObj) {
    if ( songObj ) {
      if ( initComplete ) player.loadVideoById(songObj.url,0);
      else createPlayer(songObj.url);
      document.getElementById("musicEnd").innerText = "";
    } else {
      document.getElementById("musicEnd").innerText = "No more songs to play!";
    }
  });
}

function startMusic() {
  if ( initComplete ) return;
  if ( ! apiReady ) {
    alert("The YouTube API is not yet loaded. Please wait and try again.");
    return;
  }
  socket.emit("clear-recently-flags",function() {
    requestNextSong();
  });
}

function processAllSongs() {
  if ( confirm("Are you sure you want to process all songs? (set all >= -3 to 0, delete all others)") ) {
    socket.emit("process-all-songs",function() {
      alert("All songs successfully processed.");
    });
  }
}

function onYouTubePlayerAPIReady() {
  apiReady = true;
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if ( event.data == YT.PlayerState.ENDED ) requestNextSong();
}

function setupHandlers() {
  if ( localStorage.getItem("mod-code") ) {
    var tempSocket = io("/player");
    tempSocket.emit("check-mod-code",localStorage.getItem("mod-code"),function(valid) {
      if ( valid ) socket = tempSocket;
      else alert("Failed to load the page. Please try again.");
    });
  } else {
    alert("Failed to load the page. Please try again.");
  }
}

window.onload = setupHandlers;
