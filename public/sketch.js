var userkeyword;
var movieSelected = null;
var valid_url = /.*www\.youtube\.com\/watch\?v=\w+.*/;

$(document).ready(function() {

    //USER IS TRYING TO LOAD A NEW VIDEO
    $("input").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            url = $("input").val();
            $('#urlForm')[0].reset();
            if (valid_url.test(url)) {
                movieSelected = null;
                var id_start = url.indexOf("=");
                var id = url.substring(id_start + 1, id_start + 12);
                $.get("/getClipsData/" + id, gotClipsData);
            } else if (url.toLowerCase() == "fmf") {
                movieSelected = "fmf";
                $.get("/getClipsData/fmf", gotClipsData);
            } else if (url.toLowerCase() == "gwh") {
                movieSelected = "gwh";
                $.get("/getClipsData/gwh", gotClipsData);
            } else {
                console.log("video too large");
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

        userkeyword = $(this).text().split(' (')[0];
        console.log("userkeyword: " + userkeyword);
        if (movieSelected == 'fmf') {
            var fileName = 'allFMF.json';
        } else if (movieSelected == 'gwh') {
            var fileName = 'allGWH.json';
        } else {
            var fileName = 'concepts.json';
        }
        $.getJSON(fileName, function(data) {
            gotClipsData(data);
        });
    })
});

function gotClipsData(data) {
    console.log(data);
    showObjectOptions();
    var allTimeStampArray = data;
    var formattedTimeStampArray = formatTimeStamp(allTimeStampArray, userkeyword);
    if (movieSelected == 'fmf') {
        var videoPath = '/videos/sourceVideos/fmf.mp4';
    } else if (movieSelected == 'gwh') {
        var videoPath = '/videos/sourceVideos/gwh.mp4';
    } else {
        var videoPath = '/videos/sourceVideos/1.mp4';
    }
    if (formattedTimeStampArray) {
        playVideo(formattedTimeStampArray, videoPath);
    } else {
        console.log("query not present");
    }
}

function showObjectOptions() {
    console.log("in showObjectOptions");
    $("#objectOptions ul").empty();
    if (movieSelected == 'fmf') {
        var fileName = 'allFMF.json';
    } else if (movieSelected == 'gwh') {
        var fileName = 'allGWH.json';
    } else {
        var fileName = 'concepts.json';
    }
    $.getJSON(fileName, function(data) {
        var sortable = [];
        for (var concept in data) {
            sortable.push([concept, data[concept].length]);
        }
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        // var options = Object.keys(data);
        for (var i = 0; i < sortable.length; i++) {
            $("#objectOptions ul").append("<li>" + sortable[i][0] + ' (' + sortable[i][1] + ')' + "</li>")
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
