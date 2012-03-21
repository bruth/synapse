((root, factory) ->
    # Hook is not supported in Node/CommonJS environment
    if typeof define is 'function' and define.amd
        # AMD
        define 'synapse/backbone-view', ['synapse/core', 'backbone', 'exports'], (core, Backbone, exports) ->
             factory(root, exports, core, Backbone)
    else if typeof exports is 'undefined'
        # Browser globals
        root.BackboneViewHook = factory(root, {}, root.SynapseCore, root.Backbone)
    # Backbone does not use a module syntax and thus will be a global
) @, (root, BackboneViewHook, core) ->

    # ### Interfaces Registry
    # Simple module allowing for [un]registering interfaces. The ``get`` and
    # ``set`` methods are defined here which are used by ``Synapse`` instances
    # as the common interface for ``jQuery`` objects.
    #
    # Compound interfaces correspond to other jQuery APIs such as ``attr``,
    # ``prop`` and ``data`` and require their own ``key``, thus the
    # ``attr.name`` convention. In this case, the ``key`` will be extracted
    # and passed as the first argument to the interface handler.
    interfaces = do ->
        registry: {}

        register: (config) ->
            @registry[config.name] = config

        unregister: (name) ->
            delete @registry[name]

        get: (object, name, args...) ->
            [name, key] = name.split '.'
            if key? then args = [key].concat(args)
            if (iface = @registry[name])
                return iface.get.apply(object, args)

        set: (object, name, args...) ->
            [name, key] = name.split '.'
            if key? then args = [key].concat(args)
            if (iface = @registry[name])
                return iface.set.apply(object, args)

    # ### Built-In interfaces
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
            if core.isObject(key) then @attr(key) else @attr(key, value)

        getCss = (key) -> @css(key)

        setCss = (key, value) ->
            if core.isObject(key) then @css(key) else @css(key, value)

        # ### _text_
        # Gets and sets the ``innerText`` of the element
        interfaces.register
            name: 'text'
            get: -> @text()
            set: (value) -> @text((if value? then value else '').toString())


        # ### _html_
        # Gets and sets the ``innerHTML`` of the element
        interfaces.register
            name: 'html'
            get: -> @html()
            set: (value) -> @html((if value? then value else '').toString())


        # ### _value_
        # Gets and sets the ``value`` of the element. This is to be used with form
        # fields.
        interfaces.register
            name: 'value'
            get: -> @val()
            set: (value) -> @val(if value? then value else '')


        # ### _enabled_
        # Gets and sets the ``disabled`` property of the element. The disabled
        # property is directly related to the truth of the value. That is, if the
        # value is true the element will be enabled.
        interfaces.register
            name: 'enabled',
            get: ->
                !getProperty.call(@, 'disabled')
            set: (value) ->
                if core.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'disabled', !Boolean(value))


        # ### _disabled_
        # Gets and sets the ``disabled`` property of the element. The disabled
        # property is inversely related to the truth of the value. That is, if the
        # value is true the element will be disabled.
        interfaces.register
            name: 'disabled'
            get: ->
                getProperty.call(@, 'disabled')
            set: (value) ->
                if core.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'disabled', Boolean(value))


        # ### _checked_
        # Gets and sets the ``checked`` property of the element. Applied to
        # checkboxes and radio buttons. 
        interfaces.register
            name: 'checked'
            get: ->
                getProperty.call(@, 'checked')
            set: (value) ->
                if core.isArray(value) and value.length is 0
                    value = false
                setProperty.call(@, 'checked', Boolean(value))


        # ### _visible_
        # An implied one-way interface that toggles the element's visibility
        # based on the truth of the value it is observing.
        interfaces.register
            name: 'visible'
            get: ->
                getCss.call(@, 'display') is not 'none'
            set: (value) ->
                if core.isArray(value) and value.length is 0
                    value = false
                if Boolean(value) then @show() else @hide()


        # ### _hidden_
        # An implied one-way interface that toggles the element's visibility
        # based on the truth of the value it is observing.
        interfaces.register
            name: 'hidden'
            get: ->
                getCss.call(@, 'display') is 'none'
            set: (value) ->
                if core.isArray(value) and value.length is 0
                    value = false
                if Boolean(value) then @hide() else @show()


        # ### Compound interfaces

        # ### _prop.FOO_
        # Gets and sets a property on the target element.
        interfaces.register
            name: 'prop'
            get: (key) -> getProperty.call(@, key)
            set: (key, value) -> setProperty.call(@, key, value)


        # ### _attr.FOO_
        # Gets and sets an attribute on the target element.
        interfaces.register
            name: 'attr'
            get: (key) -> getAttribute.call(@, key)
            set: (key, value) -> setAttribute.call(@, key, value)


        # ### _css.FOO_
        # Gets and sets a style property on the target element.
        interfaces.register
            name: 'css'
            get: (key) -> getCss.call(@, key)
            set: (key, value) -> setCss.call(@, key, value)


        # ### _data.FOO_
        # Gets and sets an attribute on the target element using the jQuery
        # data API.
        interfaces.register
            name: 'data'
            get: (key) -> @data(key)
            set: (key, value) -> @data(key, value)


        # ### _class.FOO_
        # Reads or adds/removes a single class on the target element using
        # jQuery hasClass for get and toggleClass for set
        # (based on the truthiness of the set value)
        interfaces.register
            name: 'class'
            get: (key) -> @hasClass(key)
            set: (key, value) -> @toggleClass(key, Boolean(value))


    # Default DOM events. When a DOM element is declared the subject of a
    # binding and no event is specified, the element will be compared to
    # each item in this list in order to determine the appropriate DOM
    # event to use. Note that more specific selectors should be listed first
    # to ensure those events are selected before less selective selectors are
    # encountered.
    domEvents = [
        ['a,button,[type=button],[type=reset]', 'click']
        ['select,[type=checkbox],[type=radio],textarea', 'change']
        ['[type=submit]', 'submit']
        ['input', 'keyup']
    ]
    
    # Default element interfaces relative to their selectors. Each
    # item will be iterated over in order and compared against using
    # the ``Zepto.fn.is()`` method for comparison. Note that more
    # specific selectors should be listed first to ensure those events are
    # selected before less selective selectors are encountered.
    elementInterfaces = [
        ['[type=checkbox],[type=radio]', 'checked']
        ['input,textarea,select', 'value']
    ]

    # An array of element attributes to check for a value during interface
    # detection. This value will be used for the opposite interface.
    elementBindAttributes = ['name', 'role', 'data-bind']
    
    return {
        typeName: 'Backbone View'
        
        domEvents: domEvents
        
        elementBindAttributes: elementBindAttributes
        
        elementInterfaces: elementInterfaces

        interfaces: interfaces        

        checkObjectType: (object) ->
            object instanceof Backbone.View

        # If the `key` exists directly on the object, assume it is a function
        # and call it to retrieve the value. Otherwise pass it off to the
        # hook.
        getHandler: (object, key) ->
            el = object.$(object.el)
            if core.isFunction(object[key])
                value = object[key]()
            else
                value = interfaces.get el, key
            if value and el.is('[type=number]')
                return if value.indexOf('.') > -1 then parseFloat(value) else parseInt(value)
            return value

        # If the `key` exists directly on the model instance, assume it
        # is a function, pass in the arguments and call it to set the value.
        # Otherwise pass it off to the hook
        setHandler: (object, key, value) ->
            if core.isFunction(object[key])
                return object[key](value)
            return interfaces.set object.$(object.el), key, value

        onEventHandler: (object, event, handler) ->
            object.$(object.el).bind event, handler

        offEventHandler: (object, event, handler) ->
            object.$(object.el).unbind event, handler

        triggerEventHandler: (object, event) ->
            object.$(object.el).trigger event

        detectEvent: (object) ->
            el = object.$(object.el)
            for item in domEvents
                [selector, event] = item
                if el.is(selector) then return event

        detectInterface: (object) ->
            el = object.$(object.el)
            for item in elementInterfaces
                [selector, iface] = item
                if el.is(selector) then return iface
            return 'text'

        detectOtherInterface: (object) ->
            el = object.$(object.el)
            for attr in elementBindAttributes
                if (value = el.attr attr)
                    return value
    }
