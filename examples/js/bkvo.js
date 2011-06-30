var bkvo, exports, parseInterfaceSignature, receiveAttribute, receiveCSS, receiveProperty, sendAttribute, sendCSS, sendProperty;
var __slice = Array.prototype.slice;
exports = this;
exports.bkvo = bkvo = {};
parseInterfaceSignature = function(sig) {
  var config, interface, observe, receive, send, _ref;
  _ref = sig.split(':'), send = _ref[0], interface = _ref[1], observe = _ref[2], receive = _ref[3];
  return config = {
    send: send,
    receive: receive,
    interface: interface,
    observes: observe.split(',')
  };
};
bkvo.interfaces = (function() {
  return {
    registry: {},
    register: function(config) {
      return this.registry[config.name] = config;
    },
    unregister: function(name) {
      return delete this.registry[name];
    },
    send: function() {
      var args, context, name;
      name = arguments[0], context = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      return this.registry[name].send.apply(context, args);
    },
    receive: function() {
      var args, context, name;
      name = arguments[0], context = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      return this.registry[name].receive.apply(context, args);
    }
  };
})();
sendProperty = function(key) {
  if (this.prop != null) {
    return this.prop(key);
  } else {
    return sendAttribute.call(this, key);
  }
};
receiveProperty = function(key, value) {
  if (this.prop != null) {
    if (typeof key === 'object') {
      return this.prop(key);
    } else {
      return this.prop(key, value);
    }
  } else {
    return receiveAttribute.call(this, key, value);
  }
};
sendAttribute = function(key) {
  return this.attr(key);
};
receiveAttribute = function(key, value) {
  if (typeof key === 'object') {
    return this.attr(key);
  } else {
    return this.attr(key, value);
  }
};
sendCSS = function(key) {
  return this.css(key);
};
receiveCSS = function(key, value) {
  if (typeof key === 'object') {
    return this.css(key);
  } else {
    return this.css(key, value);
  }
};
bkvo.interfaces.register({
  name: 'prop',
  send: function(key) {
    return sendProperty.call(this, key);
  },
  receive: function(key, value) {
    return receiveProperty.call(this, key, value);
  }
});
bkvo.interfaces.register({
  name: 'attr',
  send: function(key) {
    return sendAttribute.call(this, key);
  },
  receive: function(key, value) {
    return receiveAttribute.call(this, key, value);
  }
});
bkvo.interfaces.register({
  name: 'css',
  send: function(key) {
    return sendCSS.call(this, key);
  },
  receive: function(key, value) {
    return receiveCSS.call(this, key, value);
  }
});
bkvo.interfaces.register({
  name: 'visible',
  send: function(key) {},
  receive: function(key, value) {
    if (value) {
      return this.show();
    } else {
      return this.hide();
    }
  }
});
bkvo.interfaces.register({
  name: 'text',
  send: function(key) {
    return this.text();
  },
  receive: function(key, value) {
    value || (value = '');
    return this.text(value.toString());
  }
});
bkvo.interfaces.register({
  name: 'html',
  send: function(key) {
    return this.html();
  },
  receive: function(key, value) {
    value || (value = '');
    return this.html(value.toString());
  }
});
bkvo.interfaces.register({
  name: 'value',
  send: function(key) {
    return this.val();
  },
  receive: function(key, value) {
    value || (value = '');
    return this.val(value);
  }
});
bkvo.interfaces.register({
  name: 'enabled',
  send: function(key) {
    return !sendProperty.call(this, 'disabled');
  },
  receive: function(key, value) {
    return receiveProperty.call(this, 'disabled', !Boolean(value));
  }
});
bkvo.interfaces.register({
  name: 'disabled',
  send: function(key) {
    return receiveProperty.call(this, 'disabled');
  },
  receive: function(key, value) {
    return receiveProperty.call(this, 'disabled', Boolean(value));
  }
});
bkvo.interfaces.register({
  name: 'checked',
  send: function(key) {
    return sendProperty.call(this, 'checked');
  },
  receive: function(key, value) {
    return receiveProperty.call(this, 'checked', Boolean(value));
  }
});
/*

config =
    # two-way
    '[name=first-name]':
        keyup:
            value: 'firstName'

    # two-way
    '[name=last-name] keyup':
        value: 'lastName'
 
    # one-way ro
    '.name':
        html: 'firstName,lastName:getFullName'

    # one-way ro
    '.date':
        text: 'firstName,lastName,onTwitter:getDate'

    # one-way ro
    '[name=on-twitter]':
        enabled: 'firstName'

    # two-way
    '[name=on-twitter] change':
        prop:
            checked: 'onTwitter'

    # one-way ro
    '.twitter': visible: 'onTwitter'

    # one-way ro
    '.permalink':
        attr:
            href: 'url'
            title: 'firstName,lastName:getFullName'


'[name=first-name]'
    keyup: ':value:firstName:'

'[name=last-name]'
    keyup: ':value:lastName:'

'.name'
    noevent: ':html:firstName,lastName:getFullName'

'.date'
    noevent: ':text:firstName,lastName,onTwitter:getDate'

'[name=on-twitter]'
    noevent: ':prop:disabled=firstName:istrue'
    change: ':prop:checked=onTwitter:isfalse'

'.twitter'
    noevent: ':visible:onTwitter:'

'.permalink'
    noevent: [':attr:href=url:', ':attr:firstName,lastName:getFullName']

    

<selector> : <event>

<event> : <interface> | attr | prop | css

<proxy> : <interface> +

<interface> : <config>

<config> : 'attr1[,attr2,...][:receive]' |
    <observes> : string | array
    <send> : string | function
    <receive> : string | function
    ...


*/
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
        Model    Controller    DOM Element


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

    An event-ready object such as a Backbone Model, Collection, or Controller.
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

