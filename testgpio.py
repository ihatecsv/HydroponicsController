import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(17,GPIO.OUT)
GPIO.setup(27,GPIO.OUT)

while True:
	print "LED on"
	GPIO.output(17,GPIO.HIGH)
	GPIO.output(27,GPIO.LOW)
	time.sleep(1)
	print "LED off"
	GPIO.output(17,GPIO.LOW)
	GPIO.output(27,GPIO.HIGH)
	time.sleep(1)