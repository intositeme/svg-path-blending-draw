window.$ = require ('jQuery');
var TweenMax = require ('gsap');
var BlendSVGPath = require ("./modules/blend-path-svg");
var chroma = require('chroma-js');

var tempstuff = new BlendSVGPath(document.getElementById('mop'), 300, 10);
var tempstuff2 = new BlendSVGPath(document.getElementById('mop2'), 300, 10);
tempstuff.play();

var tWindow = $(window);
$(window).scroll(function() {
  var tS = tWindow.scrollTop();
  var scrollRatio = tS / ($(document).height() - tWindow.height());
  // console.log('scroll', scrollRatio); 
  tempstuff2.progress(scrollRatio);
});