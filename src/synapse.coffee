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
                raw = wrapped.raw

                raw.observe = ->
                    wrapped.observe arguments...
                    return @

                raw.notify = ->
                    wrapped.notify arguments...
                    return @

                raw.sync = ->
                    wrapped.sync arguments...
                    return @

                return raw

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
