 /**
  * jsComp - Web Audio Compressor
  *    [audio test]
  *     
  * https://github.com/TGrif/jsComp
  * 
  */ 
 $(function() {   // Add simple-audio-player
  
  var destination = Ctx.destination;
  
  audioPlayer(Ctx, destination);
  
  
  function audioPlayer(audioCtx, destination) {
    
    var source = audioCtx.createBufferSource();
    var blob = window.URL || window.webkitURL;
    var request = new XMLHttpRequest();

    document.getElementById('sound')
      .addEventListener('change', function (event) {

      var file = this.files[0];
      var data = blob.createObjectURL(file);
      // document.getElementById('audio').src = data;
      
      request.open("GET", data, true);
      request.responseType = 'arraybuffer';
      request.onload = function() {
        audioCtx.decodeAudioData(request.response, function (buff) {
          source.buffer = buff;
        }, function (err) {
          console.warn(err);
        })
        
      }

      request.send();

      source.connect(jsComp.compressor);
      jsComp.compressor.connect(destination);

      console.info('starting sound...');

      source.start(0);
      
    });
  }

})

