/*
Copyright 2011, Google Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
    * Neither the name of Google Inc. nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Events
// init() once the page has finished loading.
window.onload = init;

var canvas;
var canvasContext;
var canvasWidth = 0;
var canvasHeight = 0;

var backgroundColor = "rgb(0, 0, 0)";
var curveColor = "rgb(192,192,192)";
var gridColor = "rgb(200,200,200)";
var thresholdColor = "rgb(100,200,100)";//"rgb(75,25,25)";

var sampleRate = 44100.0;
var nyquist = 0.5 * sampleRate;

var threshold = -24;
var knee = 30;
var ratio = 12;
var makeupGain = 0;



var kneeThreshold = 1; // computed at draw time
var kneeThresholdDb;

var maxOutputDb = 6;
var minOutputDb = -36;

function xpixelToDb(x) {
    // This is right even though it looks like we should scale by width.
    // We want the same pixel/dB scale for both.
    var k = x / canvas.height;
    var db = minOutputDb + k * (maxOutputDb - minOutputDb);
    return db;
}

function dBToXPixel(db) {
    var k = (db - minOutputDb) / (maxOutputDb - minOutputDb);
    var x = k * canvas.height;
    return x;
}

function ypixelToDb(y) {
    var k = y / canvas.height;
    var db = maxOutputDb - k * (maxOutputDb - minOutputDb);
    return db;
}

function dBToYPixel(db) {
    var k = (maxOutputDb - db) / (maxOutputDb - minOutputDb);
    var y = k * canvas.height;
    return y;
}

function decibelsToLinear(db) {
    return Math.pow(10.0, 0.05 * db);
}

function linearToDecibels(x) {
    return 20.0 * Math.log(x) / Math.LN10;
}


var m_ratio;
var m_slope;
var m_linearThreshold;
var m_thresholdDb;
var m_kneeDb;
var m_kneeThreshold;
var m_kneeThresholdDb;
var m_ykneeThresholdDb;    

// Approximate 1st derivative with input and output expressed in dB.
// This slope is equal to the inverse of the compression "ratio".
// In other words, a compression ratio of 20 would be a slope of 1/20.
function slopeAt(x, k) {
    if (x < m_linearThreshold)
        return 1;
        
    var x2 = x * 1.001;

    var xDb = linearToDecibels(x);
    var x2Db = linearToDecibels(x2);

    var yDb = linearToDecibels(saturateBasic(x, k));
    var y2Db = linearToDecibels(saturateBasic(x2, k));

    var m = (y2Db - yDb) / (x2Db - xDb);

    return m;
}

function kAtSlope(slope) {
    var xDb = m_thresholdDb + m_kneeDb;
    var x = decibelsToLinear(xDb);

    var minK = 0.1;
    var maxK = 10000;
    var k = 5;

    // Approximate.
    for (var i = 0; i < 15; ++i) {
        m = slopeAt(x, k);
        
        // console.log("slope = " + slope + " : m = " + m + " : k = " + k);

        if (m < slope) {
            // k is too high.
            maxK = k;
            k = Math.sqrt(minK * maxK);
        } else {
            // k is not high enough.
            minK = k;
            k = Math.sqrt(minK * maxK);
        }
    }

    return k;
}

// Exponential saturation curve.
function saturateBasic(x, k)
{
    if (x < m_linearThreshold)
        return x;
    
    return m_linearThreshold + (1 - Math.exp(-k * (x  - m_linearThreshold))) / k;
}

function saturate(x, k)
{
    var y;
    
    if (x < m_kneeThreshold) {
        y = saturateBasic(x, k);
    } else {
        var xDb = linearToDecibels(x);
        var yDb = m_ykneeThresholdDb + m_slope * (xDb - m_kneeThresholdDb);
    
        y = decibelsToLinear(yDb);
    }
    
    return y;
}


function drawCurve() {
    // Update curve state.
    var dbThreshold = threshold;
    var dbKnee = knee;
    var linearThreshold = decibelsToLinear(dbThreshold);
    var linearKnee = decibelsToLinear(dbKnee);
    
    m_linearThreshold = linearThreshold;
    m_thresholdDb = dbThreshold;
    m_kneeDb = dbKnee;


    // Makeup gain.
    var maximum = 1.05 * linearKnee * linearThreshold;

    // Compute knee threshold.
    m_ratio = ratio;
    m_slope = 1 / m_ratio;

    var k = kAtSlope(1 / m_ratio);
    // console.log("k = " + k);

    m_kneeThresholdDb = dbThreshold + knee;
    m_kneeThreshold = decibelsToLinear(m_kneeThresholdDb);
    
    m_ykneeThresholdDb = linearToDecibels(saturateBasic(m_kneeThreshold, k));

    
    
    
//    var info = document.getElementById("info");
    
    
    // draw center
    var width = canvas.width;
    var height = canvas.height;

    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(0, 0, width, height);

    // Draw linear response.
    canvasContext.strokeStyle = gridColor;
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    canvasContext.moveTo(dBToXPixel(minOutputDb), dBToYPixel(minOutputDb));
    canvasContext.lineTo(dBToXPixel(maxOutputDb), dBToYPixel(maxOutputDb));
    canvasContext.stroke();    

    // Draw 0dBFS output levels from 0dBFS down to -36dBFS
    for (var dbFS = 0; dbFS >= -36; dbFS -= 6) {
        canvasContext.beginPath();
        
        var y = dBToYPixel(dbFS);
        canvasContext.moveTo(0, y);
        canvasContext.lineTo(width, y);
        canvasContext.stroke();

        canvasContext.textAlign = "center";
        canvasContext.strokeText(dbFS.toFixed(0) + " dBFS", 25, y - 5);
    }
    
    // Draw 0dBFS input line
    canvasContext.beginPath();
    canvasContext.moveTo(dBToXPixel(0), 0);
    canvasContext.lineTo(dBToXPixel(0), height);
    canvasContext.stroke();

    // Draw threshold input line
    canvasContext.strokeStyle = thresholdColor;
    canvasContext.beginPath();
    canvasContext.moveTo(dBToXPixel(dbThreshold), 0);
    canvasContext.lineTo(dBToXPixel(dbThreshold), height);
    canvasContext.stroke();
    
    // Draw knee input line
    canvasContext.strokeStyle = thresholdColor;
    canvasContext.beginPath();
    canvasContext.moveTo(dBToXPixel(m_kneeThresholdDb), 0);
    canvasContext.lineTo(dBToXPixel(m_kneeThresholdDb), height);
    canvasContext.stroke();

    canvasContext.strokeStyle = curveColor;
    canvasContext.lineWidth = 3;

    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);

//    var pixelsPerDb = (0.5 * height) / 40.0;
    
//    var noctaves = 8;
        
    for (var x = 0; x < width; ++x) {
        var inputDb = xpixelToDb(x);
        var inputLinear = decibelsToLinear(inputDb);
        // var outputLinear = shape(inputLinear);
        var outputLinear = saturate(inputLinear, k);
        var outputDb = linearToDecibels(outputLinear);
        
        // Add makeup gain.
        outputDb += makeupGain;
        
        var y = dBToYPixel(outputDb);
                
        canvasContext.lineTo(x, y);
        
        // info.innerHTML += info.innerHTML + "<br>" + x + ", " + y;
    }
    canvasContext.stroke();    
}


    function thresholdHandler(/*event, ui*/value) {
      threshold = parseFloat(/*ui.value*/value);
    //  console.log(threshold);
      drawCurve();

//      var info = document.getElementById("threshold-value");
//      info.innerHTML = "threshold = " + threshold + " dB";
    }


    function kneeHandler(/*event, ui*/value) {
      knee = parseFloat(/*ui.*/value);
      drawCurve();

//      var info = document.getElementById("knee-value");
//      info.innerHTML = "knee = " + knee  + " dB";
    }


    function ratioHandler(/*event, ui*/value) {
      ratio = parseFloat(/*ui.*/value);
      drawCurve();

//      var info = document.getElementById("ratio-value");
//      info.innerHTML = "ratio = " + ratio;
    }


    function makeupGainHandler(/*event, ui*/value) {
      makeupGain = parseFloat(/*ui.*/value);
      drawCurve();

//      var info = document.getElementById("makeupGain-value");
//      info.innerHTML = "makeupGain = " + makeupGain  + " dB";
    }



