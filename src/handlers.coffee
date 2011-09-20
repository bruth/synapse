    # ## Get/Set Handlers
    # Default event handlers for the various object types. Each type has a
    # handler for when it is the subject and for when it is the observer.
    defaultHandlers =
        get: (subject, event, converter, interfaces, set, trigger) ->
            subject.bind event, ->
                value = _.map interfaces, subject.get, subject

                if converter
                    value = converter.apply converter, value
                    if not _.isArray(value)
                        value = [value]

                set.apply subject.context, value

            if trigger then subject.trigger event


        set: (observer, interfaces) ->
            return (args...) ->
                # for each setter interface defined, use the value for each
                for interface in interfaces
                    observer.set interface, args...


    getHandlerForType = (type, method) ->
        if not (handler = Synapse.handlers[type]?[method])
            handler = defaultHandlers[method]
        return handler


    Synapse.handlers =
        2:
            # ### Model _get_ Handler
            # The default event for models is ``change``. Interfaces correspond
            # to model attributes in this context, thus defining events such as
            # ``change:title``. For alternate events, interfaces may not need
            # be defined.
            #
            # Although each event/interface combination has a separate handler,
            # values received from all interfaces are passed to the ``set``
            # handler (and ``converter`` if defined).
            #
            # Finally, if trigger the event which is typically used to fill
            # the observer with the initial values.
            get: (subject, event, converter, interfaces, set, trigger) ->
                _event = event
                for attr in interfaces
                    if attr and not _.isFunction(subject.context[attr])
                        _event = "#{event}:#{attr}"

                    subject.bind _event, (model, value, options) ->
                        value = _.map interfaces, subject.get, subject

                        if converter
                            value = converter.apply converter, value
                            if not _.isArray(value)
                                value = [value]

                        set.apply subject.context, value

                    if trigger
                        subject.trigger _event, subject.context, subject.get(attr)

            set: (observer, interfaces) ->
                return (args...) ->
                    attrs = {}
                    for [k, v] in _.zip(interfaces, args)
                        attrs[k] = v
                    observer.set attrs
