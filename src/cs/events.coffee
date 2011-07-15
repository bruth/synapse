    # default element DOM events. when a DOM element is declared the
    # subject of a binding and no event is specified, the element will
    # be compared to each item in this list in order to determine the
    # appropriate DOM event to use.
    Synapse.defaultDomEvents = [
        ['a,:button,:reset', 'click']
        ['select,:checkbox,:radio,textarea', 'change']
        [':submit', 'submit']
        [':input', 'keyup']
    ]


    # detect the default DOM event to use for the element
    Synapse.detectDomEvent = (syn) ->
        for item in Synapse.defaultDomEvents
            [selector, event] = item
            if syn.context.is(selector) then return event
        throw new Error("Event for #{syn} could not be detected.")


    # return an array of events for the given subject. if ``event`` is not
    # supplied, attempt to detect the appropriate event for the object type.
    Synapse.getEvents = (subject, event) ->
        # get the event based on the subjectType
        if not event
            if subject.type is Synapse.types.jquery
                events = [Synapse.detectDomEvent(subject)]
            else if subject.type is Synapse.types.model
                events = ['change']
            else
                throw new Error('No event defined for subject')
        else
            # ensure an array is returned
            events = if not _.isArray(event) then [event] else event

        return events

