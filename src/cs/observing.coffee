###

Backbone KVO (BKVO) implements a basic _observer pattern_ in which there is a
subject and an observer. Whenever the state of the subject changes, it
notifies each observer of this change.

To ensure consistency of state between subject and observer, the observer
can choose to notify the subject of any change in state of itself.

The simplest subject-observer relationship (also called a binding) is one-way
and downstream. That is, the observer is notified of a change in state by the
subject, but the observer does not send a notification back to the subject.

The two primary binding types are:

    two-way (sync): where the subject and observer notify each other of their
    respective changes in state, e.g. observing each other.

    one-way: where the subject notifies the observer of it's change in state.

There are also two types of one-way bindings to make use of Backbone events
and DOM events:

    DOM => observer: when a DOM event is triggered, relative to the subject
    element, it will notify the observer.

    event-ready object => observer: when an object that has been extended from
    Backbone.Events has a bound event triggered, it will notify the observer.


Example scenarios:

    event-ready object triggered => executes observer handler (most basic)
    
        An event is triggered which executes a handler the observer supplied.
        This is useful for executing cutom logic.

    event-ready object triggered => sets an observer attribute

        Backbone Hook: a DOM element (input, checkbox, etc.) can provide a
        value to a Backbone Model interfaceing a particular attribute. This is
        performed via key-value coding (KVC) techniques.


            ....Evented Object....
           /         |            \ 
        Model    Router    DOM Element


Options:

event: string | array<string> - the event(s) that will trigger the
notification by the subject to the observer

interface: string | object - defines the interface attribute/interface of
the subject that will be observed. for simple one-interface binds, a
string can be used, otherwise used an object to define multiple
interfaces. if a string is used, the observer is assumed to be a DOM
element and the interface will be auto-detected. each key represents
the an attribute/interface of the observer, while the corresponding
value represents the attribute/interface that will be observed on the
subject. the value can also be an array.

    {
        'text': ['firstName', 'lastName']
        'visible': 'visible'
    }

if the key is not defined, it is expected the handler will perform any
necessary tasks or utilize any interfaces. otherwise, the handler will
act as an pre-processor to the setting or interfacing of that data.

handler: string | function - defines the handler that will be called
when the observer is notified of the subject's change in state. the
subject along with the changed value (or values in order) will be
passed into the handler. if a string is used, the observer is assumed
to have a method declared on it of the same name.

###

# this is in underscore dev
if not _.isObject?
    _.isObject = (object) -> object is Object(object)


ObserverableModel = undefined

