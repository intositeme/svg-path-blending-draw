window.$ = require ('jQuery');
var TweenMax = require ('gsap');


var canvas;
var canvasCtx;
var alphabetPath;
var alphabetTween = { time:0, lastTime:0 };
var steps = 600;
var color = ["#F16060", "#5C4B51", "#8CBEB2", "#F3B562", "#F16060", "#5C4B51", "#8CBEB2", "#F3B562", "#F16060"];
var colorStep = [0.1, 0.30, 0.6, 0.9];
var sizeScale = 1;
$(function () {
	alphabetPath = $(".alphabets #alphabet-a path")[0];
	console.log("init" , chroma);
 	createCanvas();
 	startDraw();
});
function createCanvas () {
	canvas = document.createElement('canvas');
	canvasCtx = canvas.getContext("2d");
	canvas.id     = "alphabets";
	var box = $(".alphabets svg")[0].getAttribute('viewBox');
	box = box.split(/\s+|,/);

	sizeScale = $(".alphabets").width()/ Number(box[2]);
	canvas.width  = $(".alphabets").width();
	canvas.height = $(".alphabets").height();
	$("div.alphabets").append(canvas);
	console.log( Number(box[2]), sizeScale , $(canvas).width(), $(canvas).height() );
}
function startDraw () {

	var myColor = chroma.scale(color)
    .domain(colorStep);
	var currentPoint = alphabetPath.getPointAtLength(0);
	//canvasCtx.moveTo(currentPoint.x, currentPoint.y);
	var grad= canvasCtx.createLinearGradient(0, 0, 150, 150);
	grad.addColorStop(0, "red");
	grad.addColorStop(1, "green");
	canvasCtx.strokeStyle = grad;
	canvasCtx.lineWidth = 1;
	canvasCtx.lineCap = "round";
	canvasCtx.lineJoin="round";
	canvasCtx.fillStyle= color[0];

	TweenMax.to(alphabetTween, 10, {ease:Cubic.easeInOut, delay:2, time:1, onUpdate:onDrawUpdate, onUpdateParams:[alphabetPath, alphabetTween, myColor] });

}
function onDrawUpdate (svgPath, target, myColor) {
	var circSize = 18 * sizeScale;
	var fullCirc = 2 * Math.PI;
	var pathLength = svgPath.getTotalLength();
	var currentPathTime = pathLength * target.time;
	var currentPoint = svgPath.getPointAtLength(currentPathTime);
	var timeDiff = target.time - target.lastTime;
	var stepsDiff = Math.round ( steps * timeDiff );
 	for (var i =0; i< stepsDiff; i++) {
 		var tStep = timeDiff * (i/stepsDiff) + target.lastTime;
		var tPathTime = pathLength * tStep;
 		
 		var goColor = myColor(tStep);
		// console.log('inter up: ', tPathTime, target.time, target.lastTime); 
		var tPoint = svgPath.getPointAtLength(tPathTime);

		
		canvasCtx.fillStyle= goColor;

		canvasCtx.beginPath();
		canvasCtx.arc(tPoint.x * sizeScale, tPoint.y * sizeScale, circSize, 0, 2* fullCirc );
		canvasCtx.fill();
		// canvasCtx.stroke();
 	} 
		// console.log('onDrawUpdate', stepsDiff, currentPoint, target.time, target.lastTime); 
	canvasCtx.beginPath();	
	canvasCtx.arc(currentPoint.x * sizeScale, currentPoint.y * sizeScale, circSize, 0, 2* fullCirc );
	canvasCtx.fill();
	

	target.lastTime = target.time;
}