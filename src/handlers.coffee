    # the default set of event handlers for the various object types. each
    # type has a handler for when it is the subject and for when it is
    # the observer
    Synapse.handlers =
        2:
            getter: (subject, event, convert, interfaces, set) ->
                _event = event
                for interface in interfaces
                    # handle the case where an interface (the model attribute) is
                    # not defined. when anything changes about the model, this will
                    # fire.
                    if interface and not subject.context[interface]
                        _event = "#{event}:#{interface}"

                    subject.bind _event, (model, value, options) ->
                        # shortcut for getting a value via the interface for
                        # from the subject
                        value = _.map interfaces, subject.get, subject
                        # call the user-defined converter which takes the message
                        # passed from the subject and returns another value
                        if convert
                            value = convert.apply convert, value
                            if not _.isArray(value)
                                value = [value]
                        # call the notify handler passing itself, the interface
                        # and the value to all observers.
                        set.apply subject.context, value

                    subject.trigger _event, subject.context, subject.get(interface)
