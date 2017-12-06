const Clarifai = require('clarifai');
const fs = require('fs');

const app = new Clarifai.App({
 apiKey: 'a709fc8346a34e34853d563efa31daea'
});

fs.readFile("videos/sourceVideos/avengers.mp4", {encoding: 'base64'}, function(err, data){
  if (err) {throw err;}
  console.log("file converted to base64");
  var encodedVideo = {
    base64: data
  }
  app.models.predict(Clarifai.GENERAL_MODEL, encodedVideo, {video:true})
  .then(function(response) {
      console.log("inside predict");
      var res = JSON.stringify(response, null, 2);
      fs.writeFile('output.json', res, function(){
        console.log("response written");
      });
    },
    function(err) {
      console.log(err.data);
      var res = JSON.stringify(err.data, null, 2);
      fs.writeFile('error.json', res, function(){
        console.log("error written");
      });
    }
  )
  .catch(function(err){
      console.log("inside catch");
      console.log(err);
    }
  )
});
