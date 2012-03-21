

(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(root, exports, require('synapse/core'), require('backbone'));
  } else if (typeof define === 'function' && define.amd) {
    return define('synapse/backbone-model', ['synapse/core', 'backbone', 'exports'], function(core, Backbone, exports) {
      return factory(root, exports, core, Backbone);
    });
  } else {
    return root.BackboneModelHook = factory(root, {}, root.SynapseCore, root.Backbone);
  }
})(this, function(root, BackboneModelHook, core) {
  return {
    typeName: 'Backbone Model',
    checkObjectType: function(object) {
      return object instanceof Backbone.Model;
    },
    getHandler: function(object, key) {
      if (core.isFunction(object[key])) {
        return object[key]();
      } else {
        return object.get(key);
      }
    },
    setHandler: function(object, key, value) {
      var attrs;
      if (core.isFunction(object[key])) {
        return object[key](value);
      } else {
        attrs = {};
        attrs[key] = value;
        return object.set(attrs);
      }
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
    detectEvent: function(object, iface) {
      if (iface && !object[iface]) return "change:" + iface;
      return 'change';
    }
  };
});
