var userkeyword;

$(document).ready(function() {
    $("form").submit(function(event) {
        userkeyword = $("input").val();
        // $.get("/getClipsData/" + userkeyword, gotClipsData);
        return false;
    })
    var timeStampArray = [
        1000,
        2000,
        3000,
        4000,
        10000,
        11000,
        12000,
        13000,
        14000
    ];
    var videoPath = '/videos/sourceVideos/avengers.mp4';
    playVideo(timeStampArray, videoPath);
})

function gotClipsData(data) {}

function playVideo(timeStampArray, videoPath) {
    var videoStartTime;
    var durationTime;
    var video = document.getElementById('mainVideo');
    var source = document.createElement('source');
    source.setAttribute('src', videoPath);
    video.appendChild(source);

    video.addEventListener('loadedmetadata', function() {
        videoStartTime = 10;
        durationTime = 4;
        this.currentTime = videoStartTime;
    }, false);

    video.addEventListener('timeupdate', function() {
        var playedTime = this.currentTime - videoStartTime;
        if (playedTime >= durationTime)
            this.pause();
        }
    );
    video.play();
}
