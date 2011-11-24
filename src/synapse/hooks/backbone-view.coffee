# Backbone View Hook

((root, factory) ->
    # Hook is not supported in Node/CommonJS environment
    if typeof define is 'function' and define.amd
        # AMD
        define 'synapse/hooks/backbone-view', [
            'synapse/core'
            'synapse/hooks/jquery',
            'backbone'
            'exports'
        ], (core, jQueryHook, Backbone, exports) ->
             factory(root, exports, core, jQueryHook, Backbone)
    else if typeof exports is 'undefined'
        # Browser globals
        root.BackboneViewHook = factory(root, {}, root.SynapseCore, root.jQueryHook, root.Backbone)
    # Backbone does not use a module syntax and thus will be a global
) @, (root, BackboneViewHook, core, hook) ->

    return {
        typeName: 'Backbone View'

        checkObjectType: (object) ->
            object instanceof Backbone.View

        # If the `key` exists directly on the object, assume it is a function
        # and call it to retrieve the value. Otherwise pass it off to the
        # hook.
        getHandler: (object, key) ->
            if core.isFunction(object[key])
                return object[key]()
            return hook.getHandler hook.coerceObject(object.el), key

        # If the `key` exists directly on the model instance, assume it
        # is a function, pass in the arguments and call it to set the value.
        # Otherwise pass it off to the hook
        setHandler: (object, key, value) ->
            if core.isFunction(object[key])
                return object[key](value)
            return hook.setHandler hook.coerceObject(object.el), key, value

        onEventHandler: (object, event, handler) ->
            hook.onEventHandler hook.coerceObject(object.el), event, handler

        offEventHandler: (object, event, handler) ->
            hook.offEventHandler hook.coerceObject(object.el), event, handler

        triggerEventHandler: (object, event) ->
            hook.triggerEventHandler hook.coerceObject(object.el), event

        detectEvent: (object) ->
            hook.detectEvent hook.coerceObject(object.el)

        detectInterface: (object) ->
            hook.detectInterface hook.coerceObject(object.el)

        detectOtherInterface: (object) ->
            hook.detectOtherInterface hook.coerceObject(object.el)

    }
