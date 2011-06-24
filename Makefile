watch:
	coffee -b -w -o ./js -c ./cs

build:
	cat ./cs/{interfaces,observing}.coffee | coffee -scb > ./js/kvo.js
	coffee -b -o ./js -c ./cs
