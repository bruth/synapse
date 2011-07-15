Synapse.handlers = {
  0: {
    send: function(event, subject, interface, notify, populate) {
      subject.bind(event, function() {
        var value;
        value = this.get(interface);
        return notify(this.context, interface, value);
      });
      if (populate) {
        return subject.context.trigger(event);
      }
    },
    receive: function(observer, interface, handler) {
      return function(subject, value) {
        if (handler) {
          value = handler(observer.context, interface, value);
        }
        return observer.set(interface, value);
      };
    }
  },
  1: {
    send: function(event, subject, interface, notify) {
      subject.bind(event, function() {
        var value;
        value = this.get(interface);
        return notify(this.context, interface, value);
      });
      if (populate) {
        return subject.trigger(event);
      }
    }
  },
  receive: function(observer, interface, handler) {
    return function(subject, value) {
      if (handler) {
        value = handler(observer.context, interface, value);
      }
      return observer.set(interface, value);
    };
  },
  2: {
    send: function(event, subject, interface, notify) {
      if (interface) {
        event = "" + event + ":" + interface;
      }
      subject.bind(event, function(model, value, options) {
        return notify(this.context, interface, value);
      });
      if (populate) {
        return subject.trigger(event, subject, subject.get(interface));
      }
    },
    receive: function(observer, interface, handler) {
      return function(subject, value) {
        var attrs;
        if (handler) {
          value = handler(observer.context, interface, value);
        }
        attrs = {};
        attrs[interface] = value;
        return this.set(attrs);
      };
    }
  }
};