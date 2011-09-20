    # Iterates over each selector and event in ``domEvents`` and
    # compares it with the subject ``context`` (e.g. the ``jQuery`` object).
    detectDomEvent = (elem) ->
        for item in Synapse.configuration.domEvents
            [selector, event] = item
            if elem.is(selector) then return event
        if Synapse.configuration.defaultDomEvent
            return Synapse.configuration.defaultDomEvent
        throw new Error("Event for #{elem} could not be detected.")


    # Return an array of events for the given subject. if ``event`` is not
    # supplied, attempt to detect the appropriate event for the object type.
    # An array is used when subjects are being observed via multiple events.
    getEvents = (subject, event) ->
        if not event
            if subject.type is Types.jquery
                events = [detectDomEvent(subject.context)]
            else if subject.type is Types.view
                events = [detectDomEvent(subject.context.el)]
            else if subject.type is Types.model
                events = ['change']
            else
                throw new Error('No event defined for subject')
        else
            events = if not _.isArray(event) then [event] else event

        return events

    Synapse.getEvents = getEvents
