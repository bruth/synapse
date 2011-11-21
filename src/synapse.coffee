#
# Synapse
# (c) 2011 Byron Ruth
# Synapse may be freely distributed under the BSD license
# Version: 0.3
# Date: November 21, 2011
#

define ['synapse/core', 'synapse/connect'], (core, connect) ->
    objectGuid = 1

    class Synapse
        version: '0.3'
       
        # ## Constructor
        # Ensure the ``object`` is not already an instance of ``Synapse``.
        constructor: (object) ->
            if object instanceof Synapse then return object
            if @constructor isnt Synapse then return new Synapse(object)

            for hook in Synapse.hooks
                if hook.checkObjectType object
                    @type = hook.typeName
                    @hook = hook
                    @guid = objectGuid++
                    @raw = hook.coerceObject?(object) or object
                    @channels = []
                    return

            throw new Error("No hook exists for #{core.getType(object)} types")

        # Detects an appropriate event to attach an event handler to. This
        # applies only to subjects.
        detectEvent: ->
            if (value = @hook.detectEvent @raw, arguments...) then return value
            throw new Error "#{@type} types do not support events"

        # Attaches an event handler. This applies only to subjects.
        on: ->
            if (value = @hook.onEventHandler? @raw, arguments...) then return @
            throw new Error "#{@type} types do not support events"

        # Detaches an event handler. This applies only to subjects.
        off: ->
            if (value = @hook.offEventHandler? @raw, arguments...) then return @
            throw new Error "#{@type} types do not support events"
        
        # Triggers an event handler. This applies only to subjects.
        trigger: ->
            if (value = @hook.triggerEventHandler? @raw, arguments...) then return @
            throw new Error "#{@type} types do not support events"

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

        toString: ->
            @hook.toString?(@raw) or @raw.toString()

    
    # Ability to register hooks
    Synapse.hooks = hooks = []
    Synapse.addHooks = ->
        hooks.push.apply hooks, arguments
    
    return Synapse
