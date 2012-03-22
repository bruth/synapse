

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
    return define('synapse',['synapse/core', 'exports'], function(core, exports) {
      return factory(root, exports, core);
    });
  } else {
    return root.Synapse = factory(root, {}, root.SynapseCore);
  }
})(this, function(root, Synapse, core) {
  var cache, connect, connectOne, defaultConnectOptions, detectEvent, detectInterface, detectOtherInterface, guid, limitedApi, offEvent, onEvent, triggerEvent;
  guid = 1;
  cache = {};
  limitedApi = 'observe notify syncWith stopObserving pauseObserving resumeObserving stopNotifying pauseNotifying resumeNotifying'.split(' ');
  Synapse = (function() {

    Synapse.prototype.version = '0.5b';

    function Synapse(object) {
      var cached, hook, method, raw, wrapped, _fn, _i, _j, _len, _len2, _ref;
      if (object instanceof Synapse) return object;
      if ((cached = cache[object[Synapse.expando]])) return cached;
      if (this.constructor !== Synapse) {
        wrapped = new Synapse(object);
        raw = wrapped.raw;
        _fn = function(method) {
          return raw[method] = function() {
            wrapped[method].apply(wrapped, arguments);
            return raw;
          };
        };
        for (_i = 0, _len = limitedApi.length; _i < _len; _i++) {
          method = limitedApi[_i];
          _fn(method);
        }
        return raw;
      }
      _ref = Synapse.hooks;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        hook = _ref[_j];
        if (hook.checkObjectType(object)) break;
        hook = null;
      }
      if (!hook) {
        throw new Error("An appropriate hook was not determined for                    " + (core.getType(object)) + " types");
      }
      this.raw = (typeof hook.coerceObject === "function" ? hook.coerceObject(object) : void 0) || object;
      this.hook = hook;
      cache[this.guid = object[Synapse.expando] = guid++] = this;
      this._observing = {};
      this._notifying = {};
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

    Synapse.prototype.stopObserving = function(subject) {
      var chan, meta, observerInterface, subjectCid;
      if (subject) {
        if ((meta = this._observing[subject.guid])) {
          for (observerInterface in meta.channels) {
            chan = channels[observerInterface];
            offEvent(subject, chan.event, chan.handler);
          }
          delete this._observing[subject.guid];
        }
      } else {
        for (subjectCid in this._observing) {
          meta = this._observing[subjectCid];
          subject = cache[subjectCid];
          for (observerInterface in meta.channels) {
            chan = meta.channels[observerInterface];
            offEvent(subject, chan.event, chan.handler);
          }
        }
        this._observing = {};
      }
      return this;
    };

    Synapse.prototype.pauseObserving = function(subject) {
      var meta, subjectCid;
      if (subject) {
        if ((meta = this._observing[subject.guid])) meta.open = false;
      } else {
        for (subjectCid in this._observing) {
          this._observing[subjectCid].open = false;
        }
      }
      return this;
    };

    Synapse.prototype.resumeObserving = function(subject) {
      var meta, subjectCid;
      if (subject) {
        if ((meta = this._observing[subject.guid])) meta.open = true;
      } else {
        for (subjectCid in this._observing) {
          this._observing[subjectCid].open = true;
        }
      }
      return this;
    };

    Synapse.prototype.stopNotifying = function(observer) {
      var chan, meta, observerCid, observerInterface;
      if (observer) {
        if ((meta = this._notifying[observer.guid])) {
          for (observerInterface in meta.channels) {
            chan = meta.channels[observerInterface];
            offEvent(this, chan.event, chan.handler);
          }
          delete this._notifying[observer.guid];
        }
      } else {
        for (observerCid in this._notifying) {
          meta = this._notifying[observerCid];
          observer = cache[observerCid];
          for (observerInterface in meta.channels) {
            chan = meta.channels[observerInterface];
            offEvent(this, chan.event, chan.handler);
          }
        }
        this._notifying = {};
      }
      return this;
    };

    Synapse.prototype.pauseNotifying = function(observer) {
      var meta, observerCid;
      if (observer) {
        if ((meta = this._notifying[observer.guid])) meta.open = false;
      } else {
        for (observerCid in this._notifying) {
          this._notifying[observerCid].open = false;
        }
      }
      return this;
    };

    Synapse.prototype.resumeNotifying = function(observer) {
      var meta, observerCid;
      if (observer) {
        if ((meta = this._notifying[observer.guid])) meta.open = true;
      } else {
        for (observerCid in this._notifying) {
          this._notifying[observerCid].open = true;
        }
      }
      return this;
    };

    return Synapse;

  })();
  Synapse.expando = 'Synapse' + (Synapse.prototype.version + Math.random()).replace(/\D/g, '');
  Synapse.hooks = [];
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
    var channel, converter, event, events, handler, key, observerInterface, observerMeta, subjectInterface, subjectMeta, triggerOnBind, value, _i, _len;
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
        var _ref, _ref2;
        if (((_ref = observer._observing[subject.guid]) != null ? _ref.open : void 0) === true && ((_ref2 = subject._notifying[observer.guid]) != null ? _ref2.open : void 0) === true) {
          value = subject.get(subjectInterface);
          if (converter) value = converter(value);
          return observer.set(observerInterface, value);
        }
      };
      if (!(observerMeta = observer._observing[subject.guid])) {
        observerMeta = observer._observing[subject.guid] = {
          open: true,
          channels: {}
        };
      }
      if (!(subjectMeta = subject._notifying[observer.guid])) {
        subjectMeta = subject._notifying[observer.guid] = {
          open: true,
          channels: {}
        };
      }
      channel = {
        event: event,
        handler: handler
      };
      observerMeta.channels[observerInterface] = channel;
      subjectMeta.channels[observerInterface] = channel;
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
