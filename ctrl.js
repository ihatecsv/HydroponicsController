var rpio = require('rpio');

rpio.open(11, rpio.OUTPUT, rpio.LOW);
rpio.open(13, rpio.OUTPUT, rpio.LOW);

var getTime = function(){
	return Math.floor(new Date().getTime()/1000);
}

var controlLoop = function(){
	
	setTimeout(function(){
		rpio.write(11, rpio.HIGH);
		
		setTimeout(function(){
			rpio.write(11, rpio.LOW);
			controlLoop();
		}, 5000);
		
	}, 2000);
}

controlLoop();

//300000
//40000