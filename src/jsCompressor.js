/**
 *  jsComp
 *    Web Audio Compressor
 *    
 * https://github.com/TGrif/jsComp
 */

 
 
    var
 
            audioCtx = window.AudioContext || window.webkitAudioContext,
                    
                Ctx = new audioCtx(),
        
        
                    jsComp = new Compressor(Ctx),
        
        
        
        power = false;





$(function() {



        jsElement('jsComp');
        


                $('<div/>', {
                    id: "jsComp"
                })
                
                    .appendTo('body');    
            




                /**  LED  **/
            
            
        $('<img />').switch({
            
                id: 'led',
                image: 'lib/jqskin/images/led_big_white_mod.png',
                
                left: topX + 49,
                top: topY + 5,
                width: 32,
                height: 32,
                
                clickable: false
                
                
          })
          
                  .appendTo('#jsComp');





                /**  TOGGLE SWITCH  **/
                  
            
        $('<img />').switch({
            
                id: 'sw',
                image: 'lib/jqskin/images/toggle_sw.png',
                
                left: topX + 10,
                top: topY + 31,
                width: 32,
                height: 32,
                
                clickable: true,
                
                
                    click: (function() {                    

                            power = (power) ? false : true;


                        $(this).prop('title', (power) ? 'power off' : 'power on');
                        
                        $('#led').switch("value", $(this).switch("value"));
                        
                        
                            if (power) {
                               $('.small_knob_value').removeClass('powerOff');
							   $('#curve').show();
                            } else {
                                $('.small_knob_value').addClass('powerOff');
								$('#curve').hide();
                            }                        
                        
                    })
                
          })
          
                .prop('title', 'power on')
              
                  .appendTo('#jsComp');

      
      
      
           
                /**  THRESHOLD KNOB  **/
                
           
        $('<img />').knob({
            
            id: 'threshold',
            image: 'lib/jqskin/images/knob_silver_big_mid.png',
            
            left: topX + 18,
            top: topY + 104,
            width: 60,
            height: 60,
            
            value: jsComp.thresholdKnobValue(),
            
            
                change: (function() {
                    
                    var thresholdValue = jsComp.compressor.threshold.value;
                    
                        
                            thresholdHandler(thresholdValue);
                    
                    
                        jsComp.setThreshold(
                                $(this).knob('value')
                            );
                        
                        $('#threshold_value').html(thresholdValue + ' dB');
                    
                })
            
        })
        
            .prop('title', 'threshold')
            
                .appendTo('#jsComp');
        
        

                        $('<div />', {
                            id: 'threshold_value',
                            class: 'small_knob_value powerOff',
                            style: 'left: ' + (topX + 54) + 'px; top: ' + (topY + 165) + 'px;',
                            html: '-' + $('#threshold').knob('value') + ' dB'
                        })

                            .appendTo('#jsComp');
        
        



                /**  RATIO KNOB  **/


        $('<img />').knob({            
            
            id: 'ratio',
            image: 'lib/jqskin/images/knob_silver_big_mid.png',
            
            left: topX + 18,
            top: topY + 189,
            width: 60,
            height: 60,
            
            value: jsComp.ratioKnobValue(),
            
            
                change: (function() {
                    
                    var ratioValue = jsComp.compressor.ratio.value;
                    
                    
                            ratioHandler(ratioValue);
                            
                        jsComp.setRatio(
                                $(this).knob('value')
                            );
                        
                        $('#ratio_value').html(ratioValue);
                    
                })
            
            
        })
        
            .prop('title', 'ratio')
    
                .appendTo('#jsComp');


                            
                        $('<div />', {
                            id: 'ratio_value',
                            class: 'small_knob_value powerOff',
                            style: 'left: ' + (topX + 58) + 'px; top: ' + (topY + 249) + 'px;',
                            html: jsComp.compressor.ratio.value
                        })

                            .appendTo('#jsComp');




                    /**  MAKE UP KNOB  **/
                

        $('<img />').knob({
            
            id: 'reduction',
            image: 'lib/jqskin/images/knob_red_mid.png',
            
            left: topX + 15,
            top: topY + 308,
            width: 36,
            height: 36,
            
            value: jsComp.factorySettings.reduction,
            
            
                change: (function() {
                    
                    var makeupValue = jsComp.compressor.reduction.value.toFixed(2);
                    
                    
                            makeupGainHandler(makeupValue);
                        
                        var reduction = Math.round($(this).knob('value'));                                    
                        jsComp.setMakeUp(reduction);
                        
                        $('#reduction_value').html(makeupValue + ' dB');
                    
                })
                
        })
        
            .prop('title', 'make up')
    
                .appendTo('#jsComp');
        
        
                            
                        $('<div />', {
                            id: 'reduction_value',
                            class: 'small_knob_value powerOff',
                            style: 'left: ' + (topX + 50) + 'px; top: ' + (topY + 328) + 'px;',
                            html: $('#reduction').knob('value') + ' dB'
                        })

                            .appendTo('#jsComp');                        
        
        
        
        
        
                    /**  KNEE KNOB  **/
                    

        $('<img />').knob({
            
            id: 'knee',            
            image: 'lib/jqskin/images/knob_silver_small.png',
            
            left: topX + 15,
            top: topY + 369,
            width: 20,
            height: 20,
            
            value: jsComp.factorySettings.knee,
            
            
                change: (function() {
                    
                    var kneeValue = jsComp.compressor.knee.value;
                    
                    
                            kneeHandler(kneeValue);
                        
                        
                        var knee = Math.round($(this).knob('value'));
                        jsComp.setKnee(knee);
                        
                        $('#knee_value').html(kneeValue + ' dB');
                    
                })
                
        })
        
            .prop('title', 'knee')
        
                .appendTo('#jsComp');


                            
                        $('<div />', {
                            id: 'knee_value',
                            class: 'small_knob_value powerOff',
                            style: 'left: ' + (topX + 37) + 'px; top: ' + (topY + 375) + 'px;',
                            html: $('#knee').knob('value') + ' dB'
                        })

                            .appendTo('#jsComp');





                    /**  ATTACK KNOB  **/
                    
                    
        $('<img />').knob({
            
            id: 'attack',
            image: 'lib/jqskin/images/knob_silver_small.png',
            
            left: topX + 15,
            top: topY + 389,
            width: 20,
            height: 20,
            
            value: jsComp.factorySettings.attack,
            
            
                change: (function() {
                    
                                    
                        jsComp.setAttack(
                                $(this).knob('value')
                            );
                    
                        $('#attack_value').html(
                                jsComp.compressor.attack.value.toFixed(2)
                            );
                    
                })
            
        })
        
            .prop('title', 'attack')
        
                .appendTo('#jsComp');
		


                        $('<div />', {
                            id: 'attack_value',
                            class: 'small_knob_value powerOff',
                            style: 'left: ' + (topX + 37) + 'px; top: ' + (topY + 396) + 'px;',
                            html: $('#attack').knob('value')
                        })

                            .appendTo('#jsComp');        
        
        
        

                    /**  RELEASE KNOB  **/
                    
        
        $('<img />').knob({
            
            id: 'release',
            image: 'lib/jqskin/images/knob_silver_small.png',
            
            left: topX + 15,
            top: topY + 409,
            width: 20,
            height: 20,
            
            value: jsComp.factorySettings.release,
            
                change: (function() {


                        jsComp.setRelease(
                                $(this).knob('value')
                            );
                        
                        $('#release_value').html(
                                jsComp.compressor.release.value.toFixed(2)
                            );
                    
                })
            
        })
        
            .prop('title', 'release')
    
                .appendTo('#jsComp');



                        $('<div />', {
                            id: 'release_value',
                            class: 'small_knob_value powerOff',
                            style: 'left: ' + (topX + 37) + 'px; top: ' + (topY + 416) + 'px;',
                            html: $('#release').knob('value')
                        })

                            .appendTo('#jsComp');        
        
           
        

            $('<img/>', {
                
                id: 'curveBtn',
                src: 'img/wave.png',
                style: 'left: ' + (topX + 25) + 'px; top: ' + (topY + 446) + 'px;',
                title: "show wave form",
                
                    click: function() {

                        if (power)
                            $('#curve').toggle();
                    }
            })
            
                .appendTo('#jsComp');



    
            $('<div/>', {
                id: "jsCompSignature",
                class: 'signature',
                text: 'jsComp',
                style: 'left: ' + (topX + 37) + 'px; top: ' + (topY + 487) + 'px;'
            })

                .appendTo('#jsComp');
    



   });
 
 
 