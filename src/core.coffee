# NOTE: indent is necessary for building...

    # this is in underscore dev
    if not _.isObject then _.isObject = (object) -> object is Object(object)


    # default configuration options for Synapse
    defaultSynapseConf =
        autoExtendObjects: true
        debug: false


    # user can predefine Synapse as an object defining options.
    # this object will be augmented during execution
    synapseConf = @Synapse or {}


    # fill in the rest of the default options
    _.defaults(synapseConf, defaultSynapseConf)


    # define and build up local copy of Synapse
    Synapse = (object) -> new Synapse.fn.init(object)

    Synapse.version = '@VERSION'

    # global internal counter for all objects. used to reference objects
    # that are connected in some way.
    Synapse.guid = 1

    # general cache for all objects by their ``guid``
    Synapse.cache = {}

    # store configuration
    Synapse.conf = synapseConf


    Synapse.log = ->
        if Synapse.conf.debug
            try
                console.log.apply(console, arguments)
            catch e
                try
                    opera.postError.apply(opera, arguments)
                catch e
                    alert(Array.prototype.join.call(arguments, ' '))


    # an enumeration of supported object types
    Synapse.types =

        # object primitive or instance that is not natively supported. the
        # object will be extended with Backbone.Events if the methods
        # 'bind', 'trigger' and 'unbind' are not present.
        object: 0

        # represents a jQuery object
        jquery: 1

        # Backbone model object
        model: 2

        # Backbone collection object
        collection: 3

        # Backbone view object
        view: 4

        # Backbone router object
        router: 5


    typeNames =
        0: 'Object'
        1: 'jQuery'
        2: 'Model'
        3: 'Collection'
        4: 'View'
        5: 'Router'


    # determines the object type
    Synapse.getObjectType = (object) ->

        if object instanceof $
            return Synapse.types.jquery

        if object instanceof Backbone.Model
            return Synapse.types.model

        if object instanceof Backbone.Collection
            return Synapse.types.collection

        if object instanceof Backbone.View
            return Synapse.types.view

        if object instanceof Backbone.Router
            return Synapse.types.router

        return Synapse.types.object


    Synapse.fn = Synapse:: =

        constructor: Synapse

        # keep references to all observers and subjects via their guid.
        # the corresponding event and whether it is an active connection.
        # { 3: [event, true] }
        observers: {}

        subjects: {}

        init: (context) ->
            # already an instance
            if context instanceof Synapse then return context

            # convert into a jQuery object if a string or element
            if _.isString(context) or _.isElement(context)
                context = $.apply($, arguments)

            # store reference to original context 
            @context = context

            # get the type of the context
            @type = Synapse.getObjectType(context)

            # increment guid and cache a reference to this object
            Synapse.cache[@guid = Synapse.guid++] = @

        # use native bind method if available and fallback to the
        # Backbone.Events.bind
        bind: ->
            if @context.bind
                @context.bind.apply(@context, arguments)
            else
                Backbone.Events.bind.apply(@context, arguments)
            return @

        # use native unbind method if available and fallback to the
        # Backbone.Events.unbind
        unbind: ->
            if @context.unbind
                @context.unbind.apply(@context, arguments)
            else
                Backbone.Events.unbind.apply(@context, arguments)
            return @

        # use native trigger method if available and fallback to the
        # Backbone.Events.trigger
        trigger: ->
            if @context.trigger
                @context.trigger.apply(@context, arguments)
            else
                Backbone.Events.trigger.apply(@context, arguments)
            return @

        get: (key) ->
            # if a method exists on this object, this takes precedence
            if _.isFunction(@context[key])
                return @context[key]()

            # use the interfaces for jQuery objects
            if @type is Synapse.types.jquery
                return Synapse.interfaces.get(@context, key)

            # use the native get method if it exists e.g.
            # Backbone.Model.get
            if @context.get
                return @context.get.call(@context, key)

            # fall back to simply setting the object property
            return @context[key]

        set: (key, value) ->
            # if a method exists on this object, this takes precedence
            if _.isFunction(@context[key])
                return @context[key](value)

            # handle single key/value pair and create an object for use
            # by the below ``set`` methods
            if not _.isObject(key)
                attrs = {}
                attrs[key] = value
            else
                attrs = key

            # use the interfaces for jQuery objects
            if @type is Synapse.types.jquery
                for k, v of attrs
                    Synapse.interfaces.set(@context, k, v)

            # next try using native set method on context e.g. Model.set
            else if @context.set
                @context.set.call(@context, attrs)

            # fallback to extending the context object
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

        toString: -> "<Synapse #{typeNames[@type]} ##{@guid}>"

    # simple convenience methods
    Synapse::observe = Synapse::addNotifier
    Synapse::notify = Synapse::addObserver

    Synapse.fn.init.prototype = Synapse.fn

