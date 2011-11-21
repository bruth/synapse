define ['backbone'], ->

    return {
        typeName: 'Backbone.Model'

        toString: (object) ->
            object.cid

        checkObjectType: (object) ->
            object instanceof Backbone.Model

        getHandler: (object, key) ->
            if object[key]?
                object[key]()
            else
                object.get key

        setHandler: (object, key, value) ->
            if object[key]?
                object[key](value)
            else
                attrs = {}
                attrs[key] = value
                object.set attrs

        onEventHandler: (object, event, handler) ->
            object.bind event, handler

        offEventHandler: (object, event, handler) ->
            object.unbind event, handler

        triggerEventHandler: (object, event) ->
            object.trigger event

        detectEvent: (object, interface) ->
            if interface and not object[interface]
                return "change:#{interface}"
            return 'change' 
    }
