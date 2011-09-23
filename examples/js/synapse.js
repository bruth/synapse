var __slice = Array.prototype.slice;
(function(window) {
  var Synapse, TypeNames, Types, configuration, connect, connectOne, defaultConfiguration, defaultHandlers, defaultRegisterOptions, detectDomEvent, detectElementInterface, getEvents, getHandlerForType, getInterfaces, getObjectType, interfaces;
  defaultConfiguration = {
    debug: false,
    noConflict: false,
    domEvents: [['a,:button,:reset', 'click'], ['select,:checkbox,:radio,textarea', 'change'], [':submit', 'submit'], [':input', 'keyup']],
    defaultDomEvent: null,
    elementInterfaces: [[':checkbox,:radio', 'checked'], ['button', 'html'], [':input', 'value']],
    defaultElementInterface: 'text',
    elementBindAttributes: ['name', 'role']
  };
  configuration = this.Synapse || {};
  _.defaults(configuration, defaultConfiguration);
  Types = {
    object: 0,
    jquery: 1,
    model: 2,
    collection: 3,
    view: 4
  };
  TypeNames = {
    0: 'Object',
    1: 'jQuery',
    2: 'Model',
    3: 'Collection',
    4: 'View'
  };
  getObjectType = function(object) {
    if (object instanceof jQuery) {
      return Types.jquery;
    }
    if (object instanceof Backbone.Model) {
      return Types.model;
    }
    if (object instanceof Backbone.Collection) {
      return Types.collection;
    }
    if (object instanceof Backbone.View) {
      return Types.view;
    }
    return Types.object;
  };
  Synapse = function(object) {
    return new Synapse.fn.init(object);
  };
  Synapse.guid = 1;
  Synapse.cache = {};
  Synapse.version = '0.2';
  Synapse.configuration = configuration;
  Synapse.fn = Synapse.prototype = {
    constructor: Synapse,
    observers: {},
    subjects: {},
    init: function(context) {
      if (context instanceof Synapse) {
        return context;
      }
      if (_.isString(context) || _.isElement(context)) {
        this.originalContext = context;
        context = jQuery.apply(jQuery, arguments);
      }
      this.context = context;
      this.type = getObjectType(context);
      return Synapse.cache[this.guid = Synapse.guid++] = this;
    },
    bind: function() {
      var bind;
      bind = this.context.bind || Backbone.Events.bind;
      return bind.apply(this.context, arguments);
    },
    unbind: function() {
      var unbind;
      unbind = this.context.unbind || Backbone.Events.unbind;
      return unbind.apply(this.context, arguments);
    },
    trigger: function() {
      var trigger;
      trigger = this.context.trigger || Backbone.Events.trigger;
      return trigger.apply(this.context, arguments);
    },
    get: function(key) {
      if (this.type === Types.jquery) {
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
      if (this.type === Types.jquery) {
        for (k in attrs) {
          v = attrs[k];
          Synapse.interfaces.set(this.context, k, v);
        }
      } else if (_.isFunction(this.context[key])) {
        this.context[key](value);
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
      return this.observe(other).notify(other);
    },
    observe: function() {
      var args, other;
      other = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!(other instanceof Synapse)) {
        other = Synapse(other);
      }
      connect.apply(null, [other, this].concat(__slice.call(args)));
      return this;
    },
    notify: function() {
      var args, other;
      other = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!(other instanceof Synapse)) {
        other = Synapse(other);
      }
      connect.apply(null, [this, other].concat(__slice.call(args)));
      return this;
    },
    toString: function() {
      return "<Synapse " + TypeNames[this.type] + " #" + this.guid + ">";
    }
  };
  Synapse.fn.init.prototype = Synapse.fn;
  detectDomEvent = function(elem) {
    var event, item, selector, _i, _len, _ref;
    elem = jQuery(elem);
    _ref = Synapse.configuration.domEvents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], event = item[1];
      if (elem.is(selector)) {
        return event;
      }
    }
    if (Synapse.configuration.defaultDomEvent) {
      return Synapse.configuration.defaultDomEvent;
    }
    throw new Error("Event for " + elem + " could not be detected.");
  };
  getEvents = function(subject, event) {
    var events;
    if (!event) {
      if (subject.type === Types.jquery) {
        events = [detectDomEvent(subject.context)];
      } else if (subject.type === Types.view) {
        events = [detectDomEvent(subject.context.el)];
      } else if (subject.type === Types.model) {
        events = ['change'];
      } else {
        throw new Error('No event defined for subject');
      }
    } else {
      events = !_.isArray(event) ? [event] : event;
    }
    return events;
  };
  Synapse.getEvents = getEvents;
  defaultHandlers = {
    get: function(subject, event, converter, interfaces, set, trigger) {
      subject.bind(event, function() {
        var value;
        value = _.map(interfaces, subject.get, subject);
        if (converter) {
          value = converter.apply(converter, value);
          if (!_.isArray(value)) {
            value = [value];
          }
        }
        return set.apply(subject.context, value);
      });
      if (trigger) {
        return subject.trigger(event);
      }
    },
    set: function(observer, interfaces) {
      return function() {
        var args, interface, _i, _len, _results;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _results = [];
        for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
          interface = interfaces[_i];
          _results.push(observer.set.apply(observer, [interface].concat(__slice.call(args))));
        }
        return _results;
      };
    }
  };
  getHandlerForType = function(type, method) {
    var handler, _ref;
    if (!(handler = (_ref = Synapse.handlers[type]) != null ? _ref[method] : void 0)) {
      handler = defaultHandlers[method];
    }
    return handler;
  };
  Synapse.handlers = {
    2: {
      get: function(subject, event, converter, interfaces, set, trigger) {
        var attr, _event, _i, _len, _results;
        _event = event;
        _results = [];
        for (_i = 0, _len = interfaces.length; _i < _len; _i++) {
          attr = interfaces[_i];
          if (attr && !_.isFunction(subject.context[attr])) {
            _event = "" + event + ":" + attr;
          }
          subject.bind(_event, function(model, value, options) {
            value = _.map(interfaces, subject.get, subject);
            if (converter) {
              value = converter.apply(converter, value);
              if (!_.isArray(value)) {
                value = [value];
              }
            }
            return set.apply(subject.context, value);
          });
          _results.push(trigger ? subject.trigger(_event, subject.context, subject.get(attr)) : void 0);
        }
        return _results;
      },
      set: function(observer, interfaces) {
        return function() {
          var args, attrs, k, v, _i, _len, _ref, _ref2;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          attrs = {};
          _ref = _.zip(interfaces, args);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            _ref2 = _ref[_i], k = _ref2[0], v = _ref2[1];
            attrs[k] = v;
          }
          return observer.set(attrs);
        };
      }
    }
  };
  defaultRegisterOptions = {
    event: null,
    subjectInterface: null,
    observerInterface: null,
    converter: null,
    triggerOnBind: true
  };
  connectOne = function(subject, observer, options) {
    var converter, event, events, getHandler, observerInterface, setHandler, subjectInterface, triggerOnBind, _i, _len, _ref, _results;
    _.defaults(options, defaultRegisterOptions);
    events = getEvents(subject, options.event);
    _ref = getInterfaces(subject, observer, options.subjectInterface, options.observerInterface), subjectInterface = _ref[0], observerInterface = _ref[1];
    if ((converter = options.converter) && !_.isFunction(converter)) {
      converter = observer[converter];
    }
    triggerOnBind = options.triggerOnBind;
    getHandler = getHandlerForType(subject.type, 'get');
    setHandler = getHandlerForType(subject.type, 'set');
    setHandler = setHandler(observer, observerInterface);
    _results = [];
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      subject.observers[observer.guid][event] = true;
      observer.subjects[subject.guid][event] = true;
      _results.push(getHandler(subject, event, converter, subjectInterface, setHandler, triggerOnBind));
    }
    return _results;
  };
  connect = function() {
    var arg0, arg1, args, observer, opt, options, subject, _i, _len, _results;
    subject = arguments[0], observer = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (!subject.observers[observer.guid]) {
      subject.observers[observer.guid] = {};
    }
    if (!observer.subjects[subject.guid]) {
      observer.subjects[subject.guid] = {};
    }
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
    if (!_.isArray(options)) {
      options = [options];
    }
    _results = [];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      opt = options[_i];
      _results.push(connectOne(subject, observer, opt));
    }
    return _results;
  };
  detectElementInterface = function(elem) {
    var interface, item, selector, _i, _len, _ref;
    elem = jQuery(elem);
    _ref = Synapse.configuration.elementInterfaces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      selector = item[0], interface = item[1];
      if (elem.is(selector)) {
        return interface;
      }
    }
    if (Synapse.configuration.defaultElementInterface) {
      return Synapse.configuration.defaultElementInterface;
    }
    throw new Error("Interface for " + elem + " could not be detected.");
  };
  getInterfaces = function(subject, observer, subjectInterface, observerInterface) {
    var attr, el, _i, _j, _len, _len2, _ref, _ref2;
    if (!subjectInterface) {
      if (subject.type === Types.jquery) {
        subjectInterface = detectElementInterface(subject.context);
      } else if (subject.type === Types.view) {
        subjectInterface = detectElementInterface(subject.context.el);
      } else if (subject.type === Types.model) {
        subjectInterface = '';
      }
    }
    if (!observerInterface) {
      if (observer.type === Types.jquery) {
        observerInterface = detectElementInterface(observer.context);
      } else if (observer.type === Types.view) {
        observerInterface = detectElementInterface(observer.context.el);
      }
    }
    if (!subjectInterface) {
      el = null;
      if (observer.type === Types.jquery) {
        el = jQuery(observer.context);
      } else if (observer.type === Types.view) {
        el = jQuery(observer.context.el);
      }
      if (el) {
        _ref = Synapse.configuration.elementBindAttributes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attr = _ref[_i];
          if (el.attr(attr)) {
            subjectInterface = el.attr(attr);
            break;
          }
        }
      }
    }
    if (!observerInterface) {
      el = null;
      if (subject.type === Types.jquery) {
        el = jQuery(subject.context);
      } else if (subject.type === Types.view) {
        el = jQuery(subject.context.el);
      }
      if (el) {
        _ref2 = Synapse.configuration.elementBindAttributes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          attr = _ref2[_j];
          if (el.attr(attr)) {
            observerInterface = el.attr(attr);
            break;
          }
        }
      } else {
        observerInterface = subjectInterface;
      }
    }
    if (!observerInterface) {
      throw new Error("The interfaces between " + subject + " and " + observer + "                could be detected - " + subjectInterface + " => " + observerInterface);
    }
    if (_.isString(subjectInterface)) {
      subjectInterface = subjectInterface.split(' ');
    }
    if (_.isString(observerInterface)) {
      observerInterface = observerInterface.split(' ');
    }
    return [subjectInterface, observerInterface];
  };
  interfaces = (function() {
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
      if (_.isObject(key)) {
        return this.attr(key);
      } else {
        return this.attr(key, value);
      }
    };
    getStyle = function(key) {
      return this.css(key);
    };
    setStyle = function(key, value) {
      if (_.isObject(key)) {
        return this.css(key);
      } else {
        return this.css(key, value);
      }
    };
    interfaces.register({
      name: 'text',
      get: function() {
        return this.text();
      },
      set: function(value) {
        return this.text((value || (value = '')).toString());
      }
    });
    interfaces.register({
      name: 'html',
      get: function() {
        return this.html();
      },
      set: function(value) {
        return this.html((value || (value = '')).toString());
      }
    });
    interfaces.register({
      name: 'value',
      get: function() {
        return this.val();
      },
      set: function(value) {
        return this.val(value || (value = ''));
      }
    });
    interfaces.register({
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
    interfaces.register({
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
    interfaces.register({
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
    interfaces.register({
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
    interfaces.register({
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
    interfaces.register({
      name: 'prop',
      get: function(key) {
        return getProperty.call(this, key);
      },
      set: function(key, value) {
        return setProperty.call(this, key, value);
      }
    });
    interfaces.register({
      name: 'attr',
      get: function(key) {
        return getAttribute.call(this, key);
      },
      set: function(key, value) {
        return setAttribute.call(this, key, value);
      }
    });
    interfaces.register({
      name: 'style',
      get: function(key) {
        return getStyle.call(this, key);
      },
      set: function(key, value) {
        return setStyle.call(this, key, value);
      }
    });
    interfaces.register({
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
    return interfaces.register({
      name: 'data',
      get: function(key) {
        return this.data(key);
      },
      set: function(key, value) {
        return this.data(key, value);
      }
    });
  })();
  Synapse.getInterfaces = getInterfaces;
  Synapse.interfaces = interfaces;
  return window.Synapse = Synapse;
})(window);
