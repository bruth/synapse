class ObservableView extends Backbone.View

    setupBindings: ->

        for config in @bindings

            # make it easier to work with for multiple observees
            if not $.isArray(config.observes)
                config.observes = [config.observes]

            # get element relative to this view
            elem = $(config.selector, @el)

            # referencing an undefined object
            if elem.length is 0 then continue

            do (elem, config) =>

                getter = ElementInterfaces[config.interface].get
                setter = ElementInterfaces[config.interface].set

                # a handler can be define which will be used to supply a value
                # provided by the view or model instance. this is needed for
                # computed values.
                if config.handler?
                    if typeof config.handler is 'function'
                        handler = config.handler
                    else
                        handler = @[config.handler] or @model[config.handler]
                else
                    handler = null

                # the convert function, if supplied, converts the value provided
                # by the ElementInterface getter
                if config.convert?
                    if typeof config.convert is 'function'
                        convert = config.convert
                    else
                        convert = @[config.convert] or @model[config.convert]
                else
                    convert = null

                # the convertBack function, if supplied, converts the value
                # provided by the model into a value intended to be used by the
                # ElementInterface setter
                if config.convertBack?
                    if typeof config.convertBack is 'function'
                        convertBack = config.convertBack
                    else
                        convertBack = @[config.convertBack] or @model[config.convertBack]
                else
                    convertBack = null

                # define the toElement pipeline
                toElement = (model, value, options) =>
                    if options and options.loopback is false
                        # if loopback is disabled, prevent the toElement
                        # pipeline from being triggered on the out
                        if options.callee is elem then return

                    # if a handler exists, call it rather than using the
                    # passed in value
                    value = if handler then handler() else value
                    value = if convertBack then convertBack(value) else value

                    setter(elem, value)

                for attr in config.observes
                    do (attr) =>

                        @model.bind("change:#{attr}", toElement)
                        @model.trigger("change:#{attr}", @model, @model.get(attr))
                        # if config.event is defined, this adds the second of the
                        # two-way binding where the DOM element send data back to the
                        # model
                        if config.event

                            # define the toElement pipeline
                            toModel = (evt) =>
                                attrs = {}
                                options = {}

                                value = getter(elem)
                                value = if convert then convert(value) else value

                                attrs[attr] = value

                                if config.loopback?
                                    options.loopback = config.loopback
                                    options.callee = elem

                                @model.set attrs, options

                            elem.bind config.event, toModel

class ElementInterface
    constructor: (@name, @get, @set) ->

ElementInterfaces = {}

registerElementInterface = (name, getter, setter) ->
    ElementInterfaces[name] = new ElementInterface name, getter, setter

unregisterElementInterface = (name) ->
    delete bindingHandlers[name]


registerElementInterface('visible',
    (elem) ->
    (elem, value) -> if value then elem.show() else elem.hide()
)

registerElementInterface('text',
    (elem) -> elem.text()
    (elem, value) -> if value? then elem.text(value)
)

registerElementInterface('html',
    (elem) -> elem.html()
    (elem, value) -> if value? then elem.html(value)
)

registerElementInterface('value',
    (elem) -> elem.val()
    (elem, value) -> if value? then elem.val(value)
)

registerElementInterface('enabled',
    (elem) -> elem.prop('disabled')
    (elem, value) -> elem.prop('disabled', !value)
)

registerElementInterface('disabled',
    (elem) -> elem.prop('disabled')
    (elem, value) -> elem.prop('disabled', value)
)

registerElementInterface('checked',
    (elem) -> elem.prop('checked')
    (elem, value) -> elem.prop('checked', value)
)

ObservableView = ObservableView
