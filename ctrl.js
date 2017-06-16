var oled = require('oled-ssd1306-i2c');
var font = require('oled-font-5x7');
 
var opts = {
  width: 128, // screen width 
  height: 32, // screen height 
  address: 0x3C, // Pass I2C address of screen if it is not the default of 0x3C 
  device: '/dev/i2c-1', // Pass your i2c device here if it is not /dev/i2c-1 
  microview: false, // set to true if you have a microview display 
};
 
var disp = new oled(opts);

var getTime = function(){
	return Math.floor(new Date().getTime()/1000);
}

var systemState = {
	state: 0,
	sTime: getTime()
}

var updateScreen = function(data){
	disp.setCursor(5, 5);
	disp.writeString(font, 1, 'Cats and dogs are really cool animals, you know.', 1, true);
}

var controlLoop = function(){
	systemState.state = 1;
	systemState.sTime = getTime();
	updateScreen();
	console.log(systemState);
	setTimeout(function(){
		systemState.state = 0;
		systemState.sTime = getTime();
		updateScreen();
		console.log(systemState);
		setTimeout(function(){
			controlLoop();
		}, 5000);
	}, 2000);
}

controlLoop();

//300000
//40000