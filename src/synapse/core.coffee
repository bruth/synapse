((root, factory) ->
    if typeof exports isnt 'undefined'
        # Node/CommonJS
        factory(root, exports)
    else if typeof define is 'function' and define.amd
        # AMD
        define 'synapse/core', ['exports'], (exports) ->
            factory(root, exports)
    else
        # Browser globals
        root.SynapseCore = factory(root, {})
) @, (root, core) ->

    channels = {}
    
    return {
        toString: Object.prototype.toString

        getType: (object) ->
            @toString.call(object).match(/^\[object\s(.*)\]$/)[1]

        isObject: (object) ->
            @getType(object) is 'Object'

        isArray: (object) ->
            @getType(object) is 'Array'

        isFunction: (object) ->
            @getType(object) is 'Function'

        isString: (object) ->
            @getType(object) is 'String'

        # Pub/Sub components
        publish: (channel, args...) ->
            subscribers = channels[channel] or []
            for sub in subscribers
                sub.handler.apply sub.context, args

        subscribe: (channel, handler, context) ->
            if not channels[channel] then channels[channel] = []
            sub = handler: handler, context: context or handler
            channels[channel].push sub
            return [channel, sub]

        unsubscribe: (handle) ->
            if (subscribers = channels[handle[0]])
                for i, sub in subscribers
                    if sub is handle[1]
                        subscribers.splice(i, 1)
                        break
    }
