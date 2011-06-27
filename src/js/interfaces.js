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