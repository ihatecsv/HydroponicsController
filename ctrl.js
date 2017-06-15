var zerorpc = require("zerorpc");

var getTime = function(){
	return Math.floor(new Date().getTime()/1000);
}

var systemState = {
	state: 0,
	sTime: getTime()
}

var updatePy = function(data){
	client.invoke("testFunc", JSON.stringify(systemState), function(error, res, more) {
		console.log(res);
	});
}

var controlLoop = function(){
	systemState.state = 1;
	systemState.sTime = getTime();
	updatePy();
	console.log(systemState);
	setTimeout(function(){
		systemState.state = 0;
		systemState.sTime = getTime();
		updatePy();
		console.log(systemState);
		setTimeout(function(){
			controlLoop();
		}, 5000);
	}, 2000);
}

var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");

controlLoop();

//300000
//40000