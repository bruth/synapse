var __slice = Array.prototype.slice;

define(['synapse/core', 'synapse/connect'], function(core, connect) {
  var Synapse, hooks, objectGuid;
  objectGuid = 1;
  Synapse = (function() {

    Synapse.prototype.version = '0.3.1';

    function Synapse(object) {
      var hook, raw, wrapped, _i, _len, _ref;
      if (object instanceof Synapse) return object;
      if (this.constructor !== Synapse) {
        wrapped = new Synapse(object);
        raw = wrapped.raw;
        raw.observe = function() {
          wrapped.observe.apply(wrapped, arguments);
          return this;
        };
        raw.notify = function() {
          wrapped.notify.apply(wrapped, arguments);
          return this;
        };
        raw.sync = function() {
          wrapped.sync.apply(wrapped, arguments);
          return this;
        };
        return raw;
      }
      _ref = Synapse.hooks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hook = _ref[_i];
        if (hook.checkObjectType(object)) break;
        hook = null;
      }
      if (!hook) {
        throw new Error("No hook exists for " + (core.getType(object)) + " types");
      }
      this.raw = (typeof hook.coerceObject === "function" ? hook.coerceObject(object) : void 0) || object;
      this.hook = hook;
      this.guid = objectGuid++;
      this.channels = [];
    }

    Synapse.prototype.get = function() {
      var _ref;
      return (_ref = this.hook).getHandler.apply(_ref, [this.raw].concat(__slice.call(arguments)));
    };

    Synapse.prototype.set = function() {
      var _ref;
      (_ref = this.hook).setHandler.apply(_ref, [this.raw].concat(__slice.call(arguments)));
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

    Synapse.prototype.sync = function(other) {
      other = new Synapse(other);
      this.observe(other).notify(other);
      return this;
    };

    return Synapse;

  })();
  Synapse.hooks = hooks = [];
  Synapse.addHooks = function() {
    return hooks.push.apply(hooks, arguments);
  };
  return Synapse;
});