function init() {
    canvas = document.getElementById('curve');
    canvasContext = canvas.getContext('2d');

    canvasWidth = parseFloat(window.getComputedStyle(canvas, null).width);
    canvasHeight = parseFloat(window.getComputedStyle(canvas, null).height);    
    
//    addSlider("threshold");
//    addSlider("knee");
//    addSlider("ratio");
//    addSlider("makeupGain");
//    configureSlider("threshold", threshold, -36.0, 0, thresholdHandler);
//    configureSlider("knee", knee, 0.0, 40.0, kneeHandler);
//    configureSlider("ratio", ratio, 1, 50, ratioHandler);
//    configureSlider("makeupGain", makeupGain, 0, 20, makeupGainHandler);
        
    drawCurve();
} 



//events.js

//function getElementCoordinates(element, event) {
//    var c = getAbsolutePosition(element);
//    c.x = event.x - c.x;
//    c.y = event.y - c.y;
//    
//    var position = c;
//    
//    // This isn't the best, should abstract better.
//    if (isNaN(c.y)) {
//        var eventInfo = {event:event, element:element};
//        position = getRelativeCoordinates(eventInfo);
//    }    
//    
//    return position;
//}

function getAbsolutePosition(element) {
  var r = { x: element.offsetLeft, y: element.offsetTop };
  if (element.offsetParent) {
    var tmp = getAbsolutePosition(element.offsetParent);
    r.x += tmp.x;
    r.y += tmp.y;
  }
  return r;
};


