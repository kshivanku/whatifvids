var userkeyword;
var valid_url = /.*www\.youtube\.com\/watch\?v=\w+.*/;

$(document).ready(function() {

    //USER IS TRYING TO LOAD A NEW VIDEO
    $("input").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            url = $("input").val();
            $('#urlForm')[0].reset();
            if(valid_url.test(url)) {
              var id_start = url.indexOf("=");
              var id = url.substring(id_start + 1, id_start + 12);
              $.get("/getClipsData/" + id, gotClipsData);
            }
            else {
                console.log("invalid url");
            }
        }
      });

        //USER IS TRYING TO MOVE TO VIEW DIFFERENT OBJECTS
        $('body').on('click', '#objectOptions ul li', function() {
            //Remove the entire video div and create a new one
            $('#videoSection').remove();
            var videoPlayerDiv = document.createElement("div");
            videoPlayerDiv.id = "videoSection";
            $('body').append(videoPlayerDiv);
            $('#mainVideo').trigger('pause');

            userkeyword = $(this).text();
            $.getJSON("concepts.json", function(data) {
                gotClipsData(data);
            });
        })
    });

    function gotClipsData(data) {
        console.log(data);
        showObjectOptions();
        var allTimeStampArray = data;
        var formattedTimeStampArray = formatTimeStamp(allTimeStampArray, userkeyword);
        var videoPath = '/videos/sourceVideos/1.mp4';
        if (formattedTimeStampArray) {
            playVideo(formattedTimeStampArray, videoPath);
        } else {
            console.log("query not present");
        }
    }

    function showObjectOptions() {
        $("#objectOptions ul").empty();
        $.getJSON("concepts.json", function(data) {
            var options = Object.keys(data);
            for (var i = 0; i < options.length; i++) {
                $("#objectOptions ul").append("<li>" + options[i] + "</li>")
            }
        });
    }

    function formatTimeStamp(allTimeStampArray, userkeyword) {
        console.log("inside formatTimeStamp function");
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
        var videoStartTime = null;
        var durationTime = null;

        var videoPlayer = document.createElement("video");
        videoPlayer.id = "mainVideo";
        videoPlayer.src = videoPath;
        videoPlayer.controls = true;
        videoPlayer.pause();
        videoPlayer.removeAttribute('autoplay');
        var videoDomElement = document.getElementById("videoSection");
        videoDomElement.appendChild(videoPlayer);

        moveVideo();

        videoPlayer.addEventListener('seeked', function() {
            videoPlayer.play();
        }, true);

        // videoPlayer.addEventListener('loadedmetadata', function() {
        //     console.log("inside loadedmetadata");
        //     moveVideo();
        // }, false);

        videoPlayer.addEventListener('timeupdate', function() {
            var playedTime = this.currentTime - videoStartTime;
            if (playedTime >= durationTime) {
                if (formattedTimeStampArrayRunTime.length > 0) {
                    moveVideo();
                } else {
                    videoPlayer.pause();
                    // formattedTimeStampArrayRunTime = formattedTimeStampArray.slice();
                    // moveVideo();
                }
            }
        });

        function moveVideo() {
            videoStartTime = formattedTimeStampArrayRunTime[0].startTime / 1000;
            durationTime = formattedTimeStampArrayRunTime[0].duration / 1000;
            formattedTimeStampArrayRunTime.splice(0, 1);
            videoPlayer.currentTime = videoStartTime;
        }
    }
