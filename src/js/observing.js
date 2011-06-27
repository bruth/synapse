/*

shorthand syntax:

    event : 'interfaceName[:sendHandler][:key1=attr1,key2=attr2][:receiveHandler]'

*/var ObservableView, parseBindings, setupBinding;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
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