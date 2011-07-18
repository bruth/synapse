    defaultRegisterOptions =
        event: null
        get: null
        set: null
        convert: null


    register = (subject, observer, options) ->
        # user-defined options take precedence, followed by the default options
        _.defaults(options, defaultRegisterOptions)

        # the subject will be listening for these events to occur. once they
        # do, the subject will notify all observers of this event and perform
        # the defined handling
        events = Synapse.getEvents(subject, options.event)

        # the interfaces map represents a one-to-one or one-to-many
        # relationship between the observer and subject. for each entry,
        # whenever the subject's message changes, the observer will be
        # notified to handle via it's interface
        interfaces = Synapse.getInterfaces(subject, observer, options)

        # if custom behaviors need to occur, a convert can be defined which
        # will be passed the data by the subject
        convert = options.convert

        if convert and not _.isFunction(convert)
            convert = observer[convert]

        setter = Synapse.handlers[observer.type] and Synapse.handlers[observer.type].setter
        getter = Synapse.handlers[subject.type] and Synapse.handlers[subject.type].getter

        setter ?= (observer, interfaces) ->
            return (value) ->
                # for each setter interface defined, use the value for each
                for interface in interfaces
                    observer.set interface, value


        getter ?= (subject, event, convert, interfaces, set) ->
            subject.bind event, ->
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

            subject.trigger event


        set = setter(observer, interfaces.set)

        for event in events
            # cache references
            subject.observers[observer.guid][event] = true
            observer.subjects[subject.guid][event] = true

            getter(subject, event, convert, interfaces.get, set)


    Synapse.registerSync = (object1, object2) ->
        Synapse.registerObserver(object1, object2)
        Synapse.registerObserver(object2, object1)


    Synapse.register = (subject, observer, get, set) ->
        # setup cache of all observers for this
        if not subject.observers[observer.guid]
            subject.observers[observer.guid] = {}

        if not observer.subjects[subject.guid]
            observer.subjects[subject.guid] = {}

        if _.isFunction(get)
            options = convert: get
        else if not _.isObject(get)
            options = get: get, set: set
        else
            options = get

        # the configuration is already defined as an object
        if not _.isArray(options)
            options = [options]

        for opt in options
            register(subject, observer, opt)
