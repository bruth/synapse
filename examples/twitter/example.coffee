class PersonView extends Backbone.View


class Person extends Backbone.Model
    defaults:
        'first-name': ''
        'last-name': ''
        'on-twitter': false


       

$ ->
    people = $ '#people'

    class PersonView extends Backbone.View
        template: _.template $('#template').html()
        render: ->
            attrs = @model.toJSON()
            attrs.date = new Date
            @el = $(@template attrs)
            people.prepend(@el)
     
            BKVO.registerObserver @$('[name=on-twitter]'), @model
