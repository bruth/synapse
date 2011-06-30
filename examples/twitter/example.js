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
  __extends(Person, Backbone.Model);
  function Person() {
    Person.__super__.constructor.apply(this, arguments);
  }
  Person.prototype.defaults = {
    onTwitter: false
  };
  return Person;
})();
PersonCollection = (function() {
  __extends(PersonCollection, Backbone.Collection);
  function PersonCollection() {
    PersonCollection.__super__.constructor.apply(this, arguments);
  }
  PersonCollection.prototype.model = Person;
  PersonCollection.prototype.url = './people.json';
  return PersonCollection;
})();
PersonView = (function() {
  __extends(PersonView, ObservableView);
  function PersonView() {
    this.getDate = __bind(this.getDate, this);
    this.getFullName = __bind(this.getFullName, this);
    PersonView.__super__.constructor.apply(this, arguments);
  }
  PersonView.prototype.bindings = {
    '[name=first-name]': {
      keyup: {
        observes: 'firstName',
        interface: 'value'
      }
    },
    '[name=last-name]': {
      keyup: {
        observes: 'lastName',
        interface: 'value',
        loopback: false
      }
    },
    'input[type=checkbox]': {
      change: {
        observes: 'onTwitter',
        interface: 'checked'
      }
    },
    '.name': {
      noevent: {
        observes: ['firstName', 'lastName'],
        interface: 'html',
        receive: 'getFullName'
      }
    },
    '.onTwitter': {
      noevent: {
        observes: 'onTwitter',
        interface: 'visible'
      }
    },
    '[type=checkbox]': {
      noevent: {
        observes: 'firstName=disabled',
        interface: 'prop',
        receive: function(value) {
          return !Boolean(value);
        }
      }
    },
    '.date': {
      noevent: {
        observes: ['firstName', 'lastName', 'onTwitter'],
        interface: 'text',
        receive: 'getDate'
      }
    }
  };
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
  __extends(PersonCollectionView, ObservableView);
  function PersonCollectionView() {
    this.addPerson = __bind(this.addPerson, this);
    this.createPerson = __bind(this.createPerson, this);
    PersonCollectionView.__super__.constructor.apply(this, arguments);
  }
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