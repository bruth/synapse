SRC_DIR = src
BUILD_DIR = build
TEST_DIR = test
EXAMPLES_DIR = examples/js

MINIFIER = `which node` ${BUILD_DIR}/uglify.js --unsafe
COMPILER = `which coffee` -b -s -p

MODULES = ${SRC_DIR}/intro.coffee \
		  ${SRC_DIR}/core.coffee \
		  ${SRC_DIR}/events.coffee \
		  ${SRC_DIR}/handlers.coffee \
		  ${SRC_DIR}/interfaces.coffee \
		  ${SRC_DIR}/register.coffee \
		  ${SRC_DIR}/outro.coffee

BUILD_FILE = ${BUILD_DIR}/synapse.js
MINI_FILE = ${BUILD_DIR}/synapse.min.js

VERSION = $(shell cat VERSION)
DATE = $(shell git log -1 --pretty=format:%ad)

all: build minify

compile:
	@@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@VERSION/'"${VERSION}"'/' | \
		${COMPILER} > ${BUILD_FILE}

build: compile
	@@cp ${BUILD_FILE} ${EXAMPLES_DIR}
	@@cp ${BUILD_FILE} ${TEST_DIR}

minify: compile
	${MINIFIER} ${BUILD_FILE} > ${MINI_FILE}

clean:
	@@rm -f ${BUILD_FILE} \
		${MINI_FILE} \
		${TEST_DIR}/synapse.js \
		${EXAMPLES_DIR}/synapse.js

.PHONY: all compile build minify clean
