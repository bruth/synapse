var __slice = Array.prototype.slice;

(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(root, exports, require('synapse/core'));
  } else if (typeof define === 'function' && define.amd) {
    return define('synapse/connect', ['synapse/core', 'exports'], function(core, exports) {
      return factory(root, exports, core);
    });
  } else {
    return root.SynapseConnect = factory(root, {}, root.SynapseCore);
  }
})(this, function(root, connect, core) {
  var connectOne, defaultConnectOptions, detectEvent, detectInterface, detectOtherInterface, offEvent, onEvent, triggerEvent;
  detectEvent = function() {
    var args, object, value, _ref;
    object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((value = (_ref = object.hook).detectEvent.apply(_ref, [object.raw].concat(__slice.call(args))))) {
      return value;
    }
    throw new Error("" + object.hook.typeName + " types do not support events");
  };
  onEvent = function() {
    var args, object, value, _base;
    object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((value = typeof (_base = object.hook).onEventHandler === "function" ? _base.onEventHandler.apply(_base, [object.raw].concat(__slice.call(args))) : void 0)) {
      return object;
    }
    throw new Error("" + object.hook.typeName + " types do not support events");
  };
  offEvent = function() {
    var args, object, value, _base;
    object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((value = typeof (_base = object.hook).offEventHandler === "function" ? _base.offEventHandler.apply(_base, [object.raw].concat(__slice.call(args))) : void 0)) {
      return object;
    }
    throw new Error("" + object.hook.typeName + " types do not support events");
  };
  triggerEvent = function() {
    var args, object, value, _base;
    object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((value = typeof (_base = object.hook).triggerEventHandler === "function" ? _base.triggerEventHandler.apply(_base, [object.raw].concat(__slice.call(args))) : void 0)) {
      return object;
    }
    throw new Error("" + object.hook.typeName + " types do not support events");
  };
  detectInterface = function(object) {
    var _base;
    return typeof (_base = object.hook).detectInterface === "function" ? _base.detectInterface(object.raw) : void 0;
  };
  detectOtherInterface = function(object) {
    var _base;
    return typeof (_base = object.hook).detectOtherInterface === "function" ? _base.detectOtherInterface(object.raw) : void 0;
  };
  defaultConnectOptions = {
    event: null,
    subjectInterface: null,
    observerInterface: null,
    converter: null,
    triggerOnBind: true
  };
  connectOne = function(subject, observer, options) {
    var channels, converter, event, events, handler, key, observerInterface, subjectInterface, triggerOnBind, value, _i, _len;
    for (key in defaultConnectOptions) {
      value = defaultConnectOptions[key];
      if (!options[key]) options[key] = value;
    }
    if ((converter = options.converter) && !core.isFunction(converter)) {
      converter = observer.object[converter];
    }
    if (!(subjectInterface = options.subjectInterface)) {
      if (!(subjectInterface = detectInterface(subject) || detectOtherInterface(observer)) && !converter) {
        throw new Error("An interface for " + subject.hook.typeName + " objects could not be detected");
      }
    }
    if (!(observerInterface = options.observerInterface)) {
      if (!(observerInterface = detectInterface(observer) || detectOtherInterface(subject))) {
        throw new Error("An interface for " + observer.hook.typeName + " objects could not be detected");
      }
    }
    if (!(events = options.event)) events = detectEvent(subject, subjectInterface);
    if (!core.isArray(events)) events = [events];
    triggerOnBind = options.triggerOnBind;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      handler = function() {
        if (observer._channels[subject.guid][observerInterface].open === true) {
          value = subject.get(subjectInterface);
          if (converter) value = converter(value);
          return observer.set(observerInterface, value);
        }
      };
      if (!(channels = observer._channels[subject.guid])) {
        channels = observer._channels[subject.guid] = {};
      }
      channels[observerInterface] = {
        open: true,
        event: event,
        subject: subject,
        observer: observer,
        subjectInterface: subjectInterface,
        handler: handler
      };
      onEvent(subject, event, handler);
      if (triggerOnBind) handler();
    }
  };
  connect = function() {
    var arg0, arg1, args, observer, opt, options, subject, _i, _len;
    subject = arguments[0], observer = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    options = args;
    arg0 = args[0];
    arg1 = args[1];
    if (core.isFunction(arg0)) {
      options = {
        converter: arg0
      };
    } else if (core.isArray(arg0) || !core.isObject(arg0)) {
      options = {
        subjectInterface: arg0,
        observerInterface: arg1
      };
    }
    if (!core.isArray(options)) options = [options];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      opt = options[_i];
      connectOne(subject, observer, opt);
    }
  };
  return connect;
});
