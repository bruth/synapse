/*
Synapse - The Backbone KVO Library

Author: Byron Ruth
Version: 0.1.1
Date: Tue Aug 16 13:28:16 2011 -0400
*/
var __slice = Array.prototype.slice;
(function(window) {
  var Synapse, defaultRegisterOptions, defaultSynapseConf, detectDomEvent, detectElementInterface, register, synapseConf, typeNames;
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
  Synapse = function(object) {
    return new Synapse.fn.init(object);
  };
  Synapse.version = '0.1.1';
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
  typeNames = {
    0: 'Object',
    1: 'jQuery',
    2: 'Model',
    3: 'Collection',
    4: 'View',
    5: 'Router'
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
    subjects: {},
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
        this.context.bind.apply(this.context, arguments);
      } else {
        Backbone.Events.bind.apply(this.context, arguments);
      }
      return this;
    },
    unbind: function() {
      if (this.context.unbind) {
        this.context.unbind.apply(this.context, arguments);
      } else {
        Backbone.Events.unbind.apply(this.context, arguments);
      }
      return this;
    },
    trigger: function() {
      if (this.context.trigger) {
        this.context.trigger.apply(this.context, arguments);
      } else {
        Backbone.Events.trigger.apply(this.context, arguments);
      }
      return this;
    },
    get: function(key) {
      if (this.type === Synapse.types.jquery) {
        return Synapse.interfaces.get(this.context, key);
      }
      if (_.isFunction(this.context[key])) {
        return this.context[key]();
      }
      if (this.context.get) {
        return this.context.get.call(this.context, key);
      }
      return this.context[key];
    },
    set: function(key, value) {
      var attrs, k, v;
      if (!_.isObject(key)) {
        attrs = {};
        attrs[key] = value;
      } else {
        attrs = key;
      }
      if (_.isFunction(this.context[key])) {
        return this.context[key](value);
      }
      if (this.type === Synapse.types.jquery) {
        for (k in attrs) {
          v = attrs[k];
          Synapse.interfaces.set(this.context, k, v);
        }
      } else if (this.context.set) {
        this.context.set.call(this.context, attrs);
      } else {
        _.extend(this.context, attrs);
      }
      return this;
    },
    sync: function(other) {
      if (!(other instanceof Synapse)) {
        other = Synapse(other);
      }
      return this.addNotifier(other).addObserver(other);
    },
    addNotifier: function(other, get, set) {
      if (!(other instanceof Synapse)) {
        other = Synapse(other);
      }
      Synapse.register(other, this, get, set);
      return this;
    },
    addObserver: function(other, get, set) {
      if (!(other instanceof Synapse)) {
        other = Synapse(other);
      }
      Synapse.register(this, other, get, set);
      return this;
    },
    toString: function() {
      return "<Synapse " + typeNames[this.type] + " #" + this.guid + ">";
    }
  };
  Synapse.prototype.observe = Synapse.prototype.addNotifier;
  Synapse.prototype.notify = Synapse.prototype.addObserver;
  Synapse.fn.init.prototype = Synapse.fn;
  Synapse.defaultDomEvents = [['a,:button,:reset', 'click'], ['select,:checkbox,:radio,textarea', 'change'], [':submit', 'submit'], [':input', 'keyup']];
  detectDomEvent = function(subject) {
    var event, item, selector, _i, _len, _ref;
    _ref = Synapse.defaultDomEvents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], event = item[1];
      if (subject.context.is(selector)) {
        return event;
      }
    }
    throw new Error("Event for " + subject + " could not be detected.");
  };
  Synapse.getEvents = function(subject, event) {
    var events;
    if (!event) {
      if (subject.type === Synapse.types.jquery) {
        events = [detectDomEvent(subject)];
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
  detectElementInterface = function(obj) {
    var interface, item, selector, _i, _len, _ref;
    _ref = Synapse.elementInterfaces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], interface = item[1];
      if (obj.context.is(selector)) {
        return interface;
      }
    }
    if (Synapse.defaultElementInterface) {
      return Synapse.defaultElementInterface;
    }
    throw new Error("Interface for " + obj + " could not be detected.");
  };
  Synapse.elementInterfaces = Synapse.defauElementInterfaces = [[':checkbox', 'checked'], [':radio', 'checked'], ['button', 'html'], [':input', 'value']];
  Synapse.defaultElementInterface = 'text';
  Synapse.getInterfaces = function(subject, observer, getInterface, setInterface) {
    if (!getInterface) {
      if (subject.type === Synapse.types.jquery) {
        getInterface = detectElementInterface(subject);
      } else if (subject.type === Synapse.types.model) {
        getInterface = '';
      }
    }
    if (!setInterface) {
      if (observer.type === Synapse.types.jquery) {
        setInterface = detectElementInterface(observer);
      }
    }
    if (!getInterface) {
      if (observer.type === Synapse.types.jquery) {
        if (observer.context.attr('role')) {
          getInterface = observer.context.attr('role');
        } else if (observer.context.attr('name')) {
          getInterface = observer.context.attr('name');
        }
      }
    }
    if (!setInterface) {
      if (subject.type === Synapse.types.jquery && subject.context.attr('name')) {
        setInterface = subject.context.attr('name');
      } else {
        setInterface = getInterface;
      }
    }
    if (!setInterface) {
      throw new Error("The interfaces between " + subject + " and " + observer + " could be detected - " + getInterface + " => " + setInterface);
    }
    if (_.isString(getInterface)) {
      getInterface = getInterface.split(' ');
    }
    if (_.isString(setInterface)) {
      setInterface = setInterface.split(' ');
    }
    return [getInterface, setInterface];
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
  Synapse.handlers = {
    2: {
      getHandler: function(subject, event, convert, interfaces, set, trigger) {
        var interface, _event, _i, _len, _results;
        _event = event;
        _results = [];
        for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
          interface = interfaces[_i];
          if (interface && !subject.context[interface]) {
            _event = "" + event + ":" + interface;
          }
          subject.bind(_event, function(model, value, options) {
            value = _.map(interfaces, subject.get, subject);
            if (convert) {
              value = convert.apply(convert, value);
              if (!_.isArray(value)) {
                value = [value];
              }
            }
            return set.apply(subject.context, value);
          });
          _results.push(trigger ? subject.trigger(_event, subject.context, subject.get(interface)) : void 0);
        }
        return _results;
      }
    }
  };
  defaultRegisterOptions = {
    event: null,
    getInterface: null,
    setInterface: null,
    converter: null,
    triggerOnBind: true
  };
  register = function(subject, observer, options) {
    var converter, event, events, getHandler, getInterface, setHandler, setInterface, triggerOnBind, _i, _len, _ref, _results;
    _.defaults(options, defaultRegisterOptions);
    events = Synapse.getEvents(subject, options.event);
    _ref = Synapse.getInterfaces(subject, observer, options.getInterface, options.setInterface), getInterface = _ref[0], setInterface = _ref[1];
    converter = options.converter;
    if (converter && !_.isFunction(converter)) {
      converter = observer[converter];
    }
    triggerOnBind = options.triggerOnBind;
    if (Synapse.handlers[subject.type]) {
      getHandler = Synapse.handlers[subject.type].getHandler;
    }
    if (getHandler == null) {
      getHandler = function(subject, event, converter, interfaces, setHandler, triggerOnBind) {
        subject.bind(event, function() {
          var value;
          value = _.map(interfaces, subject.get, subject);
          if (converter) {
            value = converter.apply(converter, value);
            if (!_.isArray(value)) {
              value = [value];
            }
          }
          return setHandler.apply(subject.context, value);
        });
        if (triggerOnBind) {
          return subject.trigger(event);
        }
      };
    }
    if (Synapse.handlers[observer.type]) {
      setHandler = Synapse.handlers[observer.type].setHandler;
    }
    if (setHandler == null) {
      setHandler = function(observer, interfaces) {
        return function(value) {
          var interface, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
            interface = interfaces[_i];
            _results.push(observer.set(interface, value));
          }
          return _results;
        };
      };
    }
    setHandler = setHandler(observer, setInterface);
    _results = [];
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      subject.observers[observer.guid][event] = true;
      observer.subjects[subject.guid][event] = true;
      _results.push(getHandler(subject, event, converter, getInterface, setHandler, triggerOnBind));
    }
    return _results;
  };
  Synapse.registerSync = function(object1, object2) {
    Synapse.registerObserver(object1, object2);
    return Synapse.registerObserver(object2, object1);
  };
  Synapse.register = function(subject, observer, getInterface, setInterface) {
    var opt, options, _i, _len, _results;
    if (!subject.observers[observer.guid]) {
      subject.observers[observer.guid] = {};
    }
    if (!observer.subjects[subject.guid]) {
      observer.subjects[subject.guid] = {};
    }
    if (_.isFunction(getInterface)) {
      options = {
        converter: getInterface
      };
    } else if (!_.isObject(getInterface)) {
      options = {
        getInterface: getInterface,
        setInterface: setInterface
      };
    } else {
      options = getInterface;
    }
    if (!_.isArray(options)) {
      options = [options];
    }
    _results = [];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      opt = options[_i];
      _results.push(register(subject, observer, opt));
    }
    return _results;
  };
  return window.Synapse = window.SYN = Synapse;
})(window);
