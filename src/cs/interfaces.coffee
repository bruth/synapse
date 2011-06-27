exports = this
exports.bkvo = bkvo = {}

parseInterfaceSignature = (sig) ->
    [send, interface, observe, receive] = sig.split ':'

    config =
        send: send
        receive: receive
        interface: interface
        observes: observe.split ','
 
    
# An interface provides functions to send and receive data from referenced
# Backbone View (which interfaces with the model).
bkvo.interfaces = do ->

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
    # are the two required for BackboneJS
    if @prop? then @prop(key) else sendAttribute.call(@, key)

receiveProperty = (key, value) ->
    # backwards compatible with older jQuery versions and Zepto which
    # are the two required for BackboneJS
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


bkvo.interfaces.register
    name: 'prop'
    send: (key) -> sendProperty.call(@, key)
    receive: (key, value) -> receiveProperty.call(@, key, value)


bkvo.interfaces.register
    name: 'attr'
    send: (key) -> sendAttribute.call(@, key)
    receive: (key, value) -> receiveAttribute.call(@, key, value)


bkvo.interfaces.register
    name: 'css'
    send: (key) -> sendCSS.call(@, key)
    receive: (key, value) -> receiveCSS.call(@, key, value)


# An implied one-way interface that toggles the element's visibility
# based on the truth of the value it is observing.
bkvo.interfaces.register
    name: 'visible'
    send: (key) ->
    receive: (key, value) ->
        if value then @show() else @hide()

# Gets and receives the innerText of the element
bkvo.interfaces.register
    name: 'text'
    send: (key) ->
        @text()
    receive: (key, value) ->
        value or= ''
        @text(value.toString())

# Gets and receives the innerHTML of the element
bkvo.interfaces.register
    name: 'html'
    send: (key) ->
        @html()
    receive: (key, value) ->
        value or= ''
        @html(value.toString())

# Gets and receives the value of the element. This is to be used with form fields
# and such.
bkvo.interfaces.register
    name: 'value'
    send: (key) ->
        @val()
    receive: (key, value) ->
        value or= ''
        @val(value)

# Gets and receives the 'disabled' property of the element. The disabled property
# is directly related to the truth of the value. That is, if the value is true
# the element will be enabled.
bkvo.interfaces.register
    name: 'enabled',
    send: (key) ->
        !sendProperty.call(@, 'disabled')
    receive: (key, value) ->
        receiveProperty.call(@, 'disabled', !Boolean(value))

# Gets and receives the 'disabled' property of the element. The disabled property
# is inversely related to the truth of the value. That is, if the value is true
# the element will be disabled.
bkvo.interfaces.register
    name: 'disabled'
    send: (key) ->
        receiveProperty.call(@, 'disabled')
    receive: (key, value) ->
        receiveProperty.call(@, 'disabled', Boolean(value))

# Gets and receives the 'checked' property of the element (checkboxes or radio
# buttons). 
bkvo.interfaces.register
    name: 'checked'
    send: (key) ->
        sendProperty.call(@, 'checked')
    receive: (key, value) ->
        receiveProperty.call(@, 'checked', Boolean(value))


###

config =
    # two-way
    '[name=first-name]':
        keyup:
            value: 'firstName'

    # two-way
    '[name=last-name] keyup':
        value: 'lastName'
 
    # one-way ro
    '.name':
        html: 'firstName,lastName:getFullName'

    # one-way ro
    '.date':
        text: 'firstName,lastName,onTwitter:getDate'

    # one-way ro
    '[name=on-twitter]':
        enabled: 'firstName'

    # two-way
    '[name=on-twitter] change':
        prop:
            checked: 'onTwitter'

    # one-way ro
    '.twitter': visible: 'onTwitter'

    # one-way ro
    '.permalink':
        attr:
            href: 'url'
            title: 'firstName,lastName:getFullName'


'[name=first-name]'
    keyup: ':value:firstName:'

'[name=last-name]'
    keyup: ':value:lastName:'

'.name'
    noevent: ':html:firstName,lastName:getFullName'

'.date'
    noevent: ':text:firstName,lastName,onTwitter:getDate'

'[name=on-twitter]'
    noevent: ':prop:disabled=firstName:istrue'
    change: ':prop:checked=onTwitter:isfalse'

'.twitter'
    noevent: ':visible:onTwitter:'

'.permalink'
    noevent: [':attr:href=url:', ':attr:firstName,lastName:getFullName']

    

<selector> : <event>

<event> : <interface> | attr | prop | css

<proxy> : <interface> +

<interface> : <config>

<config> : 'attr1[,attr2,...][:receive]' |
    <observes> : string | array
    <send> : string | function
    <receive> : string | function
    ...


###
