watch:
	coffee -b -w -o $(CURDIR)/src/js -c $(CURDIR)/src/cs

build:
	$(CURDIR)/bin/build.sh
