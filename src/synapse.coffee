#
# Synapse
# (c) 2011 Byron Ruth
# Synapse may be freely distributed under the BSD license
# Version: 0.3.2
# Date: November 24, 2011
#

((root, factory) ->
    if typeof exports isnt 'undefined'
        # Node/CommonJS
        factory(root, exports, require('synapse/core'))
    else if typeof define is 'function' and define.amd
        # AMD
        define 'synapse', ['synapse/core', 'exports'], (core, exports) ->
            factory(root, exports, core)
    else
        # Browser globals
        root.Synapse = factory(root, {}, root.SynapseCore)
) @, (root, Synapse, core) ->

    objectGuid = 1
    synapseObjects = {}
    synapseHooks = []
    limitedApi = ['observe', 'notify', 'sync', 'stopObserving',
        'pauseObserving', 'resumeObserving', 'stopNotifying', 'pauseNotifying',
        'resumeNotifying']


    class Synapse
        version: '0.3.2'

        # ## Constructor
        # Ensure the ``object`` is not already an instance of ``Synapse``.
        constructor: (object) ->
            if object instanceof Synapse
                return object

            # If called with `new`, process as normal which returns the wrapped
            # object. Otherwise, augment the object with the primary methods.
            if @constructor isnt Synapse
                wrapped = new Synapse(object)
                raw = wrapped.raw

                # Extend the object with the limited API
                for method in limitedApi
                    do (method) =>
                        raw[method] = ->
                            wrapped[method].apply wrapped, arguments
                            return @
                return raw

            for hook in synapseHooks
                if hook.checkObjectType object
                    break
                hook = null

            # No hook was found for this object type
            if not hook
                throw new Error "No hook exists for #{core.getType(object)} types"

            @raw = hook.coerceObject?(object) or object
            @hook = hook
            @guid = objectGuid++
            @_observing = {}
            @_notifying = {}

            synapseObjects[@guid] = @

        # Gets a value for a given interface.
        get: ->
            @hook.getHandler @raw, arguments...

        # Sets a value for a given interface.
        set: ->
            @hook.setHandler @raw, arguments...
            return @

        # Opens a one-way channel where this object is observing another
        # object for changes in state.
        observe: (other, args...) ->
            other = new Synapse(other)
            connect(other, @, args...)
            return @

        # Opens a one-way channel where another object is being notified by
        # this object when it's state changes.
        notify: (other, args...) ->
            other = new Synapse(other)
            connect(@, other, args...)
            return @

        # Opens a two-way channel where this and another object notify each
        # other when either have a change in state.
        sync: (other) ->
            other = new Synapse(other)
            @observe(other).notify(other)
            return @

        stopObserving: (other) ->
            if not other
                for subjectGuid of @_observing
                    channels = @_observing[subjectGuid]
                    subject = synapseObjects[subjectGuid]
                    for observerInterface of channels
                        thread = channels[observerInterface]
                        offEvent(subject, thread.event, thread.handler)
                    @_observing = _open: true
            else
                channels = @_observing[other.guid]
                for observerInterface of channels
                    thread = channels[observerInterface]
                    offEvent(other, thread.event, thread.handler)
                @_observing[other.guid] = _open: true
            return @

        pauseObserving: (other) ->
            if not other
                for subjectGuid of @_observing
                    channels = @_observing[subjectGuid]
                    channels._open = false
            else
                channels = @_observing[other.guid]
                channels._open = false
            return @

        resumeObserving: (other) ->
            if other
                if (channels = @_observing[other.guid])
                    channels._open = true
            else
                for subjectGuid of @_observing
                    @_observing[subjectGuid]._open = true
            return @

        stopNotifying: (other) ->
            if not other
                for observerGuid of @_notifying
                    channels = @_notifying[observerGuid]
                    observer = synapseObjects[observerGuid]
                    for observerInterface of channels
                        thread = channels[observerInterface]
                        offEvent(@, thread.event, thread.handler)
                    @_notifying = _open: true
            else
                channels = @_notifying[other.guid]
                for observerInterface of channels
                    thread = channels[observerInterface]
                    offEvent(@, thread.event, thread.handler)
                @_notifying[other.guid] = _open: true
            return @

        pauseNotifying: (other) ->
            if not other
                for observerGuid of @_notifying
                    channels = @_notifying[observerGuid]
                    channels._open = false
            else
                channels = @_notifying[other.guid]
                channels._open = false
            return @

        resumeNotifying: (other) ->
            if other
                if (channels = @_notifying[other.guid])
                    channels._open = true
            else
                for observerGuid of @_notifying
                    @_notifying[observerGuid]._open = true
            return @


    Synapse.addHooks = ->
        synapseHooks.push.apply synapseHooks, arguments

    Synapse.clearHooks = ->
        synapseHooks = []


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


    # Options for the channel
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
            handler = ->
                if observer._observing[subject.guid]._open is true and subject._notifying[observer.guid]._open is true
                    value = subject.get subjectInterface
                    if converter then value = converter(value)
                    observer.set observerInterface, value

            if not (observerChannels = observer._observing[subject.guid])
                observerChannels = observer._observing[subject.guid] = _open: true

            if not (subjectChannels = subject._notifying[observer.guid])
                subjectChannels = subject._notifying[observer.guid] = _open: true

            # An observer interface can only be set once, thus we can store
            # the channel information relative to the observerInterface.
            channel =
                event: event
                handler: handler

            observerChannels[observerInterface] = channel
            subjectChannels[observerInterface] = channel

            onEvent(subject, event, handler)
            if triggerOnBind then triggerEvent(subject, event)

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

    return Synapse
