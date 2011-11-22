COFFEE_DIR = ./src
EXAMPLES_DIR = ./examples
DIST_DIR = ./dist
BUILD_DIR = ./build
PID_FILE = .watch-pid

SASS_DIR = ./examples/scss
CSS_DIR = ./examples/css

COMPILE_SASS = `which sass` --scss --style=compressed ${SASS_DIR}:${CSS_DIR}
COMPILE_COFFEE = `which coffee` -b -o ${BUILD_DIR} -c ${COFFEE_DIR}
WATCH_COFFEE = `which coffee` -w -b -o ${BUILD_DIR} -c ${COFFEE_DIR}
REQUIRE_OPTIMIZE = `which node` bin/r.js -o build.js

LATEST_TAG = `git describe --tags \`git rev-list --tags --max-count=1\``

all: build watch

build: sass coffee
	@cp -r ${BUILD_DIR}/synapse* ${EXAMPLES_DIR}/js

dist: build optimize
	@echo 'Creating a source distributions...'

sass:
	@echo 'Compiling Sass...'
	@mkdir -p ${CSS_DIR}
	@${COMPILE_SASS} --update

coffee:
	@echo 'Compiling CoffeeScript...'
	@${COMPILE_COFFEE}

watch: unwatch
	@echo 'Watching in the background...'
	@${WATCH_COFFEE} &> /dev/null & echo $$! > ${PID_FILE}
	@${COMPILE_SASS} --watch &> /dev/null & echo $$! >> ${PID_FILE}

unwatch:
	@if [ -f ${PID_FILE} ]; then \
		echo 'Watchers stopped'; \
		for pid in `cat ${PID_FILE}`; do kill -9 $$pid; done; \
		rm ${PID_FILE}; \
	fi;

optimize: clean
	@echo 'Optimizing the javascript...'
	@mkdir -p ${DIST_DIR}
	@${REQUIRE_OPTIMIZE} > /dev/null

clean:
	@rm -rf ${DIST_DIR}

.PHONY: all sass coffee watch unwatch build optimize clean
