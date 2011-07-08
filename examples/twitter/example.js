var Person, PersonView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
PersonView = (function() {
  function PersonView() {
    PersonView.__super__.constructor.apply(this, arguments);
  }
  __extends(PersonView, Backbone.View);
  return PersonView;
})();
Person = (function() {
  function Person() {
    Person.__super__.constructor.apply(this, arguments);
  }
  __extends(Person, ObserverableModel);
  Person.prototype.defaults = {
    'first-name': '',
    'last-name': '',
    'on-twitter': false
  };
  return Person;
})();
$(function() {
  var people;
  people = $('#people');
  PersonView = (function() {
    function PersonView() {
      PersonView.__super__.constructor.apply(this, arguments);
    }
    __extends(PersonView, Backbone.View);
    PersonView.prototype.template = _.template($('#template').html());
    PersonView.prototype.render = function() {
      var attrs;
      attrs = this.model.toJSON();
      attrs.date = new Date;
      this.el = $(this.template(attrs));
      people.prepend(this.el);
      this.$('[name=first-name]').sync(this.model);
      this.$('[name=last-name]').sync(this.model);
      this.$('[name=on-twitter]').sync(this.model);
      this.$('.name').observe(this.model, function(model) {
        var first, last;
        first = model.get('first-name');
        last = model.get('last-name');
        if (first || last) {
          return "" + first + " " + last;
        }
        return '<em style="color: grey">Name goes here...</em>';
      });
      this.$('[name=on-twitter]').observe(this.model, {
        interface: {
          enabled: ['first-name', 'last-name']
        }
      });
      this.$('.date').observe(this.model, function() {
        return new Date();
      });
      return this.$('.on-twitter').observe(this.model, {
        interface: {
          visible: 'on-twitter'
        }
      });
    };
    return PersonView;
  })();
  return $('#add-person').bind('click', function() {
    var model, view;
    model = new Person;
    view = new PersonView({
      model: model
    });
    return view.render();
  });
});