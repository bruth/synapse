    defaultRegisterOptions =
        events: null
        interfaces: null
        handler: null
        notifyInit: true


    Synapse.registerSync = (object1, object2) ->
        Synapse.registerObserver(object1, object2)
        Synapse.registerObserver(object2, object1)


    Synapse.register = (obj1, obj2, _options, downstream) ->
        if not (obj1 instanceof Synapse) then observer = Synapse(obj1)
        if not (obj2 instanceof Synapse) then notifier = Synapse(obj2)

        if downstream
            [notifier, observer] = [obj1, obj2]
        else
            [observer, notifier] = [obj1, obj2]

        if not notifier.observers[observer.guid] then notifier.observers[observer.guid] = {}
        if not observer.notifiers[notifier.guid] then observer.notifiers[notifier.guid] = {}

        options = {}

        # the shorthand syntax allows for having the third argument specify the
        # interface(s) directly. 
        if _.isString(_options) or _.isArray(_options)
            _options = interface: _options
        else if _.isFunction(_options)
            _options = handler: _options

        # user-defined options take precedence, followed by the default options
        _.extend(options, defaultRegisterOptions, _options)

        # the notifier will be listening for these events to occur. once they
        # do, the notifier will notify all observers of this event and perform
        # the defined handling
        events = Synapse.getEvents(notifier, options.event)

        # the interfaces map represents a one-to-one or one-to-many
        # relationship between the observer and notifier. for each entry,
        # whenever the notifier's message changes, the observer will be
        # notified to handle via it's interface
        interfaces = Synapse.getInterfaces(notifier, observer, options.interface)

        handler = options.handler
        # if custom behaviors need to occur, a handler can be defined which
        # will be passed the data by the notifier
        if handler and not _.isFunction(handler)
            handler = observer[handler]

        receive = Synapse.handlers[observer.type].receive
        send = Synapse.handlers[notifier.type].send

        for event in events
            # cache references
            notifier.observers[observer.guid][event] = true
            observer.notifiers[notifier.guid][event] = true

            for conn in interfaces
                [si, oi] = conn
                _receive = receive(observer, oi, send)

                if not _.isArray(si) then si = [si]
                for i in si
                    send(notifier, event, i, _receive, options.notifyInit)

