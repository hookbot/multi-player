# multi-player

NPM = $(shell which npm || echo "npm")
GULP = $(shell which gulp || echo "gulp")

all: node_modules $(GULP)

start: gulpfile.js node_modules $(GULP)
	gulp </dev/null

stop:
	killall gulp

node_modules: package.json $(NPM)
	npm install

clean:
	rm -rf node_modules

$(NPM):
	@echo "Need to install npm!"
	@[ ! -e /etc/centos-release ] || [ -e /etc/yum.repos.d/epel.repo ] || sudo yum install epel-release
	@[ ! -e /etc/yum.repos.d/epel.repo ] || sudo yum install nodejs
	@which npm || exit 1
	@sleep 2
	make $*

$(GULP):
	@echo "Please run: npm install gulp -g"
	@exit 1
