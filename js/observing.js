var ElementInterface, ElementInterfaces, ObservableView, registerElementInterface, unregisterElementInterface;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ObservableView = (function() {
  function ObservableView() {
    ObservableView.__super__.constructor.apply(this, arguments);
  }
  __extends(ObservableView, Backbone.View);
  ObservableView.prototype.setupBindings = function() {
    var config, elem, _i, _len, _ref, _results;
    _ref = this.bindings;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      config = _ref[_i];
      if (!$.isArray(config.observes)) {
        config.observes = [config.observes];
      }
      elem = $(config.selector, this.el);
      if (elem.length === 0) {
        continue;
      }
      _results.push(__bind(function(elem, config) {
        var attr, convert, convertBack, getter, handler, setter, toElement, _j, _len2, _ref2, _results2;
        getter = ElementInterfaces[config.interface].get;
        setter = ElementInterfaces[config.interface].set;
        if (config.handler != null) {
          if (typeof config.handler === 'function') {
            handler = config.handler;
          } else {
            handler = this[config.handler] || this.model[config.handler];
          }
        } else {
          handler = null;
        }
        if (config.convert != null) {
          if (typeof config.convert === 'function') {
            convert = config.convert;
          } else {
            convert = this[config.convert] || this.model[config.convert];
          }
        } else {
          convert = null;
        }
        if (config.convertBack != null) {
          if (typeof config.convertBack === 'function') {
            convertBack = config.convertBack;
          } else {
            convertBack = this[config.convertBack] || this.model[config.convertBack];
          }
        } else {
          convertBack = null;
        }
        toElement = __bind(function(model, value, options) {
          if (options && options.loopback === false) {
            if (options.callee === elem) {
              return;
            }
          }
          value = handler ? handler() : value;
          value = convertBack ? convertBack(value) : value;
          return setter(elem, value);
        }, this);
        _ref2 = config.observes;
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          attr = _ref2[_j];
          _results2.push(__bind(function(attr) {
            var toModel;
            this.model.bind("change:" + attr, toElement);
            this.model.trigger("change:" + attr, this.model, this.model.get(attr));
            if (config.event) {
              toModel = __bind(function(evt) {
                var attrs, options, value;
                attrs = {};
                options = {};
                value = getter(elem);
                value = convert ? convert(value) : value;
                attrs[attr] = value;
                if (config.loopback != null) {
                  options.loopback = config.loopback;
                  options.callee = elem;
                }
                return this.model.set(attrs, options);
              }, this);
              return elem.bind(config.event, toModel);
            }
          }, this)(attr));
        }
        return _results2;
      }, this)(elem, config));
    }
    return _results;
  };
  return ObservableView;
})();
ElementInterface = (function() {
  function ElementInterface(name, get, set) {
    this.name = name;
    this.get = get;
    this.set = set;
  }
  return ElementInterface;
})();
ElementInterfaces = {};
registerElementInterface = function(name, getter, setter) {
  return ElementInterfaces[name] = new ElementInterface(name, getter, setter);
};
unregisterElementInterface = function(name) {
  return delete bindingHandlers[name];
};
registerElementInterface('visible', function(elem) {}, function(elem, value) {
  if (value) {
    return elem.show();
  } else {
    return elem.hide();
  }
});
registerElementInterface('text', function(elem) {
  return elem.text();
}, function(elem, value) {
  if (value != null) {
    return elem.text(value);
  }
});
registerElementInterface('html', function(elem) {
  return elem.html();
}, function(elem, value) {
  if (value != null) {
    return elem.html(value);
  }
});
registerElementInterface('value', function(elem) {
  return elem.val();
}, function(elem, value) {
  if (value != null) {
    return elem.val(value);
  }
});
registerElementInterface('enabled', function(elem) {
  return elem.prop('disabled');
}, function(elem, value) {
  return elem.prop('disabled', !value);
});
registerElementInterface('disabled', function(elem) {
  return elem.prop('disabled');
}, function(elem, value) {
  return elem.prop('disabled', value);
});
registerElementInterface('checked', function(elem) {
  return elem.prop('checked');
}, function(elem, value) {
  return elem.prop('checked', value);
});
ObservableView = ObservableView;