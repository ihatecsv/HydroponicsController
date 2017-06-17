var express = require('express');
var rpio = require('rpio');
var exec = require('child_process').exec;

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var pumpPin = 13;
var lampPin = 11;

var loop1;
var loop2;
var controlLoop;

function getTime(){
	return new Date().getTime();
}

var currentState = {
	loop: false,
	pump: false,
	lamp: false,
	floodDelay: 80000,
	waitDelay: 28800000,
	floodTime: 0,
	waitTime: 0,
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

var setLoop = function(state){
	currentState.loop = state;
	if(state){
		controlLoop();
	}else{
		clearTimeout(loop1);
		clearTimeout(loop2);
	}
	updateState();
}

var updateFloodTime = function(time){
	currentState.floodTime = time;
	updateState();
}

var updateWaitTime = function(time){
	currentState.waitTime = time;
	updateState();
}

var updateState = function(){
	currentState.time = getTime();
	io.sockets.emit('state', currentState);
}

rpio.open(lampPin, rpio.OUTPUT, rpio.LOW);
rpio.open(pumpPin, rpio.OUTPUT, rpio.LOW);

controlLoop = function(){
	setPump(true);
	updateFloodTime(getTime());
	loop1 = setTimeout(function(){
		setPump(false);
		updateWaitTime(getTime());
		loop2 = setTimeout(function(){
			controlLoop();
		}, currentState.waitDelay);
	}, currentState.floodDelay);
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
	socket.on('loop', function(data){
		setLoop(data.state);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});