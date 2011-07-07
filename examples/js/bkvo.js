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
        value to a Backbone Model targeting a particular attribute. This is
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
        targetProperty: 'name',
    });


    # takes an object or CSS selector
    person1.observe('#person1 input[name=name]', 'name:value');

    person1.observe('#person1 input[name=name]', {
        localProperty: 'name',
        targetProperty: 'value'
    });


    # if the parent's home address changes, so does the child's
    child.observe(parent, ['street', 'city', 'state', 'zipcode]);

    # targetProperties is an alias for targetProperty, but if both are
    # set, the plural form takes precedence
    child.observe(parent, {
        targetProperties: ['street', 'city', 'state', 'zipcode]
    });


    # the addressView observes the parent object watches for any one of the
    # target properties to change. all values (in order) will be passed into
    # the notifyHandler (that exists on the view) along with subject.
    addressView.observe(parent, {
        targetProperties: ['street', 'city', 'state', 'zipcode],
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

    mapping := 'target' | 'local:target'


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
    updated relative to the subject. Depends on targetProperty(-ies)

    targetProperty(-ies): a single or array of target properties (located on
    the subject being observed) that the subject will notify the observer of
    when any of them change.

    notifyHandler: a function that takes the value of each targetProperty as
    arguments maps or reduces the values to the localProperty(-ies).

Object Type-specific options:

    localInterface & targetInterface (DOM): by default the interface will be
    determined based on the element type e.g. form fields interface is the
    ``value`` property. the interface can be 'data', 'attr', or 'prop'.

    event(s) (DOM): an event or list of events that will be trigger a
    notification to all observers.

*/var getAttribute, getProperty, getStyle, setAttribute, setProperty, setStyle;
var __slice = Array.prototype.slice;
(function() {
  var BKVO, defaultOptions, defaults, detectDomEvent, detectElementInterface, getEvents, getHandlerForType, getObjectType, getTargets, log, types;
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
    _: 'text',
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
  getEvents = function(event, object, type) {
    var events;
    if (!event) {
      if (type === types.jquery) {
        events = [detectDomEvent(subject)];
      } else if (type === types.model) {
        events = ['change'];
      } else {
        throw new Error('No event defined for subject');
      }
    } else {
      if (!_.isArray(event)) {
        events = [event];
      } else {
        events = event;
      }
    }
    return events;
  };
  getTargets = function(target, observer, observerType, subject, subjectType) {
    var targets;
    targets = null;
    if (!target) {
      if (subjectType === types.jquery) {
        if (subject.attr('name')) {
          targets = [subject.attr('name')];
        }
      } else if (observerType === types.jquery) {
        if (observer.attr('name')) {
          targets = [observer.attr('name')];
        }
      }
      if (!targets) {
        throw new Error('No target could be detected');
      }
    } else {
      if (!_.isArray(target)) {
        targets = [target];
      } else {
        targets = target;
      }
    }
    return targets;
  };
  getHandlerForType = function(handler, object, type) {
    var cache, interface;
    cache = {};
    if (type === types.jquery) {
      interface = detectElementInterface(object);
      handler = function(key, value) {
        value = _handler(value);
        if (value !== cache[key] || _.isEqual(value, cache[key])) {
          cache[key] = value;
          return BKVO.interfaces.set(object, interface, value);
        }
      };
    } else if (type === types.model) {
      handler = function(key, value) {
        var attrs, cacheKey;
        cacheKey = _.isObject(value) ? _.keys(value).toString() : key;
        value = _handler(value);
        if (value !== cache[key] || _.isEqual(value, cache[key])) {
          cache[key] = value;
          if (_.isString(value)) {
            attrs = {};
            attrs[key] = value;
          } else {
            attrs = value;
          }
        }
        return object.set(attrs);
      };
    }
    return handler;
  };
  defaultOptions = {
    event: null,
    target: null,
    handler: function(_) {
      return _;
    }
  };
  BKVO.registerObserver = function(observer, subject, _options) {
    var event, events, handler, interface, observerType, options, subjectType, targets, _i, _j, _len, _len2, _results, _results2;
    options = {};
    if (_.isString(_options) || _.isArray(_options)) {
      _options = {
        target: _options
      };
    }
    _.extend(options, defaultOptions, _options);
    if (_.isString(observer) || _.isElement(observer)) {
      observer = $(observer);
      observerType = types.jquery;
    } else {
      observerType = getObjectType(observer);
    }
    if (_.isString(subject) || _.isElement(subject)) {
      subject = $(subject);
      subjectType = types.jquery;
    } else {
      subjectType = getObjectType(subject);
    }
    events = getEvents(options.event, subject, subjectType);
    targets = getTargets(options.target, observer, observerType, subject, subjectType);
    handler = getHandlerForType(options.handler, observer, observerType);
    if (subjectType === types.model) {
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        _results.push((function(event) {
          var property, _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = targets.length; _j < _len2; _j++) {
            property = targets[_j];
            _results2.push((function(property) {
              return subject.bind("" + event + ":" + property, function(object, value, options) {
                var attrs, prop, _k, _len3;
                if (targets.length > 1) {
                  attrs = {};
                  for (_k = 0, _len3 = targets.length; _k < _len3; _k++) {
                    prop = targets[_k];
                    attrs[prop] = subject.get(prop);
                  }
                } else {
                  attrs = value;
                }
                return handler(property, attrs);
              });
            })(property));
          }
          return _results2;
        })(event));
      }
      return _results;
    } else if (subjectType === types.jquery) {
      interface = detectElementInterface(subject);
      _results2 = [];
      for (_j = 0, _len2 = events.length; _j < _len2; _j++) {
        event = events[_j];
        _results2.push((function(event) {
          var property, _k, _len3, _results3;
          _results3 = [];
          for (_k = 0, _len3 = targets.length; _k < _len3; _k++) {
            property = targets[_k];
            _results3.push((function(property) {
              return subject.bind(event, function(evt, data) {
                var value;
                value = BKVO.interfaces.get(subject, interface);
                return handler(property, value);
              });
            })(property));
          }
          return _results3;
        })(event));
      }
      return _results2;
    }
  };
  if (BKVO.debug) {
    BKVO.types = types;
    BKVO.getObjectType = getObjectType;
    BKVO.detectElementInterface = detectElementInterface;
    return BKVO.detectDomEvent = detectDomEvent;
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
