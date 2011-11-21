define ->
    channels = {}
    
    return {
        toString: Object.prototype.toString

        getType: (object) ->
            @toString.call(object).match(/^\[object\s(.*)\]$/)[1].toLowerCase()

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