//function getRelativeCoordinates(eventInfo, opt_reference) {
//    var x, y;
//    var event = eventInfo.event;
//    var element = eventInfo.element;
//    var reference = opt_reference || eventInfo.element;
//    if (!window.opera && typeof event.offsetX != 'undefined') {
//      // Use offset coordinates and find common offsetParent
//      var pos = { x: event.offsetX, y: event.offsetY };
//      // Send the coordinates upwards through the offsetParent chain.
//      var e = element;
//      while (e) {
//        e.mouseX = pos.x;
//        e.mouseY = pos.y;
//        pos.x += e.offsetLeft;
//        pos.y += e.offsetTop;
//        e = e.offsetParent;
//      }
//      // Look for the coordinates starting from the reference element.
//      var e = reference;
//      var offset = { x: 0, y: 0 }
//      while (e) {
//        if (typeof e.mouseX != 'undefined') {
//          x = e.mouseX - offset.x;
//          y = e.mouseY - offset.y;
//          break;
//        }
//        offset.x += e.offsetLeft;
//        offset.y += e.offsetTop;
//        e = e.offsetParent;
//      }
//      // Reset stored coordinates
//      e = element;
//      while (e) {
//        e.mouseX = undefined;
//        e.mouseY = undefined;
//        e = e.offsetParent;
//      }
//    } else {
//      // Use absolute coordinates
//      var pos = getAbsolutePosition(reference);
//      x = event.pageX - pos.x;
//      y = event.pageY - pos.y;
//    }
//    // Subtract distance to middle
//    return { x: x, y: y };
//  };




//  function addSlider(name) {
//    var controls = document.getElementById("controls");
//
//    var divName = name + "Slider";
//
//
//    var sliderText = '<div style="width:500px; height:20px;"> <input id="' + divName + '" '
//     + 'type="range" min="0" max="1" step="0.01" value="0" style="height: 20px; width: 450px;"> <div id="'
//     + name
//     + '-value" style="position:relative; left:30em; top:-18px;">'
//     + name
//     + '</div> </div> <br>  ';
//
//    controls.innerHTML = controls.innerHTML + sliderText;
//  }


//  function configureSlider(name, value, min, max, handler) {
//      // var controls = document.getElementById("controls");
//      // 
//
//      var divName = name + "Slider";
//
//      var slider = document.getElementById(divName);
//
//      slider.min = min;
//      slider.max = max;
//      slider.value = value;
//      slider.onchange = function() { handler(0, this); };
//  }

//  function addSliderOld(name) {
//    var controls = document.getElementById("controls");
//
//    var divName = name + "Slider";
//
//    var sliderText = '<div id="' 
//     + divName
//     + '" style="width:500px;"> <div id="'
//     + name
//     + '-value" style="position:relative; left:30em;">'
//     + name
//     + '</div> </div> <br>  ';
//
//    controls.innerHTML = controls.innerHTML + sliderText;
//  }


//  function configureSliderOld(name, value, min, max, handler) {
//   var controls = document.getElementById("controls");
//
//   var divName = name + "Slider";
//
//   // var slider = document.getElementById(divName);
//   var slider = $("#" + divName);
//   // var slider = document.getElementById("#" + divName);
//   slider.slider({ min: min } );
//   slider.slider('option', 'max', max);
//   slider.slider('option', 'step', 0.001);
//   slider.slider('value', value);
//
//   slider.bind('slide', handler);
//  }
 
