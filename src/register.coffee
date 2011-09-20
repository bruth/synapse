    # ## Register a Connection
    #
    # - ``event`` - the event that will trigger the ``subjectInterface`` to be
    # invoked
    # - ``subjectInterface`` - the interface for getting a value from the subject
    # - ``observerInterface`` - the interface for setting a value on the observer
    # - ``converter`` - an intermediate function that transforms the value received
    # before passing it to the ``observerInterface``
    # - ``triggerOnBind`` - defines when or not to trigger the event once bound
    # acting as the _initial_ invocation.
    defaultRegisterOptions =
        event: null
        subjectInterface: null
        observerInterface: null
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
        [subjectInterface, observerInterface] = Synapse.getInterfaces(subject, observer,
            options.subjectInterface, options.observerInterface)

        # if custom behaviors need to occur, a converter can be defined which
        # will be passed the data by the subject
        converter = options.converter

        if converter and not _.isFunction(converter)
            converter = observer[converter]

        triggerOnBind = options.triggerOnBind


        if Synapse.handlers[subject.type]
            getHandler = Synapse.handlers[subject.type].getHandler

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


        if Synapse.handlers[observer.type]
            setHandler = Synapse.handlers[observer.type].setHandler

        # default to a generic handler for setting data on the observer
        setHandler ?= (observer, interfaces) ->
            return (value) ->
                # for each setter interface defined, use the value for each
                for interface in interfaces
                    observer.set interface, value


        # this returns a handler with the passed variables in scope
        setHandler = setHandler(observer, observerInterface)

        for event in events
            # cache references
            subject.observers[observer.guid][event] = true
            observer.subjects[subject.guid][event] = true

            getHandler(subject, event, converter, subjectInterface, setHandler, triggerOnBind)


    Synapse.registerSync = (object1, object2) ->
        Synapse.registerObserver(object1, object2)
        Synapse.registerObserver(object2, object1)


    Synapse.register = (subject, observer, subjectInterface, observerInterface) ->
        # setup cache of all observers for this
        if not subject.observers[observer.guid]
            subject.observers[observer.guid] = {}

        if not observer.subjects[subject.guid]
            observer.subjects[subject.guid] = {}

        if _.isFunction(subjectInterface)
            options = converter: subjectInterface
        else if not _.isObject(subjectInterface)
            options = subjectInterface: subjectInterface, observerInterface: observerInterface
        else
            options = subjectInterface

        # the configuration is already defined as an object
        if not _.isArray(options)
            options = [options]

        for opt in options
            register(subject, observer, opt)
