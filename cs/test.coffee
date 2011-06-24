class Person extends Backbone.Model
    defaults:
        firstName: 'Joe'
        lastName: 'Smith'
        onTwitter: false


class PersonCollection extends Backbone.Collection
    model: Person
    url: './people.json'


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
            loopback: false
        }, {
            selector: 'input[type=checkbox]'
            event: 'change'
            observes: 'onTwitter'
            interface: 'checked'
        },{
            selector: '#name'
            observes: ['firstName', 'lastName']
            interface: 'html'
            handler: 'getFullName'
        }, {
            selector: '#onTwitter'
            observes: 'onTwitter'
            interface: 'visible'
        }, {
            selector: '[type=checkbox]'
            observes: 'firstName'
            interface: 'enabled'
        }, {
            selector: '.date'
            observes: ['firstName', 'lastName', 'onTwitter']
            interface: 'text'
            handler: 'getDate'
        }
    ]

    template: _.template """
        <div>
            <h3><span id="name"></span> <span id="onTwitter">is on Twitter</span></h3>


            <table>
                <tr>
                    <th>First Name:</th>
                    <td><input type="text" name="first-name"></td>
                </tr>
                <tr>
                    <th>Last Name:</th>
                    <td><input type="text" name="last-name"></td>
                </tr>
                <tr>
                    <td></td>
                    <td><label>On Twitter? <input type="checkbox" name="onTwitter"></label></td>
                </tr>
            </table>

            <p class="meta">Last updated: <span class="date"><%= date %></span></p>
        </div>
    """

    initialize: ->
        @render()
        @setupBindings()

    render: ->
        @el = $ @template(date: new Date)

    quoteString: (value) ->
        "\"#{value}\""

    getFullName: =>
        if @model.get('firstName') or @model.get('lastName')
            first = @model.get('firstName') or ''
            last = @model.get('lastName') or ''
            return first + ' ' + last
        '<span style="color: #aaa; font-style:italic">(fill out name fields)</span>'

    getDate: =>
        new Date


class PersonCollectionView extends Backbone.View
    constructor: ->
        for i in [1..10]

            @collection = new PersonCollection

            model = @collection.create
                lastName: "Smith #{i}"

            view = new PersonView
                model: model

            $('body').append(view.el)


# initialize..
$ ->
    new PersonCollectionView
