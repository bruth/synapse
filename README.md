BackboneJS KVO
==============

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

        (implemented)

        'visible': shows/hides the element based on a model attribute
        or computed value.

        'text': gets/sets the element's text node

        'html': gets/sets the element's inner HTML

        'value': gets/sets the element's value (most form fields)

        'checked': gets/sets a checkbox or radio button 'checked'
         property. this is a shortcut.

        'enabled': gets/sets a form field's 'disabled' property. this
        is a shorcut.

        'disabled': gets/sets the inverse of a form field's 'disabled'
        property. this is a shortcut.

        (yet to be implemented)
       
        'css': add/removes a CSS class to the element

        'style': adds/removes style attributes directly on the element

        'attr': gets/sets an attribute on the element

        'prop': gets/sets a property on the element

    ``handler``: when an element is observing more than one model
    attribute, a ``handler`` must be defined to return a value that is
    used to _represent_ those model's attributes.

    ``convert``: a function that takes the raw input from the element
    and converts it into something palatable for the model.

    ``convertBack``: a function that takes the value provided by the
    model and converts into something palatable for the element

See https://github.com/bruth/backbone-kvo/blob/master/cs/test.coffee for
an example.
