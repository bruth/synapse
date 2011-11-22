
define(['synapse/core', 'backbone'], function(core) {
  return {
    typeName: 'Backbone Model',
    checkObjectType: function(object) {
      return object instanceof Backbone.Model;
    },
    getHandler: function(object, key) {
      if (core.getType(object[key]) === 'function') {
        return object[key]();
      } else {
        return object.get(key);
      }
    },
    setHandler: function(object, key, value) {
      var attrs;
      if (core.getType(object[key]) === 'function') {
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
    detectEvent: function(object, interface) {
      if (interface && !object[interface]) return "change:" + interface;
      return 'change';
    }
  };
});
