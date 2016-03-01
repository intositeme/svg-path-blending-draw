var _ = require ('lodash');
var chroma = require ('chroma-js');
var _pathColors = require ("./blend-path-colors");
var _count = 0;

var BlendSVGPath = function  (target, steps = 300, strokewidth = 18) {
	var _holder, _svg, _steps, _svgViewbox, _canvas, _ctx, _id, _scale, _timeline, _tweenSteps, _strokewidth;

	if (target == undefined || target == null ) {
		console.log('BlendSVGPath - target needs to be provided to work'); 
		return; 
	}
	_steps = steps;
	_strokewidth = strokewidth;
	/**
	 * Setup the Canvas elements
	 */

	if (target instanceof $ ) {
		// console.log('BlendSVGPath - target is jquery Object');
		_holder = target[0];
	} else {
		// console.log('BlendSVGPath - target is DOM Object'); 
		_holder = target;
	}

	_svg = target.getElementsByTagName('svg')[0];

	_canvas = document.createElement('canvas');
	_ctx = _canvas.getContext("2d");
	_id =  "blend-path-"+ _count;
	_canvas.id   = _id ;
	_count++; //increase global counter to keep IDs unique
	
	// process SVG Viewbox data to keep scaling accurate
	_svgViewbox = _svg.getAttribute('viewBox');
	_svgViewbox = _svgViewbox.split(/\s+|,/);

	var holder = $(_holder);
	_scale = $(_holder).width()/ Number(_svgViewbox[2])
	_canvas.width  = $(_holder).width();
	_canvas.height =$(_holder).height();
	holder.append(_canvas);

	// Setup Div position;
	var targetStyle = window.getComputedStyle(target, null);
	console.log('target.style.position' , targetStyle.position); 
	if (targetStyle.position != "fixed") {
		target.style.position = "relative";
	}
	
	_canvas.style.position = "absolute";
	_canvas.style.left = 0;
	_canvas.style.top = 0;

	// Parse Paths to draw & sort it by Index set in id
	var paths = _holder.querySelectorAll("svg > g");
	paths = _.sortBy(paths, "index", function (o) {
		o.index = parseInt( o.id.split("-")[1] );
		return o.index;
	});

	_timeline = new TimelineMax({repeat:0, delay:1, paused: true});
	_tweenSteps = [];
	for (var i = 0; i < paths.length; i++) {
		var tPath = paths[i];
		var tStepInfo = {time:0, lastTime: 0};
		_tweenSteps.push (tStepInfo);
		var tCharacter = tPath.attributes['data-alphabet'].nodeValue;
		var tColorInfo = _.find(_pathColors, {character:tCharacter } );
		var myColor = chroma.scale(tColorInfo.color).domain(tColorInfo.index);
		var tSvgPath = tPath.getElementsByTagName("path")[0];
		var tDuration = tSvgPath.getTotalLength() / 800;
		var tween = new TweenMax(tStepInfo, tDuration, {ease:Linear.linear, time:1, onUpdate:onDrawUpdate, onUpdateParams:[tSvgPath, tStepInfo, myColor]});
		_timeline.add(tween, "-=0" );
		// console.log('path character' , tPath.getElementsByTagName("path")[0] ); 
	}
	
	/**
	 * End of Setup
	 */
	
	function onDrawUpdate (svgPath, target, myColor) {
		// _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
		// 
		if (target.lastTime > target.time) return;
		var circSize = _strokewidth * _scale;
		var fullCirc = 2 * Math.PI;
		var pathLength = svgPath.getTotalLength();
		var currentPathTime = pathLength * target.time;
		var currentPoint = svgPath.getPointAtLength(currentPathTime);
		var timeDiff = target.time - target.lastTime;
		var stepsDiff = Math.round ( _steps * timeDiff );

	 	var goColor = myColor(target.time);

	 	for (var i =0; i< stepsDiff; i++) {
	 		var tStep = timeDiff * (i/stepsDiff) + target.lastTime;
			var tPathTime = pathLength * tStep;
	 		
	 		goColor = myColor(tStep);
			// console.log('inter up: ', tPathTime, target.time, target.lastTime); 
			var tPoint = svgPath.getPointAtLength(tPathTime);
			_ctx.fillStyle= goColor;
			_ctx.beginPath();
			_ctx.arc(tPoint.x * _scale, tPoint.y * _scale, circSize, 0, 2* fullCirc );
			_ctx.fill();
			// _ctx.stroke();
	 	} 
		_ctx.fillStyle= goColor;
		_ctx.beginPath();	
		_ctx.arc(currentPoint.x * _scale, currentPoint.y * _scale, circSize, 0, 2* fullCirc );
		_ctx.fill();

		target.lastTime = target.time;
	}

	// console.log('BlendSVGPath', paths); 
	// 
	
	/**
	 * Public APIs
	 */
	
	this.play = function () {
		_timeline.play();
	}
	this.progress = function (value) {
		_timeline.progress(value);
	}

	this.id = function () {
		return _id;
	}
	this.getSteps = function () {
		return _steps;
	}
}
module.exports = BlendSVGPath;