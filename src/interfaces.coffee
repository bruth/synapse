    # detect the default interface to use for the element
    detectElementInterface = (obj) ->
        for item in Synapse.defaultElementInterfaces
            [selector, interface] = item
            if obj.context.is(selector) then return interface
        throw new Error("Interface for #{obj} could not be detected.")

    # default element interfaces relative to their selectors. each
    # item will be iterated over in order and compared against using
    # the ``jQuery.fn.is()`` method for comparison.
    Synapse.defaultElementInterfaces = [
        [':checkbox', 'checked']
        [':radio', 'checked']
        ['button', 'html']
        [':input', 'value']
        ['*', 'text']
    ]

    # return an array of interfaces appropriate for the given subject/observer.
    # if no interface is defined, only if a ``name`` attribute on either the
    # subject or observer will be used by default (in the case of form fields).
    # ``downstream`` will be true when the interfaces are being defined relative
    # to subject
    Synapse.getInterfaces = (subject, observer, interfaces={}) ->
        getInterface = interfaces.get
        setInterface = interfaces.set

        # first, determine interfaces independently of the other...

        # get the interface for the subject
        if not getInterface
            # whenever a DOM element is used, the interface is the detected
            # interface.
            if subject.type is Synapse.types.jquery
                getInterface = detectElementInterface(subject)

            # if no value has been set and the subject is a model, assume
            # the observer wants to observe any change of the model. this
            # generally assumes a handler of some sorts will be performing
            # any necessary manipulation
            else if subject.type is Synapse.types.model
                getInterface = ''

        # get the interface for the observer
        if not setInterface
            if observer.type is Synapse.types.jquery
                # since this a jQuery type, we must detect the interface to
                # be used
                setInterface = detectElementInterface(observer)


        # second, determine interfaces based on the other's type...

        if not getInterface
            # value is still not defined, so use the observer's name if
            # present. the only time this would be setInterface is if the subject
            # is also a jQuery interfacesect. in this case, the subject 'name'
            # attribute takes precedence
            if observer.type is Synapse.types.jquery and observer.context.attr('name')
                getInterface or= observer.context.attr('name')


        if not setInterface
            # if a model is used then the 'name' attribute is used as the
            # interface for that model (the attribute to be get/set on that
            # model)
            if subject.type is Synapse.types.jquery and subject.context.attr('name')
                setInterface or= subject.context.attr('name')

            else
                setInterface or= getInterface

        # if none of the above worked
        if not setInterface
            throw new Error("The interfaces between #{subject} and #{observer} could be detected - #{getInterface} => #{setInterface}")

        if _.isString(getInterface) then getInterface = getInterface.split(' ')
        if _.isString(setInterface) then setInterface = setInterface.split(' ')

        # overwrite the defined interfaces only if null
        interfaces.get = getInterface
        interfaces.set = setInterface

        return interfaces


    # the interfaces registry 
    Synapse.interfaces = do ->

        registry: {}

        register: (config) ->
            @registry[config.name] = config

        unregister: (name) ->
            delete @registry[name]

        get: (context, name, args...) ->
            if context instanceof Synapse
                context = context.context

            [name, key] = name.split ':'
            if key? then args = [key].concat(args)
            @registry[name].get.apply(context, args)

        set: (context, name, args...) ->
            if context instanceof Synapse
                context = context.context

            [name, key] = name.split ':'
            if key? then args = [key].concat(args)
            @registry[name].set.apply(context, args)


    # built-in interfaces below
    do ->
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

        # Gets and sets the innerText of the element
        Synapse.interfaces.register
            name: 'text'
            get: -> @text()
            set: (value) -> @text((value or= '').toString())


        # Gets and sets the innerHTML of the element
        Synapse.interfaces.register
            name: 'html'
            get: -> @html()
            set: (value) -> @html((value or= '').toString())


        # Gets and sets the value of the element. This is to be used with form
        # fields and such.
        Synapse.interfaces.register
            name: 'value'
            get: -> @val()
            set: (value) -> @val(value or= '')


        # Gets and sets the 'disabled' property of the element. The disabled
        # property is directly related to the truth of the value. That is, if the
        # value is true the element will be enabled.
        Synapse.interfaces.register
            name: 'enabled',
            get: ->
                !getProperty.call(@, 'disabled')
            set: (value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'disabled', !Boolean(value))


        # Gets and sets the 'disabled' property of the element. The disabled
        # property is inversely related to the truth of the value. That is, if the
        # value is true the element will be disabled.
        Synapse.interfaces.register
            name: 'disabled'
            get: ->
                getProperty.call(@, 'disabled')
            set: (value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'disabled', Boolean(value))


        # Gets and sets the 'checked' property of the element (checkboxes or radio
        # buttons). 
        Synapse.interfaces.register
            name: 'checked'
            get: ->
                getProperty.call(@, 'checked')
            set: (value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'checked', Boolean(value))


        # An implied one-way interface that toggles the element's visibility
        # based on the truth of the value it is observing.
        Synapse.interfaces.register
            name: 'visible'
            get: ->
                getStyle.call(@, 'display') is not 'none'

            set: (value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                if Boolean(value) then @show() else @hide()


        # An implied one-way interface that toggles the element's visibility
        # based on the truth of the value it is observing.
        Synapse.interfaces.register
            name: 'hidden'
            get: ->
                getStyle.call(@, 'display') is 'none'

            set: (value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                if Boolean(value) then @hide() else @show()


        Synapse.interfaces.register
            name: 'prop'
            get: (key) -> getProperty.call(@, key)
            set: (key, value) -> setProperty.call(@, key, value)


        Synapse.interfaces.register
            name: 'attr'
            get: (key) -> getAttribute.call(@, key)
            set: (key, value) -> setAttribute.call(@, key, value)


        Synapse.interfaces.register
            name: 'style'
            get: (key) -> getStyle.call(@, key)
            set: (key, value) -> setStyle.call(@, key, value)


        Synapse.interfaces.register
            name: 'css'
            get: (key) -> @hasClass(key)
            set: (key, value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                if Boolean(value) then @addClass(key) else @removeClass(key)


        Synapse.interfaces.register
            name: 'data'
            get: (key) -> @data(key)
            set: (key, value) -> @data(key, value)



