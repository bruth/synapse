setupBinding = (element, config, view) ->

    model = view.model

    # make it easier to work with for multiple observees
    if not $.isArray config.observes
        config.observes = [config.observes]

    handler = convert = convertBack = null

    # get the interface for interacting with the DOM element.
    [getter, setter] = InterfaceRegistry.get config.interface

    # a handler can be define which will be used to supply a value
    # provided by the view or model instance. this is needed for
    # computed values.
    if config.handler?
        if typeof config.handler is 'function'
            handler = config.handler
        else
            handler = view[config.handler] or model[config.handler]

    # the convert function, if supplied, converts the value provided
    # by the ElementInterface getter
    if config.convert?
        if typeof config.convert is 'function'
            convert = config.convert
        else
            convert = view[config.convert] or model[config.convert]

    # the convertBack function, if supplied, converts the value
    # provided by the model into a value intended to be used by the
    # ElementInterface setter
    if config.convertBack?
        if typeof config.convertBack is 'function'
            convertBack = config.convertBack
        else
            convertBack = view[config.convertBack] or model[config.convertBack]

    # define the toElement handler used with the Model events
    toElement = (model, value, options) =>

        if options and options.loopback is false
            # if loopback is disabled, prevent the toElement
            # pipeline from being triggered on the out
            if options.callee is element then return

        # if a handler exists, call it rather than using the
        # passed in value. this is typically necessary when observing
        # multiple attibutes.
        value = if handler then handler() else value
        value = if convertBack then convertBack value else value

        setter element, value

    for attr in config.observes
        # if config.event is defined, this adds the second binding to make this
        # two-way where the DOM element send data to the model
        if config.event then do (attr) =>

            # define the toElement pipeline used with DOM events
            toModel = (evt, params) =>
                attrs = {}
                options = {}

                value = getter(element)
                value = if convert then convert value else value

                attrs[attr] = value

                # if loopback is true, pass it with the event
                # along with the source elementent
                if config.loopback?
                    options.callee = element
                    options.loopback = config.loopback

                model.set attrs, options

            element.bind config.event, toModel

        model.bind "change:#{attr}", toElement
        model.trigger "change:#{attr}", model, model.get(attr)


class ObservableView extends Backbone.View
    setupBindings: ->
        for config in @bindings
            element = $ config.selector, @el
            setupBinding element, config, @

