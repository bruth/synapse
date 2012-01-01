
(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(root, exports);
  } else if (typeof define === 'function' && define.amd) {
    return define('synapse/core', ['exports'], function(exports) {
      return factory(root, exports);
    });
  } else {
    return root.SynapseCore = factory(root, {});
  }
})(this, function(root, core) {
  var channels;
  channels = {};
  return {
    toString: Object.prototype.toString,
    getType: function(object) {
      return this.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    },
    isObject: function(object) {
      return this.getType(object) === 'Object';
    },
    isArray: function(object) {
      return this.getType(object) === 'Array';
    },
    isFunction: function(object) {
      return this.getType(object) === 'Function';
    },
    isString: function(object) {
      return this.getType(object) === 'String';
    },
    isBoolean: function(object) {
      return this.getType(object) === 'Boolean';
    }
  };
});
