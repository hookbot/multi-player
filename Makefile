# multi-player

all: node_modules

start: gulpfile.js
	gulp </dev/null

stop:
	killall gulp

node_modules: package.json
	npm install

clean:
	rm -rf node_modules
