
define(['synapse/core'], function(core) {
  return {
    typeName: 'Plain Object',
    checkObjectType: function(object) {
      return object === Object(object);
    },
    getHandler: function(object, key) {
      if (core.getType(object[key]) === 'function') {
        return object[key]();
      } else {
        return object[key];
      }
    },
    setHandler: function(object, key, value) {
      if (core.getType(object[key]) === 'function') {
        return object[key](value);
      } else {
        return object[key] = value;
      }
    }
  };
});
