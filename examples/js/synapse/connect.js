var __slice = Array.prototype.slice;

define(function() {
  var cache, connect, connectOne, defaultConnectOptions, publish, subscribe, unsubscribe;
  cache = {};
  publish = function() {
    var args, channel, sub, subscribers, _i, _len, _results;
    channel = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    subscribers = cache[channel] || [];
    _results = [];
    for (_i = 0, _len = subscribers.length; _i < _len; _i++) {
      sub = subscribers[_i];
      _results.push(sub.handler.apply(sub.context, args));
    }
    return _results;
  };
  subscribe = function(channel, handler, context) {
    var sub;
    if (!cache[channel]) cache[channel] = [];
    sub = {
      handler: handler,
      context: context || handler
    };
    cache[channel].push(sub);
    return [channel, sub];
  };
  unsubscribe = function(handle) {
    var i, sub, subscribers, _len, _results;
    if ((subscribers = cache[handle[0]])) {
      _results = [];
      for (sub = 0, _len = subscribers.length; sub < _len; sub++) {
        i = subscribers[sub];
        if (sub === handle[1]) {
          subscribers.splice(i, 1);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };
  defaultConnectOptions = {
    event: null,
    subjectInterface: null,
    observerInterface: null,
    converter: null,
    triggerOnBind: true
  };
  connectOne = function(subject, observer, options) {
    var channel, converter, event, events, handler, observerInterface, subjectInterface, triggerOnBind, _i, _len;
    _.defaults(options, defaultConnectOptions);
    if ((converter = options.converter) && !_.isFunction(converter)) {
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
    if (!_.isArray(events)) events = [events];
    triggerOnBind = options.triggerOnBind;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      if (subjectInterface) {
        channel = "" + subject.guid + ":" + subjectInterface;
      } else {
        channel = "" + subject.guid + ":" + event;
      }
      observer.channels.push(channel);
      subscribe(channel, function(value) {
        if (converter) value = converter(value);
        return observer.set(observerInterface, value);
      });
      handler = function(event) {
        var value;
        value = subject.get(subjectInterface);
        return publish(channel, value);
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
    if (_.isFunction(arg0)) {
      options = {
        converter: arg0
      };
    } else if (_.isArray(arg0) || !_.isObject(arg0)) {
      options = {
        subjectInterface: arg0,
        observerInterface: arg1
      };
    }
    if (!_.isArray(options)) options = [options];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      opt = options[_i];
      connectOne(subject, observer, opt);
    }
  };
  return connect;
});
