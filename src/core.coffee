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


    # assign it to the root context
    Synapse = do ->

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

            for key of Backbone.Events
                if not object[key]
                    if not Synapse.conf.autoExtendObjects
                        throw new Error("object does not support events and 'autoExtendObjects' is turned off")

                    _.extend(object, Backbone.Events)
                    break

            return Synapse.types.object


        Synapse.fn = Synapse.prototype =
            constructor: Synapse

            # keep references to all observers and notifiers via their guid.
            # the corresponding event and whether it is an active connection.
            # { 3: [event, true] }
            observers: {}

            notifiers: {}

            init: (context) ->
                # already an instance
                if context instanceof Synapse then return context

                # convert into a jQuery object if a string or element
                if _.isString(context) or _.isElement(context)
                    context = $.apply($, arguments)

                else if $.isPlainObject(context)
                    _.extend(context, Backbone.Events)

                @guid = Synapse.guid++
                @type = Synapse.getObjectType(context)
                @context = context

                # cache a reference to this object
                Synapse.cache[@guid] = @

                return @

            bind: -> @.context.bind.apply(@, arguments)
            unbind: -> @.context.unbind.apply(@, arguments)
            trigger: -> @.context.trigger.apply(@, arguments)

            get: (key) ->
                if @context.get
                    return @context.get.call(@context, key)
                Synapse.interfaces.get(@context, key)

            set: (key, value) ->
                if @context.set
                    return @context.set.call(@context, key, value)
                Synapse.interfaces.set(@context, key, value)

            sync: (other) ->
                @observe(other).notify(other)

            observe: (notifier, options) ->
                Synapse.register(@, notifier, options, false)
                return @

            notify: (observer, options) ->
                Synapse.register(observer, @, options, true)
                return @


        Synapse.fn.init.prototype = Synapse.fn

        return Synapse
