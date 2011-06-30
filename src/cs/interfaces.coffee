# An interface provides functions to send and receive data from referenced
# Backbone View (which interfaces with the model).
BKVO.interfaces = do ->

    registry: {}

    register: (config) ->
        @registry[config.name] = config

    unregister: (name) ->
        delete @registry[name]

    send: (name, context, args...) ->
        @registry[name].send.apply(context, args)

    receive: (name, context, args...) ->
        @registry[name].receive.apply(context, args)


sendProperty = (key) ->
    # backwards compatible with older jQuery versions and Zepto which
    # are the two required for Backbone
    if @prop? then @prop(key) else sendAttribute.call(@, key)

receiveProperty = (key, value) ->
    # backwards compatible with older jQuery versions and Zepto which
    # are the two required for Backbone
    if @prop?
        if typeof key is 'object'
            @prop(key)
        else
            @prop(key, value)
    else
        receiveAttribute.call(@, key, value)

sendAttribute = (key) ->
    @attr(key)

receiveAttribute = (key, value) ->
    if typeof key is 'object'
        @attr(key)
    else
        @attr(key, value)

sendCSS = (key) ->
    @css(key)

receiveCSS = (key, value) ->
    if typeof key is 'object'
        @css(key)
    else
        @css(key, value)


BKVO.interfaces.register
    name: 'prop'
    send: (key) -> sendProperty.call(@, key)
    receive: (key, value) -> receiveProperty.call(@, key, value)


BKVO.interfaces.register
    name: 'attr'
    send: (key) -> sendAttribute.call(@, key)
    receive: (key, value) -> receiveAttribute.call(@, key, value)


BKVO.interfaces.register
    name: 'css'
    send: (key) -> sendCSS.call(@, key)
    receive: (key, value) -> receiveCSS.call(@, key, value)


# An implied one-way interface that toggles the element's visibility
# based on the truth of the value it is observing.
BKVO.interfaces.register
    name: 'visible'
    send: (key) ->
    receive: (key, value) ->
        if value then @show() else @hide()

# Gets and receives the innerText of the element
BKVO.interfaces.register
    name: 'text'
    send: (key) ->
        @text()
    receive: (key, value) ->
        value or= ''
        @text(value.toString())

# Gets and receives the innerHTML of the element
BKVO.interfaces.register
    name: 'html'
    send: (key) ->
        @html()
    receive: (key, value) ->
        value or= ''
        @html(value.toString())

# Gets and receives the value of the element. This is to be used with form fields
# and such.
BKVO.interfaces.register
    name: 'value'
    send: (key) ->
        @val()
    receive: (key, value) ->
        value or= ''
        @val(value)

# Gets and receives the 'disabled' property of the element. The disabled property
# is directly related to the truth of the value. That is, if the value is true
# the element will be enabled.
BKVO.interfaces.register
    name: 'enabled',
    send: (key) ->
        !sendProperty.call(@, 'disabled')
    receive: (key, value) ->
        receiveProperty.call(@, 'disabled', !Boolean(value))

# Gets and receives the 'disabled' property of the element. The disabled property
# is inversely related to the truth of the value. That is, if the value is true
# the element will be disabled.
BKVO.interfaces.register
    name: 'disabled'
    send: (key) ->
        receiveProperty.call(@, 'disabled')
    receive: (key, value) ->
        receiveProperty.call(@, 'disabled', Boolean(value))

# Gets and receives the 'checked' property of the element (checkboxes or radio
# buttons). 
BKVO.interfaces.register
    name: 'checked'
    send: (key) ->
        sendProperty.call(@, 'checked')
    receive: (key, value) ->
        receiveProperty.call(@, 'checked', Boolean(value))

