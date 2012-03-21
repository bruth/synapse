
var __slice = Array.prototype.slice;

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define('synapse/zepto', ['synapse/core', 'zepto', 'exports'], function(core, $, exports) {
      return factory(root, exports, core, $);
    });
  } else if (typeof exports === 'undefined') {
    return root.ZeptoHook = factory(root, {}, root.SynapseCore, root.Zepto);
  }
})(this, function(root, ZeptoHook, core) {
  var domEvents, elementBindAttributes, elementInterfaces, interfaces;
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
        var args, iface, key, name, object, _ref;
        object = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        _ref = name.split('.'), name = _ref[0], key = _ref[1];
        if (key != null) args = [key].concat(args);
        if ((iface = this.registry[name])) return iface.get.apply(object, args);
      },
      set: function() {
        var args, iface, key, name, object, _ref;
        object = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        _ref = name.split('.'), name = _ref[0], key = _ref[1];
        if (key != null) args = [key].concat(args);
        if ((iface = this.registry[name])) return iface.set.apply(object, args);
      }
    };
  })();
  (function() {
    var getAttribute, getCss, getProperty, setAttribute, setCss, setProperty;
    getProperty = function(key) {
      if (this.prop != null) return this.prop(key);
      return getAttribute.call(this, key);
    };
    setProperty = function(key, value) {
      if (this.prop != null) {
        if (typeof key === 'object') return this.prop(key);
        return this.prop(key, value);
      }
      return setAttribute.call(this, key, value);
    };
    getAttribute = function(key) {
      return this.attr(key);
    };
    setAttribute = function(key, value) {
      if (core.isObject(key)) {
        return this.attr(key);
      } else {
        return this.attr(key, value);
      }
    };
    getCss = function(key) {
      return this.css(key);
    };
    setCss = function(key, value) {
      if (core.isObject(key)) {
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
        return this.text((value != null ? value : '').toString());
      }
    });
    interfaces.register({
      name: 'html',
      get: function() {
        return this.html();
      },
      set: function(value) {
        return this.html((value != null ? value : '').toString());
      }
    });
    interfaces.register({
      name: 'value',
      get: function() {
        return this.val();
      },
      set: function(value) {
        return this.val(value != null ? value : '');
      }
    });
    interfaces.register({
      name: 'enabled',
      get: function() {
        return !getProperty.call(this, 'disabled');
      },
      set: function(value) {
        if (core.isArray(value) && value.length === 0) value = false;
        return setProperty.call(this, 'disabled', !Boolean(value));
      }
    });
    interfaces.register({
      name: 'disabled',
      get: function() {
        return getProperty.call(this, 'disabled');
      },
      set: function(value) {
        if (core.isArray(value) && value.length === 0) value = false;
        return setProperty.call(this, 'disabled', Boolean(value));
      }
    });
    interfaces.register({
      name: 'checked',
      get: function() {
        return getProperty.call(this, 'checked');
      },
      set: function(value) {
        if (core.isArray(value) && value.length === 0) value = false;
        return setProperty.call(this, 'checked', Boolean(value));
      }
    });
    interfaces.register({
      name: 'visible',
      get: function() {
        return getCss.call(this, 'display') === !'none';
      },
      set: function(value) {
        if (core.isArray(value) && value.length === 0) value = false;
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
        return getCss.call(this, 'display') === 'none';
      },
      set: function(value) {
        if (core.isArray(value) && value.length === 0) value = false;
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
      name: 'css',
      get: function(key) {
        return getCss.call(this, key);
      },
      set: function(key, value) {
        return setCss.call(this, key, value);
      }
    });
    interfaces.register({
      name: 'data',
      get: function(key) {
        return this.data(key);
      },
      set: function(key, value) {
        return this.data(key, value);
      }
    });
    return interfaces.register({
      name: 'class',
      get: function(key) {
        return this.hasClass(key);
      },
      set: function(key, value) {
        return this.toggleClass(key, Boolean(value));
      }
    });
  })();
  domEvents = [['a,button,[type=button],[type=reset]', 'click'], ['select,[type=checkbox],[type=radio],textarea', 'change'], ['[type=submit]', 'submit'], ['input', 'keyup']];
  elementInterfaces = [['[type=checkbox],[type=radio]', 'checked'], ['input,textarea,select', 'value']];
  elementBindAttributes = ['name', 'role', 'data-bind'];
  return {
    typeName: 'Zepto',
    domEvents: domEvents,
    elementBindAttributes: elementBindAttributes,
    elementInterfaces: elementInterfaces,
    interfaces: interfaces,
    checkObjectType: function(object) {
      return core.isString(object) || object.nodeType === 1 || core.isArray(object);
    },
    coerceObject: function(object) {
      return Zepto(object);
    },
    getHandler: function(object, key) {
      var value;
      value = interfaces.get(object, key);
      if (value && object.is('[type=number]')) {
        if (value.indexOf('.') > -1) {
          return parseFloat(value);
        } else {
          return parseInt(value);
        }
      }
      return value;
    },
    setHandler: function(object, key, value) {
      return interfaces.set(object, key, value);
    },
    onEventHandler: function(object, event, handler) {
      return object.bind(event, handler);
    },
    offEventHandler: function(object, event, handler) {
      return object.unbind(event, handler);
    },
    triggerEventHandler: function(object, event) {
      return object.trigger(event);
    },
    detectEvent: function(object) {
      var event, item, selector, _i, _len;
      for (_i = 0, _len = domEvents.length; _i < _len; _i++) {
        item = domEvents[_i];
        selector = item[0], event = item[1];
        if (object.is(selector)) return event;
      }
    },
    detectInterface: function(object) {
      var iface, item, selector, _i, _len;
      for (_i = 0, _len = elementInterfaces.length; _i < _len; _i++) {
        item = elementInterfaces[_i];
        selector = item[0], iface = item[1];
        if (object.is(selector)) return iface;
      }
      return 'text';
    },
    detectOtherInterface: function(object) {
      var attr, value, _i, _len;
      for (_i = 0, _len = elementBindAttributes.length; _i < _len; _i++) {
        attr = elementBindAttributes[_i];
        if ((value = object.attr(attr))) return value;
      }
    }
  };
});
