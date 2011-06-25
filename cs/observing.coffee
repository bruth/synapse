BINDING_TYPES =
    # a two-way binding represents two objects that keep in sync with each
    # no matter the source of the change. that is, if the element triggers the
    # event to change, the model will update itself to reflect that change and
    # vice versa.
    0:
        name: 'two-way (sync)'
        requires: ['selector', 'interface', 'event', 'observes']

    # a one-way binding using a handler (no model attributes being obvserved)
    # has the view (or any object) observing an event from an actionable
    # element such as a button or link. the handler is used to perform some
    # processing indirectly of the model data
    1:
        name: 'one-way (handler)'
        requires: ['selector', 'event', 'handler']

    # a one-way binding that is read-only (ro) is typically used with an
    # element that is non-actionable. it represents model data in some way
    # and will update itself if the model data changes. there is no way for the
    # user to alter that data using that element.
    2:
        name: 'one-way (ro)'
        requires: ['selector', 'interface', 'observes']

    # a one-way binding that is write-only (wo) is the opposite of the
    # ready-only binding. the element provides a means of entering data using
    # form fields and it will write to the model, but any changes to the model
    # will not be reflected in the representative element.
    3:
        name: 'one-way (wo)'
        requires: ['selector', 'interface', 'event', 'observes', 'loopback']


setupBinding = (element, config, view) ->

    model = view.model
    handler = convert = convertBack = null

    # if the config does not have ``observes`` defined, this is
    if config.observes?
        # make it easier to work with for multiple observees
        if not $.isArray config.observes
            config.observes = [config.observes]

    # a handler can be define which will be used to supply a value
    # provided by the view or model instance. this is needed for
    # computed values.
    if config.handler?
        if typeof config.handler is 'function'
            handler = config.handler
        else
            handler = view[config.handler] or model[config.handler]

    # the convert function, if supplied, converts the value provided
    # by the interface getter
    if config.convert?
        if typeof config.convert is 'function'
            convert = config.convert
        else
            convert = view[config.convert] or model[config.convert]

    # the convertBack function, if supplied, converts the value
    # provided by the model into a value intended to be used by the
    # interface setter
    if config.convertBack?
        if typeof config.convertBack is 'function'
            convertBack = config.convertBack
        else
            convertBack = view[config.convertBack] or model[config.convertBack]

    # if there is any need to get or set a value to the element, an
    # interface needs to be defined, otherwise the element will merely
    # act as a trigger
    if config.interface?
        # get the interface for interacting with the DOM element.
        [getter, setter] = bkvo.interfaces.get config.interface

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

    # this will be a one-way binding via a handler
    else
        element.bind config.event, handler


class ObservableView extends Backbone.View
    setupBindings: ->
        for config in @bindings
            element = $ config.selector, @el
            setupBinding element, config, @

