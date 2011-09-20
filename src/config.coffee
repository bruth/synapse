    # ## Configuration
    defaultConfiguration =
        # Adds additional logging at various points
        debug: false

        # Prevents extending jQuery and Backbone classes with the Synapse
        # methods
        noConflict: false

        # Default DOM events. When a DOM element is declared the subject of a
        # binding and no event is specified, the element will be compared to
        # each item in this list in order to determine the appropriate DOM
        # event to use. Note that more specific selectors should be listed first
        # to ensure those events are selected before less selective selectors are
        # encountered.
        domEvents: [
            ['a,:button,:reset', 'click']
            ['select,:checkbox,:radio,textarea', 'change']
            [':submit', 'submit']
            [':input', 'keyup']
        ]

        # The default DOM event to be used if none was detected from the above
        # list. If not defined, an error will be thrown for undetected events.
        defaultDomEvent: null

        # Default element interfaces relative to their selectors. Each
        # item will be iterated over in order and compared against using
        # the ``jQuery.fn.is()`` method for comparison. Note that more
        # specific selectors should be listed first to ensure those events are
        # selected before less selective selectors are encountered.
        elementInterfaces: [
            [':checkbox,:radio', 'checked']
            ['button', 'html']
            [':input', 'value']
        ]

        # The default element interface to be used if none was detected from
        # the above list. If not defined, an error will be thrown for undetected
        # interfaces.
        defaultElementInterface: 'text'

        # An array of element attributes to check for a value during interface
        # detection. This value will be used for the opposite interface.
        elementBindAttributes: ['name', 'role']

    # A ``Synapse`` object can be defined before script initialization to
    # provide the configuration.
    configuration = @Synapse or {}

    # Fill in the rest of the default configurations
    _.defaults(configuration, defaultConfiguration)

