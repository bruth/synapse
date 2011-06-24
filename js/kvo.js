var InterfaceRegistry, ObservableView, setupBinding;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
InterfaceRegistry = (function() {
  var unregister;
  function InterfaceRegistry() {}
  InterfaceRegistry.prototype.interfaces = {};
  InterfaceRegistry.prototype.get = function(name) {
    var interface;
    interface = this.interfaces[name];
    return [interface.get, interface.set];
  };
  InterfaceRegistry.prototype.register = function(name, getter, setter) {
    return this.interfaces[name] = {
      get: getter,
      set: setter
    };
  };
  unregister = function(name) {
    return delete this.interfaces[name];
  };
  return InterfaceRegistry;
})();
InterfaceRegistry = new InterfaceRegistry;
InterfaceRegistry.register('visible', function(element) {}, function(element, value) {
  if (value) {
    return element.show();
  } else {
    return element.hide();
  }
});
InterfaceRegistry.register('text', function(element) {
  return element.text();
}, function(element, value) {
  value || (value = '');
  return element.text(value.toString());
});
InterfaceRegistry.register('html', function(element) {
  return element.html();
}, function(element, value) {
  value || (value = '');
  return element.html(value.toString());
});
InterfaceRegistry.register('value', function(element) {
  return element.val();
}, function(element, value) {
  value || (value = '');
  return element.val(value);
});
InterfaceRegistry.register('enabled', function(element) {
  return element.prop('disabled');
}, function(element, value) {
  return element.prop('disabled', !Boolean(value));
});
InterfaceRegistry.register('disabled', function(element) {
  return element.prop('disabled');
}, function(element, value) {
  return element.prop('disabled', Boolean(value));
});
InterfaceRegistry.register('checked', function(element) {
  return element.prop('checked');
}, function(element, value) {
  return element.prop('checked', Boolean(value));
});
setupBinding = function(element, config, view) {
  var attr, convert, convertBack, getter, handler, model, setter, toElement, _i, _len, _ref, _ref2, _results;
  model = view.model;
  if (!$.isArray(config.observes)) {
    config.observes = [config.observes];
  }
  handler = convert = convertBack = null;
  _ref = InterfaceRegistry.get(config.interface), getter = _ref[0], setter = _ref[1];
  if (config.handler != null) {
    if (typeof config.handler === 'function') {
      handler = config.handler;
    } else {
      handler = view[config.handler] || model[config.handler];
    }
  }
  if (config.convert != null) {
    if (typeof config.convert === 'function') {
      convert = config.convert;
    } else {
      convert = view[config.convert] || model[config.convert];
    }
  }
  if (config.convertBack != null) {
    if (typeof config.convertBack === 'function') {
      convertBack = config.convertBack;
    } else {
      convertBack = view[config.convertBack] || model[config.convertBack];
    }
  }
  toElement = __bind(function(model, value, options) {
    if (options && options.loopback === false) {
      if (options.callee === element) {
        return;
      }
    }
    value = handler ? handler() : value;
    value = convertBack ? convertBack(value) : value;
    return setter(element, value);
  }, this);
  _ref2 = config.observes;
  _results = [];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    attr = _ref2[_i];
    if (config.event) {
      __bind(function(attr) {
        var toModel;
        toModel = __bind(function(evt, params) {
          var attrs, options, value;
          attrs = {};
          options = {};
          value = getter(element);
          value = convert ? convert(value) : value;
          attrs[attr] = value;
          if (config.loopback != null) {
            options.callee = element;
            options.loopback = config.loopback;
          }
          return model.set(attrs, options);
        }, this);
        return element.bind(config.event, toModel);
      }, this)(attr);
    }
    model.bind("change:" + attr, toElement);
    _results.push(model.trigger("change:" + attr, model, model.get(attr)));
  }
  return _results;
};
ObservableView = (function() {
  function ObservableView() {
    ObservableView.__super__.constructor.apply(this, arguments);
  }
  __extends(ObservableView, Backbone.View);
  ObservableView.prototype.setupBindings = function() {
    var config, element, _i, _len, _ref, _results;
    _ref = this.bindings;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      config = _ref[_i];
      element = $(config.selector, this.el);
      _results.push(setupBinding(element, config, this));
    }
    return _results;
  };
  return ObservableView;
})();
