/*
Synapse - The Backbone KVO Library

Author: Byron Ruth
Version: 0.1
Date: Fri Jul 15 17:29:02 2011 -0500
*/var __slice = Array.prototype.slice;
(function(window) {
  var Synapse, defaultRegisterOptions, defaultSynapseConf, parseInterfaces, synapseConf;
  if (!_.isObject) {
    _.isObject = function(object) {
      return object === Object(object);
    };
  }
  defaultSynapseConf = {
    autoExtendObjects: true,
    debug: false
  };
  synapseConf = this.Synapse || {};
  _.defaults(synapseConf, defaultSynapseConf);
  Synapse = (function() {
    var Synapse;
    Synapse = function(object) {
      return new Synapse.fn.init(object);
    };
    Synapse.version = '0.1';
    Synapse.guid = 1;
    Synapse.cache = {};
    Synapse.conf = synapseConf;
    Synapse.log = function() {
      if (Synapse.conf.debug) {
        try {
          return console.log.apply(console, arguments);
        } catch (e) {
          try {
            return opera.postError.apply(opera, arguments);
          } catch (e) {
            return alert(Array.prototype.join.call(arguments, ' '));
          }
        }
      }
    };
    Synapse.types = {
      object: 0,
      jquery: 1,
      model: 2,
      collection: 3,
      view: 4,
      router: 5
    };
    Synapse.getObjectType = function(object) {
      var key;
      if (object instanceof $) {
        return Synapse.types.jquery;
      }
      if (object instanceof Backbone.Model) {
        return Synapse.types.model;
      }
      if (object instanceof Backbone.Collection) {
        return Synapse.types.collection;
      }
      if (object instanceof Backbone.View) {
        return Synapse.types.view;
      }
      if (object instanceof Backbone.Router) {
        return Synapse.types.router;
      }
      for (key in Backbone.Events) {
        if (!object[key]) {
          if (!Synapse.conf.autoExtendObjects) {
            throw new Error("object does not support events and 'autoExtendObjects' is turned off");
          }
          _.extend(object, Backbone.Events);
          break;
        }
      }
      return Synapse.types.object;
    };
    Synapse.fn = Synapse.prototype = {
      constructor: Synapse,
      observers: {},
      notifiers: {},
      init: function(context) {
        if (context instanceof Synapse) {
          return context;
        }
        if (_.isString(context) || _.isElement(context)) {
          context = $.apply($, arguments);
        } else if ($.isPlainObject(context)) {
          _.extend(context, Backbone.Events);
        }
        this.guid = Synapse.guid++;
        this.type = Synapse.getObjectType(context);
        this.context = context;
        Synapse.cache[this.guid] = this;
        return this;
      },
      bind: function() {
        return this.context.bind.apply(this, arguments);
      },
      unbind: function() {
        return this.context.unbind.apply(this, arguments);
      },
      trigger: function() {
        return this.context.trigger.apply(this, arguments);
      },
      get: function(key) {
        if (this.context.get) {
          return this.context.get.call(this.context, key);
        }
        return Synapse.interfaces.get(this.context, key);
      },
      set: function(key, value) {
        if (this.context.set) {
          return this.context.set.call(this.context, key, value);
        }
        return Synapse.interfaces.set(this.context, key, value);
      },
      sync: function(other) {
        return this.observe(other).notify(other);
      },
      observe: function(notifier, options) {
        Synapse.register(this, notifier, options, false);
        return this;
      },
      notify: function(observer, options) {
        Synapse.register(observer, this, options, true);
        return this;
      }
    };
    Synapse.fn.init.prototype = Synapse.fn;
    return Synapse;
  })();
  Synapse.defaultDomEvents = [['a,:button,:reset', 'click'], ['select,:checkbox,:radio,textarea', 'change'], [':submit', 'submit'], [':input', 'keyup']];
  Synapse.detectDomEvent = function(syn) {
    var event, item, selector, _i, _len, _ref;
    _ref = Synapse.defaultDomEvents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], event = item[1];
      if (syn.context.is(selector)) {
        return event;
      }
    }
    throw new Error("Event for " + syn + " could not be detected.");
  };
  Synapse.getEvents = function(subject, event) {
    var events;
    if (!event) {
      if (subject.type === Synapse.types.jquery) {
        events = [Synapse.detectDomEvent(subject)];
      } else if (subject.type === Synapse.types.model) {
        events = ['change'];
      } else {
        throw new Error('No event defined for subject');
      }
    } else {
      events = !_.isArray(event) ? [event] : event;
    }
    return events;
  };
  Synapse.handlers = {
    0: {
      send: function(notifier, event, interface, notify, notify) {
        notifier.bind(event, function() {
          var value;
          value = this.get(interface);
          return notify(this.context, interface, value);
        });
        if (notify) {
          return notifier.context.trigger(event);
        }
      },
      receive: function(observer, interface, handler) {
        return function(notifier, value) {
          if (handler) {
            value = handler(observer.context, interface, value);
          }
          return observer.set(interface, value);
        };
      }
    },
    1: {
      send: function(notifier, event, interface, notify) {
        notifier.bind(event, function() {
          var value;
          value = this.get(interface);
          return notify(this.context, interface, value);
        });
        if (notify) {
          return notifier.trigger(event);
        }
      },
      receive: function(observer, interface, handler) {
        return function(notifier, value) {
          if (handler) {
            value = handler(this.context, interface, value);
          }
          return this.set(interface, value);
        };
      }
    },
    2: {
      send: function(notifier, event, interface, notify) {
        if (interface) {
          event = "" + event + ":" + interface;
        }
        notifier.bind(event, function(model, value, options) {
          return notify(this.context, interface, value);
        });
        if (notify) {
          return notifier.trigger(event, notifier, notifier.get(interface));
        }
      },
      receive: function(observer, interface, handler) {
        return function(notifier, value) {
          var attrs;
          if (handler) {
            value = handler(this.context, interface, value);
          }
          attrs = {};
          attrs[interface] = value;
          return this.set(attrs);
        };
      }
    }
  };
  Synapse.defaultElementInterfaces = [[':checkbox', 'checked'], [':radio', 'checked'], ['button', 'html'], [':input', 'value'], ['*', 'text']];
  Synapse.detectElementInterface = function(syn) {
    var interface, item, selector, _i, _len, _ref;
    _ref = Synapse.defaultElementInterfaces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], interface = item[1];
      if (syn.context.is(selector)) {
        return interface;
      }
    }
    throw new Error("Interface for " + syn + " could not be detected.");
  };
  parseInterfaces = function(interfaces, downstream) {
    if (!interfaces) {
      interfaces = [[null, null]];
    } else if (_.isArray(interfaces)) {
      if (!_.isArray(interfaces[0])) {
        interfaces = [interfaces];
      }
    } else {
      interfaces = downstream ? [[interfaces, null]] : [[null, interfaces]];
    }
    return interfaces;
  };
  Synapse.getInterfaces = function(notifier, observer, interfaces, downstream) {
    var oi, pair, si, _i, _len, _oi, _ref, _ref2, _ref3, _ref4, _ref5, _si;
    if (downstream == null) {
      downstream = true;
    }
    interfaces = parseInterfaces(interfaces, downstream);
    for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
      pair = interfaces[_i];
      if (downstream) {
        _ref = [0, 1], si = _ref[0], oi = _ref[1];
      } else {
        _ref2 = [1, 0], oi = _ref2[0], si = _ref2[1];
      }
      _si = null;
      _oi = null;
      if (notifier.type === Synapse.types.jquery) {
        _si = Synapse.detectElementInterface(notifier);
        if ((_ref3 = observer.type) === Synapse.types.model || _ref3 === Synapse.types.object) {
          _oi = notifier.context.attr('name') || null;
        }
      }
      if (observer.type === Synapse.types.jquery) {
        _oi = Synapse.detectElementInterface(observer);
        if (!_si) {
          _si = observer.context.attr('name') || null;
        }
      }
      if (_si === null && notifier.type === Synapse.types.model) {
        _si = '';
      }
      (_ref4 = pair[si]) != null ? _ref4 : pair[si] = _si;
      (_ref5 = pair[oi]) != null ? _ref5 : pair[oi] = _oi;
      if (pair[si] === null || pair[oi] === null) {
        throw new Error("The interfaces between " + notifier + " and " + observer + " could be detected");
      }
    }
    return interfaces;
  };
  Synapse.interfaces = (function() {
    return {
      registry: {},
      register: function(config) {
        return this.registry[config.name] = config;
      },
      unregister: function(name) {
        return delete this.registry[name];
      },
      get: function() {
        var args, context, key, name, _ref;
        context = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (context instanceof Synapse) {
          context = context.context;
        }
        _ref = name.split(':'), name = _ref[0], key = _ref[1];
        if (key != null) {
          args = [key].concat(args);
        }
        return this.registry[name].get.apply(context, args);
      },
      set: function() {
        var args, context, key, name, _ref;
        context = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (context instanceof Synapse) {
          context = context.context;
        }
        _ref = name.split(':'), name = _ref[0], key = _ref[1];
        if (key != null) {
          args = [key].concat(args);
        }
        return this.registry[name].set.apply(context, args);
      }
    };
  })();
  (function() {
    var getAttribute, getProperty, getStyle, setAttribute, setProperty, setStyle;
    getProperty = function(key) {
      if (this.prop != null) {
        return this.prop(key);
      }
      return getAttribute.call(this, key);
    };
    setProperty = function(key, value) {
      if (this.prop != null) {
        if (typeof key === 'object') {
          return this.prop(key);
        }
        return this.prop(key, value);
      }
      return setAttribute.call(this, key, value);
    };
    getAttribute = function(key) {
      return this.attr(key);
    };
    setAttribute = function(key, value) {
      if (typeof key === 'object') {
        return this.attr(key);
      }
      return this.attr(key, value);
    };
    getStyle = function(key) {
      return this.css(key);
    };
    setStyle = function(key, value) {
      if (typeof key === 'object') {
        return this.css(key);
      }
      return this.css(key, value);
    };
    Synapse.interfaces.register({
      name: 'prop',
      get: function(key) {
        return getProperty.call(this, key);
      },
      set: function(key, value) {
        return setProperty.call(this, key, value);
      }
    });
    Synapse.interfaces.register({
      name: 'attr',
      get: function(key) {
        return getAttribute.call(this, key);
      },
      set: function(key, value) {
        return setAttribute.call(this, key, value);
      }
    });
    Synapse.interfaces.register({
      name: 'style',
      get: function(key) {
        return getStyle.call(this, key);
      },
      set: function(key, value) {
        return setStyle.call(this, key, value);
      }
    });
    Synapse.interfaces.register({
      name: 'text',
      get: function() {
        return this.text();
      },
      set: function(value) {
        return this.text((value || (value = '')).toString());
      }
    });
    Synapse.interfaces.register({
      name: 'html',
      get: function() {
        return this.html();
      },
      set: function(value) {
        return this.html((value || (value = '')).toString());
      }
    });
    Synapse.interfaces.register({
      name: 'value',
      get: function() {
        return this.val();
      },
      set: function(value) {
        return this.val(value || (value = ''));
      }
    });
    Synapse.interfaces.register({
      name: 'enabled',
      get: function() {
        return !getProperty.call(this, 'disabled');
      },
      set: function(value) {
        if (_.isArray(value) && value.length === 0) {
          value = false;
        }
        return setProperty.call(this, 'disabled', !Boolean(value));
      }
    });
    Synapse.interfaces.register({
      name: 'disabled',
      get: function() {
        return getProperty.call(this, 'disabled');
      },
      set: function(value) {
        if (_.isArray(value) && value.length === 0) {
          value = false;
        }
        return setProperty.call(this, 'disabled', Boolean(value));
      }
    });
    Synapse.interfaces.register({
      name: 'checked',
      get: function() {
        return getProperty.call(this, 'checked');
      },
      set: function(value) {
        if (_.isArray(value) && value.length === 0) {
          value = false;
        }
        return setProperty.call(this, 'checked', Boolean(value));
      }
    });
    Synapse.interfaces.register({
      name: 'visible',
      get: function() {
        return getStyle.call(this, 'display') === !'none';
      },
      set: function(value) {
        if (_.isArray(value) && value.length === 0) {
          value = false;
        }
        if (Boolean(value)) {
          return this.show();
        } else {
          return this.hide();
        }
      }
    });
    Synapse.interfaces.register({
      name: 'hidden',
      get: function() {
        return getStyle.call(this, 'display') === 'none';
      },
      set: function(value) {
        if (_.isArray(value) && value.length === 0) {
          value = false;
        }
        if (Boolean(value)) {
          return this.hide();
        } else {
          return this.show();
        }
      }
    });
    return Synapse.interfaces.register({
      name: 'css',
      get: function(key) {
        return this.hasClass(key);
      },
      set: function(key, value) {
        if (_.isArray(value) && value.length === 0) {
          value = false;
        }
        if (Boolean(value)) {
          return this.addClass(key);
        } else {
          return this.removeClass(key);
        }
      }
    });
  })();
  defaultRegisterOptions = {
    events: null,
    interfaces: null,
    handler: null,
    notifyInit: true
  };
  Synapse.registerSync = function(object1, object2) {
    Synapse.registerObserver(object1, object2);
    return Synapse.registerObserver(object2, object1);
  };
  Synapse.register = function(obj1, obj2, _options, downstream) {
    var conn, event, events, handler, i, interfaces, notifier, observer, oi, options, receive, send, si, _i, _len, _receive, _ref, _ref2, _results;
    if (!(obj1 instanceof Synapse)) {
      observer = Synapse(obj1);
    }
    if (!(obj2 instanceof Synapse)) {
      notifier = Synapse(obj2);
    }
    if (downstream) {
      _ref = [obj1, obj2], notifier = _ref[0], observer = _ref[1];
    } else {
      _ref2 = [obj1, obj2], observer = _ref2[0], notifier = _ref2[1];
    }
    if (!notifier.observers[observer.guid]) {
      notifier.observers[observer.guid] = {};
    }
    if (!observer.notifiers[notifier.guid]) {
      observer.notifiers[notifier.guid] = {};
    }
    options = {};
    if (_.isString(_options) || _.isArray(_options)) {
      _options = {
        interface: _options
      };
    } else if (_.isFunction(_options)) {
      _options = {
        handler: _options
      };
    }
    _.extend(options, defaultRegisterOptions, _options);
    events = Synapse.getEvents(notifier, options.event);
    interfaces = Synapse.getInterfaces(notifier, observer, options.interface);
    handler = options.handler;
    if (handler && !_.isFunction(handler)) {
      handler = observer[handler];
    }
    receive = Synapse.handlers[observer.type].receive;
    send = Synapse.handlers[notifier.type].send;
    _results = [];
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      notifier.observers[observer.guid][event] = true;
      observer.notifiers[notifier.guid][event] = true;
      _results.push((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
          conn = interfaces[_i];
          si = conn[0], oi = conn[1];
          _receive = receive(observer, oi, send);
          if (!_.isArray(si)) {
            si = [si];
          }
          _results.push((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = si.length; _i < _len; _i++) {
              i = si[_i];
              _results.push(send(notifier, event, i, _receive, options.notifyInit));
            }
            return _results;
          })());
        }
        return _results;
      })());
    }
    return _results;
  };
  return window.Synapse = window.SYN = Synapse;
})(window);
