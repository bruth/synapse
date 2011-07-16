    # the default set of event handlers for the various object types. each
    # type has a handler for when it is the notifier and for when it is
    # the observer
    Synapse.handlers =

        0:
            send: (notifier, event, interface, notify, notify) ->
                notifier.bind event, ->
                    # shortcut for getting a value via the interface for
                    # from the notifier
                    value = @get(interface)
                    # call the notify handler passing itself, the interface
                    # and the value to all observers.
                    notify(@context, interface, value)
        
                if notify then notifier.context.trigger event


            receive: (observer, interface, handler) ->
                return (notifier, value) ->
                    # call the user-defined handler which receives itself,
                    # the interface and the value
                    if handler
                        value = handler(observer.context, interface, value)
                    # shortcut for setting a value via the interface for
                    # from the observer 
                    observer.set(interface, value)

        1:
            send: (notifier, event, interface, notify) ->
                notifier.bind event, ->
                    # shortcut for getting a value via the interface for
                    # from the notifier
                    value = @get(interface)
                    # call the notify handler passing itself, the interface
                    # and the value to all observers.
                    notify(@context, interface, value)

                if notify then notifier.trigger event


            receive: (observer, interface, handler) ->
                return (notifier, value) ->
                    # call the user-defined handler which receives itself,
                    # the interface and the value
                    if handler
                        value = handler(@context, interface, value)
                    # shortcut for setting a value via the interface for
                    # from the observer 
                    @set(interface, value)

        2:
            send: (notifier, event, interface, notify) ->
                # handle the case where an interface (the model attribute) is
                # not defined. when anything changes about the model, this will
                # fire.
                if interface then event = "#{event}:#{interface}"

                notifier.bind event, (model, value, options) ->
                    notify(@context, interface, value)

                if notify then notifier.trigger event, notifier, notifier.get(interface)


            receive: (observer, interface, handler) ->
                return (notifier, value) ->
                    if handler
                        value = handler(@context, interface, value)

                    attrs = {}
                    attrs[interface] = value
                    @set(attrs)