*/
(function() {
  var BKVO, defaults, detectObjectInterface, getObjectType, notifyObservers, registerObserver, types;
  this.BKVO = this.BKVO || {};
  BKVO = this.BKVO;
  defaults = {
    autoExtendObjects: true,
    debug: false
  };
  _.defaults(BKVO, defaults);
  if (this.console != null) {
    BKVO.log = function(msg) {
      return console.log(msg);
    };
  } else {
    BKVO.log = function(msg) {
      return alert(msg);
    };
  }
  types = {
    jquery: 0,
    evented: 1,
    view: 2,
    controller: 3,
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
    if (object instanceof Backbone.Controller) {
      return types.controller;
    }
    _ref = ['bind', 'unbind', 'trigger'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      method = _ref[_i];
      if (!object[method]) {
        if (!BKVO.autoExtendObjects) {
          throw Error("Object does not have a " + method + " method. ensure\nthe object has been extended from Backbone.Events or set\nBKVO.autoExtendObjects to true.");
        }
        _.extend(object, Backbone.Events);
        if (BKVO.debug) {
          BKVO.log("" + object + " extended with Backbone.Events");
        }
        break;
      }
    }
    return types.evented;
  };
  detectObjectInterface = function(object) {
    var tag, type;
    tag = object.prop('tagName').toLowerCase();
    if (tag === 'input') {
      type = object.prop('type').toLowerCase();
      if (type === 'checkbox' || type === 'radio') {
        return 'prop:checked';
      }
      return 'value';
    }
    if (tag === 'select') {
      return 'value';
    }
  };
  registerObserver = function(observer, subject, options) {
    var observerType, property, subjectType, _i, _len, _ref, _results;
    if (typeof observer === 'string') {
      observer = $(observer);
      observerType = types.jquery;
    } else {
      observerType = getObjectType(observer);
    }
    if (typeof subject === 'string') {
      subject = $(subject);
      subjectType = types.jquery;
    } else {
      subjectType = getObjectType(subject);
    }
    if (subjectType === types.model || subjectType === types.collection) {
      _ref = options.targetProperties;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        property = _ref[_i];
        _results.push((function(property) {
          return subject.bind("change:" + property, function(object, value, options) {});
        })(property));
      }
      return _results;
    }
  };
  notifyObservers = function(subject) {
    var observers;
    if (subject instanceof $) {
      return observers = subject.data('_observers') || {};
    }
  };
  jQuery.fn.observe = function(object, options) {};
  if (BKVO.debug) {
    BKVO.types = types;
    BKVO.getObjectType = getObjectType;
    return BKVO.detectObjectInterface = detectObjectInterface;
  }
})();
