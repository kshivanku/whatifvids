var allTimeStampArray = {
  "concept1": [
    10000,
    11000,
    12000,
    13000,
    14000,
    15000,
    20000,
    21000,
    22000,
    40000,
    41000,
    42000,
    43000
  ],
  "concept2" : [
    1000,
    2000,
    3000
  ]
};

$(document).ready(function() {
    $("form").submit(function(event) {
        var userkeyword = $("input").val();
        // $.get("/getClipsData/" + userkeyword, gotClipsData);
        var formattedTimeStampArray = formatTimeStamp(userkeyword);
        console.log("Final formattedTimeStampArray: ");
        console.log(JSON.parse(JSON.stringify(formattedTimeStampArray)));
        var videoPath = '/videos/sourceVideos/avengers.mp4';
        playVideo(formattedTimeStampArray, videoPath);
        return false;
    })
})

function gotClipsData(data) {}

function formatTimeStamp(userkeyword) {
  var userRequestedTimestamp = allTimeStampArray[userkeyword];
  var formattedTSArray = [];
  var startTime = 0;
  var duration = 0;
  for(var i = 0 ; i < userRequestedTimestamp.length - 1 ; i++) {
    if(userRequestedTimestamp[i + 1] - userRequestedTimestamp[i] != 1000) {
      duration = userRequestedTimestamp[i] - startTime;
      formattedTSArray.push({"startTime": startTime, "duration": duration});
      startTime = 0;
      duration = 0;
    }
    else {
      if(startTime == 0) {
        startTime = userRequestedTimestamp[i];
      }
    }
    if(i == userRequestedTimestamp.length - 2) {
      duration = userRequestedTimestamp[i + 1] - startTime;
      formattedTSArray.push({"startTime": startTime, "duration": duration});
    }
  }
  return formattedTSArray;
}

function playVideo(formattedTimeStampArray, videoPath) {
    var videoStartTime;
    var durationTime;
    var videoPlayer = document.getElementById('mainVideo');
    var source = document.createElement('source');
    source.setAttribute('src', videoPath);
    videoPlayer.appendChild(source);
    
    videoPlayer.addEventListener("seeked", function() { videoPlayer.play(); }, true);

    videoPlayer.addEventListener('loadedmetadata', function() {
        videoStartTime = formattedTimeStampArray[0].startTime / 1000;
        durationTime = formattedTimeStampArray[0].duration / 1000;
        formattedTimeStampArray.splice(0, 1);
        console.log(videoStartTime);
        videoPlayer.currentTime = videoStartTime;
    }, false);

    videoPlayer.addEventListener('timeupdate', function() {
        var playedTime = this.currentTime - videoStartTime;
        if (playedTime >= durationTime) {
            if(formattedTimeStampArray.length>0) {
              videoStartTime = formattedTimeStampArray[0].startTime / 1000;
              durationTime = formattedTimeStampArray[0].duration / 1000;
              formattedTimeStampArray.splice(0, 1);
              videoPlayer.currentTime = videoStartTime;
            }
            else{
              this.pause();
              console.log("play over");
            }
        }
    });
}
