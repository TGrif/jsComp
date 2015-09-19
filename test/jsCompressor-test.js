/**
 *  jsComp audio-test
 * 
 * @author TGrif 2015 - MIT Licence
 * 
 *  @requires AudioContext()
 */ 
 
 
 
    var  



            source = Ctx.createBufferSource(),

            request = new XMLHttpRequest(),
            

                buffer,
                
                
                    sampleSound = 'test/audio/01_piste_01.ogg';
    
    
    
    
  
        request.open("GET", sampleSound, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            Ctx.decodeAudioData(request.response, function(buff) {                
                source.buffer = buff;
            }, function(err) {
                console.warn(err);
            });
            
        };  
        
            request.send();




  
    source.connect(jsComp.compressor);
    jsComp.compressor.connect(Ctx.destination);
       
       
        

        console.info('starting sound...');
    

    source.start(0);


