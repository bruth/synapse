
define(function() {
  return {
    typeName: 'Plain Object',
    checkObjectType: function(object) {
      return object === Object(object);
    },
    getHandler: function(object, key) {
      if (object[key] != null) {
        return object[key]();
      } else {
        return object[key];
      }
    },
    setHandler: function(object, key, value) {
      if (object[key] != null) {
        return object[key](value);
      } else {
        return object[key] = value;
      }
    }
  };
});
