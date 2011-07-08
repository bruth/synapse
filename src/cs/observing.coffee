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


API use:

    # it reads.. the '#person1' element will observe ``person1.name`` and keep
    # the element's innerText updated
    $('#person1 .name').observe(person1, 'text:name');

    $('#person1').observe(person1, {
        localProperty: 'text',
        interfaceProperty: 'name',
    });


    # takes an object or CSS selector
    person1.observe('#person1 input[name=name]', 'name:value');

    person1.observe('#person1 input[name=name]', {
        localProperty: 'name',
        interfaceProperty: 'value'
    });


    # if the parent's home address changes, so does the child's
    child.observe(parent, ['street', 'city', 'state', 'zipcode]);

    # interfaceProperties is an alias for interfaceProperty, but if both are
    # set, the plural form takes precedence
    child.observe(parent, {
        interfaceProperties: ['street', 'city', 'state', 'zipcode]
    });


    # the addressView observes the parent object watches for any one of the
    # interface properties to change. all values (in order) will be passed into
    # the notifyHandler (that exists on the view) along with subject.
    addressView.observe(parent, {
        interfaceProperties: ['street', 'city', 'state', 'zipcode],
        notifyHandler: 'formatAddress'
    });


    # this element observes any attribute change on person1 and
    # sets it with the same name in it's $(...).data() hash.
    $('#person1').observe(person1);

    # same as above except the the properties will be set as element
    # attributes instead of data values i.e. $(...).attr()
    $('#person1').observe(person1, {
        localInterface: 'attr'
    });


Arguments:

    arguments := subject, config

    subject := jQuery | Evented Object

    config := full | [mapping, ...] | mapping

    mapping := 'interface' | 'local:interface'


Object Types:

    A jQuery object can be used for simple bindings where no additional logic
    or rendering is required.

    A Backbone View acts a container/proxy for a jQuery element, thus it uses
    all the same options a jQuery object would use. If there are templates
    being used or custom handlers a view should be used.

    An event-ready object such as a Backbone Model, Collection, or Router.
    Any object can become event-ready. Simply extend the object with the
    Backbone.Event model:

        var object = {};
        _.extend(object, Backbone.Events);

    or using jQuery:

        var object = {};
        $.extend(object, Backbone.Events);


General options:

    localProperty(-ies): a single or array of local properties that will be
    updated relative to the subject. Depends on interfaceProperty(-ies)

    interfaceProperty(-ies): a single or array of interface properties (located on
    the subject being observed) that the subject will notify the observer of
    when any of them change.

    notifyHandler: a function that takes the value of each interfaceProperty as
    arguments maps or reduces the values to the localProperty(-ies).

Object Type-specific options:

    localInterface & interfaceInterface (DOM): by default the interface will be
    determined based on the element type e.g. form fields interface is the
    ``value`` property. the interface can be 'data', 'attr', or 'prop'.

    event(s) (DOM): an event or list of events that will be trigger a
    notification to all observers.

###

ObserverableModel = undefined

do ->

    if not _.isObject?
        _.isObject = (object) -> object is Object(object)

    # user can predefine BKVO as an object defining options.
    # this object will be augmented during execution
    this.BKVO = this.BKVO or {}

    BKVO = this.BKVO

    # default options
    defaults =
        autoExtendObjects: true
        debug: false

    # fill in
    _.defaults(BKVO, defaults)

    
    # default element interfaces
    BKVO.defaultElementInterfaces =
        _: 'html'
        input: 'value'
        select: 'value'
        textarea: 'value'
        checkbox: 'checked'
        radio: 'checked'


    # default element DOM events
    BKVO.defaultDomEvents =
        input: 'keyup'
        button: 'click'
        submit: 'submit'
        select: 'change'
        checkbox: 'change'
        radio: 'change'
        textarea: 'change'


    if this.console?
        log = (msg) -> if BKVO.debug then console.log(msg)
    else
        log = (msg) -> if BKVO.debug then alert(msg)


    # an enumeration of supported object types
    types =
        jquery: 0
        evented: 1
        view: 2
        router: 3
        model: 4
        collection: 5

    handlers =
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
                



    # determines the object type
    getObjectType = (object) ->

        if object instanceof $
            return types.jquery

        if object instanceof Backbone.View
            return types.view

        if object instanceof Backbone.Collection
            return types.collection

        if object instanceof Backbone.Model
            return types.model

        if object instanceof Backbone.Router
            return types.router

        # ensure this object contains the necessary methods
        for method in ['bind', 'unbind', 'trigger']
            if not object[method]

                if not BKVO.autoExtendObjects
                    throw Error("""Object does not have a #{method} method. ensure
                        the object has been extended from Backbone.Events or set
                        BKVO.autoExtendObjects to true.""")

                _.extend(object, Backbone.Events)
                log("#{object} extended with Backbone.Events")

                break
   
        return types.evented


    # detect the default interface to use for the element
    detectElementInterface = (object) ->
        tag = object.prop('tagName').toLowerCase()
        # this is the starting point
        interface = BKVO.defaultElementInterfaces[tag]

        # custom handling for input types
        if tag is 'input'
            type = object.prop('type').toLowerCase()
            interface = BKVO.defaultElementInterfaces[type] or interface

        # fallback to the default if it exists
        interface or= BKVO.defaultElementInterfaces['_']

        if not interface
            throw new Error('An interface for this element could not be detected')

        return interface

    # detect the default DOM event to use for the element
    detectDomEvent = (object) ->
        tag = object.prop('tagName').toLowerCase()
        # this is the starting point
        event = BKVO.defaultDomEvents[tag]

        # custom handling for input types
        if tag is 'input'
            type = object.prop('type').toLowerCase()
            event = BKVO.defaultDomEvents[type] or event

        # fallback to the default if it exists
        event or= BKVO.defaultDomEvents['_']

        if not event
            throw new Error('A DOM event for this element could not be detected')

        return event


    # return an array of events for the given subject. if ``event`` is not
    # supplied, attempt to detect the appropriate event for the object type.
    getEvents = (subject, event) ->
        # get the event based on the subjectType
        if not event
            type = getObjectType(subject)

            if type is types.jquery
                events = [detectDomEvent(subject)]
            else if type is types.model
                events = ['change']
            else
                throw new Error('No event defined for subject')
        else
            # ensure an array is returned
            events = if not _.isArray(event) then [event] else event

        return events


    # return an array of interfaces appropriate for the given subject/observer.
    # if no interface is defined, only if a ``name`` attribute on either the
    # subject or observer will be used by default (in the case of form fields).
    getInterfaces = (observer, subject, interface) ->
        interfaces = {}
        oType = getObjectType(observer)
        sType = getObjectType(subject)

        if not interface
            key = null
            value = null

            # whenever a DOM element is used, the interface is the detected
            # interface. if a model is used then the 'name' attribute is used
            # as the interface for that model (the attribute to be get/set on
            # that model)
            if sType is types.jquery
                value = detectElementInterface(subject)

                if oType is types.model
                    key = subject.attr('name')

            if oType is types.jquery
                # since this a jQuery object, we must detect the interface to
                # be used
                key = detectElementInterface(observer)

                # value is still not defined, so use the observer's name if
                # present.
                if not value and observer.attr('name')
                    value = observer.attr('name')

            if not value and sType is types.model
                value = ''

            if key is null or value is null
                throw new Error('The interface could be detected')

            interfaces[key] = value

        else
            # the observer wants to be notified when one or multiple items have
            # changed state
            if _.isString(interface) or _.isArray(interface)
                value = interface

                if oType is types.jquery
                    key = detectElementInterface(observer)

                # only if the interface is a string can it also be the attribute/
                # interface for the observer
                else if _.isString(interface)
                    key = value

                # the observer interface is unknown or ambiguous
                else
                    throw new Error('The observer interface could not be determined')

                interfaces[key] = value

            else
                interfaces = interface

        return interfaces

    # Options:
    # 
    #   event: string | array<string> - the event(s) that will trigger the
    #   notification by the subject to the observer
    #
    #   interface: string | object - defines the interface attribute/interface of
    #   the subject that will be observed. for simple one-interface binds, a
    #   string can be used, otherwise used an object to define multiple
    #   interfaces. if a string is used, the observer is assumed to be a DOM
    #   element and the interface will be auto-detected. each key represents
    #   the an attribute/interface of the observer, while the corresponding
    #   value represents the attribute/interface that will be observed on the
    #   subject. the value can also be an array.
    #
    #       {
    #           'text': ['firstName', 'lastName']
    #           'visible': 'visible'
    #
    #       }
    #
    #   if the key is not defined, it is expected the handler will perform any
    #   necessary tasks or utilize any interfaces. otherwise, the handler will
    #   act as an pre-processor to the setting or interfacing of that data.
    #
    #   handler: string | function - defines the handler that will be called
    #   when the observer is notified of the subject's change in state. the
    #   subject along with the changed value (or values in order) will be
    #   passed into the handler. if a string is used, the observer is assumed
    #   to have a method declared on it of the same name.

    defaultOptions =
        event: null
        interface: null
        handler: null


    BKVO.registerSync = (object1, object2) ->
        BKVO.registerObserver(object1, object2)
        BKVO.registerObserver(object2, object1)


    BKVO.registerObserver = (observer, subject, _options) ->
        options = {}

        # the shorthand syntax allows for having the third argument specify the
        # interface(s) directly. 
        if _.isString(_options) or _.isArray(_options)
            _options = interface: _options
        else if _.isFunction(_options)
            _options = handler: _options

        # user-defined options take precedence, followed by the default options
        _.extend(options, defaultOptions, _options)

        # convert into the jQuery object if a string or element
        if _.isString(observer) or _.isElement(observer)
            observer = $(observer)

        # convert into the jQuery object if a string or element
        if _.isString(subject) or _.isElement(subject)
            subject = $(subject)

        # the subject will be listening for these events to occur. once they
        # do, the subject will notify all observers of this event and perform
        # the defined handling
        events = getEvents(subject, options.event)

        # the interfaces map represents a one-to-one or one-to-many
        # relationship between the observer and subject. for each entry,
        # whenever the subject's message changes, the observer will be
        # notified to handle via it's interface
        interfaces = getInterfaces(observer, subject, options.interface)

        oType = getObjectType(observer)
        sType = getObjectType(subject)

        handler = options.handler
        # if custom behaviors need to occur, a handler can be defined which
        # will be passed the data by the subject
        if handler and not _.isFunction(handler)
            handler = observer[handler]

        observerHandler = handlers[oType].observer
        subjectHandler = handlers[sType].subject

        for event in events
            for oInterface, sInterface of interfaces
                handler = observerHandler(observer, oInterface, handler)

                if _.isArray(sInterface)
                    for si in sInterface
                        subjectHandler(event, subject, si, handler)
                else
                    subjectHandler(event, subject, sInterface, handler)


    jQuery.fn.observe = (subject, options) ->
        BKVO.registerObserver(@, subject, options)

    jQuery.fn.sync = (other) ->
        BKVO.registerSync(@, other)

    class ObserverableModel extends Backbone.Model
        observe: (subject, options) ->
            BKVO.registerObserver(@, subject, options)

        sync: (other) ->
            BKVO.registerSync(other)


    if BKVO.debug
        BKVO.types = types
        BKVO.getObjectType = getObjectType
        BKVO.detectElementInterface = detectElementInterface
        BKVO.detectDomEvent = detectDomEvent
        BKVO.getEvents = getEvents
        BKVO.getInterfaces = getInterfaces
