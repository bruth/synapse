    # ## Create a Connection
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


    # The workhorse which sets up a single connection between the ``subject``
    # and ``observer``. Note, the ``subject`` and ``observer`` are already
    # ``Synapse`` instances.
    connectOne = (subject, observer, options) ->

        _.defaults(options, defaultRegisterOptions)

        events = getEvents(subject, options.event)

        [subjectInterface, observerInterface] = getInterfaces(subject, observer,
            options.subjectInterface, options.observerInterface)

        if (converter = options.converter) and not _.isFunction(converter)
            converter = observer[converter]

        triggerOnBind = options.triggerOnBind

        getHandler = getHandlerForType(subject.type, 'get')
        setHandler = getHandlerForType(subject.type, 'set')

        setHandler = setHandler(observer, observerInterface)

        for event in events
            subject.observers[observer.guid][event] = true
            observer.subjects[subject.guid][event] = true

            getHandler(subject, event, converter, subjectInterface, setHandler, triggerOnBind)


    # Defines multiple connections between two objects via the
    # interfaces specified. A few shorthand arguments that can be passed
    # include:
    #
    # - ``subject``, ``observer``, ``converter`` - interfaces are detected
    # with a converter. Useful for simple data transformations e.g. raw data &rarr;
    # HTMLified
    # - ``subject``, ``observer``, ``subjectInterface``, ``observerInterface`` -
    # one or both interfaces are explicitly defined. The direction is always
    # ``subject`` &rarr; ``observer``, thus the subject interface is specified
    # first.
    # - ``subject``, ``observer``, ``options`` - an ``options`` object can be
    # passed specifying one or all of the connection options, including the
    # event that will trigger the pipeline.
    # - ``subject``, ``observer``, ...
    connect = (subject, observer, args...) ->
        if not subject.observers[observer.guid]
            subject.observers[observer.guid] = {}

        if not observer.subjects[subject.guid]
            observer.subjects[subject.guid] = {}

        options = args
        arg0 = args[0]
        arg1 = args[1]

        if _.isFunction(arg0)
            options = converter: arg0
        else if _.isArray(arg0) or not _.isObject(arg0)
            options =
                subjectInterface: arg0
                observerInterface: arg1

        # the configuration is already defined as an object
        if not _.isArray(options)
            options = [options]

        for opt in options
            connectOne(subject, observer, opt)

