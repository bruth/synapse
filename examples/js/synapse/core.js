var __slice = Array.prototype.slice;

define(function() {
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
    publish: function() {
      var args, channel, sub, subscribers, _i, _len, _results;
      channel = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      subscribers = channels[channel] || [];
      _results = [];
      for (_i = 0, _len = subscribers.length; _i < _len; _i++) {
        sub = subscribers[_i];
        _results.push(sub.handler.apply(sub.context, args));
      }
      return _results;
    },
    subscribe: function(channel, handler, context) {
      var sub;
      if (!channels[channel]) channels[channel] = [];
      sub = {
        handler: handler,
        context: context || handler
      };
      channels[channel].push(sub);
      return [channel, sub];
    },
    unsubscribe: function(handle) {
      var i, sub, subscribers, _len, _results;
      if ((subscribers = channels[handle[0]])) {
        _results = [];
        for (sub = 0, _len = subscribers.length; sub < _len; sub++) {
          i = subscribers[sub];
          if (sub === handle[1]) {
            subscribers.splice(i, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  };
});
