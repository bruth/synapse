var Person, PersonCollection, PersonCollectionView, PersonView;
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
    onTwitter: false
  };
  return Person;
})();
PersonCollection = (function() {
  function PersonCollection() {
    PersonCollection.__super__.constructor.apply(this, arguments);
  }
  __extends(PersonCollection, Backbone.Collection);
  PersonCollection.prototype.model = Person;
  PersonCollection.prototype.url = './people.json';
  return PersonCollection;
})();
PersonView = (function() {
  function PersonView() {
    this.getDate = __bind(this.getDate, this);;
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
      loopback: false
    }, {
      selector: 'input[type=checkbox]',
      event: 'change',
      observes: 'onTwitter',
      interface: 'checked'
    }, {
      selector: '.name',
      observes: ['firstName', 'lastName'],
      interface: 'html',
      handler: 'getFullName'
    }, {
      selector: '.onTwitter',
      observes: 'onTwitter',
      interface: 'visible'
    }, {
      selector: '[type=checkbox]',
      observes: 'firstName',
      interface: 'enabled'
    }, {
      selector: '.date',
      observes: ['firstName', 'lastName', 'onTwitter'],
      interface: 'text',
      handler: 'getDate'
    }
  ];
  PersonView.prototype.initialize = function(options) {
    this.render(options.template);
    return this.setupBindings();
  };
  PersonView.prototype.render = function(template) {
    return this.el = $(template({
      date: new Date
    }));
  };
  PersonView.prototype.getFullName = function() {
    var first, last;
    if (this.model.get('firstName') || this.model.get('lastName')) {
      first = this.model.get('firstName') || '';
      last = this.model.get('lastName') || '';
      return first + ' ' + last;
    }
    return '<span style="color: #aaa; font-style:italic">(fill out name fields)</span>';
  };
  PersonView.prototype.getDate = function() {
    return new Date;
  };
  return PersonView;
})();
PersonCollectionView = (function() {
  function PersonCollectionView() {
    this.addPerson = __bind(this.addPerson, this);;
    this.createPerson = __bind(this.createPerson, this);;    PersonCollectionView.__super__.constructor.apply(this, arguments);
  }
  __extends(PersonCollectionView, ObservableView);
  PersonCollectionView.prototype.initialize = function(options) {
    this.el = $('#people');
    this.template = options.template;
    this.collection = new PersonCollection;
    this.collection.bind('refresh', __bind(function(collection) {
      return this.collection.each(__bind(function(model) {
        return this.addPerson(model);
      }, this));
    }, this));
    this.collection.bind('add', __bind(function(model) {
      return this.addPerson(model);
    }, this));
    this.collection.fetch();
    return $('#add-person').bind('click', this.createPerson);
  };
  PersonCollectionView.prototype.createPerson = function() {
    var model;
    model = new Person;
    return this.collection.add(model);
  };
  PersonCollectionView.prototype.addPerson = function(model) {
    var view;
    view = new PersonView({
      template: this.template,
      model: model
    });
    return this.el.prepend(view.el);
  };
  return PersonCollectionView;
})();
$(function() {
  var template;
  template = _.template($('#template').html());
  return new PersonCollectionView({
    template: template
  });
});