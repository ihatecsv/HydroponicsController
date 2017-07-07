var express = require('express');
var exec = require('child_process').exec;

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var pumpPin = 13;
var lampPin = 11;

var testMode = false;

if(testMode){
	var rpio = {};
	rpio.open = function(a, b, c, d){}
}else{
	var rpio = require('rpio');
}

var loop1;
var loop2;
var loop3;
var loop4;
var pumpControlLoop;
var lampControlLoop;

function getTime(){
	return new Date().getTime();
}

var currentState = {
	pumpLoop: false,
	lampLoop: false,
	pump: false,
	lamp: false,
	pumpDelay: 85000,
	pumpWaitDelay: 21600000,
	
	lampDelay: 57600000,
	lampWaitDelay: 28800000,
	
	pumpTime: 0,
	pumpWaitTime: 0,
	
	lampTime: 0,
	lampWaitTime: 0,
	
	time: 0
}

var setLamp = function(state){
	currentState.lamp = state;
	if(state){
		rpio.open(lampPin, rpio.OUTPUT, rpio.HIGH);
	}else{
		rpio.open(lampPin, rpio.OUTPUT, rpio.LOW);
	}
	updateState();
}

var setPump = function(state){
	currentState.pump = state;
	if(state){
		rpio.open(pumpPin, rpio.OUTPUT, rpio.HIGH);
	}else{
		rpio.open(pumpPin, rpio.OUTPUT, rpio.LOW);
	}
	updateState();
}

var setPumpLoop = function(state){
	currentState.pumpLoop = state;
	if(state){
		pumpControlLoop();
	}else{
		clearTimeout(loop1);
		clearTimeout(loop2);
	}
	updateState();
}

var setLampLoop = function(state){
	currentState.lampLoop = state;
	if(state){
		lampControlLoop();
	}else{
		clearTimeout(loop3);
		clearTimeout(loop4);
	}
	updateState();
}

var updatePumpTime = function(time){
	currentState.pumpTime = time;
	updateState();
}

var updatePumpWaitTime = function(time){
	currentState.pumpWaitTime = time;
	updateState();
}

var updateLampTime = function(time){
	currentState.lampTime = time;
	updateState();
}

var updateLampWaitTime = function(time){
	currentState.lampWaitTime = time;
	updateState();
}

var updateState = function(){
	currentState.time = getTime();
	io.sockets.emit('state', currentState);
}

rpio.open(lampPin, rpio.OUTPUT, rpio.LOW);
rpio.open(pumpPin, rpio.OUTPUT, rpio.LOW);

pumpControlLoop = function(){
	setPump(true);
	updatePumpTime(getTime());
	loop1 = setTimeout(function(){
		setPump(false);
		updatePumpWaitTime(getTime());
		loop2 = setTimeout(function(){
			pumpControlLoop();
		}, currentState.pumpWaitDelay);
	}, currentState.pumpDelay);
}

lampControlLoop = function(){
	setLamp(true);
	updateLampTime(getTime());
	loop3 = setTimeout(function(){
		setLamp(false);
		updateLampWaitTime(getTime());
		loop4 = setTimeout(function(){
			lampControlLoop();
		}, currentState.lampWaitDelay);
	}, currentState.lampDelay);
}

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/webcam', function(req, res, next) {
	exec("fswebcam /home/pi/HydroponicsController/public/img/webcam.jpg", function(err, stdout, stderr) {
		res.sendFile('/home/pi/HydroponicsController/public/img/webcam.jpg');
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', function(socket){
	updateState();
	socket.on('lamp', function(data){
		setLamp(data.state);
	});
	socket.on('pump', function(data){
		setPump(data.state);
	});
	socket.on('pumpLoop', function(data){
		setPumpLoop(data.state);
	});
	socket.on('lampLoop', function(data){
		setLampLoop(data.state);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});