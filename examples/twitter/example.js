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
  __extends(PersonView, Backbone.View);
  function PersonView() {
    PersonView.__super__.constructor.apply(this, arguments);
  }
  return PersonView;
})();
Person = (function() {
  __extends(Person, Backbone.Model);
  function Person() {
    Person.__super__.constructor.apply(this, arguments);
  }
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
  return PersonView = (function() {
    __extends(PersonView, Backbone.View);
    function PersonView() {
      PersonView.__super__.constructor.apply(this, arguments);
    }
    PersonView.prototype.template = _.template($('#template').html());
    PersonView.prototype.render = function() {
      var attrs;
      attrs = this.model.toJSON();
      attrs.date = new Date;
      this.el = $(this.template(attrs));
      people.prepend(this.el);
      return BKVO.registerObserver(this.$('[name=on-twitter]'), this.model);
    };
    return PersonView;
  })();
});