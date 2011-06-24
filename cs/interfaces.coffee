class InterfaceRegistry

    interfaces: {}

    get: (name) ->
        interface = @interfaces[name]
        [interface.get, interface.set]

    register: (name, getter, setter) ->
        @interfaces[name] =
            get: getter
            set: setter

    unregister = (name) ->
        delete @interfaces[name]


InterfaceRegistry = new InterfaceRegistry

# built-in interfaces

InterfaceRegistry.register('visible',
    (element) ->
    (element, value) ->
        if value then element.show() else element.hide()
)

InterfaceRegistry.register('text',
    (element) ->
        element.text()
    (element, value) ->
        value or= ''
        element.text(value.toString())
)

InterfaceRegistry.register('html',
    (element) ->
        element.html()
    (element, value) ->
        value or= ''
        element.html(value.toString())
)

InterfaceRegistry.register('value',
    (element) ->
        element.val()
    (element, value) ->
        value or= ''
        element.val(value)
)

InterfaceRegistry.register('enabled',
    (element) ->
        element.prop('disabled')
    (element, value) ->
        element.prop('disabled', !Boolean(value))
)

InterfaceRegistry.register('disabled',
    (element) ->
        element.prop('disabled')
    (element, value) ->
        element.prop('disabled', Boolean(value))
)

InterfaceRegistry.register('checked',
    (element) ->
        element.prop('checked')
    (element, value) ->
        element.prop('checked', Boolean(value))
)


