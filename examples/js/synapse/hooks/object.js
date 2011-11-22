
define(['synapse/core'], function(core) {
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
