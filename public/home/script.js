var socket,songs,voteTable;

function renderSongs() {
  var table = document.getElementById("votableSongs");
  while ( table.firstChild ) {
    table.removeChild(table.firstChild);
  }
  var ids = Object.keys(songs);
  ids = ids.sort((a,b) => songs[b].votes - songs[a].votes);
  for ( var i = 0; i < ids.length; i++ ) {
    var row = document.createElement("tr");
    row.id = "song-" + ids[i];
    var col1 = document.createElement("td");
    var upArrow = document.createElement("button");
    upArrow.className = "upArrow";
    if ( voteTable[ids[i]] == 1 ) upArrow.classList.add("checked");
    upArrow["data-id"] = ids[i];
    upArrow.onclick = function() {
      voteSong(this["data-id"],1);
    }
    col1.appendChild(upArrow);
    var voteIndicator = document.createElement("p");
    voteIndicator.className = "voteIndicator";
    voteIndicator.innerText = songs[ids[i]].votes;
    col1.appendChild(voteIndicator);
    var downArrow = document.createElement("button");
    downArrow.className = "downArrow";
    if ( voteTable[ids[i]] == -1 ) downArrow.classList.add("checked");
    downArrow["data-id"] = ids[i];
    downArrow.onclick = function() {
      voteSong(this["data-id"],-1);
    }
    col1.appendChild(downArrow);
    row.appendChild(col1);
    var col2 = document.createElement("td");
    var link = document.createElement("a");
    link.innerText = songs[ids[i]].title;
    link.href = "https://youtube.com/watch?v=" + songs[ids[i]].url;
    link.target = "_blank";
    col2.appendChild(link);
    col2.appendChild(document.createElement("br"));
    if ( songs[ids[i]].author ) {
      var sub = document.createElement("sub");
      sub.innerText = "By " + songs[ids[i]].author;
      col2.appendChild(sub);
    }
    row.appendChild(col2);
    var col3 = document.createElement("td");
    var playButton = document.createElement("a");
    playButton.className = "playButton";
    playButton.href = "https://youtube.com/watch?v=" + songs[ids[i]].url;
    playButton.target = "_blank";
    col3.appendChild(playButton);
    var sub = document.createElement("a");
    sub.innerText = "Watch on YouTube";
    sub.href = "https://youtube.com/watch?v=" + songs[ids[i]].url;
    sub.target = "_blank";
    col3.appendChild(sub);
    row.appendChild(col3);
    table.appendChild(row);
  }
}

function voteSong(id,vote) {
  /* Based on this grid:
    Want on top, current on side
    |    | -1 |  0 | +1 |
    | -1 | +1 | XX | +2 |
    |  0 | -1 | XX | +1 |
    | +1 | -2 | XX | -1 |
  */
  var magnitudeTable = [
    [ 1, 0, 2],
    [-1, 0, 1],
    [-2, 0,-1]
  ];
  var currentVal = voteTable[id] || 0;
  var magnitude = magnitudeTable[currentVal + 1][vote + 1];
  if ( voteTable[id] != vote ) voteTable[id] = vote;
  else voteTable[id] = 0;
  localStorage.setItem("vote",JSON.stringify(voteTable));
  socket.emit("vote-song",id,magnitude);
}

function submitSong() {
  /*
    Valid URL forms:
    https://www.youtube.com/watch?v=XXXXXXXXXXX
    https://youtube.com/watch?v=XXXXXXXXXXX
    www.youtube.com/watch?v=XXXXXXXXXXX
    youtube.com/watch?v=XXXXXXXXXXX
    watch?v=XXXXXXXXXXX
    XXXXXXXXXXX
    X = (lowercase alpha) || (uppercase alpha) || (digits) || (-,_)
  */
  var songObj = {
    "title": document.getElementById("submitSongname").value,
    "author": document.getElementById("submitAuthor").value,
    "url": document.getElementById("submitURL").value,
    "email": document.getElementById("submitEmail").value
  }
  songObj.url = songObj.url
    .split("https://").join("")
    .split("www.").join("")
    .split("youtube.com/").join("")
    .split("watch?v=").join("");
  var badData = false;
  document.getElementById("submitURL").classList.remove("badData");
  document.getElementById("submitEmail").classList.remove("badData");
  document.getElementById("submitSongname").classList.remove("badData");
  document.getElementById("badDataInfo").innerText = "";
  if ( songObj.url.length != 11 || ! /^[a-zA-Z0-9\-_]+$/.test(songObj.url) ) {
    document.getElementById("submitURL").classList.add("badData");
    badData = true;
  }
  if ( ! /^[a-zA-Z]+@[a-z]+\.[a-z]{3}$/.test(songObj.email) ) {
    document.getElementById("submitEmail").classList.add("badData");
    badData = true;
  }
  if ( ! songObj.title ) {
    document.getElementById("submitSongname").classList.add("badData");
    badData = true;
  }
  if ( badData ) {
    document.getElementById("badDataInfo").innerText = "One or more things went wrong while trying to submit. Please fix the errors and try again.";
    return;
  }
  socket.emit("submit-song",songObj,function(success,id,newSongData) {
    if ( success ) {
      songs = newSongData;
      voteTable[id] = 1;
      localStorage.setItem("vote",JSON.stringify(voteTable));
      renderSongs();
      document.getElementById("song-" + id).scrollIntoView();
      document.getElementById("submitURL").value = "";
      document.getElementById("submitEmail").value = "";
      document.getElementById("submitSongname").value = "";
      document.getElementById("submitAuthor").value = "";
    } else {
      if ( id == "incorrect-email" ) {
        document.getElementById("submitEmail").classList.add("badData");
        document.getElementById("badDataInfo").innerText = "One or more things went wrong while trying to submit. Please fix the errors and try again.";
      }
    }
  });
}

function setupHandlers() {
  if ( ! localStorage.getItem("vote") ) localStorage.setItem("vote","{}");
  voteTable = JSON.parse(localStorage.getItem("vote"));
  socket = io("/home");
  socket.on("get-songs",function(data) {
    songs = data;
    renderSongs();
  });
}

window.onload = setupHandlers;
