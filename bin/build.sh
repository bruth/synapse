#!/bin/bash

BASEDIR=$(cd `dirname "$0"`/.. && pwd)
EXAMPLES="$BASEDIR/examples"

cat $BASEDIR/src/cs/{interfaces,observing}.coffee | coffee -scb > "$BASEDIR/examples/js/bkvo.js"
coffee -b -o "$BASEDIR/src/js" -c "$BASEDIR/src/cs"

find $BASEDIR/examples/* -type d -maxdepth 1 | while read dir
    do coffee -b -c "$dir"
done
coffee -b -o "$BASEDIR/src/js" -c "$BASEDIR/src/cs"
