var __slice = Array.prototype.slice;

define(['synapse/connect'], function(connect) {
  var Synapse, extensions, objectGuid;
  objectGuid = 1;
  Synapse = (function() {

    Synapse.prototype.version = '@VERSION';

    function Synapse(object) {
      var ext, _i, _len, _ref;
      if (object instanceof Synapse) return object;
      if (this.constructor !== Synapse) return new Synapse(object);
      _ref = Synapse.extensions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ext = _ref[_i];
        if (ext.checkObjectType(object)) {
          this.type = ext.typeName;
          this.ext = ext;
          this.guid = objectGuid++;
          this.raw = (typeof ext.coerceObject === "function" ? ext.coerceObject(object) : void 0) || object;
          this.channels = [];
          this.lastInterfaceValues = {};
          return;
        }
      }
      throw new Error("No extension exists for " + object + " types");
    }

    Synapse.prototype.detectEvent = function() {
      var value, _ref;
      if ((value = (_ref = this.ext).detectEvent.apply(_ref, [this.raw].concat(__slice.call(arguments))))) {
        return value;
      }
      throw new Error("Objects for " + this.type + " do not support events");
    };

    Synapse.prototype.on = function() {
      var value, _base;
      if ((value = typeof (_base = this.ext).onEventHandler === "function" ? _base.onEventHandler.apply(_base, [this.raw].concat(__slice.call(arguments))) : void 0)) {
        return this;
      }
      throw new Error("Objects for " + this.type + " do not support events");
    };

    Synapse.prototype.off = function() {
      var value, _base;
      if ((value = typeof (_base = this.ext).offEventHandler === "function" ? _base.offEventHandler.apply(_base, [this.raw].concat(__slice.call(arguments))) : void 0)) {
        return this;
      }
      throw new Error("Objects for " + this.type + " do not support events");
    };

    Synapse.prototype.trigger = function() {
      var value, _base;
      if ((value = typeof (_base = this.ext).triggerEventHandler === "function" ? _base.triggerEventHandler.apply(_base, [this.raw].concat(__slice.call(arguments))) : void 0)) {
        return this;
      }
      throw new Error("Objects for " + this.type + " do not support events");
    };

    Synapse.prototype.detectInterface = function() {
      var _base;
      return typeof (_base = this.ext).detectInterface === "function" ? _base.detectInterface(this.raw) : void 0;
    };

    Synapse.prototype.detectOtherInterface = function() {
      var _base;
      return typeof (_base = this.ext).detectOtherInterface === "function" ? _base.detectOtherInterface(this.raw) : void 0;
    };

    Synapse.prototype.get = function() {
      var _ref;
      return (_ref = this.ext).getHandler.apply(_ref, [this.raw].concat(__slice.call(arguments)));
    };

    Synapse.prototype.set = function() {
      var _ref;
      (_ref = this.ext).setHandler.apply(_ref, [this.raw].concat(__slice.call(arguments)));
      return this;
    };

    Synapse.prototype.sync = function(other) {
      other = new Synapse(other);
      this.observe(other).notify(other);
      return this;
    };

    Synapse.prototype.observe = function() {
      var args, other;
      other = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      other = new Synapse(other);
      connect.apply(null, [other, this].concat(__slice.call(args)));
      return this;
    };

    Synapse.prototype.notify = function() {
      var args, other;
      other = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      other = new Synapse(other);
      connect.apply(null, [this, other].concat(__slice.call(args)));
      return this;
    };

    Synapse.prototype.toString = function() {
      var _base;
      return (typeof (_base = this.ext).toString === "function" ? _base.toString(this.raw) : void 0) || this.raw.toString();
    };

    return Synapse;

  })();
  Synapse.extensions = extensions = [];
  Synapse.addExtensions = function() {
    return extensions.push.apply(extensions, arguments);
  };
  return Synapse;
});
