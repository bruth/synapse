SRC_DIR = src
DIST_DIR = dist
TEST_DIR = test
EXAMPLES_DIR = examples/js

JQUERY_SM = ${SRC_DIR}/jquery
UNDERSCORE_SM = ${SRC_DIR}/underscore
BACKBONE_SM = ${SRC_DIR}/backbone

UGLIFY = `which node` build/uglify.js --unsafe
COMPILER = `which coffee` -b -s -p

MODULES = ${SRC_DIR}/intro.coffee \
		  ${SRC_DIR}/core.coffee \
		  ${SRC_DIR}/events.coffee \
		  ${SRC_DIR}/handlers.coffee \
		  ${SRC_DIR}/interfaces.coffee \
		  ${SRC_DIR}/register.coffee \
		  ${SRC_DIR}/outro.coffee

VERSION = $(shell cat VERSION)
DATE = $(shell git log -1 --pretty=format:%ad)

all: update_sm build minify

jquery:
	@@cd ${JQUERY_SM}
	@@cd ${JQUERY_SM} && make
	@@cp ${JQUERY_SM}/dist/jquery.js ${EXAMPLES_DIR}

underscore:
	@@cp ${UNDERSCORE_SM}/underscore.js ${EXAMPLES_DIR}

backbone:
	@@cp ${BACKBONE_SM}/backbone.js ${EXAMPLES_DIR}

compile:
	@@mkdir -p dist
	@@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@VERSION/'"${VERSION}"'/' | \
		${COMPILER} > ${DIST_DIR}/synapse.js

build: jquery backbone underscore compile
	@@cp ${DIST_DIR}/synapse.js ${EXAMPLES_DIR}

minify: compile
	${UGLIFY} ${DIST_DIR}/synapse.js > ${DIST_DIR}/synapse.min.js

update_sm:
	@@git submodule foreach "git pull \$$(git config remote.origin.url)"
	@@git submodule foreach "git checkout \$$(git describe --tags \$$(git rev-list --tags --max-count=1))"

clean:
	@@rm -rf ${DIST_DIR} \
		${EXAMPLES_DIR}/synapse.js \
		${EXAMPLES_DIR}/underscore.js \
		${EXAMPLES_DIR}/backbone.js \
		${EXAMPLES_DIR}/jquery.js


.PHONY: all compile build minify update_sm jquery underscore backbone clean
