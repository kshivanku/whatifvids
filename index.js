const Clarifai = require('clarifai');
var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = new Clarifai.App({apiKey: 'a049ebeb03bf4515a07e136c9a4e39cf'});

var secondsThreshold = 2;
var probabilityThreshold = 0.950;

fs.readFile("videos/sourceVideos/avengers.mp4", {
    encoding: 'base64'
}, function(err, data) {
    if (err) {
        throw err;
    }
    console.log("file converted to base64");
    var encodedVideo = {
        base64: data
    }
    app.models.predict(Clarifai.GENERAL_MODEL, encodedVideo, {video: true}).then(function(response) {
        console.log("inside predict");
        var res = JSON.stringify(response, null, 2);
        fs.writeFile('output.json', res, function() {
            console.log("response written");
        });
        var keyConcepts = findKeyConcepts(response);
        var chosenConcept = "window";
        makeWhatIfVideo(chosenConcept, keyConcepts);
    }, function(err) {
        console.log(err.data);
        var res = JSON.stringify(err.data, null, 2);
        fs.writeFile('error.json', res, function() {
            console.log("error written");
        });
    }).catch(function(err) {
        console.log("inside catch");
        console.log(err);
    })
});

function findKeyConcepts(rawInput) {

    //Finding all the keyConcepts
    var keyConcepts = {};
    var framesArray = rawInput.outputs[0].data.frames;
    for (var i = 0; i < framesArray.length; i++) {
        var frame_time_info = framesArray[i].frame_info.time;
        var conceptsArray = framesArray[i].data.concepts;
        for (var j = 0; j < conceptsArray.length; j++) {
            if(conceptsArray[j].value > probabilityThreshold){
              if(!(keyConcepts[conceptsArray[j].name])) {
                  keyConcepts[conceptsArray[j].name] = [];
              }
              keyConcepts[conceptsArray[j].name].push(frame_time_info);
            }
        }
    }

    //cleaning up the concepts, removing concepts that were detected for less than n seconds

    var keyConceptsNames= Object.keys(keyConcepts);
    for (var i = keyConceptsNames.length - 1 ; i >= 0 ; i--) {
      var conceptTimingArray = keyConcepts[keyConceptsNames[i]];
      if(conceptTimingArray.length > 2) {
        var indexPot = [];
        for (var j = conceptTimingArray.length - 1 ; j >= 1 ; j--) {
          if (conceptTimingArray[j] - conceptTimingArray[j - 1] == 1000) {
            indexPot.push(j);
          }else{
            if(indexPot.length < secondsThreshold) {
              keyConcepts[keyConceptsNames[i]].splice(j, indexPot.length + 1);
            }
            // else {
            //   console.log("Saving: " + keyConceptsNames[i] + " because indexPot length is " + indexPot.length + "\n" + indexPot);
            // }
            indexPot = [];
          }
          if(j == 1 && indexPot.length < secondsThreshold) {
            keyConcepts[keyConceptsNames[i]].splice(j-1, indexPot.length + 2);
          }
        }
      }
      if(conceptTimingArray.length < secondsThreshold) {
        delete keyConcepts[keyConceptsNames[i]];
      }
    }


    fs.writeFile('concepts.json', JSON.stringify(keyConcepts, null, 2), function(){
      console.log('concept written');
    });
    return keyConcepts;
}

function makeWhatIfVideo(chosenConcept, keyConcepts){
  if(keyConcepts[chosenConcept]){
    var timeStamps = keyConcepts[chosenConcept];
    for (var i = 0 ; i < timeStamps.length ; i++){
      ffmpeg('videos/sourceVideos/avengers.mp4')
       .setStartTime(msToTime(timeStamps[i]))
       .setDuration('1')
       .output('videos/sourceVideos/avengersCut' + i + '.mp4')

       .on('end', function(err) {
           if(!err)
           {
             console.log('conversion Done');
           }

       })
       .on('error', function(err){
           console.log('error: ', +err);

       }).run();
    }
  }
  else {
    console.log("chosen concept not in key concepts");
  }
}


function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}
