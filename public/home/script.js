var songs = [
  {
    "title": "Satisfied",
    "author": "Hamilton",
    "url": "Hf1NDb_Hc60",
    "votes": 20,
    "recentlyPlayed": true,
    "reports": 0
  },
  {
    "title": "Non-Stop",
    "author": "Hamilton",
    "url": "Hf1NDb_Hc60",
    "votes": 15,
    "recentlyPlayed": true,
    "reports": 0
  },
  {
    "title": "The World Was Wide Enough",
    "author": "Hamilton",
    "url": "Hf1NDb_Hc60",
    "votes": 10,
    "recentlyPlayed": true,
    "reports": 0
  },
  {
    "title": "You Need to Calm Down",
    "author": "Taylor Swift",
    "url": "Dkk9gvTmCXY",
    "votes": 5,
    "recentlyPlayed": true,
    "reports": 0
  }
];

function renderSongs() {
  var table = document.getElementById("votableSongs");
  for ( var i = 0; i < songs.length; i++ ) {
    var row = document.createElement("tr");
    var col1 = document.createElement("td");
    var upArrow = document.createElement("button");
    upArrow.className = "upArrow";
    col1.appendChild(upArrow);
    var voteIndicator = document.createElement("p");
    voteIndicator.className = "voteIndicator";
    voteIndicator.innerText = songs[i].votes;
    col1.appendChild(voteIndicator);
    var downArrow = document.createElement("button");
    downArrow.className = "downArrow";
    col1.appendChild(downArrow);
    row.appendChild(col1);
    var col2 = document.createElement("td");
    var link = document.createElement("a");
    link.innerText = songs[i].title;
    link.href = "https://youtube.com/watch?v=" + songs[i].url;
    link.target = "_blank";
    col2.appendChild(link);
    col2.appendChild(document.createElement("br"));
    var sub = document.createElement("sub");
    sub.innerText = "By " + songs[i].author;
    col2.appendChild(sub);
    row.appendChild(col2);
    var col3 = document.createElement("td");
    var playButton = document.createElement("a");
    playButton.className = "playButton";
    playButton.href = "https://youtube.com/watch?v=" + songs[i].url;
    playButton.target = "_blank";
    col3.appendChild(playButton);
    var sub = document.createElement("a");
    sub.innerText = "Watch on YouTube";
    sub.href = "https://youtube.com/watch?v=" + songs[i].url;
    sub.target = "_blank";
    col3.appendChild(sub);
    row.appendChild(col3);
    table.appendChild(row);
  }
}

window.onload = renderSongs;
