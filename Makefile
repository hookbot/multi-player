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
	@[ ! -e /etc/centos-release ] || make INSTALL_CENTOS
	@uname -a | grep -vi darwin || make INSTALL_OSX
	@which npm || exit 1
	@sleep 2
	make $*

$(GULP):
	@which npm || (echo "Please install npm first!" && exit 1)
	@echo "Installing gulp ...";
	@which gulp || sudo npm install gulp -g

INSTALL_CENTOS:
	@echo Installing epel ...
	@[ -e /etc/yum.repos.d/epel.repo ] || sudo yum install epel-release
	@echo Installing nodejs ...
	@[ ! -e /etc/yum.repos.d/epel.repo ] || sudo yum install nodejs

INSTALL_OSX:
	@echo Installing brew ...
	@which brew || /usr/bin/ruby -e "$$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	@which brew || exit 1
	@echo Installing npm ...
	@which npm || brew install node
