class PersonView extends Backbone.View


class Person extends ObserverableModel
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

            @model.bind 'change', (model) ->
                model.set updated: new Date()
     
            @$('[name=first-name]').sync @model
            @$('[name=last-name]').sync @model
            @$('[name=on-twitter]').sync @model

            @$('.name').observe @model, (model) ->
                first = model.get('first-name')
                last = model.get('last-name')
                if first or last
                    return "#{first} #{last}"
                '<em style="color: grey">Name goes here...</em>'

            @$('[name=on-twitter]').observe @model,
                interface: enabled: ['first-name', 'last-name']
            @$('.date').observe @model, 'updated'
            @$('.on-twitter').observe @model,
                interface: visible: 'on-twitter'



    $('#add-person').bind 'click', ->
        model = new Person

        view = new PersonView
            model: model

        view.render()
