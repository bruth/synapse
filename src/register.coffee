    defaultRegisterOptions =
        event: null
        getInterface: null
        setInterface: null
        converter: null
        triggerOnBind: true



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
        [getInterface, setInterface] = Synapse.getInterfaces(subject, observer,
            options.getInterface, options.setInterface)

        # if custom behaviors need to occur, a converter can be defined which
        # will be passed the data by the subject
        converter = options.converter

        if converter and not _.isFunction(converter)
            converter = observer[converter]

        triggerOnBind = options.triggerOnBind

        getHandler = Synapse.handlers[subject.type] and Synapse.handlers[subject.type].get
        setHandler = Synapse.handlers[observer.type] and Synapse.handlers[observer.type].set

        # default to a generic handler for getting data from the subject
        getHandler ?= (subject, event, converter, interfaces, setHandler, triggerOnBind) ->
            subject.bind event, ->
                # shortcut for getting a value via the interface for
                # from the subject
                value = _.map interfaces, subject.get, subject
                # call the user-defined converter which takes the message
                # passed from the subject and returns another value
                if converter
                    value = converter.apply converter, value
                    if not _.isArray(value)
                        value = [value]
                # call the notify handler passing itself, the interface
                # and the value to all observers.
                setHandler.apply subject.context, value

            if triggerOnBind then subject.trigger event


        # default to a generic handler for setting data on the observer
        setHandler ?= (observer, interfaces) ->
            return (value) ->
                # for each setter interface defined, use the value for each
                for interface in interfaces
                    observer.set interface, value


        # this returns a handler with the passed variables in scope
        setHandler = setHandler(observer, setInterface)

        for event in events
            # cache references
            subject.observers[observer.guid][event] = true
            observer.subjects[subject.guid][event] = true

            getHandler(subject, event, converter, getInterface, setHandler, triggerOnBind)


    Synapse.registerSync = (object1, object2) ->
        Synapse.registerObserver(object1, object2)
        Synapse.registerObserver(object2, object1)


    Synapse.register = (subject, observer, getInterface, setInterface) ->
        # setup cache of all observers for this
        if not subject.observers[observer.guid]
            subject.observers[observer.guid] = {}

        if not observer.subjects[subject.guid]
            observer.subjects[subject.guid] = {}

        if _.isFunction(getInterface)
            options = converter: getInterface
        else if not _.isObject(getInterface)
            options = getInterface: getInterface, setInterface: setInterface
        else
            options = getInterface

        # the configuration is already defined as an object
        if not _.isArray(options)
            options = [options]

        for opt in options
            register(subject, observer, opt)
