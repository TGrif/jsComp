/**
 * jsComp - Web Audio Compressor
 * 
 * @author TGrif 2015 - MIT Licence
 * https://github.com/TGrif/jsComp
 * 
 */


function Compressor(audioCtx) {

  var dynamicsCompressor = audioCtx.createDynamicsCompressor();

  this.factorySettings = {
    threshold: -24,
    ratio: 12,
    reduction: 1,
    attack: 0,
    knee: 30,
    release: 0.25
  };

  for (var prop in this.factorySettings) {
    dynamicsCompressor[prop].value = this.factorySettings[prop];
  }

  this.compressor = dynamicsCompressor;
  // console.log(this.compressor.reduction) // TODO
  this.power = false;
  
}


Compressor.prototype = {

  switchPower: function() {
    this.power = !this.power;
  },
  
  
  /**
  * @param {float} threshold     range(-60, 0)
  */
  setThreshold: function (threshold) {  // TODO décalage à l'alumage avec le graphe
    thresholdValue = - Math.round((threshold * 60) / 100);
    this.compressor.threshold.value = thresholdValue;
    // console.log(this.compressor.threshold.value)
    thresholdHandler(thresholdValue);
  },

  getThreshold: function() {
    // return 100 / (60 / - this.factorySettings.threshold);
    // return 100 / (60 / - this.compressor.threshold.value);
    return this.compressor.threshold.value
  },


  /**
  * @param {float} ratio     range(1, 20)
  */
  setRatio: function (ratio) {
    this.compressor.ratio.value = Math.round((ratio * 20) / 100) > 1
      ? Math.round((ratio * 20) / 100)
      : 1;
  },


  ratioKnobValue: function() {
    return 100 / (20 / this.factorySettings.ratio);
  },


  /**
  * @param {float} makeUp     range(1, 24)  // TODO https://github.com/Theodeus/tuna/blob/master/tuna.js
  */
  setMakeUp: function (makeUp) {
    this.compressor.reduction.value = Math.round((makeUp * 24) / 100) > 1
      ? Math.round((makeUp * 24) / 100)
      : 1;
  },
  
  makeUpKnobValue: function() {
    return 100 / (20 / this.factorySettings.reduction);
  },


  /**
  * @param {float} knee       range(0, 40)
  */
  setKnee: function (knee) {
    this.compressor.knee.value = Math.round((knee * 40) / 100);
  },


  /**
  * @param {float} attack    range(0, 1)
  */
  setAttack: function (attack) {
    this.compressor.attack.value = (Math.round(attack) / 100).toFixed(2);
  },

  getAttack: function() {
    return jsComp.compressor.attack.value.toFixed(2)
  },


  /**
  * @param {float} release   range(0, 1)
  */
  setRelease: function (release) {
    this.compressor.release.value =	(Math.round(release) / 100).toFixed(2);
  }

}
