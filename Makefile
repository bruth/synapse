watch:
	coffee -b -w -o $(CURDIR)/src/js -c $(CURDIR)/src/cs

build:
	cat $(CURDIR)/src/cs/{interfaces,observing}.coffee | coffee -scb > $(CURDIR)/example/js/kvo.js
	coffee -b -o $(CURDIR)/src/js -c $(CURDIR)/src/cs
	coffee -b -o $(CURDIR)/example/js -c $(CURDIR)/example/cs
