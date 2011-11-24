((root, factory) ->
    if typeof exports isnt 'undefined'
        # Node/CommonJS
        factory(root, exports, require('synapse/core'))
    else if typeof define is 'function' and define.amd
        # AMD
        define 'synapse/connect', ['synapse/core', 'exports'], (core, exports) ->
            factory(root, exports, core)
    else
        # Browser globals
        root.SynapseConnect = factory(root, {}, root.SynapseCore)
) @, (root, connect, core) ->

    # Detects an appropriate event to attach an event handler to. This
    # applies only to subjects.
    detectEvent = (object, args...) ->
        if (value = object.hook.detectEvent object.raw, args...)
            return value
        throw new Error "#{object.hook.typeName} types do not support events"

    # Attaches an event handler. This applies only to subjects.
    onEvent = (object, args...) ->
        if (value = object.hook.onEventHandler? object.raw, args...)
            return object
        throw new Error "#{object.hook.typeName} types do not support events"

    # Detaches an event handler. This applies only to subjects.
    offEvent = (object, args...) ->
        if (value = object.hook.offEventHandler? object.raw, args...)
            return object
        throw new Error "#{object.hook.typeName} types do not support events"
    
    # Triggers an event handler. This applies only to subjects.
    triggerEvent = (object, args...) ->
        if (value = object.hook.triggerEventHandler? object.raw, args...)
            return object
        throw new Error "#{object.hook.typeName} types do not support events"

    # Detects an appropriate interface (property or method) to use as a
    # data source for a given communication channel.
    detectInterface = (object) ->
        object.hook.detectInterface? object.raw

    # Detects an interface for the other end of the channel.
    detectOtherInterface = (object) ->
        object.hook.detectOtherInterface? object.raw


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
        if (converter = options.converter) and not core.isFunction(converter)
            converter = observer.object[converter]
        
        # Detect the interface for the subject if not defined
        if not (subjectInterface = options.subjectInterface)
            if not (subjectInterface = detectInterface(subject) or detectOtherInterface(observer)) and not converter
                throw new Error "An interface for #{subject.hook.typeName} objects could not be detected"

        # Detect the interface for the observer if not defined
        if not (observerInterface = options.observerInterface)
            if not (observerInterface = detectInterface(observer) or detectOtherInterface(subject))
                throw new Error "An interface for #{observer.hook.typeName} objects could not be detected"

        # Get the events that trigger the subject's change in state
        if not (events = options.event)
            events = detectEvent(subject, subjectInterface)
        if not core.isArray(events) then events = [events]

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

            onEvent(subject, event, handler)
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

        if core.isFunction(arg0)
            options = converter: arg0
        else if core.isArray(arg0) or not core.isObject(arg0)
            options =
                subjectInterface: arg0
                observerInterface: arg1

        # the configuration is already defined as an object
        if not core.isArray(options)
            options = [options]

        for opt in options
            connectOne(subject, observer, opt)
        return

    return connect
