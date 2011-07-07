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
        value to a Backbone Model targeting a particular attribute. This is
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
        targetProperty: 'name',
    });


    # takes an object or CSS selector
    person1.observe('#person1 input[name=name]', 'name:value');

    person1.observe('#person1 input[name=name]', {
        localProperty: 'name',
        targetProperty: 'value'
    });


    # if the parent's home address changes, so does the child's
    child.observe(parent, ['street', 'city', 'state', 'zipcode]);

    # targetProperties is an alias for targetProperty, but if both are
    # set, the plural form takes precedence
    child.observe(parent, {
        targetProperties: ['street', 'city', 'state', 'zipcode]
    });


    # the addressView observes the parent object watches for any one of the
    # target properties to change. all values (in order) will be passed into
    # the notifyHandler (that exists on the view) along with subject.
    addressView.observe(parent, {
        targetProperties: ['street', 'city', 'state', 'zipcode],
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

    mapping := 'target' | 'local:target'


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
    updated relative to the subject. Depends on targetProperty(-ies)

    targetProperty(-ies): a single or array of target properties (located on
    the subject being observed) that the subject will notify the observer of
    when any of them change.

    notifyHandler: a function that takes the value of each targetProperty as
    arguments maps or reduces the values to the localProperty(-ies).

Object Type-specific options:

    localInterface & targetInterface (DOM): by default the interface will be
    determined based on the element type e.g. form fields interface is the
    ``value`` property. the interface can be 'data', 'attr', or 'prop'.

    event(s) (DOM): an event or list of events that will be trigger a
    notification to all observers.

###

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
        _: 'text'
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


    getEvents = (event, object, type) ->
        # get the event based on the subjectType
        if not event
            if type is types.jquery
                events = [detectDomEvent(subject)]
            else if type is types.model
                events = ['change']
            else
                throw new Error('No event defined for subject')
        else
            if not _.isArray(event)
                events = [event]
            else
                events = event

        return events


    getTargets = (target, observer, observerType, subject, subjectType) ->
        targets = null

        if not target
            # if the subject is a form element then use the 'name' attribute
            if subjectType is types.jquery
                if subject.attr('name') then targets = [subject.attr('name')]
            else if observerType is types.jquery
                if observer.attr('name') then targets = [observer.attr('name')]

            if not targets
                throw new Error('No target could be detected')
        else
            if not _.isArray(target)
                targets = [target]
            else
                targets = target

        return targets


    getHandlerForType = (handler, object, type) ->
        cache = {}

        if type is types.jquery
            interface = detectElementInterface(object)
            handler = (key, value) ->
                value = _handler(value)
                if value isnt cache[key] or _.isEqual(value, cache[key])
                    cache[key] = value
                    BKVO.interfaces.set(object, interface, value)

        else if type is types.model
            handler = (key, value) ->
                # in order to take advantage of the cache from a model's
                # perspective, we must cache the value relative to the keys of
                # the value if it is an object. this will be an object when
                # this observer is observing multiple targets. we do not want
                cacheKey = if _.isObject(value) then _.keys(value).toString() else key

                value = _handler(value)

                if value isnt cache[key] or _.isEqual(value, cache[key])
                    cache[key] = value

                    if _.isString(value)
                        attrs = {}
                        attrs[key] = value
                    else
                        attrs = value

                object.set(attrs)

        return handler

    # Options:
    # 
    #   event: string | array<string> - the event(s) that will trigger the
    #   notification by the subject to the observer
    #
    #   target: string | object - defines the target attribute/interface of
    #   the subject that will be observed. for simple one-target binds, a
    #   string can be used, otherwise used an object to define multiple
    #   targets. if a string is used, the observer is assumed to be a DOM
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
        target: null
        handler: (_) -> _


    BKVO.registerObserver = (observer, subject, _options) ->
        options = {}

        # the shorthand syntax allows for having the third argument specify the
        # observers targets. 
        if _.isString(_options) or _.isArray(_options)
            _options = target: _options

        _.extend(options, defaultOptions, _options)

        if _.isString(observer) or _.isElement(observer)
            observer = $(observer)
            observerType = types.jquery
        else
            observerType = getObjectType(observer)

        if _.isString(subject) or _.isElement(subject)
            subject = $(subject)
            subjectType = types.jquery
        else
            subjectType = getObjectType(subject)

        events = getEvents(options.event, subject, subjectType)
        targets = getTargets(options.target, observer, observerType, subject, subjectType)

        handler = getHandlerForType(options.handler, observer, observerType)

        if subjectType is types.model
            for event in events then do (event) ->
                for property in targets then do (property) ->
                    subject.bind "#{event}:#{property}", (object, value, options) ->
                        if targets.length > 1
                            attrs = {}
                            for prop in targets
                                attrs[prop] = subject.get(prop)
                        else
                            attrs = value
                        handler(property, attrs)

        
        else if subjectType is types.jquery
            interface = detectElementInterface(subject)
            for event in events then do (event) ->
                for property in targets then do (property) ->
                    subject.bind event, (evt, data) ->
                        value = BKVO.interfaces.get(subject, interface)
                        handler(property, value)


    if BKVO.debug
        BKVO.types = types
        BKVO.getObjectType = getObjectType
        BKVO.detectElementInterface = detectElementInterface
        BKVO.detectDomEvent = detectDomEvent


# parseBindings = (bindings) ->
#     for selector, events of bindings
#         element = @$ selector
# 
#         for event, configs of events
#             if not $.isArray configs then configs = [configs]
#             if event is 'noevent' then event = null
# 
#             for config in configs
#                 if typeof config is 'string'
#                     config = parseInterfaceSignature(config)
#                 if not $.isArray config.observes then config.observes = [config.observes]
#                 setupBinding.call(@, element, event, config)
#         
# 
# setupBinding = (element, event, config) ->
#     model = @model
#     send = config.send
#     interface = config.interface
#     observes = config.observes
#     receive = config.receive
# 
#     # the send function is used when the element is sending data
#     # to the targets
#     if send? and typeof send isnt 'function'
#         send = @[send] or model[send]
# 
#     # the receive function is used when the element is receiving data
#     # from the target
#     if receive? and typeof receive isnt 'function'
#         receive = @[receive] or model[receive]
# 
#     if observes?
#         # define the toElement handler used with the Model events. 
#         toElement = (model, value, options) =>
# 
#             if options? and options.loopback is false
#                 # if loopback is disabled, prevent the toElement
#                 # pipeline from being triggered on the out
#                 if options.callee is element then return
# 
#             value = if receive then receive(value) else value
# 
#             bkvo.interfaces.receive(interface, element, key, value)
# 
#         for observee in observes
#             [attr, key] = observee.split '='
#             if not key? then key = attr
# 
#             # if config.event is defined, this adds the second binding to make this
#             # two-way where the DOM element send data to the model
#             if event then do (attr, key) =>
# 
#                 # define the toElement pipeline used with DOM events
#                 toModel = (evt, params) =>
#                     data = {}
#                     options = attr: attr
# 
#                     value = bkvo.interfaces.send(interface, element, key)
#                     value = if send then send(value) else value
# 
#                     data[attr] = value
# 
#                     # if loopback is true, pass it with the event
#                     # along with the source elementent
#                     if config.loopback?
#                         options.callee = element
#                         options.loopback = config.loopback
# 
#                     model.set data, options
# 
#                 # bind the element for the given event, with the handler that
#                 # invokes the model data being updated
#                 element.bind event, toModel
# 
#             model.bind "change:#{attr}", toElement
#             model.trigger "change:#{attr}", model, model.get(attr)
# 
#     # this will be a one-way binding via a handler
#     else
#         element.bind event, send
# 
# 
# class ObservableView extends Backbone.View
#     setupBindings: => parseBindings.call @, @bindings
