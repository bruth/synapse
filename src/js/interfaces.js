var bkvo;
this.bkvo = bkvo = {};
bkvo.interfaces = (function() {
  return {
    registry: {},
    get: function(name) {
      var interface;
      interface = this.registry[name];
      return [interface.get, interface.set];
    },
    register: function(props) {
      return this.registry[props.name] = props;
    },
    unregister: function(name) {
      return delete this.registry[name];
    }
  };
})();
bkvo.interfaces.register({
  name: 'visible',
  get: function(element) {},
  set: function(element, value) {
    if (value) {
      return element.show();
    } else {
      return element.hide();
    }
  }
});
bkvo.interfaces.register({
  name: 'text',
  get: function(element) {
    return element.text();
  },
  set: function(element, value) {
    value || (value = '');
    return element.text(value.toString());
  }
});
bkvo.interfaces.register({
  name: 'html',
  get: function(element) {
    return element.html();
  },
  set: function(element, value) {
    value || (value = '');
    return element.html(value.toString());
  }
});
bkvo.interfaces.register({
  name: 'value',
  get: function(element) {
    return element.val();
  },
  set: function(element, value) {
    value || (value = '');
    return element.val(value);
  }
});
bkvo.interfaces.register({
  name: 'enabled',
  get: function(element) {
    return element.prop('disabled');
  },
  set: function(element, value) {
    return element.prop('disabled', !Boolean(value));
  }
});
bkvo.interfaces.register({
  name: 'disabled',
  get: function(element) {
    return element.prop('disabled');
  },
  set: function(element, value) {
    return element.prop('disabled', Boolean(value));
  }
});
bkvo.interfaces.register({
  name: 'checked',
  get: function(element) {
    return element.prop('checked');
  },
  set: function(element, value) {
    return element.prop('checked', Boolean(value));
  }
});