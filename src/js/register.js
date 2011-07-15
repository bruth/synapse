(function() {
  var defaultRegisterOptions;
  defaultRegisterOptions = {
    events: null,
    interfaces: null,
    handler: null,
    prepopulate: true
  };
  Synapse.registerSync = function(object1, object2) {
    Synapse.registerObserver(object1, object2);
    return Synapse.registerObserver(object2, object1);
  };
  return Synapse.registerObserver = function(observer, subject, _options) {
    var event, events, handler, interfaces, oi, options, receiver, sender, si, _i, _len, _receiver, _results;
    if (!(observer instanceof Synapse)) {
      observer = Synapse(observer);
    }
    if (!(subject instanceof Synapse)) {
      subject = Synapse(subject);
    }
    options = {};
    if (_.isString(_options) || _.isArray(_options)) {
      _options = {
        interface: _options
      };
    } else if (_.isFunction(_options)) {
      _options = {
        handler: _options
      };
    }
    _.extend(options, defaultOptions, _options);
    events = Synapse.getEvents(subject, options.event);
    interfaces = Synapse.getInterfaces(observer, subject, options.interface);
    handler = options.handler;
    if (handler && !_.isFunction(handler)) {
      handler = observer[handler];
    }
    receiver = Synapse.handlers[observer.type].receiver;
    sender = Synapse.handlers[subject.type].sender;
    _results = [];
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (oi in interfaces) {
          si = interfaces[oi];
          _receiver = receiver(observer, oi, handler);
          if (_.isArray(si)) {
            si = [si];
          }
          _results2.push((function() {
            var _j, _len2, _results3;
            _results3 = [];
            for (_j = 0, _len2 = si.length; _j < _len2; _j++) {
              si = si[_j];
              _results3.push(sender(subject, event, sinterface, _receiver, config.prepopulate));
            }
            return _results3;
          })());
        }
        return _results2;
      })());
    }
    return _results;
  };
})();