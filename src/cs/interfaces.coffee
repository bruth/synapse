this.bkvo = bkvo = {}

# The registry for all element interface getter and setter functions.
bkvo.interfaces = do ->

    registry: {}

    get: (name) ->
        interface = @registry[name]
        [interface.get, interface.set]

    register: (props) ->
        @registry[props.name] = props

    unregister: (name) ->
        delete @registry[name]

# An implied one-way interface that toggles the element's visibility
# based on the truth of the value it is observing.
bkvo.interfaces.register
    name: 'visible'
    get: (element) ->
    set: (element, value) ->
        if value then element.show() else element.hide()

# Gets and sets the innerText of the element
bkvo.interfaces.register
    name: 'text'
    get: (element) ->
        element.text()
    set: (element, value) ->
        value or= ''
        element.text(value.toString())

# Gets and sets the innerHTML of the element
bkvo.interfaces.register
    name: 'html'
    get: (element) ->
        element.html()
    set: (element, value) ->
        value or= ''
        element.html(value.toString())

# Gets and sets the value of the element. This is to be used with form fields
# and such.
bkvo.interfaces.register
    name: 'value'
    get: (element) ->
        element.val()
    set: (element, value) ->
        value or= ''
        element.val(value)

# Gets and sets the 'disabled' property of the element. The disabled property
# is directly related to the truth of the value. That is, if the value is true
# the element will be enabled.
bkvo.interfaces.register
    name: 'enabled',
    get: (element) ->
        element.prop('disabled')
    set: (element, value) ->
        element.prop('disabled', !Boolean(value))

# Gets and sets the 'disabled' property of the element. The disabled property
# is inversely related to the truth of the value. That is, if the value is true
# the element will be disabled.
bkvo.interfaces.register
    name: 'disabled'
    get: (element) ->
        element.prop('disabled')
    set: (element, value) ->
        element.prop('disabled', Boolean(value))

# Gets and sets the 'checked' property of the element (checkboxes or radio
# buttons). 
bkvo.interfaces.register
    name: 'checked'
    get: (element) ->
        element.prop('checked')
    set: (element, value) ->
        element.prop('checked', Boolean(value))
