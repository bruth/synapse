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
  /*

      A ``binding`` represents an association between a DOM element and a
      view. The view represents a model instance which provides an interface
      for getting/setting data.

      In most cases, the data persisting in the model needs to be represented
      in the DOM in some way. Loading the data into the DOM initially is not
      typically the issue (templates, pre-defined HTML can be used). The
      difficulty comes when changes are made to that data and there is no
      immediate way of updating the respective DOM elements reflecting the
      model's data.

      Setting up a binding is simple. Simply think of the transition steps
      involved for each direction (assuming a two-way binding).

      The options are as follows:

          ``selector``: the CSS selector in the context of the view's element

          ``observes``: a string or array of strings which are names of
          attributes on the model

          ``event``: a DOM event or array of DOM events which will be bound
          to the DOM element. when these events are triggered on this
          element, this start the pipeline _to_ the model.

          if ``event`` is not defined, then this represents a one-way binding
          from the model to the DOM element. that is, interaction with the
          DOM element will never impact the model.

          ``loopback``: defines whether a change from the DOM to the model
          will loop back to the DOM element. default is ``true``. a common
          case where this is desirable is for augmenting or formatting the
          raw input of the user. e.g. '200 n market st.' -> 200 N Market St'

          ``interface``: the type of binding relative to the DOM element. the
          default choices include:

              'visible': shows/hides the element based on a model attribute
              or computed value.

              'text': gets/sets the element's text node

              'html': gets/sets the element's inner HTML

              'value': gets/sets the element's value (most form fields)

              'css': add/removes a CSS class to the element

              'style': adds/removes style attributes directly on the element

              'attr': gets/sets an attribute on the element

              'prop': gets/sets a property on the element

              'checked': gets/sets a checkbox or radio button 'checked'
              property. this is a shortcut.

              'enabled': gets/sets a form field's 'disabled' property. this
              is a shorcut.

              'disabled': gets/sets the inverse of a form field's 'disabled'
              property. this is a shortcut.

          ``handler``: when an element is observing more than one model
          attribute, a ``handler`` must be defined to return a value that is
          used to _represent_ those model's attributes.

          ``convert``: a function that takes the raw input from the element
          and converts it into something palatable for the model.

          ``convertBack``: a function that takes the value provided by the
          model and converts into something palatable for the element

      Example declaration of bindings:

      bindings:
          '[name=first-name] keyup': 'firstName'
          '[name=last-name]': 'lastName'

          '#name':
              # the '#name' element observes 'firstName' and 'lastName'
              observes: ['firstName', 'lastName']
              handler: 'getFullName'
              interface: 'text'

          '#onTwitter':
              observes: 'onTwitter'
              handler: 'visible'

          '#other-name':
              observes: ['firstName', 'lastName']
              handler: 'getFancyFullName'
              interface: 'html'
  */
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
        var attr, convert, convertBack, getter, handler, setter, toElement, _i, _len, _ref, _results;
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
        _ref = config.observes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attr = _ref[_i];
          _results.push(__bind(function(attr) {
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
        return _results;
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
window.ObservableView = ObservableView;