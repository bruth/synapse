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
        Model    Controller    DOM Element


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

    An event-ready object such as a Backbone Model, Collection, or Controller.
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

    this.BKVO = BKVO =
        autoExtendObjects: true


    # an enumeration of supported object types
    TYPES =
        jquery: 0
        evented: 1
        view: 2
        controller: 3
        model: 4
        collection: 5


    # determines the object type
    getObjectType = (object) ->

        if object instanceof $
            return TYPES.jquery

        if object instanceof Backbone.View
            return TYPES.view

        if object instanceof Backbone.Collection
            return TYPES.collection

        if object instanceof Backbone.Model
            return TYPES.model

        if object instanceof Backbone.Controller
            return TYPES.controller

        # ensure this object contains the necessary methods
        for method in ['bind', 'unbind', 'trigger']
            if not object[method]
                if not BKVO.autoExtendObjects:
                    throw Error("object does not have a #{method} method. ensure
                        the object has been extend from Backbone.Events")
                _.extend(object, Backbone.Events)
                break
   
        return TYPES.evented


    autodetectElementInterface = (object) ->
        tag = object.prop('tagName').toLowerCase()

        if tag is 'input'
            type = object.prop('type').toLowerCase()

            if type is 'checkbox' or type is 'radio'
                return 'prop:checked'
            return 'value'
        
        if tag is 'select'
            return 'value'




    registerObserver = (observer, subject, options) ->

        if typeof observer is 'string'
            observer = $(observer)
            observerType = TYPES.jquery
        else
            observerType = getObjectType(observer)

        if typeof subject is 'string'
            subject = $(subject)
            subjectType = TYPES.jquery
        else
            subjectType = getObjectType(subject)

        if subjectType in [TYPES.model, TYPES.collection]
            for property in options.targetProperties do (property) ->
                subject.bind "change:#{property}", (object, value, options) ->
                    observer.


    notifyObservers = (subject) ->
        if subject instanceof $
            observers = subject.data('_observers') or {}

    # Registers the jQuery object as an observer of another object
    jQuery.fn.observe = (object, options) ->




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
