var Person, PersonView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Person = (function() {
  function Person() {
    Person.__super__.constructor.apply(this, arguments);
  }
  __extends(Person, Backbone.Model);
  Person.prototype.defaults = {
    firstName: 'Joe',
    lastName: 'Smith',
    onTwitter: false
  };
  return Person;
})();
PersonView = (function() {
  function PersonView() {
    this.getFullName = __bind(this.getFullName, this);;    PersonView.__super__.constructor.apply(this, arguments);
  }
  __extends(PersonView, ObservableView);
  PersonView.prototype.bindings = [
    {
      selector: '[name=first-name]',
      observes: 'firstName',
      event: 'keyup',
      interface: 'value'
    }, {
      selector: '[name=last-name]',
      event: 'keyup',
      observes: 'lastName',
      interface: 'value',
      convert: 'dinosaurize',
      loopback: false
    }, {
      selector: 'input[type=checkbox]',
      event: 'change',
      observes: 'onTwitter',
      interface: 'checked'
    }, {
      selector: '[name=last-name]',
      observes: 'firstName',
      interface: 'enabled'
    }, {
      selector: '#name',
      observes: ['firstName', 'lastName'],
      interface: 'html',
      handler: 'getFullName',
      convertBack: 'quoteString'
    }, {
      selector: '#onTwitter',
      observes: 'onTwitter',
      interface: 'visible'
    }
  ];
  PersonView.prototype.initialize = function() {
    this.model = new Person;
    this.el = $('body')[0];
    return this.setupBindings();
  };
  PersonView.prototype.quoteString = function(value) {
    return "\"" + value + "\"";
  };
  PersonView.prototype.dinosaurize = function(value) {
    return "" + value + "osaurus";
  };
  PersonView.prototype.getFullName = function(value) {
    var first, last;
    if (this.model.get('firstName') || this.model.get('lastName')) {
      first = this.model.get('firstName') || '';
      last = this.model.get('lastName') || '';
      return first + ' ' + last;
    }
    return '<span style="color: #aaa; font-style:italic">(fill out name fields)</span>';
  };
  return PersonView;
})();
$(function() {
  return new PersonView;
});