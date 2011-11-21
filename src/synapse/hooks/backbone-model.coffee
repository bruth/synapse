# Components for the Backbone Model hook

define ['backbone'], ->

    return {
        typeName: 'Backbone Model'

        # Ensure we are dealing with a Backbone.Model instance
        checkObjectType: (object) ->
            object instanceof Backbone.Model

        # If the `key` exists directly on the model instance, assume it
        # is a function and call it to retrieve the value. Otherwise use
        # the `get` method.
        getHandler: (object, key) ->
            if object[key]? then object[key]() else object.get key

        # If the `key` exists directly on the model instance, assume it
        # is a function, pass in the arguments and call it to set the value.
        # Otherwise use the `set` method. Note, the key/value must be put
        # into an object until https://github.com/documentcloud/backbone/pull/570
        # or one of the other variants are merged into Backbone.
        setHandler: (object, key, value) ->
            if object[key]?
                object[key](value)
            else
                attrs = {}
                attrs[key] = value
                object.set attrs

        # The Backbone Model class has it's own event system, thus we can use
        # bind/unbind/trigger methods here.
        onEventHandler: (object, event, handler) ->
            object.bind event, handler

        offEventHandler: (object, event, handler) ->
            object.unbind event, handler

        triggerEventHandler: (object, event) ->
            object.trigger event

        # Detect the appropriate event for model. Change is typically the
        # desired event to watch. The event can be more specific depending on
        # the what the interface refers to. Interfaces in the context of
        # Backbone Models are simply data attributes. The interface is checked
        # to ensure it does not represent a method on the model instance.
        detectEvent: (object, interface) ->
            if interface and not object[interface]
                return "change:#{interface}"
            return 'change' 
    }
