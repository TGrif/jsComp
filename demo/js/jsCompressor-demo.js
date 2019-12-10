/**
 * jsComp - Web Audio Compressor
 *
 * @author TGrif 2015 - MIT Licence
 * https://github.com/TGrif/jsComp
 * 
 */


var audioCtx = window.AudioContext || window.webkitAudioContext;
var Ctx = new audioCtx();

var jsComp = new Compressor(Ctx);



$(function() {


  $('<div>', { id: "jsComp" }).appendTo('body');


    /**  LED  **/
  
  $('<img>').switch({
    
    id: 'led',
    image: 'lib/jqskin/images/led_big_white_mod.png',
    
    left: 49,
    top: 5,
    width: 32,
    height: 32,
    
    clickable: false
    
  })
      .appendTo('#jsComp');


    /**  TOGGLE SWITCH  **/
  
  $('<img>').switch({
      
    id: 'sw',
    image: 'lib/jqskin/images/toggle_sw.png',
    
    left: 10,
    top: 31,
    width: 32,
    height: 32,
    
    clickable: true,
    
    click: function() {

      jsComp.switchPower()
      // jsComp.power = jsComp.power ? false : true;

      $(this).prop('title', (jsComp.power) ? 'power off' : 'power on');
      
      $('#led').switch("value", $(this).switch("value"));
      
      if (jsComp.power) {
        $('.small_knob_value').removeClass('powerOff');
        $('#curve').show();
      } else {
        $('.small_knob_value').addClass('powerOff');
        $('#curve').hide();
      }
        
    }
    
  })
      .prop('title', 'power on')
      .appendTo('#jsComp');


    /**  THRESHOLD KNOB  **/
     
  $('<img>').knob({
      
    id: 'threshold',
    image: 'lib/jqskin/images/knob_silver_big_mid.png',
    
    left: 18,
    top: 104,
    width: 60,
    height: 60,
    
    value: - jsComp.getThreshold(),
    
    change: function() {
      // console.log(jsComp.getThreshold())
      // console.log(jsComp.compressor.threshold.value)
      // let thresholdValue = jsComp.compressor.threshold.value;
      // thresholdHandler(thresholdValue);
      $('#threshold_value').html(jsComp.getThreshold() + ' dB');
      
      jsComp.setThreshold($(this).knob('value'));
      
    }
      
  })
      .prop('title', 'threshold')
      .appendTo('#jsComp');
  

  $('<div />', {
      id: 'threshold_value',
      class: 'small_knob_value powerOff',
      style: 'left: 54px; top: 165px;',
      html: '-' + $('#threshold').knob('value') + ' dB'
  })
      .appendTo('#jsComp');
  
  
    /**  RATIO KNOB  **/

  $('<img>').knob({
      
      id: 'ratio',
      image: 'lib/jqskin/images/knob_silver_big_mid.png',
      
      left: 18,
      top: 189,
      width: 60,
      height: 60,
      
      value: jsComp.ratioKnobValue(),
      
      change: function() {
          
        let ratioValue = jsComp.compressor.ratio.value;
        ratioHandler(ratioValue);
        $('#ratio_value').html(ratioValue);
        
        let ratioKnobValue = $(this).knob('value');
        jsComp.setRatio(ratioKnobValue);
        
      }
      
  })
      .prop('title', 'ratio')
      .appendTo('#jsComp');

  
  $('<div>', {
      id: 'ratio_value',
      class: 'small_knob_value powerOff',
      style: 'left: 58px; top: 249px;',
      html: jsComp.compressor.ratio.value
  })
      .appendTo('#jsComp');


    /**  MAKE UP KNOB  **/

  $('<img>').knob({
      
      id: 'reduction',
      image: 'lib/jqskin/images/knob_red_mid.png',
      
      left: 15,
      top: 308,
      width: 36,
      height: 36,
      
      // value: jsComp.makeUpKnobValue(),  //factorySettings.reduction,
      value: jsComp.factorySettings.reduction,
      
      change: function() {  // FIXME
        //https://www.w3.org/TR/webaudio/#computing-the-makeup-gain
        
        console.log(jsComp.compressor.reduction.value)
        // let makeupValue = jsComp.compressor.reduction.value.toFixed(2);
        // console.log(makeupValue)
        
        // makeupGainHandler(jsComp.makeUpKnobValue())
        // makeupGainHandler(makeupValue);
        // $('#reduction_value').html(makeupValue + ' dB');
        // 
        // let reduction = Math.round($(this).knob('value'));
        // jsComp.setMakeUp(reduction);
        
      }
      
  })
  
      .prop('title', 'make up')
      .appendTo('#jsComp');
  
  
  $('<div />', {
      id: 'reduction_value',
      class: 'small_knob_value powerOff',
      style: 'left: 50px; top: 328px;',
      html: $('#reduction').knob('value') + ' dB'
  })
      .appendTo('#jsComp');
  
  
    /**  KNEE KNOB  **/

  $('<img />').knob({
      
      id: 'knee',
      image: 'lib/jqskin/images/knob_silver_small.png',
      
      left: 15,
      top: 369,
      width: 20,
      height: 20,
      
      value: jsComp.factorySettings.knee,
      
      
      change: function() {
          
        var kneeValue = jsComp.compressor.knee.value;
        
        kneeHandler(kneeValue);
            
        var knee = Math.round($(this).knob('value'));
        jsComp.setKnee(knee);
        
        $('#knee_value').html(kneeValue + ' dB');
          
      }
          
  })
  
      .prop('title', 'knee')
      .appendTo('#jsComp');



  $('<div />', {
      id: 'knee_value',
      class: 'small_knob_value powerOff',
      style: 'left: 37px; top: 375px;',
      html: $('#knee').knob('value') + ' dB'
  })
      .appendTo('#jsComp');



    /**  ATTACK KNOB  **/
  
  
  $('<img />').knob({
      
      id: 'attack',
      image: 'lib/jqskin/images/knob_silver_small.png',
      
      left: 15,
      top: 389,
      width: 20,
      height: 20,
      
      value: jsComp.factorySettings.attack,
      
      change: function() {
        
        let attackKnobValue = $(this).knob('value')
        jsComp.setAttack(attackKnobValue);
    
        $('#attack_value').html(jsComp.getAttack()
                // jsComp.compressor.attack.value.toFixed(2)
            );
          
      }
      
  })
  
      .prop('title', 'attack')
      .appendTo('#jsComp');


  $('<div />', {
      id: 'attack_value',
      class: 'small_knob_value powerOff',
      style: 'left: 37px; top: 396px;',
      html: $('#attack').knob('value')
  })
      .appendTo('#jsComp');
  
  
    /**  RELEASE KNOB  **/
    
  
  $('<img />').knob({
      
      id: 'release',
      image: 'lib/jqskin/images/knob_silver_small.png',
      
      left: 15,
      top: 409,
      width: 20,
      height: 20,
      
      value: jsComp.factorySettings.release,
      
      change: function() {

        jsComp.setRelease(
                $(this).knob('value')
            );
        
        $('#release_value').html(
                jsComp.compressor.release.value.toFixed(2)
            );
          
      }
      
  })
  
      .prop('title', 'release')
      .appendTo('#jsComp');


  $('<div />', {
      id: 'release_value',
      class: 'small_knob_value powerOff',
      style: 'left: 37px; top: 416px;',
      html: $('#release').knob('value')
  })

      .appendTo('#jsComp');
  
     
  
    // $('<img/>', {
    // 
    //     id: 'curveBtn',
    //     src: 'img/wave.png',
    //     style: 'left: 25px; top: 446px;',
    //     title: "show wave form",
    // 
    //     click: function() {
    // 
    //       if (jsComp.power) $('#curve').toggle();
    //     }
    // })
    // 
    //     .appendTo('#jsComp');



      $('<div/>', {
          id: "jsCompSignature",
          class: 'signature',
          text: 'jsComp',
          style: 'left: 37px; top: 487px;'
      })

          .appendTo('#jsComp');


   });
 
 