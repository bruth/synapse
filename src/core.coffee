#
#     Synapse - The Backbone KVO Library
#     (c) 2011 Byron Ruth
#     Synapse may be freely distributed under the MIT license
#     Version: @VERSION
#     Date: @DATE
#

define ['synapse/connect'], (connect) ->
    objectGuid = 1

    class Synapse
        version: '@VERSION'
       
        # ## Constructor
        # Ensure the ``context`` is not already an instance of ``Synapse``.
        # Strings and DOM elements are converted to jQuery objects and the
        # original context is stored for safe-keeping. The ``type`` is
        # determined for inferring the interfaces.
        constructor: (object) ->
            if object instanceof Synapse then return object
            if @constructor isnt Synapse then return new Synapse(object)
            for ext in Synapse.hooks
                if ext.checkObjectType object
                    @type = ext.typeName
                    @ext = ext
                    @guid = objectGuid++
                    @raw = ext.coerceObject?(object) or object
                    @channels = []
                    @lastInterfaceValues = {} 
                    return
            throw new Error("No hook exists for #{object} types")

        detectEvent: ->
            if (value = @ext.detectEvent @raw, arguments...) then return value
            throw new Error "Objects for #{@type} do not support events"

        on: ->
            if (value = @ext.onEventHandler? @raw, arguments...) then return @
            throw new Error "Objects for #{@type} do not support events"

        off: ->
            if (value = @ext.offEventHandler? @raw, arguments...) then return @
            throw new Error "Objects for #{@type} do not support events"
        
        trigger: ->
            if (value = @ext.triggerEventHandler? @raw, arguments...) then return @
            throw new Error "Objects for #{@type} do not support events"
       
        detectInterface: ->
            @ext.detectInterface? @raw

        detectOtherInterface: ->
            @ext.detectOtherInterface? @raw

        get: ->
            @ext.getHandler @raw, arguments...

        set: ->
            @ext.setHandler @raw, arguments...
            return @
 
        sync: (other) ->
            other = new Synapse(other)
            @observe(other).notify(other)
            return @

        observe: (other, args...) ->
            other = new Synapse(other)
            connect(other, @, args...)
            return @

        notify: (other, args...) ->
            other = new Synapse(other)
            connect(@, other, args...)
            return @

        toString: ->
            @ext.toString?(@raw) or @raw.toString()

    
    # Ability to register hooks
    Synapse.hooks = hooks = []
    Synapse.addHooks = ->
        hooks.push.apply hooks, arguments
    
    return Synapse
