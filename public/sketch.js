var allTimeStampArray;
var userkeyword;

$(document).ready(function() {
    $("form").submit(function(event) {
        userkeyword = $("input").val();
        if (false) {
            $.get("/getClipsData/" + userkeyword, gotClipsData);
        } else {
            $.getJSON("concepts.json", function(json) {
                console.log(json);
                gotClipsData(json);
            });
        }
        return false;
    })
})

function gotClipsData(data) {
    console.log(data);
    allTimeStampArray = data;
    var formattedTimeStampArray = formatTimeStamp(userkeyword);
    var videoPath = '/videos/sourceVideos/avengers.mp4';
    if (formattedTimeStampArray) {
        playVideo(formattedTimeStampArray, videoPath);
    } else {
        console.log("query not present");
    }
}

function formatTimeStamp(userkeyword) {
    var userRequestedTimestamp = allTimeStampArray[userkeyword];
    var formattedTSArray = [];
    var startTime = 0;
    var duration = 0;
    if (userRequestedTimestamp) {
        for (var i = 0; i < userRequestedTimestamp.length - 1; i++) {
            if (userRequestedTimestamp[i + 1] - userRequestedTimestamp[i] != 1000) {
                duration = userRequestedTimestamp[i] - startTime;
                formattedTSArray.push({"startTime": startTime, "duration": duration});
                startTime = 0;
                duration = 0;
            } else {
                if (startTime == 0) {
                    startTime = userRequestedTimestamp[i];
                }
            }
            if (i == userRequestedTimestamp.length - 2) {
                duration = userRequestedTimestamp[i + 1] - startTime;
                formattedTSArray.push({"startTime": startTime, "duration": duration});
            }
        }
        return formattedTSArray;
    } else {
        return null
    }
}

function playVideo(formattedTimeStampArray, videoPath) {
    var formattedTimeStampArrayRunTime = formattedTimeStampArray.slice();
    var videoStartTime;
    var durationTime;
    var videoPlayer = document.getElementById('mainVideo');
    var source = document.createElement('source');
    source.setAttribute('src', videoPath);
    videoPlayer.appendChild(source);

    videoPlayer.addEventListener("seeked", function() {
        videoPlayer.play();
    }, true);

    videoPlayer.addEventListener('loadedmetadata', function() {
        moveVideo();
    }, false);

    videoPlayer.addEventListener('timeupdate', function() {
        var playedTime = this.currentTime - videoStartTime;
        if (playedTime >= durationTime) {
            if (formattedTimeStampArrayRunTime.length > 0) {
                moveVideo();
            } else {
                videoPlayer.pause();
                formattedTimeStampArrayRunTime = formattedTimeStampArray.slice();
                moveVideo();
                console.log("repeat");
            }
        }
    });
    function moveVideo(){
      videoStartTime = formattedTimeStampArrayRunTime[0].startTime / 1000;
      durationTime = formattedTimeStampArrayRunTime[0].duration / 1000;
      formattedTimeStampArrayRunTime.splice(0, 1);
      videoPlayer.currentTime = videoStartTime;
    }
}
