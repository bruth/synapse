SRC_DIR = src
DIST_DIR = dist
EXAMPLES_DIR = examples/js
TEST_DIR = examples/test
PID_FILE = /tmp/synapse-watch

JQUERY_SM = ${SRC_DIR}/jquery
UNDERSCORE_SM = ${SRC_DIR}/underscore
BACKBONE_SM = ${SRC_DIR}/backbone
QUNIT_SM = ${SRC_DIR}/qunit

DOCCO = `which docco`
UGLIFY = `which node` build/uglify.js --unsafe
COMPILER = `which coffee` -b -s -p

MODULES = ${SRC_DIR}/intro.coffee \
		  ${SRC_DIR}/config.coffee \
		  ${SRC_DIR}/core.coffee \
		  ${SRC_DIR}/events.coffee \
		  ${SRC_DIR}/handlers.coffee \
		  ${SRC_DIR}/connect.coffee \
		  ${SRC_DIR}/interfaces.coffee \
		  ${SRC_DIR}/outro.coffee

VERSION = $(shell cat VERSION)
DATE = $(shell git log -1 --pretty=format:%ad)

LATEST_TAG = `git describe --tags \`git rev-list --tags --max-count=1\``

all: pull jquery underscore backbone qunit build uglify docs

jquery:
	@echo 'Updating jQuery...'
	@cd ${JQUERY_SM} && git checkout ${LATEST_TAG}
	@cd ${JQUERY_SM} && make
	@cp ${JQUERY_SM}/dist/jquery.js ${EXAMPLES_DIR}

underscore:
	@echo 'Updating Underscore...'
	@cd ${UNDERSCORE_SM} && git checkout ${LATEST_TAG}
	@cp ${UNDERSCORE_SM}/underscore.js ${EXAMPLES_DIR}

backbone:
	@echo 'Updating Backbone...'
	@cd ${BACKBONE_SM} && git checkout ${LATEST_TAG}
	@cp ${BACKBONE_SM}/backbone.js ${EXAMPLES_DIR}

qunit:
	@echo 'Updating QUnit...'
	@cp ${QUNIT_SM}/qunit/qunit.* ${TEST_DIR}

watch: unwatch
	@echo 'Watching in the background...'
	@${COMPILER} &> /dev/null & echo $$! > ${PID_FILE}

unwatch:
	@if [ -f ${PID_FILE} ]; then \
		echo 'Watchers stopped'; \
		for pid in `cat ${PID_FILE}`; do kill -9 $$pid; done; \
		rm ${PID_FILE}; \
	fi;

compile:
	@echo 'Compiling CoffeeScript...'
	@mkdir -p dist
	@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@VERSION/'"${VERSION}"'/' | \
		${COMPILER} > ${DIST_DIR}/synapse.js

build: compile
	@echo 'Building...'
	@cp ${DIST_DIR}/synapse.js ${EXAMPLES_DIR}

uglify: compile
	@echo 'Uglifying...'
	@${UGLIFY} ${DIST_DIR}/synapse.js > ${DIST_DIR}/synapse.min.js

docs:
	@echo 'Building docs...'
	@rm -rf docs
	@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@VERSION/'"${VERSION}"'/' > synapse.coffee
	@${DOCCO} synapse.coffee
	@rm synapse.coffee

pull:
	@echo 'Pulling latest of everything...'
	@git pull origin master
	@if [ -d .git ]; then \
		if git submodule status | grep -q -E '^-'; then \
			git submodule update --init --recursive; \
		else \
			git submodule update --init --recursive --merge; \
		fi; \
	fi;
	@git submodule foreach "git pull \$$(git config remote.origin.url)"	

clean:
	@rm -rf ${DIST_DIR} \
		${EXAMPLES_DIR}/synapse.js \
		${EXAMPLES_DIR}/underscore.js \
		${EXAMPLES_DIR}/backbone.js \
		${EXAMPLES_DIR}/jquery.js


.PHONY: all compile build uglify pull jquery underscore backbone qunit clean docs
