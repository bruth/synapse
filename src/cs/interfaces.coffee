# An interface provides functions to get and set data from referenced
# Backbone View (which interfaces with the model).
BKVO.interfaces = do ->

    registry: {}

    register: (config) ->
        @registry[config.name] = config

    unregister: (name) ->
        delete @registry[name]

    get: (context, name, args...) ->
        [name, key] = name.split ':'
        if key? then args = [key].concat(args)
        @registry[name].get.apply(context, args)

    set: (context, name, args...) ->
        [name, key] = name.split ':'
        if key? then args = [key].concat(args)
        @registry[name].set.apply(context, args)


# setter/getter for properties
getProperty = (key) ->
    # backwards compatible with older jQuery versions and Zepto which
    # are the two required for Backbone
    if @prop?
        return @prop(key)
    getAttribute.call(@, key)

setProperty = (key, value) ->
    # backwards compatible with older jQuery versions and Zepto which
    # are the two required for Backbone
    if @prop?
        if typeof key is 'object'
            return @prop(key)
        return @prop(key, value)
    setAttribute.call(@, key, value)


# setter/getter for attributes
getAttribute = (key) -> @attr(key)

setAttribute = (key, value) ->
    if typeof key is 'object'
        return @attr(key)
    @attr(key, value)


# setter/getter for style properties
getStyle = (key) -> @css(key)

setStyle = (key, value) ->
    if typeof key is 'object'
        return @css(key)
    @css(key, value)


BKVO.interfaces.register
    name: 'prop'
    get: (key) -> getProperty.call(@, key)
    set: (key, value) -> setProperty.call(@, key, value)


BKVO.interfaces.register
    name: 'attr'
    get: (key) -> getAttribute.call(@, key)
    set: (key, value) -> setAttribute.call(@, key, value)


BKVO.interfaces.register
    name: 'style'
    get: (key) -> getStyle.call(@, key)
    set: (key, value) -> setStyle.call(@, key, value)


# Gets and sets the innerText of the element
BKVO.interfaces.register
    name: 'text'
    get: -> @text()
    set: (value) -> @text((value or= '').toString())


# Gets and sets the innerHTML of the element
BKVO.interfaces.register
    name: 'html'
    get: -> @html()
    set: (value) -> @html((value or= '').toString())


# Gets and sets the value of the element. This is to be used with form fields
# and such.
BKVO.interfaces.register
    name: 'value'
    get: -> @val()
    set: (value) -> @val(value or= '')


# Gets and sets the 'disabled' property of the element. The disabled property
# is directly related to the truth of the value. That is, if the value is true
# the element will be enabled.
BKVO.interfaces.register
    name: 'enabled',
    get: ->
        !getProperty.call(@, 'disabled')
    set: (value) ->
        if _.isArray(value) and value.length is 0
            value = false
        setProperty.call(@, 'disabled', !Boolean(value))


# Gets and sets the 'disabled' property of the element. The disabled property
# is inversely related to the truth of the value. That is, if the value is true
# the element will be disabled.
BKVO.interfaces.register
    name: 'disabled'
    get: ->
        getProperty.call(@, 'disabled')
    set: (value) ->
        if _.isArray(value) and value.length is 0
            value = false
        setProperty.call(@, 'disabled', Boolean(value))


# Gets and sets the 'checked' property of the element (checkboxes or radio
# buttons). 
BKVO.interfaces.register
    name: 'checked'
    get: ->
        getProperty.call(@, 'checked')
    set: (value) ->
        if _.isArray(value) and value.length is 0
            value = false
        setProperty.call(@, 'checked', Boolean(value))


# An implied one-way interface that toggles the element's visibility
# based on the truth of the value it is observing.
BKVO.interfaces.register
    name: 'visible'
    get: ->
        getStyle.call(@, 'display') is not 'none'

    set: (value) ->
        if _.isArray(value) and value.length is 0
            value = false
        if Boolean(value) then @show() else @hide()


# An implied one-way interface that toggles the element's visibility
# based on the truth of the value it is observing.
BKVO.interfaces.register
    name: 'hidden'
    get: ->
        getStyle.call(@, 'display') is 'none'

    set: (value) ->
        if _.isArray(value) and value.length is 0
            value = false
        if Boolean(value) then @hide() else @show()


BKVO.interfaces.register
    name: 'css'
    get: (key) -> @.hasClass(key)
    set: (key, value) ->
        if _.isArray(value) and value.length is 0
            value = false
        if Boolean(value) then @addClass(key) else @removeClass(key)

