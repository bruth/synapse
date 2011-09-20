    # ## Supported Types
    # An enumeration of supported object types including:
    #
    # - any object (fallback)
    # - jQuery and DOM elements
    # - Backbone.Model objects
    # - Backbone.Collection objects
    # - Backbone.View objects
    Types =
        object: 0
        jquery: 1
        model: 2
        collection: 3
        view: 4

    TypeNames =
        0: 'Object'
        1: 'jQuery'
        2: 'Model'
        3: 'Collection'
        4: 'View'

    getObjectType = (object) ->

        if object instanceof $
            return Types.jquery

        if object instanceof Backbone.Model
            return Types.model

        if object instanceof Backbone.Collection
            return Types.collection

        if object instanceof Backbone.View
            return Types.view

        return Types.object


    # The ``Synapse`` constructor acts as a common adapter between objects
    # providing a common interface for each type of object.
    Synapse = (object) -> new Synapse.fn.init(object)

    Synapse.guid = 1
    Synapse.cache = {}
    Synapse.version = '@VERSION'
    Synapse.configuration = configuration

    Synapse.fn = Synapse:: =

        constructor: Synapse

        # Keep references to all observers and subjects via their guid, the
        # corresponding event, and whether it is an active connection.
        # ``{ 3: [event, true] }``. So the necessary objects can be deferenced
        # when observing is turned off.
        observers: {}
        subjects: {}

        # ## Constructor
        # Ensure the ``context`` is not already an instance of ``Synapse``.
        # Strings and DOM elements are converted to jQuery objects and the
        # original context is stored for safe-keeping. The ``type`` is
        # determined for inferring the interfaces.
        init: (context) ->
            if context instanceof Synapse then return context

            if _.isString(context) or _.isElement(context)
                @originalContext = context
                context = $.apply($, arguments)

            @context = context
            @type = getObjectType(context)

            Synapse.cache[@guid = Synapse.guid++] = @

        # ## Bind/Unbind/Trigger
        # The common interface between all objects are the ``bind``,
        # ``unbind``, and ``trigger`` methods. The native methods are used if
        # available and fallback to the methods defined on the
        # ``Backbone.Events`` module.
        bind: ->
            bind = @context.bind or Backbone.Events.bind
            bind.apply @context, arguments

        unbind: ->
            unbind = @context.unbind or Backbone.Events.unbind
            unbind.apply @context, arguments

        trigger: ->
            trigger = @context.trigger or Backbone.Events.trigger
            trigger.apply @context, arguments


        # ## Get/Set
        # The second shared interface between all objects are the ``get`` and
        # ``set`` methods. The appropriate method of invocation is chosen
        # depending on the object type. If a ``jQuery`` object, the built-in
        # interfaces are used. The ``key`` will be checked on all other objects
        # to be a method, and then checked for a local ``get``/``set`` method.
        # The fallback (e.g. object primitives) is to return or set the object
        # property.
        get: (key) ->
            if @type is Types.jquery
                return Synapse.interfaces.get(@context, key)

            if _.isFunction(@context[key])
                return @context[key]()

            if @context.get
                return @context.get.call(@context, key)

            return @context[key]

        set: (key, value) ->
            if not _.isObject(key)
                attrs = {}
                attrs[key] = value
            else
                attrs = key

            if @type is Types.jquery
                for k, v of attrs
                    Synapse.interfaces.set(@context, k, v)
            else if _.isFunction(@context[key])
                @context[key](value)
            else if @context.set
                @context.set.call(@context, attrs)
            else
                _.extend @context, attrs

            return @

        sync: (other) ->
            if not (other instanceof Synapse)
                other = Synapse(other)
            @addNotifier(other).addObserver(other)

        addNotifier: (other, get, set) ->
            if not (other instanceof Synapse)
                other = Synapse(other)
            Synapse.register(other, @, get, set)
            return @

        addObserver: (other, get, set) ->
            if not (other instanceof Synapse)
                other = Synapse(other)
            Synapse.register(@, other, get, set)
            return @

        toString: -> "<Synapse #{TypeNames[@type]} ##{@guid}>"

    Synapse.fn.init:: = Synapse.fn

    # Extra convenience methods..
    Synapse::observe = Synapse::addNotifier
    Synapse::notify = Synapse::addObserver


