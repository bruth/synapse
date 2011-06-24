var InterfaceRegistry;
InterfaceRegistry = (function() {
  var unregister;
  function InterfaceRegistry() {}
  InterfaceRegistry.prototype.interfaces = {};
  InterfaceRegistry.prototype.get = function(name) {
    var interface;
    interface = this.interfaces[name];
    return [interface.get, interface.set];
  };
  InterfaceRegistry.prototype.register = function(name, getter, setter) {
    return this.interfaces[name] = {
      get: getter,
      set: setter
    };
  };
  unregister = function(name) {
    return delete this.interfaces[name];
  };
  return InterfaceRegistry;
})();
InterfaceRegistry = new InterfaceRegistry;
InterfaceRegistry.register('visible', function(element) {}, function(element, value) {
  if (value) {
    return element.show();
  } else {
    return element.hide();
  }
});
InterfaceRegistry.register('text', function(element) {
  return element.text();
}, function(element, value) {
  value || (value = '');
  return element.text(value.toString());
});
InterfaceRegistry.register('html', function(element) {
  return element.html();
}, function(element, value) {
  value || (value = '');
  return element.html(value.toString());
});
InterfaceRegistry.register('value', function(element) {
  return element.val();
}, function(element, value) {
  value || (value = '');
  return element.val(value);
});
InterfaceRegistry.register('enabled', function(element) {
  return element.prop('disabled');
}, function(element, value) {
  return element.prop('disabled', !Boolean(value));
});
InterfaceRegistry.register('disabled', function(element) {
  return element.prop('disabled');
}, function(element, value) {
  return element.prop('disabled', Boolean(value));
});
InterfaceRegistry.register('checked', function(element) {
  return element.prop('checked');
}, function(element, value) {
  return element.prop('checked', Boolean(value));
});