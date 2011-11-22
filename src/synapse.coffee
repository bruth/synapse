#
# Synapse
# (c) 2011 Byron Ruth
# Synapse may be freely distributed under the BSD license
# Version: 0.3.1
# Date: November 21, 2011
#

define ['synapse/core', 'synapse/connect'], (core, connect) ->
    objectGuid = 1

    class Synapse
        version: '0.3.1'
       
        # ## Constructor
        # Ensure the ``object`` is not already an instance of ``Synapse``.
        constructor: (object) ->
            if object instanceof Synapse
                return object

            # If called with `new`, process as normal which returns the wrapped
            # object. Otherwise, augment the object with the primary methods.
            if @constructor isnt Synapse
                wrapped = new Synapse(object)

                object.observe = ->
                    wrapped.observe arguments...
                    return @

                object.notify = ->
                    wrapped.notify arguments...
                    return @

                object.sync = ->
                    wrapped.sync arguments...
                    return @

                return wrapped.raw

            # Find the appropriate hook
            for hook in Synapse.hooks
                if hook.checkObjectType object
                    break
                hook = null

            # No hook was found for this object type
            if not hook
                throw new Error "No hook exists for #{core.getType(object)} types"

            @raw = hook.coerceObject?(object) or object
            @hook = hook
            @guid = objectGuid++
            @channels = []

        # Detects an appropriate event to attach an event handler to. This
        # applies only to subjects.
        detectEvent: ->
            if (value = @hook.detectEvent @raw, arguments...) then return value
            throw new Error "#{@hook.typeName} types do not support events"

        # Attaches an event handler. This applies only to subjects.
        on: ->
            if (value = @hook.onEventHandler? @raw, arguments...) then return @
            throw new Error "#{@hook.typeName} types do not support events"

        # Detaches an event handler. This applies only to subjects.
        off: ->
            if (value = @hook.offEventHandler? @raw, arguments...) then return @
            throw new Error "#{@hook.typeName} types do not support events"
        
        # Triggers an event handler. This applies only to subjects.
        trigger: ->
            if (value = @hook.triggerEventHandler? @raw, arguments...) then return @
            throw new Error "#{@hook.typeName} types do not support events"

        # Detects an appropriate interface (property or method) to use as a
        # data source for a given communication channel.
        detectInterface: ->
            @hook.detectInterface? @raw

        # Detects an interface for the other end of the channel.
        detectOtherInterface: ->
            @hook.detectOtherInterface? @raw

        # Gets a value for a given interface.
        get: ->
            @hook.getHandler @raw, arguments...

        # Sets a value for a given interface.
        set: ->
            @hook.setHandler @raw, arguments...
            return @

        # Opens a one-way channel where this object is observing another
        # object for changes in state.
        observe: (other, args...) ->
            other = new Synapse(other)
            connect(other, @, args...)
            return @

        # Opens a one-way channel where another object is being notified by
        # this object when it's state changes.
        notify: (other, args...) ->
            other = new Synapse(other)
            connect(@, other, args...)
            return @ 

        # Opens a two-way channel where this and another object notify each
        # other when either have a change in state.
        sync: (other) ->
            other = new Synapse(other)
            @observe(other).notify(other)
            return @


    # Register hooks
    Synapse.hooks = hooks = []
    Synapse.addHooks = ->
        hooks.push.apply hooks, arguments

    return Synapse
