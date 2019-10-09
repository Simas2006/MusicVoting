var list = [
  "Hf1NDb_Hc60",
  "-zp6nLiqtHs",
  "OSs6xiXON4s",
  "Dkk9gvTmCXY"
];
var nextIndex = 0;

var player;
function onYouTubePlayerAPIReady() {
  player = new YT.Player('player', {
    width: '640',
    height: '390',
    videoId: list[nextIndex],
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
  nextIndex++;
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if ( event.data == YT.PlayerState.ENDED ) {
    player.loadVideoById(list[nextIndex],0);
    nextIndex++;
  }
}
