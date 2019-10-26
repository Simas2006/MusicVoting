var recentlyPlayed = [
  {
    "title": "Satisfied",
    "author": "Hamilton",
    "url": "Hf1NDb_Hc60",
    "votes": 0,
    "reports": 0
  },
  {
    "title": "Non-Stop",
    "author": "Hamilton",
    "url": "Hf1NDb_Hc60",
    "votes": 0,
    "reports": 0
  },
  {
    "title": "The World Was Wide Enough",
    "author": "Hamilton",
    "url": "Hf1NDb_Hc60",
    "votes": 0,
    "reports": 0
  },
  {
    "title": "You Need to Calm Down",
    "author": "Taylor Swift",
    "url": "Dkk9gvTmCXY",
    "votes": 0,
    "reports": 0
  }
];

function renderRecentlyPlayed() {
  var table = document.getElementById("recently-played");
  for ( var i = 0; i < recentlyPlayed.length; i++ ) {
    var row = document.createElement("tr");
    var col1 = document.createElement("td");
    var upArrow = document.createElement("button");
    upArrow.className = "upArrow checked";
    col1.appendChild(upArrow);
    var voteIndicator = document.createElement("p");
    voteIndicator.className = "voteIndicator";
    voteIndicator.innerText = recentlyPlayed[i].votes;
    col1.appendChild(voteIndicator);
    var downArrow = document.createElement("button");
    downArrow.className = "downArrow checked";
    col1.appendChild(downArrow);
    row.appendChild(col1);
    var col2 = document.createElement("td");
    var link = document.createElement("a");
    link.innerText = recentlyPlayed[i].title;
    link.href = "https://youtube.com/watch?v=" + recentlyPlayed[i].url;
    link.target = "_blank";
    col2.appendChild(link);
    col2.appendChild(document.createElement("br"));
    var sub = document.createElement("sub");
    sub.innerText = "By " + recentlyPlayed[i].author;
    col2.appendChild(sub);
    row.appendChild(col2);
    var col3 = document.createElement("td");
    var playButton = document.createElement("a");
    playButton.className = "playButton";
    playButton.href = "https://youtube.com/watch?v=" + recentlyPlayed[i].url;
    playButton.target = "_blank";
    col3.appendChild(playButton);
    var sub = document.createElement("a");
    sub.innerText = "Watch on YouTube";
    sub.href = "https://youtube.com/watch?v=" + recentlyPlayed[i].url;
    sub.target = "_blank";
    col3.appendChild(sub);
    row.appendChild(col3);
    table.appendChild(row);
  }
}

window.onload = renderRecentlyPlayed;
