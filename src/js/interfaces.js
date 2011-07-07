var getAttribute, getProperty, getStyle, setAttribute, setProperty, setStyle;
var __slice = Array.prototype.slice;
BKVO.interfaces = (function() {
  return {
    registry: {},
    register: function(config) {
      return this.registry[config.name] = config;
    },
    unregister: function(name) {
      return delete this.registry[name];
    },
    get: function() {
      var args, context, key, name, _ref;
      context = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      _ref = name.split(':'), name = _ref[0], key = _ref[1];
      if (key != null) {
        args = [key].concat(args);
      }
      return this.registry[name].get.apply(context, args);
    },
    set: function() {
      var args, context, key, name, _ref;
      context = arguments[0], name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      _ref = name.split(':'), name = _ref[0], key = _ref[1];
      if (key != null) {
        args = [key].concat(args);
      }
      return this.registry[name].set.apply(context, args);
    }
  };
})();
getProperty = function(key) {
  if (this.prop != null) {
    return this.prop(key);
  }
  return getAttribute.call(this, key);
};
setProperty = function(key, value) {
  if (this.prop != null) {
    if (typeof key === 'object') {
      return this.prop(key);
    }
    return this.prop(key, value);
  }
  return setAttribute.call(this, key, value);
};
getAttribute = function(key) {
  return this.attr(key);
};
setAttribute = function(key, value) {
  if (typeof key === 'object') {
    return this.attr(key);
  }
  return this.attr(key, value);
};
getStyle = function(key) {
  return this.css(key);
};
setStyle = function(key, value) {
  if (typeof key === 'object') {
    return this.css(key);
  }
  return this.css(key, value);
};
BKVO.interfaces.register({
  name: 'prop',
  get: function(key) {
    return getProperty.call(this, key);
  },
  set: function(key, value) {
    return setProperty.call(this, key, value);
  }
});
BKVO.interfaces.register({
  name: 'attr',
  get: function(key) {
    return getAttribute.call(this, key);
  },
  set: function(key, value) {
    return setAttribute.call(this, key, value);
  }
});
BKVO.interfaces.register({
  name: 'style',
  get: function(key) {
    return getStyle.call(this, key);
  },
  set: function(key, value) {
    return setStyle.call(this, key, value);
  }
});
BKVO.interfaces.register({
  name: 'text',
  get: function() {
    return this.text();
  },
  set: function(value) {
    return this.text((value || (value = '')).toString());
  }
});
BKVO.interfaces.register({
  name: 'html',
  get: function() {
    return this.html();
  },
  set: function(value) {
    return this.html((value || (value = '')).toString());
  }
});
BKVO.interfaces.register({
  name: 'value',
  get: function() {
    return this.val();
  },
  set: function(value) {
    return this.val(value || (value = ''));
  }
});
BKVO.interfaces.register({
  name: 'enabled',
  get: function() {
    return !getProperty.call(this, 'disabled');
  },
  set: function(value) {
    if (_.isArray(value) && value.length === 0) {
      value = false;
    }
    return setProperty.call(this, 'disabled', !Boolean(value));
  }
});
BKVO.interfaces.register({
  name: 'disabled',
  get: function() {
    return getProperty.call(this, 'disabled');
  },
  set: function(value) {
    if (_.isArray(value) && value.length === 0) {
      value = false;
    }
    return setProperty.call(this, 'disabled', Boolean(value));
  }
});
BKVO.interfaces.register({
  name: 'checked',
  get: function() {
    return getProperty.call(this, 'checked');
  },
  set: function(value) {
    if (_.isArray(value) && value.length === 0) {
      value = false;
    }
    return setProperty.call(this, 'checked', Boolean(value));
  }
});
BKVO.interfaces.register({
  name: 'visible',
  get: function() {
    return getStyle.call(this, 'display') === !'none';
  },
  set: function(value) {
    if (_.isArray(value) && value.length === 0) {
      value = false;
    }
    if (Boolean(value)) {
      return this.show();
    } else {
      return this.hide();
    }
  }
});
BKVO.interfaces.register({
  name: 'hidden',
  get: function() {
    return getStyle.call(this, 'display') === 'none';
  },
  set: function(value) {
    if (_.isArray(value) && value.length === 0) {
      value = false;
    }
    if (Boolean(value)) {
      return this.hide();
    } else {
      return this.show();
    }
  }
});