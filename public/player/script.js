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
    if ( initComplete ) player.loadVideoById(songObj.url,0);
    else createPlayer(songObj.url);
  });
}

function startMusic() {
  if ( initComplete ) return;
  if ( ! apiReady ) {
    alert("The YouTube API is not yet loaded. Please wait and try again.");
    return;
  }
  requestNextSong();
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
  socket = io("/player");
}

window.onload = setupHandlers;
