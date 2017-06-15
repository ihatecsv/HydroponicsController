import zerorpc
import json

systemState = None

class HelloRPC(object):
	def testFunc(self, jsonString):
		systemState = json.loads(jsonString);
		print systemState['state']
		return "Excellent"

s = zerorpc.Server(HelloRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()