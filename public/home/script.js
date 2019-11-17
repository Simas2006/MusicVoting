var socket,songs,voteTable,savedIDs;
var modMode = false;

function renderSongs(forceRedo) {
  var table = document.getElementById("votableSongs");
  while ( table.firstChild ) {
    table.removeChild(table.firstChild);
  }
  var ids;
  if ( ! savedIDs || forceRedo ) {
    var ids = Object.keys(songs);
    ids = ids.sort((a,b) => songs[a].votes != songs[b].votes ? songs[b].votes - songs[a].votes : Math.random() - 0.5);
    savedIDs = ids;
  } else {
    ids = savedIDs;
  }
  var lastLoginTime = parseInt(localStorage.getItem("lastLogin"));
  for ( var i = 0; i < ids.length; i++ ) {
    if ( lastLoginTime < songs[ids[i]].mostRecentReset ) {
      if ( voteTable[ids[i]] != 0 ) voteTable[ids[i]] = 0;
    }
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
    var reportButton = document.createElement("button");
    if ( ! modMode ) {
      reportButton.innerText = "⚑";
    } else {
      if ( songs[ids[i]].reports == 0 ) {
        reportButton.innerText = "⚑";
      } else {
        reportButton.innerText = "⚑ " + songs[ids[i]].reports;
        reportButton.style.color = "red";
      }
    }
    reportButton.className = "reportButton";
    reportButton["data-id"] = ids[i];
    reportButton.onclick = function() {
      if ( this["data-clicked"] ) return;
      if ( ! modMode ) {
        if ( confirm("Do you want to report this song as being inappropriate/containing explicit content?") ) {
          socket.emit("report-song",this["data-id"]);
          this.style.color = "red";
          this["data-clicked"] = true;
        }
      } else {
        var email = songs[this["data-id"]].email;
        var value = prompt("This song was submitted by " + email + "\nType 'unreport' to remove all reports from this song (This song good)\nType 'delete' to delete this song (This song bad)\nPress Cancel to cancel");
        if ( value == "unreport" ) {
          socket.emit("mod-action",localStorage.getItem("mod-code"),"unreport",this["data-id"]);
        } else if ( value == "delete" ) {
          socket.emit("mod-action",localStorage.getItem("mod-code"),"delete",this["data-id"]);
        }
      }
    }
    col2.appendChild(reportButton);
    row.appendChild(col2);
    var col3 = document.createElement("td");
    var link = document.createElement("a");
    link.innerText = songs[ids[i]].title;
    link.href = "https://youtube.com/watch?v=" + songs[ids[i]].url;
    link.target = "_blank";
    col3.appendChild(link);
    col3.appendChild(document.createElement("br"));
    var text = "";
    if ( songs[ids[i]].author ) text += "By " + songs[ids[i]].author + " ";
    if ( songs[ids[i]].recentlyPlayed ) text += "[Played last week!]"
    var sub = document.createElement("sub");
    sub.innerText = text;
    if ( songs[ids[i]].recentlyPlayed ) sub.style.color = "green";
    col3.appendChild(sub);
    row.appendChild(col3);
    var col4 = document.createElement("td");
    var playButton = document.createElement("a");
    playButton.className = "playButton";
    playButton.href = "https://youtube.com/watch?v=" + songs[ids[i]].url;
    playButton.target = "_blank";
    col4.appendChild(playButton);
    var sub = document.createElement("a");
    sub.innerText = "Watch on YouTube";
    sub.href = "https://youtube.com/watch?v=" + songs[ids[i]].url;
    sub.target = "_blank";
    col4.appendChild(sub);
    row.appendChild(col4);
    table.appendChild(row);
  }
  localStorage.setItem("lastLogin",new Date().getTime());
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
      renderSongs(true);
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
  if ( ! localStorage.getItem("lastLogin") ) localStorage.setItem("lastLogin",-1);
  voteTable = JSON.parse(localStorage.getItem("vote"));
  socket = io("/home");
  socket.on("get-songs",function(data,forceRedo) {
    songs = data;
    renderSongs(forceRedo);
  });
  if ( localStorage.getItem("mod-code") ) {
    socket.emit("check-mod-code",localStorage.getItem("mod-code"),function(result) {
      if ( result ) {
        modMode = true;
        renderSongs();
      }
    });
  }
}

window.onload = setupHandlers;
