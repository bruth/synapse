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

        isBoolean: (object) ->
            @getType(object) is 'Boolean'
    }
