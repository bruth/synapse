class ObservableView extends Backbone.View
    ###

        A ``binding`` represents an association between a DOM element and a
        view. The view represents a model instance which provides an interface
        for getting/setting data.

        In most cases, the data persisting in the model needs to be represented
        in the DOM in some way. Loading the data into the DOM initially is not
        typically the issue (templates, pre-defined HTML can be used). The
        difficulty comes when changes are made to that data and there is no
        immediate way of updating the respective DOM elements reflecting the
        model's data.

        Setting up a binding is simple. Simply think of the transition steps
        involved for each direction (assuming a two-way binding).

        The options are as follows:

            ``selector``: the CSS selector in the context of the view's element

            ``observes``: a string or array of strings which are names of
            attributes on the model

            ``event``: a DOM event or array of DOM events which will be bound
            to the DOM element. when these events are triggered on this
            element, this start the pipeline _to_ the model.

            if ``event`` is not defined, then this represents a one-way binding
            from the model to the DOM element. that is, interaction with the
            DOM element will never impact the model.

            ``loopback``: defines whether a change from the DOM to the model
            will loop back to the DOM element. default is ``true``. a common
            case where this is desirable is for augmenting or formatting the
            raw input of the user. e.g. '200 n market st.' -> 200 N Market St'

            ``interface``: the type of binding relative to the DOM element. the
            default choices include:

                'visible': shows/hides the element based on a model attribute
                or computed value.

                'text': gets/sets the element's text node

                'html': gets/sets the element's inner HTML

                'value': gets/sets the element's value (most form fields)

                'css': add/removes a CSS class to the element

                'style': adds/removes style attributes directly on the element

                'attr': gets/sets an attribute on the element

                'prop': gets/sets a property on the element

                'checked': gets/sets a checkbox or radio button 'checked'
                property. this is a shortcut.

                'enabled': gets/sets a form field's 'disabled' property. this
                is a shorcut.

                'disabled': gets/sets the inverse of a form field's 'disabled'
                property. this is a shortcut.

            ``handler``: when an element is observing more than one model
            attribute, a ``handler`` must be defined to return a value that is
            used to _represent_ those model's attributes.

            ``convert``: a function that takes the raw input from the element
            and converts it into something palatable for the model.

            ``convertBack``: a function that takes the value provided by the
            model and converts into something palatable for the element
    ###

    setupBindings: ->

        for config in @bindings

            # make it easier to work with for multiple observees
            if not $.isArray(config.observes)
                config.observes = [config.observes]

            # get element relative to this view
            elem = $(config.selector, @el)

            # referencing an undefined object
            if elem.length is 0 then continue

            do (elem, config) =>

                getter = ElementInterfaces[config.interface].get
                setter = ElementInterfaces[config.interface].set

                # a handler can be define which will be used to supply a value
                # provided by the view or model instance. this is needed for
                # computed values.
                if config.handler?
                    if typeof config.handler is 'function'
                        handler = config.handler
                    else
                        handler = @[config.handler] or @model[config.handler]
                else
                    handler = null

                # the convert function, if supplied, converts the value provided
                # by the ElementInterface getter
                if config.convert?
                    if typeof config.convert is 'function'
                        convert = config.convert
                    else
                        convert = @[config.convert] or @model[config.convert]
                else
                    convert = null

                # the convertBack function, if supplied, converts the value
                # provided by the model into a value intended to be used by the
                # ElementInterface setter
                if config.convertBack?
                    if typeof config.convertBack is 'function'
                        convertBack = config.convertBack
                    else
                        convertBack = @[config.convertBack] or @model[config.convertBack]
                else
                    convertBack = null

                # define the toElement pipeline
                toElement = (model, value, options) =>
                    if options and options.loopback is false
                        # if loopback is disabled, prevent the toElement
                        # pipeline from being triggered on the out
                        if options.callee is elem then return

                    # if a handler exists, call it rather than using the
                    # passed in value
                    value = if handler then handler() else value
                    value = if convertBack then convertBack(value) else value

                    setter(elem, value)

                for attr in config.observes
                    do (attr) =>

                        @model.bind("change:#{attr}", toElement)
                        @model.trigger("change:#{attr}", @model, @model.get(attr))
                        # if config.event is defined, this adds the second of the
                        # two-way binding where the DOM element send data back to the
                        # model
                        if config.event

                            # define the toElement pipeline
                            toModel = (evt) =>
                                attrs = {}
                                options = {}

                                value = getter(elem)
                                value = if convert then convert(value) else value

                                attrs[attr] = value

                                if config.loopback?
                                    options.loopback = config.loopback
                                    options.callee = elem

                                @model.set attrs, options

                            elem.bind config.event, toModel

class ElementInterface
    constructor: (@name, @get, @set) ->

ElementInterfaces = {}

registerElementInterface = (name, getter, setter) ->
    ElementInterfaces[name] = new ElementInterface name, getter, setter

unregisterElementInterface = (name) ->
    delete bindingHandlers[name]


registerElementInterface('visible',
    (elem) ->
    (elem, value) -> if value then elem.show() else elem.hide()
)

registerElementInterface('text',
    (elem) -> elem.text()
    (elem, value) -> if value? then elem.text(value)
)

registerElementInterface('html',
    (elem) -> elem.html()
    (elem, value) -> if value? then elem.html(value)
)

registerElementInterface('value',
    (elem) -> elem.val()
    (elem, value) -> if value? then elem.val(value)
)

registerElementInterface('enabled',
    (elem) -> elem.prop('disabled')
    (elem, value) -> elem.prop('disabled', !value)
)

registerElementInterface('disabled',
    (elem) -> elem.prop('disabled')
    (elem, value) -> elem.prop('disabled', value)
)

registerElementInterface('checked',
    (elem) -> elem.prop('checked')
    (elem, value) -> elem.prop('checked', value)
)

window.ObservableView = ObservableView
