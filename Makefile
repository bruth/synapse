COFFEE_DIR = ./src
DOCS_DIR = ./docs
DIST_DIR = ./dist
BUILD_DIR = ./build
PID_FILE = .watch-pid

SASS_DIR = ./docs/scss
CSS_DIR = ./docs/css

all: build watch

build: sass coffee
	@cp -r ${BUILD_DIR}/synapse* ${DOCS_DIR}/js
	@`which node` bin/r.js -o build.js > /dev/null

dist: clean build optimize
	@echo 'Creating a source distributions...'

sass:
	@echo 'Compiling Sass...'
	@mkdir -p ${CSS_DIR}
	@`which sass` --scss --style=compressed ${SASS_DIR}:${CSS_DIR} -r ${SASS_DIR}/bourbon/lib/bourbon.rb --update

coffee:
	@echo 'Compiling CoffeeScript...'
	@`which coffee` -b -o ${BUILD_DIR} -c ${COFFEE_DIR}

watch: unwatch
	@echo 'Watching in the background...'
	@`which coffee` -w -b -o ${BUILD_DIR} -c ${COFFEE_DIR} &> /dev/null & echo $$! > ${PID_FILE}
	@`which sass` --scss --style=compressed ${SASS_DIR}:${CSS_DIR} \
		-r ${SASS_DIR}/bourbon/lib/bourbon.rb --watch &> /dev/null & echo $$! >> ${PID_FILE}

unwatch:
	@if [ -f ${PID_FILE} ]; then \
		echo 'Watchers stopped'; \
		for pid in `cat ${PID_FILE}`; do kill -9 $$pid; done; \
		rm ${PID_FILE}; \
	fi;

optimize:
	@echo 'Optimizing the javascript...'
	@mkdir -p ${DIST_DIR}
	@`which node` bin/r.js -o build-optimize.js > /dev/null

clean:
	@rm -rf ${DIST_DIR}

.PHONY: all sass coffee watch unwatch build optimize clean
