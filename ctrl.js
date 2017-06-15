var http = require("http");

var getTime = function(){
	return Math.floor(new Date().getTime()/1000);
}

var systemState = {
	state: 0,
	sTime: getTime()
}

var updatePy = function(data){
	var options = {
	  hostname: 'localhost',
	  port: 80,
	  path: '/statusUpdate',
	  method: 'POST',
	  headers: {
		  'Content-Type': 'application/json',
	  }
	};
	var req = http.request(options, function(res) {
	  console.log('Status: ' + res.statusCode);
	  console.log('Headers: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (body) {
		console.log('Body: ' + body);
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	// write data to request body
	req.write(JSON.stringify(systemState));
	req.end();
}

var controlLoop = function(){
	setTimeout(function(){
		systemState.state = 1;
		updatePy();
		setTimeout(function(){
			systemState.state = 0;
			updatePy();
		}, 300000);
	}, 40000);
}