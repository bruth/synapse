    # Iterates over each selector and event in ``elementInterfaces`` and
    # compares it with the subject ``context`` (e.g. the ``jQuery`` object).
    detectElementInterface = (elem) ->
        for item in Synapse.configuration.elementInterfaces
            [selector, interface] = item
            if elem.is(selector) then return interface
        if Synapse.configuration.defaultElementInterface
            return Synapse.configuration.defaultElementInterface
        throw new Error("Interface for #{elem} could not be detected.")

    # Return an array of interfaces appropriate for the given subject/observer.
    # If no interface is defined, only if a ``name`` or ``role`` attribute on
    # either the subject or observer will be used by default. The following steps
    # are invovled in determining the interfaces:
    #
    # - each interface is independently determined first, since the other may
    # be inferred from the other (specifically in the case of DOM elements)
    # - if either are not defined, each is attempted to be determined relative
    # to the other
    # - elements can use an arbitrary identifier such as the ``name`` or
    # ``role`` attribute (e.g. name="title")
    #
    # The last step slits the string in case multiple interfaces have been
    # defined for either side.
    #
    # **Special note:**
    # If no ``subjectInterface`` has been set and the subject is a model, assume
    # the observer wants to observe any change of the model. This generally
    # assumes a handler of some sorts will be performing any necessary
    # manipulation.
    Synapse.getInterfaces = (subject, observer, subjectInterface, observerInterface) ->

        if not subjectInterface
            if subject.type is Types.jquery
                subjectInterface = detectElementInterface(subject.context)
            else if subject.type is Types.view
                subjectInterface = detectElementInterface(subject.context.el)
            else if subject.type is Types.model
                subjectInterface = ''

        if not observerInterface
            if observer.type is Types.jquery
                observerInterface = detectElementInterface(observer.context)
            else if observer.type is Types.view
                observerInterface = detectElementInterface(observer.context.el)

        if not subjectInterface
            el = null

            if observer.type is Types.jquery
                el = observer.context
            else if observer.type is Types.view
                el = observer.context.el

            if el
                for attr in Synapse.configuration.elementBindAttributes
                    if el.attr(attr)
                        subjectInterface = el.attr(attr)
                        break

        if not observerInterface
            el = null

            if subject.type is Types.jquery
                el = subject.context
            else if subject.type is Types.view
                el = subject.context.el

            if el
                for attr in Synapse.configuration.elementBindAttributes
                    if el.attr(attr)
                        observerInterface = el.attr(attr)
                        break
            else
                observerInterface = subjectInterface

        if not observerInterface
            throw new Error("The interfaces between #{subject} and #{observer}
                could be detected - #{subjectInterface} => #{observerInterface}")

        if _.isString(subjectInterface) then subjectInterface = subjectInterface.split(' ')
        if _.isString(observerInterface) then observerInterface = observerInterface.split(' ')

        return [subjectInterface, observerInterface]


    # ### Interfaces Registry
    # Simple module allowing for [un]registering interfaces. The ``get`` and
    # ``set`` methods are defined here which are used by ``Synapse`` instances
    # as the common interface for ``jQuery`` objects.
    #
    # Compound interfaces correspond to other jQuery APIs such as ``attr``,
    # ``prop`` and ``data`` and require their own ``key``, thus the
    # ``attr:name`` convention. In this case, the ``key`` will be extracted
    # and passed as the first argument to the interface handler.
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


    # ### Built-In Interfaces
    # Each setter and getter for compound interfaces are defined up front
    # for use throughout the interfaces. For older versions of jQuery, ``attr``
    # will be used instread of ``prop``.
    do ->
        getProperty = (key) ->
            if @prop?
                return @prop(key)
            getAttribute.call(@, key)

        setProperty = (key, value) ->
            if @prop?
                if typeof key is 'object'
                    return @prop(key)
                return @prop(key, value)
            setAttribute.call(@, key, value)

        getAttribute = (key) -> @attr(key)

        setAttribute = (key, value) ->
            if _.isObject(key) then @attr(key) else @attr(key, value)


        getStyle = (key) -> @css(key)

        setStyle = (key, value) ->
            if _.isObject(key) then @css(key) else @css(key, value)

        # ### _text_
        # Gets and sets the ``innerText`` of the element
        Synapse.interfaces.register
            name: 'text'
            get: -> @text()
            set: (value) -> @text((value or= '').toString())


        # ### _html_
        # Gets and sets the ``innerHTML`` of the element
        Synapse.interfaces.register
            name: 'html'
            get: -> @html()
            set: (value) -> @html((value or= '').toString())


        # ### _value_
        # Gets and sets the ``value`` of the element. This is to be used with form
        # fields.
        Synapse.interfaces.register
            name: 'value'
            get: -> @val()
            set: (value) -> @val(value or= '')


        # ### _enabled_
        # Gets and sets the ``disabled`` property of the element. The disabled
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


        # ### _disabled_
        # Gets and sets the ``disabled`` property of the element. The disabled
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


        # ### _checked_
        # Gets and sets the ``checked`` property of the element. Applied to
        # checkboxes and radio buttons. 
        Synapse.interfaces.register
            name: 'checked'
            get: ->
                getProperty.call(@, 'checked')
            set: (value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'checked', Boolean(value))


        # ### _visible_
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


        # ### _hidden_
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


        # ### Compound Interfaces

        # ### _prop:FOO_
        # Gets and sets a property on the target element.
        Synapse.interfaces.register
            name: 'prop'
            get: (key) -> getProperty.call(@, key)
            set: (key, value) -> setProperty.call(@, key, value)


        # ### _attr:FOO_
        # Gets and sets an attribute on the target element.
        Synapse.interfaces.register
            name: 'attr'
            get: (key) -> getAttribute.call(@, key)
            set: (key, value) -> setAttribute.call(@, key, value)


        # ### _style:FOO_
        # Gets and sets a style property on the target element.
        Synapse.interfaces.register
            name: 'style'
            get: (key) -> getStyle.call(@, key)
            set: (key, value) -> setStyle.call(@, key, value)


        # ### _css:FOO_
        # Gets and sets a CSS class on the target element.
        Synapse.interfaces.register
            name: 'css'
            get: (key) -> @hasClass(key)
            set: (key, value) ->
                if _.isArray(value) and value.length is 0
                    value = false
                if Boolean(value) then @addClass(key) else @removeClass(key)


        # ### _data:FOO_
        # Gets and sets an attribute on the target element using the jQuery
        # data API.
        Synapse.interfaces.register
            name: 'data'
            get: (key) -> @data(key)
            set: (key, value) -> @data(key, value)

