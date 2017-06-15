#!/usr/bin/env python
# -*- coding: utf-8 -*-

# https://luma-oled.readthedocs.io/en/latest/python-usage.html

from luma.core.interface.serial import i2c, spi
from luma.core.render import canvas
from luma.oled.device import ssd1306, ssd1325, ssd1331, sh1106
import os.path

# rev.1 users set port=0
# substitute spi(device=0, port=0) below if using that interface
serial = i2c(port=1, address=0x3C)

# substitute ssd1331(...) or sh1106(...) below if using that device
device = ssd1306(serial)

count = 0
status = "Idle"

while True:
	with canvas(device) as draw:
		draw.text((5, 5), "Stat: " + status, fill="white")
		draw.text((5, 15), "Temp: " + str(count) + " " + chr(176)+ "C", fill="white")
		draw.text((5, 25), "Flow: " + str(10000-count) + " s", fill="white")
		count+=1