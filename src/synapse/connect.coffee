define ['synapse/core'], (core) ->

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
    defaultConnectOptions =
        event: null
        subjectInterface: null
        observerInterface: null
        converter: null
        triggerOnBind: true

    # The workhorse which sets up a single connection between the ``subject``
    # and ``observer``. Note, the ``subject`` and ``observer``
    connectOne = (subject, observer, options) ->

        for key, value of defaultConnectOptions
            if not options[key]
                options[key] = value

        # A converter may be defined as a string which is assumed to be a
        # method name on the original object
        if (converter = options.converter) and core.getType(converter) isnt 'function'
            converter = observer.object[converter]
        
        # Detect the interface for the subject if not defined
        if not (subjectInterface = options.subjectInterface)
            if not (subjectInterface = subject.detectInterface() or observer.detectOtherInterface()) and not converter
                throw new Error "An interface for #{subject.type} objects could not be detected"

        # Detect the interface for the observer if not defined
        if not (observerInterface = options.observerInterface)
            if not (observerInterface = observer.detectInterface() or subject.detectOtherInterface())
                throw new Error "An interface for #{observer.type} objects could not be detected"

        # Get the events that trigger the subject's change in state
        if not (events = options.event)
            events = subject.detectEvent(subjectInterface)
        if core.getType(events) isnt 'array' then events = [events]

        triggerOnBind = options.triggerOnBind
        
        for event in events
            # Create a unique channel relative to the subject's interface
            if subjectInterface
                channel = "#{subject.guid}:#{subjectInterface}"
            else
                channel = "#{subject.guid}:#{event}"

            observer.channels.push channel
            
            core.subscribe channel, (value) ->
                if converter then value = converter(value)
                observer.set observerInterface, value
            
            handler = (event) ->
                value = subject.get subjectInterface
                # If subjectInterface is not undefined, cache the value
                core.publish channel, value

            subject.on event, handler            
            if triggerOnBind then handler()

        return


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
        options = args
        arg0 = args[0]
        arg1 = args[1]

        if core.getType(arg0) is 'function'
            options = converter: arg0
        else if core.getType(arg0) is 'array' or core.getType(arg0) isnt 'object'
            options =
                subjectInterface: arg0
                observerInterface: arg1

        # the configuration is already defined as an object
        if core.getType(options) isnt 'array'
            options = [options]

        for opt in options
            connectOne(subject, observer, opt)
        return


    return connect