do ->

    log = ->
        if BKVO.debug
            try
                console.log.apply(console, arguments)
            catch e
                try
                    opera.postError.apply(opera, arguments)
                catch e 
                    alert(Array.prototype.join.call(arguments, ' '))

    error = (msg)->  throw new Error(msg)


    # default configuration options for BKVO
    defaultBKVO =
        autoExtendObjects: true
        debug: false


    # user can predefine BKVO as an object defining options.
    # this object will be augmented during execution
    baseBKVO = @BKVO or {}


    # fill in the rest of the default options
    _.defaults(baseBKVO, defaultBKVO)


    # assign it to the root context
    @BKVO = do ->

        # define and build up local copy of BKVO
        BKVO = (object) -> new BKVO.fn.init(object)

        _.extend(BKVO, baseBKVO)

        # an enumeration of supported object types
        BKVO.types =
            jquery: 0
            evented: 1
            view: 2
            router: 3
            model: 4
            collection: 5


        # determines the object type
        BKVO.getObjectType = (object) ->

            if object instanceof $
                return BKVO.types.jquery

            if object instanceof Backbone.View
                return BKVO.types.view

            if object instanceof Backbone.Collection
                return BKVO.types.collection

            if object instanceof Backbone.Model
                return BKVO.types.model

            if object instanceof Backbone.Router
                return BKVO.types.router
 
            return BKVO.types.evented


        # default element interfaces relative to their selectors. each
        # item will be iterated over in order and compared against using
        # the ``jQuery.fn.is()`` method for comparison.
        BKVO.defaultElementInterfaces = [
            [':checkbox', 'checked']
            [':radio', 'checked']
            ['button', 'html']
            [':input', 'value']
            ['*', 'text']
        ]


        # default element DOM events. when a DOM element is declared the
        # subject of a binding and no event is specified, the element will
        # be compared to each item in this list in order to determine the
        # appropriate DOM event to use.
        BKVO.defaultDomEvents = [
            ['a,:button,:reset', 'click']
            ['select,:checkbox,:radio,textarea', 'change']
            [':submit', 'submit']
            [':input', 'keyup']
        ]


        # detect the default interface to use for the element
        BKVO.detectElementInterface = (elem) ->
            for item in BKVO.defaultElementInterfaces
                [selector, interface] = item
                if elem.object.is(selector) then return interface
            error("Interface for #{elem} could not be detected.")


        # detect the default DOM event to use for the element
        BKVO.detectDomEvent = (elem) ->
            for item in BKVO.defaultDomEvents
                [selector, event] = item
                if elem.object.is(selector) then return event
            error("Event for #{elem} could not be detected.")


        # the default set of event handlers for the various object types. each
        # type has a handler for when it is the subject and for when it is
        # the observer
        BKVO.handlers =
            0:
                subject: (event, object, interface, handler) ->
                    object.bind event, ->
                        value = BKVO.interfaces.get(object, interface)
                        handler(object, value)
                    object.trigger event

                observer: (object, interface, handler) ->
                    return (subject, value) ->
                        if handler then value = handler(subject, value)
                        BKVO.interfaces.set(object, interface, value)

            1:
                subject: (event, object, interface, handler) ->
                    object.bind event, ->
                        value = object[interface]
                        handler(object, value)
                    object.trigger event

                observer: (object, interface, handler) ->
                    return (subject, value) ->
                        if handler then value = handler(subject, value)
                        object[interface] = value

            4:
                subject: (event, object, interface, handler) ->
                    # handle the case where an interface (the model attribute) is
                    # not defined. when anything changes about the model, this will
                    # fire.
                    if interface then event = "#{event}:#{interface}"

                    object.bind event, (model, value, options) ->
                        handler(object, value)
                    object.trigger event, object, object.get(interface)

                observer: (object, interface, handler) ->
                    return (subject, value) ->
                        if handler then value = handler(subject, value)
                        attrs = {}
                        attrs[interface] = value
                        object.set(attrs)
                    


        # return an array of events for the given subject. if ``event`` is not
        # supplied, attempt to detect the appropriate event for the object type.
        BKVO.getEvents = (subject, event) ->
            # get the event based on the subjectType
            if not event
                if subject.type is BKVO.types.jquery
                    events = [BKVO.detectDomEvent(subject)]
                else if subject.type is BKVO.types.model
                    events = ['change']
                else
                    error('No event defined for subject')
            else
                # ensure an array is returned
                events = if not _.isArray(event) then [event] else event

            return events


        # return an array of interfaces appropriate for the given subject/observer.
        # if no interface is defined, only if a ``name`` attribute on either the
        # subject or observer will be used by default (in the case of form fields).
        BKVO.getInterfaces = (observer, subject, interface) ->
            interfaces = {}

            if not interface
                key = null
                value = null

                # whenever a DOM element is used, the interface is the detected
                # interface. if a model is used then the 'name' attribute is used
                # as the interface for that model (the attribute to be get/set on
                # that model)
                if subject.type is BKVO.types.jquery
                    value = BKVO.detectElementInterface(subject)

                    if observer.type in [BKVO.types.model, BKVO.types.evented]
                        key = subject.object.attr('name')

                if observer.type is BKVO.types.jquery
                    # since this a jQuery object, we must detect the interface to
                    # be used
                    key = BKVO.detectElementInterface(observer)

                    # value is still not defined, so use the observer's name if
                    # present. the only time this would be set is if the subject
                    # is also a jQuery object. in this case, the subject 'name'
                    # attribute takes precedence
                    if not value
                        value = observer.object.attr('name') or null

                # if no value has been set and the subject is a model, assume
                # the observer wants to observe any change of the model. this
                # generally assumes a handler of some sorts will be performing
                # any necessary manipulation
                if value is null and subject.type is BKVO.types.model
                    value = ''

                # if none of the above worked,
                if key is null or value is null
                    error('The interface could be detected')

                interfaces[key] = value

            else
                # the observer wants to be notified when one or multiple items
                # have changed state
                if _.isString(interface) or _.isArray(interface)
                    value = interface

                    if observer.type is BKVO.types.jquery
                        key = BKVO.detectElementInterface(observer)

                    # only if the interface is a string can it also be the
                    # attribute/interface for the observer
                    else if _.isString(interface)
                        key = value

                    # the observer interface is unknown or ambiguous
                    else
                        error('The observer interface could not be determined')

                    interfaces[key] = value

                else
                    interfaces = interface

            return interfaces


        defaultOptions =
            event: null
            interface: null
            handler: null


        BKVO.registerSync = (object1, object2) ->
            BKVO.registerObserver(object1, object2)
            BKVO.registerObserver(object2, object1)


        BKVO.registerObserver = (observer, subject, _options) ->
            if not (observer instanceof BKVO) then observer = BKVO(observer)
            if not (subject instanceof BKVO) then subject = BKVO(subject)

            options = {}

            # the shorthand syntax allows for having the third argument specify the
            # interface(s) directly. 
            if _.isString(_options) or _.isArray(_options)
                _options = interface: _options
            else if _.isFunction(_options)
                _options = handler: _options

            # user-defined options take precedence, followed by the default options
            _.extend(options, defaultOptions, _options)

            # the subject will be listening for these events to occur. once they
            # do, the subject will notify all observers of this event and perform
            # the defined handling
            events = BKVO.getEvents(subject, options.event)

            # the interfaces map represents a one-to-one or one-to-many
            # relationship between the observer and subject. for each entry,
            # whenever the subject's message changes, the observer will be
            # notified to handle via it's interface
            interfaces = BKVO.getInterfaces(observer, subject, options.interface)

            handler = options.handler
            # if custom behaviors need to occur, a handler can be defined which
            # will be passed the data by the subject
            if handler and not _.isFunction(handler)
                handler = observer[handler]

            observerHandler = BKVO.handlers[observer.type].observer
            subjectHandler = BKVO.handlers[subject.type].subject

            for event in events
                for oInterface, sInterface of interfaces
                    handler = observerHandler(observer.object, oInterface, handler)

                    if _.isArray(sInterface)
                        for si in sInterface
                            subjectHandler(event, subject.object, si, handler)
                    else
                        subjectHandler(event, subject.object, sInterface, handler)


        BKVO.fn = BKVO.prototype =
            version: '0.9'

            constructor: BKVO

            init: (object, cxt) ->
                # already an instance
                if object instanceof BKVO then return object

                # convert into the jQuery object if a string or element
                if _.isString(object) or _.isElement(object)
                    object = $(object, cxt)
                else if $.isPlainObject(object)
                    _.extend(object, Backbone.Events)

                @type = BKVO.getObjectType(object)
                @object = object

                return @

            sync: (other) ->
                BKVO.registerSync(@, other)
                return @

            observe: (subject, options) ->
                BKVO.registerObserver(@, subject, options)
                return @

            notify: (observer, options) ->
                BKVO.registerObserver(observer, @, options)
                return @


        BKVO.fn.init.prototype = BKVO.fn

        return BKVO
