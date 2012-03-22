#
# Synapse
# (c) 2011-2012 Byron Ruth
# Synapse may be freely distributed under the BSD license
# Version: 0.5b
# Date: March 21, 2012
#

((root, factory) ->
    if typeof exports isnt 'undefined'
        # Node/CommonJS
        factory(root, exports, require('synapse/core'))
    else if typeof define is 'function' and define.amd
        # AMD
        define ['synapse/core', 'exports'], (core, exports) ->
            factory(root, exports, core)
    else
        # Browser globals
        root.Synapse = factory(root, {}, root.SynapseCore)
) @, (root, Synapse, core) ->

    # Internal unique client-side id for internal API
    guid = 1
    # Internal cache of all raw and Synapse objects
    cache = {}

    # Limited API method names
    limitedApi = 'observe notify syncWith stopObserving pauseObserving resumeObserving stopNotifying pauseNotifying resumeNotifying'.split ' '

    class Synapse
        version: '0.5b'

        # ## Constructor
        # Ensure the ``object`` is not already an instance of ``Synapse``.
        constructor: (object) ->
            # Check if already an instance..
            if object instanceof Synapse then return object
            # Check if this object is already cached..
            if (cached = cache[object[Synapse.expando]]) then return cached

            # If called with `new`, process as normal which returns the wrapped
            # object. Otherwise, augment the object with the limited API methods.
            if @constructor isnt Synapse
                wrapped = new Synapse(object)
                raw = wrapped.raw
                # Extend the object with the limited API
                for method in limitedApi
                    do (method) ->
                        raw[method] = ->
                            wrapped[method].apply wrapped, arguments
                            return raw
                return raw

            for hook in Synapse.hooks
                if hook.checkObjectType object
                    break
                hook = null

            # No hook was found for this object type
            if not hook
                throw new Error "An appropriate hook was not determined for
                    #{ core.getType(object) } types"

            @raw = hook.coerceObject?(object) or object
            @hook = hook
            # Cache the object with the corresponding Synapse object to prevent
            # redundant objects and prevent memory leaks.
            cache[@guid = object[Synapse.expando] = guid++] = @
            @_observing = {}
            @_notifying = {}

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
            connect other, @, args...
            return @

        # Opens a one-way channel where another object is being notified by
        # this object when it's state changes.
        notify: (other, args...) ->
            other = new Synapse(other)
            connect @, other, args...
            return @

        # Opens a two-way channel where this and another object notify each
        # other when either have a change in state.
        syncWith: (other) ->
            other = new Synapse(other)
            @observe(other).notify(other)
            return @

        stopObserving: (subject) ->
            # Find all channels established with the subject and remove the
            # corresponding event handler relative to this observer.
            if subject
                if (meta = @_observing[subject.guid])
                    for observerInterface of meta.channels
                        chan = channels[observerInterface]
                        offEvent(subject, chan.event, chan.handler)
                    # Deference everything associated with the subject
                    delete @_observing[subject.guid]
            else
                for subjectCid of @_observing
                    meta = @_observing[subjectCid]
                    subject = cache[subjectCid]
                    for observerInterface of meta.channels
                        chan = meta.channels[observerInterface]
                        offEvent(subject, chan.event, chan.handler)
                @_observing = {}
            return @

        # Temporarily close the channels for the subject or for all subjects
        pauseObserving: (subject) ->
            if subject
                if (meta = @_observing[subject.guid])
                    meta.open = false
            else
                for subjectCid of @_observing
                    @_observing[subjectCid].open = false
            return @

        resumeObserving: (subject) ->
            if subject
                if (meta = @_observing[subject.guid])
                    meta.open = true
            else
                for subjectCid of @_observing
                    @_observing[subjectCid].open = true
            return @

        stopNotifying: (observer) ->
            if observer
                if (meta = @_notifying[observer.guid])
                    for observerInterface of meta.channels
                        chan = meta.channels[observerInterface]
                        offEvent(@, chan.event, chan.handler)
                    delete @_notifying[observer.guid]
            else
                for observerCid of @_notifying
                    meta = @_notifying[observerCid]
                    observer = cache[observerCid]
                    for observerInterface of meta.channels
                        chan = meta.channels[observerInterface]
                        offEvent(@, chan.event, chan.handler)
                @_notifying = {}
            return @

        pauseNotifying: (observer) ->
            if observer
                if (meta = @_notifying[observer.guid])
                    meta.open = false
            else
                for observerCid of @_notifying
                    @_notifying[observerCid].open = false
            return @

        resumeNotifying: (observer) ->
            if observer
                if (meta = @_notifying[observer.guid])
                    meta.open = true
            else
                for observerCid of @_notifying
                    @_notifying[observerCid].open = true
            return @


    Synapse.expando = 'Synapse' + (Synapse::version + Math.random()).replace /\D/g, ''
    Synapse.hooks = []

    # Detects an appropriate event to attach an event handler to. This
    # applies only to subjects.
    detectEvent = (object, args...) ->
        if (value = object.hook.detectEvent object.raw, args...)
            return value
        throw new Error "#{ object.hook.typeName } types do not support events"

    # Attaches an event handler. This applies only to subjects.
    onEvent = (object, args...) ->
        if (value = object.hook.onEventHandler? object.raw, args...)
            return object
        throw new Error "#{ object.hook.typeName } types do not support events"

    # Detaches an event handler. This applies only to subjects.
    offEvent = (object, args...) ->
        if (value = object.hook.offEventHandler? object.raw, args...)
            return object
        throw new Error "#{ object.hook.typeName } types do not support events"

    # Triggers an event handler. This applies only to subjects.
    triggerEvent = (object, args...) ->
        if (value = object.hook.triggerEventHandler? object.raw, args...)
            return object
        throw new Error "#{ object.hook.typeName } types do not support events"

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
            if not options[key]?
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
                # Ensure both the observer and the subject channels are open
                if observer._observing[subject.guid]?.open is true and subject._notifying[observer.guid]?.open is true
                    value = subject.get subjectInterface
                    if converter then value = converter(value)
                    observer.set observerInterface, value

            if not (observerMeta = observer._observing[subject.guid])
                observerMeta = observer._observing[subject.guid] =
                    open: true
                    channels: {}

            if not (subjectMeta = subject._notifying[observer.guid])
                subjectMeta = subject._notifying[observer.guid] =
                    open: true
                    channels: {}

            # An observer interface can only be set once, thus we can store
            # the channel information relative to the observerInterface.
            channel =
                event: event
                handler: handler

            observerMeta.channels[observerInterface] = channel
            subjectMeta.channels[observerInterface] = channel

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
