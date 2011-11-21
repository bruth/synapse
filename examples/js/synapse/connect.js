var __slice = Array.prototype.slice;

define(['synapse/core'], function(core) {
  var connect, connectOne, defaultConnectOptions;
  defaultConnectOptions = {
    event: null,
    subjectInterface: null,
    observerInterface: null,
    converter: null,
    triggerOnBind: true
  };
  connectOne = function(subject, observer, options) {
    var channel, converter, event, events, handler, key, observerInterface, subjectInterface, triggerOnBind, value, _i, _len;
    for (key in defaultConnectOptions) {
      value = defaultConnectOptions[key];
      if (!options[key]) options[key] = value;
    }
    if ((converter = options.converter) && core.getType(converter) !== 'function') {
      converter = observer.object[converter];
    }
    if (!(subjectInterface = options.subjectInterface)) {
      if (!(subjectInterface = subject.detectInterface() || observer.detectOtherInterface()) && !converter) {
        throw new Error("An interface for " + subject.type + " objects could not be detected");
      }
    }
    if (!(observerInterface = options.observerInterface)) {
      if (!(observerInterface = observer.detectInterface() || subject.detectOtherInterface())) {
        throw new Error("An interface for " + observer.type + " objects could not be detected");
      }
    }
    if (!(events = options.event)) events = subject.detectEvent(subjectInterface);
    if (core.getType(events) !== 'array') events = [events];
    triggerOnBind = options.triggerOnBind;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      if (subjectInterface) {
        channel = "" + subject.guid + ":" + subjectInterface;
      } else {
        channel = "" + subject.guid + ":" + event;
      }
      observer.channels.push(channel);
      core.subscribe(channel, function(value) {
        if (converter) value = converter(value);
        return observer.set(observerInterface, value);
      });
      handler = function(event) {
        value = subject.get(subjectInterface);
        return core.publish(channel, value);
      };
      subject.on(event, handler);
      if (triggerOnBind) handler();
    }
  };
  connect = function() {
    var arg0, arg1, args, observer, opt, options, subject, _i, _len;
    subject = arguments[0], observer = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    options = args;
    arg0 = args[0];
    arg1 = args[1];
    if (core.getType(arg0) === 'function') {
      options = {
        converter: arg0
      };
    } else if (core.getType(arg0) === 'array' || core.getType(arg0) !== 'object') {
      options = {
        subjectInterface: arg0,
        observerInterface: arg1
      };
    }
    if (core.getType(options) !== 'array') options = [options];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      opt = options[_i];
      connectOne(subject, observer, opt);
    }
  };
  return connect;
});
