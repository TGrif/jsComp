 /**
  *  jsComp core
  *  
  *  @author TGrif 2015 - MIT Licence
  *  
  *  @requires AudioContext()
  */
 
 
 
    function Compressor(ctx) {


        var
        
                dynamicsCompressor = ctx.createDynamicsCompressor();
                
                
                    this.factorySettings = {
                        
                            threshold: -24,
                            ratio: 12,
                            reduction: 1,
                            attack: 0,
                            knee: 30,
                            release: 0.25
                            
                      };
        
        
        
            for (var prop in this.factorySettings) {
                if (this.factorySettings.hasOwnProperty(prop)) {
                    dynamicsCompressor[prop].value = this.factorySettings[prop];
                }
            }    

                
                
        this.compressor = dynamicsCompressor;
        
        
    };
 
 
 
 
 
 
            Compressor.prototype = {



                        /**
                         * @param {float} threshold     range(-60, 0)
                         */
                    
                    setThreshold: function(threshold) {            
                        this.compressor.threshold.value =
                                - Math.round((threshold * 60) / 100);            
                    },


                    thresholdKnobValue: function() {
                        return 100 / (60 / - this.factorySettings.threshold);
                    },



                        /**
                         * @param {float} ratio     range(1, 20)
                         */
                        
                    setRatio: function(ratio) {
                        this.compressor.ratio.value = 
                                (Math.round((ratio * 20) / 100) > 1)
                                    ? Math.round((ratio * 20) / 100)
                                        : 1;
                    },


                    ratioKnobValue: function() {
                        return 100 / (20 / this.factorySettings.ratio);
                    },



                        /**
                         * @param {float} makeUp     range(1, 24)
                         */

                    setMakeUp: function(makeUp) {                        
                        this.compressor.reduction.value =
                                (Math.round((makeUp * 24) / 100) > 1)
                                    ? Math.round((makeUp * 24) / 100)
                                        : 1;
                    },



                        /**
                         * @param {float} knee       range(0, 40)
                         */
                    
                    setKnee: function(knee) {
                        this.compressor.knee.value =
                                Math.round((knee * 40) / 100);
                    },



                        /**
                         * @param {float} attack    range(0, 1)
                         */
                        
                    setAttack: function(attack) {
                        this.compressor.attack.value =
                                (Math.round(attack) / 100).toFixed(2);            
                    },



                        /**
                         * @param {float} release   range(0, 1)
                         */
                    
                    setRelease: function(release) {                
                        this.compressor.release.value =
                                (Math.round(release) / 100).toFixed(2);
                    }





            };
          
    
 
