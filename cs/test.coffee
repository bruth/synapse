class Person extends Backbone.Model
    defaults:
        firstName: 'Joe'
        lastName: 'Smith'
        onTwitter: false


class PersonView extends ObservableView
    bindings: [
        {
            selector: '[name=first-name]'
            observes: 'firstName'
            event: 'keyup'
            interface: 'value'
        }, {
            selector: '[name=last-name]'
            event: 'keyup'
            observes: 'lastName'
            interface: 'value'
            convert: 'dinosaurize'
            loopback: false
        }, {
            selector: 'input[type=checkbox]'
            event: 'change'
            observes: 'onTwitter'
            interface: 'checked'
        }, {
            selector: '[name=last-name]'
            observes: 'firstName'
            interface: 'enabled'
        }, {
            selector: '#name'
            observes: ['firstName', 'lastName']
            interface: 'html'
            handler: 'getFullName'
            convertBack: 'quoteString'
        }, {
            selector: '#onTwitter'
            observes: 'onTwitter'
            interface: 'visible'
        }
    ]

    initialize: ->
        @model = new Person
        @el = $('body')[0]
        @setupBindings()

    quoteString: (value) ->
        "\"#{value}\""

    dinosaurize: (value) ->
        "#{value}osaurus"

    getFullName: (value) =>
        if @model.get('firstName') or @model.get('lastName')
            first = @model.get('firstName') or ''
            last = @model.get('lastName') or ''
            return first + ' ' + last
        '<span style="color: #aaa; font-style:italic">(fill out name fields)</span>'

# initialize..
$ -> new PersonView
