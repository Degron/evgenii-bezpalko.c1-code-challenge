# FEATURE is an optional .feature file path to run. If not provided, will run all .feature files.

test:
	 node_modules/.bin/cucumber.js --fail-fast $(FEATURE)

start:
	node server/server.js