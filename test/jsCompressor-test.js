 /**
  * jsComp - Web Audio Compressor
  *    [audio test]
  *     
  * https://github.com/TGrif/jsComp
  * 
  */ 
 
    var source = Ctx.createBufferSource();

    var request = new XMLHttpRequest();

    var sampleSound = 'test/audio/sample.ogg';
    
  
    request.open("GET", sampleSound, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        Ctx.decodeAudioData(request.response, function (buff) {
            source.buffer = buff;
        }, function (err) {
            console.warn(err);
        })
        
    }
    
    request.send();


    source.connect(jsComp.compressor);
    jsComp.compressor.connect(Ctx.destination);
    
    console.info('starting sound...');
    
    source.start(0);

