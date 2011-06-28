var ObservableView, bkvo, exports, parseBindings, parseInterfaceSignature, receiveAttribute, receiveCSS, receiveProperty, sendAttribute, sendCSS, sendProperty, setupBinding;
var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
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

shorthand syntax:

    event : 'interfaceName[:sendHandler][:key1=attr1,key2=attr2][:receiveHandler]'

*/
parseBindings = function(bindings) {
  var config, configs, element, event, events, selector, _results;
  _results = [];
  for (selector in bindings) {
    events = bindings[selector];
    element = this.$(selector);
    _results.push((function() {
      var _results2;
      _results2 = [];
      for (event in events) {
        configs = events[event];
        if (!$.isArray(configs)) {
          configs = [configs];
        }
        if (event === 'noevent') {
          event = null;
        }
        _results2.push((function() {
          var _i, _len, _results3;
          _results3 = [];
          for (_i = 0, _len = configs.length; _i < _len; _i++) {
            config = configs[_i];
            if (typeof config === 'string') {
              config = parseInterfaceSignature(config);
            }
            if (!$.isArray(config.observes)) {
              config.observes = [config.observes];
            }
            _results3.push(setupBinding.call(this, element, event, config));
          }
          return _results3;
        }).call(this));
      }
      return _results2;
    }).call(this));
  }
  return _results;
};
setupBinding = function(element, event, config) {
  var attr, interface, key, model, observee, observes, receive, send, toElement, _i, _len, _ref, _results;
  model = this.model;
  send = config.send;
  interface = config.interface;
  observes = config.observes;
  receive = config.receive;
  if ((send != null) && typeof send !== 'function') {
    send = this[send] || model[send];
  }
  if ((receive != null) && typeof receive !== 'function') {
    receive = this[receive] || model[receive];
  }
  if (observes != null) {
    toElement = __bind(function(model, value, options) {
      if ((options != null) && options.loopback === false) {
        if (options.callee === element) {
          return;
        }
      }
      value = receive ? receive(value) : value;
      return bkvo.interfaces.receive(interface, element, key, value);
    }, this);
    _results = [];
    for (_i = 0, _len = observes.length; _i < _len; _i++) {
      observee = observes[_i];
      _ref = observee.split('='), attr = _ref[0], key = _ref[1];
      if (!(key != null)) {
        key = attr;
      }
      if (event) {
        __bind(function(attr, key) {
          var toModel;
          toModel = __bind(function(evt, params) {
            var data, options, value;
            data = {};
            options = {
              attr: attr
            };
            value = bkvo.interfaces.send(interface, element, key);
            value = send ? send(value) : value;
            data[attr] = value;
            if (config.loopback != null) {
              options.callee = element;
              options.loopback = config.loopback;
            }
            return model.set(data, options);
          }, this);
          return element.bind(event, toModel);
        }, this)(attr, key);
      }
      model.bind("change:" + attr, toElement);
      _results.push(model.trigger("change:" + attr, model, model.get(attr)));
    }
    return _results;
  } else {
    return element.bind(event, send);
  }
};
ObservableView = (function() {
  function ObservableView() {
    this.setupBindings = __bind(this.setupBindings, this);;    ObservableView.__super__.constructor.apply(this, arguments);
  }
  __extends(ObservableView, Backbone.View);
  ObservableView.prototype.setupBindings = function() {
    return parseBindings.call(this, this.bindings);
  };
  return ObservableView;
})();
