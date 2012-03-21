# Plain Object Hook. Obviously, plain objects do not have an event system
# built-in thus this Hook only allows these objects to be observers of other
# event-_ready_ objects.

((root, factory) ->
    if typeof exports isnt 'undefined'
        # Node/CommonJS
        factory(root, exports, require('synapse/core'))
    else if typeof define is 'function' and define.amd
        # AMD
        define 'synapse/hooks/object', ['synapse/core', 'exports'], (core, exports) ->
            factory(root, exports, core)
    else
        # Browser globals
        root.ObjectHook = factory(root, {}, root.SynapseCore)
) @, (root, ObjectHook, core) ->

    return {
        typeName: 'Plain Object'

        checkObjectType: (object) ->
            core.isObject(object)

        # If the `key` exists directly on the object, assume it
        # is a function and call it to retrieve the value.
        getHandler: (object, key) ->
            if core.isFunction(object[key])
                object[key]()
            else
                object[key]

        # If the `key` exists directly on the model instance, assume it
        # is a function, pass in the arguments and call it to set the value.
        setHandler: (object, key, value) ->
            if core.isFunction(object[key])
                object[key](value)
            else
                object[key] = value
    }
