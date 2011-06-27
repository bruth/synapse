###

shorthand syntax:

    event : 'interfaceName[:sendHandler][:key1=attr1,key2=attr2][:receiveHandler]'

###


parseBindings = (bindings) ->
    for selector, events of bindings
        element = @$ selector

        for event, configs of events
            if not $.isArray configs then configs = [configs]
            if event is 'noevent' then event = null

            for config in configs
                if typeof config is 'string'
                    config = parseInterfaceSignature(config)
                if not $.isArray config.observes then config.observes = [config.observes]
                setupBinding.call(@, element, event, config)
        

setupBinding = (element, event, config) ->
    model = @model
    send = config.send
    interface = config.interface
    observes = config.observes
    receive = config.receive

    # the send function is used when the element is sending data
    # to the targets
    if send? and typeof send isnt 'function'
        send = @[send] or model[send]

    # the receive function is used when the element is receiving data
    # from the target
    if receive? and typeof receive isnt 'function'
        receive = @[receive] or model[receive]

    if observes?
        # define the toElement handler used with the Model events. 
        toElement = (model, value, options) =>

            if options? and options.loopback is false
                # if loopback is disabled, prevent the toElement
                # pipeline from being triggered on the out
                if options.callee is element then return

            value = if receive then receive(value) else value

            bkvo.interfaces.receive(interface, element, key, value)

        for observee in observes
            [attr, key] = observee.split '='
            if not key? then key = attr

            # if config.event is defined, this adds the second binding to make this
            # two-way where the DOM element send data to the model
            if event then do (attr, key) =>

                # define the toElement pipeline used with DOM events
                toModel = (evt, params) =>
                    data = {}
                    options = attr: attr

                    value = bkvo.interfaces.send(interface, element, key)
                    value = if send then send(value) else value

                    data[attr] = value

                    # if loopback is true, pass it with the event
                    # along with the source elementent
                    if config.loopback?
                        options.callee = element
                        options.loopback = config.loopback

                    model.set data, options

                # bind the element for the given event, with the handler that
                # invokes the model data being updated
                element.bind event, toModel

            model.bind "change:#{attr}", toElement
            model.trigger "change:#{attr}", model, model.get(attr)

    # this will be a one-way binding via a handler
    else
        element.bind event, send


class ObservableView extends Backbone.View
    setupBindings: => parseBindings.call @, @bindings

