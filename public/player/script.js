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
  if ( ! localStorage.getItem("temp-lock") ) {
    alert("Failed to load the page. Please try again.");
  } else {
    socket = io("/player");
  }
}

window.onload = setupHandlers;
