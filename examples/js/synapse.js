/*
Synapse - The Backbone KVO Library

Author: Byron Ruth
Version: 0.1
Date: Sun Jul 17 10:14:46 2011 -0400
*/var __slice = Array.prototype.slice;
(function(window) {
  var Synapse, defaultRegisterOptions, defaultSynapseConf, detectElementInterface, parseInterfaces, synapseConf;
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
        }
        this.context = context;
        this.type = Synapse.getObjectType(context);
        return Synapse.cache[this.guid = Synapse.guid++] = this;
      },
      bind: function() {
        if (this.context.bind) {
          return this.context.bind.apply(this.context, arguments);
        }
        return Backbone.Events.bind.apply(this.context, arguments);
      },
      unbind: function() {
        if (this.context.unbind) {
          this.context.unbind.apply(this.context, arguments);
        }
        return Backbone.Events.unbind.apply(this.context, arguments);
      },
      trigger: function() {
        if (this.context.trigger) {
          return this.context.trigger.apply(this.context, arguments);
        }
        return Backbone.Events.trigger.apply(this.context, arguments);
      },
      get: function(key) {
        if (this.type === Synapse.types.jquery) {
          return Synapse.interfaces.get(this.context, key);
        }
        if (this.context.get) {
          return this.context.get.call(this.context, key);
        }
        return this.context[key];
      },
      set: function(key, value) {
        var attrs, k, v, _results;
        if (!_.isObject(key)) {
          attrs = {};
          attrs[key] = value;
        } else {
          attrs = key;
        }
        if (this.type === Synapse.types.jquery) {
          _results = [];
          for (k in attrs) {
            v = attrs[k];
            _results.push(Synapse.interfaces.set(this.context, k, v));
          }
          return _results;
        } else if (this.context.set) {
          return this.context.set.call(this.context, attrs);
        } else {
          return _.extend(this.context, attrs);
        }
      },
      sync: function(other) {
        if (!(other instanceof Synapse)) {
          other = Synapse(other);
        }
        return this.addObserver(other).addNotifier(other);
      },
      addNotifier: function(other, options) {
        if (!(other instanceof Synapse)) {
          other = Synapse(other);
        }
        Synapse.register(other, this, options, false);
        return this;
      },
      addObserver: function(other, options) {
        if (!(other instanceof Synapse)) {
          other = Synapse(other);
        }
        Synapse.register(this, other, options, true);
        return this;
      },
      observe: Synapse.prototype.addNotifier,
      notify: Synapse.prototype.addObserver
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
      send: function(notifier, event, interface, handler, notify) {
        notifier.bind(event, function() {
          var value;
          value = notifier.get(interface);
          return handler(notifier.context, value);
        });
        if (notify) {
          return notifier.trigger(event);
        }
      },
      receive: function(observer, interface, handler) {
        return function(notifier, value) {
          if (handler) {
            value = handler(observer.context, value);
          }
          return observer.set(interface, value);
        };
      }
    },
    1: {
      send: function(notifier, event, interface, handler, notify) {
        notifier.bind(event, function() {
          var value;
          value = notifier.get(interface);
          return handler(notifier.context, value);
        });
        if (notify) {
          return notifier.trigger(event);
        }
      },
      receive: function(observer, interface, handler) {
        return function(notifier, value) {
          if (handler) {
            value = handler(observer.context, value);
          }
          return observer.set(interface, value);
        };
      }
    },
    2: {
      send: function(notifier, event, interface, handler, notify) {
        if (interface) {
          event = "" + event + ":" + interface;
        }
        notifier.bind(event, function(model, value, options) {
          return handler(notifier.context, value);
        });
        if (notify) {
          return notifier.trigger(event, notifier, notifier.get(interface));
        }
      },
      receive: function(observer, interface, handler) {
        return function(notifier, value) {
          var attrs;
          if (handler) {
            value = handler(observer.context, value);
          }
          attrs = {};
          attrs[interface] = value;
          return observer.set(attrs);
        };
      }
    }
  };
  detectElementInterface = function(obj) {
    var interface, item, selector, _i, _len, _ref;
    _ref = Synapse.defaultElementInterfaces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], interface = item[1];
      if (obj.context.is(selector)) {
        return interface;
      }
    }
    throw new Error("Interface for " + obj + " could not be detected.");
  };
  parseInterfaces = function(interfaces) {
    if (!interfaces) {
      interfaces = [{}];
    } else if (!_.isArray(interfaces)) {
      interfaces = [interfaces];
    }
    return interfaces;
  };
  Synapse.defaultElementInterfaces = [[':checkbox', 'checked'], [':radio', 'checked'], ['button', 'html'], [':input', 'value'], ['*', 'text']];
  Synapse.getInterfaces = function(subject, observer, interfaces) {
    var get, obj, set, _i, _len, _ref, _ref2;
    interfaces = parseInterfaces(interfaces);
    for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
      obj = interfaces[_i];
      get = null;
      set = null;
      if (subject.type === Synapse.types.jquery) {
        get = detectElementInterface(subject);
        set = subject.context.attr('name') || null;
      }
      if (observer.type === Synapse.types.jquery) {
        set = detectElementInterface(observer);
        get != null ? get : get = observer.context.attr('name') || null;
      }
      if (subject.type === Synapse.types.model) {
        get != null ? get : get = '';
      }
      (_ref = obj.get) != null ? _ref : obj.get = get;
      (_ref2 = obj.set) != null ? _ref2 : obj.set = set;
      if (obj.get === null || obj.set === null) {
        throw new Error("The interfaces between " + subject + " and " + observer + " could be detected");
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
    return Synapse.interfaces.register({
      name: 'data',
      get: function(key) {
        return this.data(key);
      },
      set: function(key, value) {
        return this.data(key, value);
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
  Synapse.register = function(notifier, observer, _options, downstream) {
    var conn, event, events, handler, i, interfaces, oi, options, receive, send, si, _i, _len, _receive, _results;
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
          _receive = receive(observer, oi, handler);
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
