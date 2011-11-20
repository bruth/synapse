define ->

    return {
        typeName: 'Plain Object'

        checkObjectType: (object) ->
            object is Object(object)

        # If the proprty is callable, execute it
        getHandler: (object, key) ->
            if object[key]?
                object[key]()
            else
                object[key]

        setHandler: (object, key, value) ->
            if object[key]?
                object[key](value)
            else
                object[key] = value
    }
