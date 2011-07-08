/*

Backbone KVO (BKVO) implements a basic _observer pattern_ in which there is a
subject and an observer. Whenever the state of the subject changes, it
notifies each observer of this change.

To ensure consistency of state between subject and observer, the observer
can choose to notify the subject of any change in state of itself.

The simplest subject-observer relationship (also called a binding) is one-way
and downstream. That is, the observer is notified of a change in state by the
subject, but the observer does not send a notification back to the subject.

The two primary binding types are:

    two-way (sync): where the subject and observer notify each other of their
    respective changes in state, e.g. observing each other.

    one-way: where the subject notifies the observer of it's change in state.

There are also two types of one-way bindings to make use of Backbone events
and DOM events:

    DOM => observer: when a DOM event is triggered, relative to the subject
    element, it will notify the observer.

    event-ready object => observer: when an object that has been extended from
    Backbone.Events has a bound event triggered, it will notify the observer.


Example scenarios:

    event-ready object triggered => executes observer handler (most basic)

        An event is triggered which executes a handler the observer supplied.
        This is useful for executing cutom logic.

    event-ready object triggered => sets an observer attribute

        Backbone Hook: a DOM element (input, checkbox, etc.) can provide a
        value to a Backbone Model interfaceing a particular attribute. This is
        performed via key-value coding (KVC) techniques.


            ....Evented Object....
           /         |            \
        Model    Router    DOM Element


API use:

    # it reads.. the '#person1' element will observe ``person1.name`` and keep
    # the element's innerText updated
    $('#person1 .name').observe(person1, 'text:name');

    $('#person1').observe(person1, {
        localProperty: 'text',
        interfaceProperty: 'name',
    });


    # takes an object or CSS selector
    person1.observe('#person1 input[name=name]', 'name:value');

    person1.observe('#person1 input[name=name]', {
        localProperty: 'name',
        interfaceProperty: 'value'
    });


    # if the parent's home address changes, so does the child's
    child.observe(parent, ['street', 'city', 'state', 'zipcode]);

    # interfaceProperties is an alias for interfaceProperty, but if both are
    # set, the plural form takes precedence
    child.observe(parent, {
        interfaceProperties: ['street', 'city', 'state', 'zipcode]
    });


    # the addressView observes the parent object watches for any one of the
    # interface properties to change. all values (in order) will be passed into
    # the notifyHandler (that exists on the view) along with subject.
    addressView.observe(parent, {
        interfaceProperties: ['street', 'city', 'state', 'zipcode],
        notifyHandler: 'formatAddress'
    });


    # this element observes any attribute change on person1 and
    # sets it with the same name in it's $(...).data() hash.
    $('#person1').observe(person1);

    # same as above except the the properties will be set as element
    # attributes instead of data values i.e. $(...).attr()
    $('#person1').observe(person1, {
        localInterface: 'attr'
    });


Arguments:

    arguments := subject, config

    subject := jQuery | Evented Object

    config := full | [mapping, ...] | mapping

    mapping := 'interface' | 'local:interface'


Object Types:

    A jQuery object can be used for simple bindings where no additional logic
    or rendering is required.

    A Backbone View acts a container/proxy for a jQuery element, thus it uses
    all the same options a jQuery object would use. If there are templates
    being used or custom handlers a view should be used.

    An event-ready object such as a Backbone Model, Collection, or Router.
    Any object can become event-ready. Simply extend the object with the
    Backbone.Event model:

        var object = {};
        _.extend(object, Backbone.Events);

    or using jQuery:

        var object = {};
        $.extend(object, Backbone.Events);


General options:

    localProperty(-ies): a single or array of local properties that will be
    updated relative to the subject. Depends on interfaceProperty(-ies)

    interfaceProperty(-ies): a single or array of interface properties (located on
    the subject being observed) that the subject will notify the observer of
    when any of them change.

    notifyHandler: a function that takes the value of each interfaceProperty as
    arguments maps or reduces the values to the localProperty(-ies).

Object Type-specific options:

    localInterface & interfaceInterface (DOM): by default the interface will be
    determined based on the element type e.g. form fields interface is the
    ``value`` property. the interface can be 'data', 'attr', or 'prop'.

    event(s) (DOM): an event or list of events that will be trigger a
    notification to all observers.

*/var ObserverableModel, getAttribute, getProperty, getStyle, setAttribute, setProperty, setStyle;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __slice = Array.prototype.slice;
ObserverableModel = void 0;
(function() {
  var BKVO, defaultOptions, defaults, detectDomEvent, detectElementInterface, getEvents, getInterfaces, getObjectType, handlers, log, types;
  if (!(_.isObject != null)) {
    _.isObject = function(object) {
      return object === Object(object);
    };
  }
  this.BKVO = this.BKVO || {};
  BKVO = this.BKVO;
  defaults = {
    autoExtendObjects: true,
    debug: false
  };
  _.defaults(BKVO, defaults);
  BKVO.defaultElementInterfaces = {
    _: 'html',
    input: 'value',
    select: 'value',
    textarea: 'value',
    checkbox: 'checked',
    radio: 'checked'
  };
  BKVO.defaultDomEvents = {
    input: 'keyup',
    button: 'click',
    submit: 'submit',
    select: 'change',
    checkbox: 'change',
    radio: 'change',
    textarea: 'change'
  };
  if (this.console != null) {
    log = function(msg) {
      if (BKVO.debug) {
        return console.log(msg);
      }
    };
  } else {
    log = function(msg) {
      if (BKVO.debug) {
        return alert(msg);
      }
    };
  }
  types = {
    jquery: 0,
    evented: 1,
    view: 2,
    router: 3,
    model: 4,
    collection: 5
  };
  handlers = {
    0: {
      subject: function(event, object, interface, handler) {
        object.bind(event, function() {
          var value;
          value = BKVO.interfaces.get(object, interface);
          return handler(object, value);
        });
        return object.trigger(event);
      },
      observer: function(object, interface, handler) {
        return function(subject, value) {
          if (handler) {
            value = handler(subject, value);
          }
          return BKVO.interfaces.set(object, interface, value);
        };
      }
    },
    4: {
      subject: function(event, object, interface, handler) {
        if (interface) {
          event = "" + event + ":" + interface;
        }
        object.bind(event, function(model, value, options) {
          return handler(object, value);
        });
        return object.trigger(event, object, object.get(interface));
      },
      observer: function(object, interface, handler) {
        return function(subject, value) {
          var attrs;
          if (handler) {
            value = handler(subject, value);
          }
          attrs = {};
          attrs[interface] = value;
          return object.set(attrs);
        };
      }
    }
  };
  getObjectType = function(object) {
    var method, _i, _len, _ref;
    if (object instanceof $) {
      return types.jquery;
    }
    if (object instanceof Backbone.View) {
      return types.view;
    }
    if (object instanceof Backbone.Collection) {
      return types.collection;
    }
    if (object instanceof Backbone.Model) {
      return types.model;
    }
    if (object instanceof Backbone.Router) {
      return types.router;
    }
    _ref = ['bind', 'unbind', 'trigger'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      method = _ref[_i];
      if (!object[method]) {
        if (!BKVO.autoExtendObjects) {
          throw Error("Object does not have a " + method + " method. ensure\nthe object has been extended from Backbone.Events or set\nBKVO.autoExtendObjects to true.");
        }
        _.extend(object, Backbone.Events);
        log("" + object + " extended with Backbone.Events");
        break;
      }
    }
    return types.evented;
  };
  detectElementInterface = function(object) {
    var interface, tag, type;
    tag = object.prop('tagName').toLowerCase();
    interface = BKVO.defaultElementInterfaces[tag];
    if (tag === 'input') {
      type = object.prop('type').toLowerCase();
      interface = BKVO.defaultElementInterfaces[type] || interface;
    }
    interface || (interface = BKVO.defaultElementInterfaces['_']);
    if (!interface) {
      throw new Error('An interface for this element could not be detected');
    }
    return interface;
  };
  detectDomEvent = function(object) {
    var event, tag, type;
    tag = object.prop('tagName').toLowerCase();
    event = BKVO.defaultDomEvents[tag];
    if (tag === 'input') {
      type = object.prop('type').toLowerCase();
      event = BKVO.defaultDomEvents[type] || event;
    }
    event || (event = BKVO.defaultDomEvents['_']);
    if (!event) {
      throw new Error('A DOM event for this element could not be detected');
    }
    return event;
  };
  getEvents = function(subject, event) {
    var events, type;
    if (!event) {
      type = getObjectType(subject);
      if (type === types.jquery) {
        events = [detectDomEvent(subject)];
      } else if (type === types.model) {
        events = ['change'];
      } else {
        throw new Error('No event defined for subject');
      }
    } else {
      events = !_.isArray(event) ? [event] : event;
    }
    return events;
  };
  getInterfaces = function(observer, subject, interface) {
    var interfaces, key, oType, sType, value;
    interfaces = {};
    oType = getObjectType(observer);
    sType = getObjectType(subject);
    if (!interface) {
      key = null;
      value = null;
      if (sType === types.jquery) {
        value = detectElementInterface(subject);
        if (oType === types.model) {
          key = subject.attr('name');
        }
      }
      if (oType === types.jquery) {
        key = detectElementInterface(observer);
        if (!value && observer.attr('name')) {
          value = observer.attr('name');
        }
      }
      if (!value && sType === types.model) {
        value = '';
      }
      if (key === null || value === null) {
        throw new Error('The interface could be detected');
      }
      interfaces[key] = value;
    } else {
      if (_.isString(interface) || _.isArray(interface)) {
        value = interface;
        if (oType === types.jquery) {
          key = detectElementInterface(observer);
        } else if (_.isString(interface)) {
          key = value;
        } else {
          throw new Error('The observer interface could not be determined');
        }
        interfaces[key] = value;
      } else {
        interfaces = interface;
      }
    }
    return interfaces;
  };
  defaultOptions = {
    event: null,
    interface: null,
    handler: null
  };
  BKVO.registerSync = function(object1, object2) {
    BKVO.registerObserver(object1, object2);
    return BKVO.registerObserver(object2, object1);
  };
  BKVO.registerObserver = function(observer, subject, _options) {
    var event, events, handler, interfaces, oInterface, oType, observerHandler, options, sInterface, sType, si, subjectHandler, _i, _len, _results;
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
    _.extend(options, defaultOptions, _options);
    if (_.isString(observer) || _.isElement(observer)) {
      observer = $(observer);
    }
    if (_.isString(subject) || _.isElement(subject)) {
      subject = $(subject);
    }
    events = getEvents(subject, options.event);
    interfaces = getInterfaces(observer, subject, options.interface);
    oType = getObjectType(observer);
    sType = getObjectType(subject);
    handler = options.handler;
    if (handler && !_.isFunction(handler)) {
      handler = observer[handler];
    }
    observerHandler = handlers[oType].observer;
    subjectHandler = handlers[sType].subject;
    _results = [];
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      _results.push((function() {
        var _results;
        _results = [];
        for (oInterface in interfaces) {
          sInterface = interfaces[oInterface];
          handler = observerHandler(observer, oInterface, handler);
          _results.push((function() {
            var _i, _len, _results;
            if (_.isArray(sInterface)) {
              _results = [];
              for (_i = 0, _len = sInterface.length; _i < _len; _i++) {
                si = sInterface[_i];
                _results.push(subjectHandler(event, subject, si, handler));
              }
              return _results;
            } else {
              return subjectHandler(event, subject, sInterface, handler);
            }
          })());
        }
        return _results;
      })());
    }
    return _results;
  };
  jQuery.fn.observe = function(subject, options) {
    return BKVO.registerObserver(this, subject, options);
  };
  jQuery.fn.sync = function(other) {
    return BKVO.registerSync(this, other);
  };
  ObserverableModel = (function() {
    function ObserverableModel() {
      ObserverableModel.__super__.constructor.apply(this, arguments);
    }
    __extends(ObserverableModel, Backbone.Model);
    ObserverableModel.prototype.observe = function(subject, options) {
      return BKVO.registerObserver(this, subject, options);
    };
    ObserverableModel.prototype.sync = function(other) {
      return BKVO.registerSync(this, other);
    };
    return ObserverableModel;
  })();
  if (BKVO.debug) {
    BKVO.types = types;
    BKVO.getObjectType = getObjectType;
    BKVO.detectElementInterface = detectElementInterface;
    BKVO.detectDomEvent = detectDomEvent;
    BKVO.getEvents = getEvents;
    return BKVO.getInterfaces = getInterfaces;
  }
})();
BKVO.interfaces = (function() {
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
      _ref = name.split(':'), name = _ref[0], key = _ref[1];
      if (key != null) {
        args = [key].concat(args);
      }
      return this.registry[name].get.apply(context, args);
    },
    set: function() {
      var args, context, key, name, _ref;
      context = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      _ref = name.split(':'), name = _ref[0], key = _ref[1];
      if (key != null) {
        args = [key].concat(args);
      }
      return this.registry[name].set.apply(context, args);
    }
  };
})();
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
BKVO.interfaces.register({
  name: 'prop',
  get: function(key) {
    return getProperty.call(this, key);
  },
  set: function(key, value) {
    return setProperty.call(this, key, value);
  }
});
BKVO.interfaces.register({
  name: 'attr',
  get: function(key) {
    return getAttribute.call(this, key);
  },
  set: function(key, value) {
    return setAttribute.call(this, key, value);
  }
});
BKVO.interfaces.register({
  name: 'style',
  get: function(key) {
    return getStyle.call(this, key);
  },
  set: function(key, value) {
    return setStyle.call(this, key, value);
  }
});
BKVO.interfaces.register({
  name: 'text',
  get: function() {
    return this.text();
  },
  set: function(value) {
    return this.text((value || (value = '')).toString());
  }
});
BKVO.interfaces.register({
  name: 'html',
  get: function() {
    return this.html();
  },
  set: function(value) {
    return this.html((value || (value = '')).toString());
  }
});
BKVO.interfaces.register({
  name: 'value',
  get: function() {
    return this.val();
  },
  set: function(value) {
    return this.val(value || (value = ''));
  }
});
BKVO.interfaces.register({
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
BKVO.interfaces.register({
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
BKVO.interfaces.register({
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
BKVO.interfaces.register({
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
BKVO.interfaces.register({
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
BKVO.interfaces.register({
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
