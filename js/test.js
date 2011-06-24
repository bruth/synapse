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
    firstName: 'Joe',
    lastName: 'Smith',
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
      selector: '#name',
      observes: ['firstName', 'lastName'],
      interface: 'html',
      handler: 'getFullName'
    }, {
      selector: '#onTwitter',
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
  PersonView.prototype.template = _.template("<div>\n    <h3><span id=\"name\"></span> <span id=\"onTwitter\">is on Twitter</span></h3>\n\n\n    <table>\n        <tr>\n            <th>First Name:</th>\n            <td><input type=\"text\" name=\"first-name\"></td>\n        </tr>\n        <tr>\n            <th>Last Name:</th>\n            <td><input type=\"text\" name=\"last-name\"></td>\n        </tr>\n        <tr>\n            <td></td>\n            <td><label>On Twitter? <input type=\"checkbox\" name=\"onTwitter\"></label></td>\n        </tr>\n    </table>\n\n    <p class=\"meta\">Last updated: <span class=\"date\"><%= date %></span></p>\n</div>");
  PersonView.prototype.initialize = function() {
    this.render();
    return this.setupBindings();
  };
  PersonView.prototype.render = function() {
    return this.el = $(this.template({
      date: new Date
    }));
  };
  PersonView.prototype.quoteString = function(value) {
    return "\"" + value + "\"";
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
    var i, model, view;
    for (i = 1; i <= 10; i++) {
      this.collection = new PersonCollection;
      model = this.collection.create({
        lastName: "Smith " + i
      });
      view = new PersonView({
        model: model
      });
      $('body').append(view.el);
    }
  }
  __extends(PersonCollectionView, Backbone.View);
  return PersonCollectionView;
})();
$(function() {
  return new PersonCollectionView;
});