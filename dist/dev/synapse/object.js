

(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(root, exports, require('synapse/core'));
  } else if (typeof define === 'function' && define.amd) {
    return define('synapse/object', ['synapse/core', 'exports'], function(core, exports) {
      return factory(root, exports, core);
    });
  } else {
    return root.ObjectHook = factory(root, {}, root.SynapseCore);
  }
})(this, function(root, ObjectHook, core) {
  return {
    typeName: 'Plain Object',
    checkObjectType: function(object) {
      return core.isObject(object);
    },
    getHandler: function(object, key) {
      if (core.isFunction(object[key])) {
        return object[key]();
      } else {
        return object[key];
      }
    },
    setHandler: function(object, key, value) {
      if (core.isFunction(object[key])) {
        return object[key](value);
      } else {
        return object[key] = value;
      }
    }
  };
});
