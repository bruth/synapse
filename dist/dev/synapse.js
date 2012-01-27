

(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(root, exports);
  } else if (typeof define === 'function' && define.amd) {
    return define('synapse/core', ['exports'], function(exports) {
      return factory(root, exports);
    });
  } else {
    return root.SynapseCore = factory(root, {});
  }
})(this, function(root, core) {
  var channels;
  channels = {};
  return {
    toString: Object.prototype.toString,
    getType: function(object) {
      return this.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    },
    isObject: function(object) {
      return this.getType(object) === 'Object';
    },
    isArray: function(object) {
      return this.getType(object) === 'Array';
    },
    isFunction: function(object) {
      return this.getType(object) === 'Function';
    },
    isString: function(object) {
      return this.getType(object) === 'String';
    },
    isBoolean: function(object) {
      return this.getType(object) === 'Boolean';
    }
  };
});

var __slice = Array.prototype.slice;

(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(root, exports, require('synapse/core'));
  } else if (typeof define === 'function' && define.amd) {
    return define('synapse', ['synapse/core', 'exports'], function(core, exports) {
      return factory(root, exports, core);
    });
  } else {
    return root.Synapse = factory(root, {}, root.SynapseCore);
  }
})(this, function(root, Synapse, core) {
  var connect, connectOne, defaultConnectOptions, detectEvent, detectInterface, detectOtherInterface, limitedApi, objectGuid, offEvent, onEvent, synapseHooks, synapseObjects, triggerEvent;
  objectGuid = 1;
  synapseObjects = {};
  synapseHooks = [];
  limitedApi = ['observe', 'notify', 'syncWith', 'stopObserving', 'pauseObserving', 'resumeObserving', 'stopNotifying', 'pauseNotifying', 'resumeNotifying'];
  Synapse = (function() {

    Synapse.prototype.version = '0.4.2';

    function Synapse(object) {
      var hook, method, raw, wrapped, _fn, _i, _j, _len, _len2,
        _this = this;
      if (object instanceof Synapse) return object;
      if (this.constructor !== Synapse) {
        wrapped = new Synapse(object);
        raw = wrapped.raw;
        _fn = function(method) {
          return raw[method] = function() {
            wrapped[method].apply(wrapped, arguments);
            return this;
          };
        };
        for (_i = 0, _len = limitedApi.length; _i < _len; _i++) {
          method = limitedApi[_i];
          _fn(method);
        }
        return raw;
      }
      for (_j = 0, _len2 = synapseHooks.length; _j < _len2; _j++) {
        hook = synapseHooks[_j];
        if (hook.checkObjectType(object)) break;
        hook = null;
      }
      if (!hook) {
        throw new Error("No hook exists for " + (core.getType(object)) + " types");
      }
      this.raw = (typeof hook.coerceObject === "function" ? hook.coerceObject(object) : void 0) || object;
      this.hook = hook;
      this.guid = objectGuid++;
      this._observing = {};
      this._notifying = {};
      synapseObjects[this.guid] = this;
    }

    Synapse.prototype.get = function() {
      var _ref;
      return (_ref = this.hook).getHandler.apply(_ref, [this.raw].concat(__slice.call(arguments)));
    };

    Synapse.prototype.set = function() {
      var _ref;
      (_ref = this.hook).setHandler.apply(_ref, [this.raw].concat(__slice.call(arguments)));
      return this;
    };

    Synapse.prototype.observe = function() {
      var args, other;
      other = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      other = new Synapse(other);
      connect.apply(null, [other, this].concat(__slice.call(args)));
      return this;
    };

    Synapse.prototype.notify = function() {
      var args, other;
      other = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      other = new Synapse(other);
      connect.apply(null, [this, other].concat(__slice.call(args)));
      return this;
    };

    Synapse.prototype.syncWith = function(other) {
      other = new Synapse(other);
      this.observe(other).notify(other);
      return this;
    };

    Synapse.prototype.stopObserving = function(other) {
      var channels, observerInterface, subject, subjectGuid, thread;
      if (!other) {
        for (subjectGuid in this._observing) {
          channels = this._observing[subjectGuid];
          subject = synapseObjects[subjectGuid];
          for (observerInterface in channels) {
            thread = channels[observerInterface];
            offEvent(subject, thread.event, thread.handler);
          }
          this._observing = {
            _open: true
          };
        }
      } else {
        channels = this._observing[other.guid];
        for (observerInterface in channels) {
          thread = channels[observerInterface];
          offEvent(other, thread.event, thread.handler);
        }
        this._observing[other.guid] = {
          _open: true
        };
      }
      return this;
    };

    Synapse.prototype.pauseObserving = function(other) {
      var channels, subjectGuid;
      if (!other) {
        for (subjectGuid in this._observing) {
          channels = this._observing[subjectGuid];
          channels._open = false;
        }
      } else {
        channels = this._observing[other.guid];
        channels._open = false;
      }
      return this;
    };

    Synapse.prototype.resumeObserving = function(other) {
      var channels, subjectGuid;
      if (other) {
        if ((channels = this._observing[other.guid])) channels._open = true;
      } else {
        for (subjectGuid in this._observing) {
          this._observing[subjectGuid]._open = true;
        }
      }
      return this;
    };

    Synapse.prototype.stopNotifying = function(other) {
      var channels, observer, observerGuid, observerInterface, thread;
      if (!other) {
        for (observerGuid in this._notifying) {
          channels = this._notifying[observerGuid];
          observer = synapseObjects[observerGuid];
          for (observerInterface in channels) {
            thread = channels[observerInterface];
            offEvent(this, thread.event, thread.handler);
          }
          this._notifying = {
            _open: true
          };
        }
      } else {
        channels = this._notifying[other.guid];
        for (observerInterface in channels) {
          thread = channels[observerInterface];
          offEvent(this, thread.event, thread.handler);
        }
        this._notifying[other.guid] = {
          _open: true
        };
      }
      return this;
    };

    Synapse.prototype.pauseNotifying = function(other) {
      var channels, observerGuid;
      if (!other) {
        for (observerGuid in this._notifying) {
          channels = this._notifying[observerGuid];
          channels._open = false;
        }
      } else {
        channels = this._notifying[other.guid];
        channels._open = false;
      }
      return this;
    };

    Synapse.prototype.resumeNotifying = function(other) {
      var channels, observerGuid;
      if (other) {
        if ((channels = this._notifying[other.guid])) channels._open = true;
      } else {
        for (observerGuid in this._notifying) {
          this._notifying[observerGuid]._open = true;
        }
      }
      return this;
    };

    return Synapse;

  })();
  Synapse.addHooks = function() {
    return synapseHooks.push.apply(synapseHooks, arguments);
  };
  Synapse.clearHooks = function() {
    return synapseHooks = [];
  };
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
    var channel, converter, event, events, handler, key, observerChannels, observerInterface, subjectChannels, subjectInterface, triggerOnBind, value, _i, _len;
    for (key in defaultConnectOptions) {
      value = defaultConnectOptions[key];
      if (!(options[key] != null)) options[key] = value;
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
        if (observer._observing[subject.guid]._open === true && subject._notifying[observer.guid]._open === true) {
          value = subject.get(subjectInterface);
          if (converter) value = converter(value);
          return observer.set(observerInterface, value);
        }
      };
      if (!(observerChannels = observer._observing[subject.guid])) {
        observerChannels = observer._observing[subject.guid] = {
          _open: true
        };
      }
      if (!(subjectChannels = subject._notifying[observer.guid])) {
        subjectChannels = subject._notifying[observer.guid] = {
          _open: true
        };
      }
      channel = {
        event: event,
        handler: handler
      };
      observerChannels[observerInterface] = channel;
      subjectChannels[observerInterface] = channel;
      onEvent(subject, event, handler);
      if (triggerOnBind) triggerEvent(subject, event);
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
  return Synapse;
});
