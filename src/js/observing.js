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


Options:

event: string | array<string> - the event(s) that will trigger the
notification by the subject to the observer

interface: string | object - defines the interface attribute/interface of
the subject that will be observed. for simple one-interface binds, a
string can be used, otherwise used an object to define multiple
interfaces. if a string is used, the observer is assumed to be a DOM
element and the interface will be auto-detected. each key represents
the an attribute/interface of the observer, while the corresponding
value represents the attribute/interface that will be observed on the
subject. the value can also be an array.

    {
        'text': ['firstName', 'lastName']
        'visible': 'visible'
    }

if the key is not defined, it is expected the handler will perform any
necessary tasks or utilize any interfaces. otherwise, the handler will
act as an pre-processor to the setting or interfacing of that data.

handler: string | function - defines the handler that will be called
when the observer is notified of the subject's change in state. the
subject along with the changed value (or values in order) will be
passed into the handler. if a string is used, the observer is assumed
to have a method declared on it of the same name.

*/var ObserverableModel;
if (!(_.isObject != null)) {
  _.isObject = function(object) {
    return object === Object(object);
  };
}
ObserverableModel = void 0;
(function() {
  var baseBKVO, defaultBKVO, error, log;
  log = function() {
    if (BKVO.debug) {
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
  error = function(msg) {
    throw new Error(msg);
  };
  defaultBKVO = {
    autoExtendObjects: true,
    debug: false
  };
  baseBKVO = this.BKVO || {};
  _.defaults(baseBKVO, defaultBKVO);
  return this.BKVO = (function() {
    var BKVO, defaultOptions;
    BKVO = function(object) {
      return new BKVO.fn.init(object);
    };
    _.extend(BKVO, baseBKVO);
    BKVO.types = {
      jquery: 0,
      evented: 1,
      view: 2,
      router: 3,
      model: 4,
      collection: 5
    };
    BKVO.getObjectType = function(object) {
      if (object instanceof $) {
        return BKVO.types.jquery;
      }
      if (object instanceof Backbone.View) {
        return BKVO.types.view;
      }
      if (object instanceof Backbone.Collection) {
        return BKVO.types.collection;
      }
      if (object instanceof Backbone.Model) {
        return BKVO.types.model;
      }
      if (object instanceof Backbone.Router) {
        return BKVO.types.router;
      }
      return BKVO.types.evented;
    };
    BKVO.defaultElementInterfaces = [[':checkbox', 'checked'], [':radio', 'checked'], ['button', 'html'], [':input', 'value'], ['*', 'text']];
    BKVO.defaultDomEvents = [['a,:button,:reset', 'click'], ['select,:checkbox,:radio,textarea', 'change'], [':submit', 'submit'], [':input', 'keyup']];
    BKVO.detectElementInterface = function(elem) {
      var interface, item, selector, _i, _len, _ref;
      _ref = BKVO.defaultElementInterfaces;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        selector = item[0], interface = item[1];
        if (elem.object.is(selector)) {
          return interface;
        }
      }
      return error("Interface for " + elem + " could not be detected.");
    };
    BKVO.detectDomEvent = function(elem) {
      var event, item, selector, _i, _len, _ref;
      _ref = BKVO.defaultDomEvents;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        selector = item[0], event = item[1];
        if (elem.object.is(selector)) {
          return event;
        }
      }
      return error("Event for " + elem + " could not be detected.");
    };
    BKVO.handlers = {
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
      1: {
        subject: function(event, object, interface, handler) {
          object.bind(event, function() {
            var value;
            value = object[interface];
            return handler(object, value);
          });
          return object.trigger(event);
        },
        observer: function(object, interface, handler) {
          return function(subject, value) {
            if (handler) {
              value = handler(subject, value);
            }
            return object[interface] = value;
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
    BKVO.getEvents = function(subject, event) {
      var events;
      if (!event) {
        if (subject.type === BKVO.types.jquery) {
          events = [BKVO.detectDomEvent(subject)];
        } else if (subject.type === BKVO.types.model) {
          events = ['change'];
        } else {
          error('No event defined for subject');
        }
      } else {
        events = !_.isArray(event) ? [event] : event;
      }
      return events;
    };
    BKVO.getInterfaces = function(observer, subject, interface) {
      var interfaces, key, value, _ref;
      interfaces = {};
      if (!interface) {
        key = null;
        value = null;
        if (subject.type === BKVO.types.jquery) {
          value = BKVO.detectElementInterface(subject);
          if ((_ref = observer.type) === BKVO.types.model || _ref === BKVO.types.evented) {
            key = subject.object.attr('name');
          }
        }
        if (observer.type === BKVO.types.jquery) {
          key = BKVO.detectElementInterface(observer);
          if (!value) {
            value = observer.object.attr('name') || null;
          }
        }
        if (value === null && subject.type === BKVO.types.model) {
          value = '';
        }
        if (key === null || value === null) {
          error('The interface could be detected');
        }
        interfaces[key] = value;
      } else {
        if (_.isString(interface) || _.isArray(interface)) {
          value = interface;
          if (observer.type === BKVO.types.jquery) {
            key = BKVO.detectElementInterface(observer);
          } else if (_.isString(interface)) {
            key = value;
          } else {
            error('The observer interface could not be determined');
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
      var event, events, handler, interfaces, oInterface, observerHandler, options, sInterface, si, subjectHandler, _i, _len, _results;
      if (!(observer instanceof BKVO)) {
        observer = BKVO(observer);
      }
      if (!(subject instanceof BKVO)) {
        subject = BKVO(subject);
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
      _.extend(options, defaultOptions, _options);
      events = BKVO.getEvents(subject, options.event);
      interfaces = BKVO.getInterfaces(observer, subject, options.interface);
      handler = options.handler;
      if (handler && !_.isFunction(handler)) {
        handler = observer[handler];
      }
      observerHandler = BKVO.handlers[observer.type].observer;
      subjectHandler = BKVO.handlers[subject.type].subject;
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        _results.push((function() {
          var _results;
          _results = [];
          for (oInterface in interfaces) {
            sInterface = interfaces[oInterface];
            handler = observerHandler(observer.object, oInterface, handler);
            _results.push((function() {
              var _i, _len, _results;
              if (_.isArray(sInterface)) {
                _results = [];
                for (_i = 0, _len = sInterface.length; _i < _len; _i++) {
                  si = sInterface[_i];
                  _results.push(subjectHandler(event, subject.object, si, handler));
                }
                return _results;
              } else {
                return subjectHandler(event, subject.object, sInterface, handler);
              }
            })());
          }
          return _results;
        })());
      }
      return _results;
    };
    BKVO.fn = BKVO.prototype = {
      version: '0.9',
      constructor: BKVO,
      init: function(object, cxt) {
        if (object instanceof BKVO) {
          return object;
        }
        if (_.isString(object) || _.isElement(object)) {
          object = $(object, cxt);
        } else if ($.isPlainObject(object)) {
          _.extend(object, Backbone.Events);
        }
        this.type = BKVO.getObjectType(object);
        this.object = object;
        return this;
      },
      sync: function(other) {
        BKVO.registerSync(this, other);
        return this;
      },
      observe: function(subject, options) {
        BKVO.registerObserver(this, subject, options);
        return this;
      },
      notify: function(observer, options) {
        BKVO.registerObserver(observer, this, options);
        return this;
      }
    };
    BKVO.fn.init.prototype = BKVO.fn;
    return BKVO;
  })();
})();