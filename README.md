Synapse (The Backbone KVO Library)
==================================

Get Synapse
-----------
Download this (temporary until I get a better process):
https://raw.github.com/bruth/synapse/master/examples/js/synapse.js

To build from source you must have CoffeeScript (and thus Node)
installed:

```
make build
```

you can also optionally Uglify the built file:

```
make uglify
```

in either case, there will be a ``dist`` directory added that will
contain the built files ``synapse.js`` and ``synapse.min.js``.

Introduction
------------
Synapse provides a mechanism for defining a communication hub between two
objects. In order for two objects to communicate, there are three components
needing to be defined:

* the event that will trigger the pipeline ``A`` -> ``B``
* the function to call on ``A`` that returns a message for ``B``
* the function to call on ``B`` that accepts the message from ``A``

The hub can be defined with respect to either the subject ``A`` or the observer
``B`` depending on the system. In either case, whenever a change in state occurs
in ``A``, it will notify ``B`` (and all other observers for that event).

To facilitate the most common cases, Synapse infers the three components above
from the objects' types. Currently, Synapse has built-in support for "plain"
objects (or instances), jQuery objects (and thus DOM elements), and Backbone
Model instances. The various subject/observer combinations infer different
interactions between the objects. For example:

```javascript
var A = $('input[name=title]');
var B = new Backbone.Model;

Synapse(A).addObserver(B);
```

The subject ``A`` is an input element with a name attribute of 'title'.
Assuming the input element is a text input, Synapse determines the appropriate
event to be 'keyup'. That is, whenever the 'keyup' event is triggered (via user
interaction) ``A`` will notify ``B`` of this occurence.

To infer the next two components, the types of ``A`` and ``B`` in combination
must be considered. Since ``A`` is a form element, the *message* that is
sent by the notification is the value of input element at that current state.

Given that ``B`` is a model instance, we assume to store the *message* from
``A`` as a property on ``B``, but under what name? We use the name attribute
'title'. Thus the equivalent non-Synapse code would look like this:

```javascript
A.bind('keyup', function() {
    var key = A.attr('name'),
        value = A.val(),
        data = {};

    data[key] = value;

    B.set(data);
});
```

The above is not difficult to write, but there may be a lot of these depending
on the types of objects that are interacting. For example:

```javascript
var C = $(':checkbox');
Synapse(A).addObserver(C);
```

The observer in this case is a checkbox. The default behavior (in virtually all
cases) is to become 'checked' or 'unchecked' depending the *falsy* nature of
the message sent by the subject. Here is the equivalent non-Synapse code:

```javascript
A.bind('keyup', function() {
    var value = A.val();
    C.prop('checked', Boolean(value));
});
```

That is, ``C`` will only be checked if the value of ``A`` is not the empty
string.

The goal of Synapse is to handle the majority of common behaviors between
various objects, but with the ability to explicitly define custom
behaviors.


Interfaces
----------
The above examples explain the most simple interactions between two objects.
But how does each object return or accept a message from the other object?

Synapse interfaces provide a way to generically **get** and **set** properties
on Synapse supported objects. A few examples:

```javascript
var sA = Synapse(A);        // input element

sA.get('value');            // gets the 'value' property
sA.get('enabled');          // returns whether the 'disabled' attr is not set
sA.get('visible');          // returns whether the element is visible
sA.get('style:background'); // gets the element's CSS background details

sA.set('value', 'foobar');  // sets the 'value' property
sA.set('visible', false);   // makes the element hidden
sA.set('disabled', true);   // makes the element disabled
sA.set('attr:foo', 'bar');  // adds an attribute 'foo=bar' on the element

var sB = Synapse(B);        // model

sB.get('foo');              // get the value of the 'foo' property
sB.set('hello', 'moto');    // sets the 'hello' property to 'moto'
```

Due to their greater depth and complexity, DOM element interfaces target
a variety of APIs on the element including attributes, properties, and styles.
Models and plain objects are much simplier and simply get/set properties
on themselves.

Continuing the example from above using ``A`` and ``B``, since ``A`` is the
subject, the input value will be sent to it's observers every time it changes.
The observer, ``B``, is a model instance and thus *sets* the property on
itself.

```javascript
A.val('foobar');
A.trigger('keyup');     // sends the 'value' to observers
                        // B.set('title', 'foobar') is executed
                        // B.get('title') now returns the value
```

Just like how events are inferred by the objects' types, the *interfaces*
for getting/setting properties are also inferred. ``Synapse.interfaces``
is a registry of interfaces by name that each have a ``get`` and ``set``
method associated with them. Synapse has quite a few built-in ones for
interfacing with DOM elements (represented as a jQuery instance) for the
most common behaviors.

The interfaces registry can be extended by registering new interfaces or
unregistering built-in interfaces and overriding them with custom ones.

Built-in Interfaces
-------------------

**Simple**

* ``text`` - gets/sets the innerText value of the DOM element
* ``html`` - get/sets the innerHTML value of the DOM element
* ``value`` - gets/sets the value of a form element via ``.val()``
* ``enabled`` - gets/sets the "disabled" attribute. setting a *falsy* value
will add the disabled property.
* ``disabled`` - gets/sets the "disabled" attribute of an element relative.
setting a *falsy* value will remove the disabled property.
* ``checked`` - gets/sets the "checked" property
* ``visible`` - gets/sets the visibility of an element. a *falsy* value will
result in the element being hidden
* ``hidden`` - gets/sets the visibility of an element. a *falsy* value will
result in the element being visible

**Compound**

* ``prop:<key>`` - gets/sets the property ``key``
* ``attr:<key>`` - gets/sets the attribute ``key``
* ``style:<key>`` - gets/sets the CSS style ``key``
* ``css:<key>`` - gets/sets the CSS class name ``key``
* ``data:<key>`` - gets/sets arbitrary data ``key`` using jQuery data API

Subject/Observer Options
------------------------

* ``event`` - the event(s) that will trigger the notification by the subject
* ``get`` - the interface(s) to use by the subject for getting the
message to be sent to all observers for this event. if this interface does not
exist, the value is assumed to be the name of a function on the subject to be
used for getting the message for the observers.
* ``set`` - the interface to use by the observer for reading in
the message when notified. the interface. if this interface does not
exist, the value is assumed to be the name of a function on the observer to be
used to take the message.
* ``convert`` - a function to be called that takes the message and returns
a message prior to being read by the observer

An explicit binding can be defined as follows:

```javascript
Synapse('input').addObserver('span', {
    event: 'keyup',
    get: 'value',
    set: 'text'
});
```

or multiple bindings can be defined:

```javascript
Synapse('input').addObserver('span', [
    {
        event: 'keyup',
        get: 'value',
        set: 'text'
    }, {
        event: 'blur',
        get: 'value',
        set: 'data:title'
    }
]);
```

Examples
--------
View examples here to gradually learn the API:
http://bruth.github.com/synapse/examples/


TODO
----
* Add more examples
* Provide way to unobserve an object
* Determine if format of options is totally obscure
* Determine if options can be simplified
* Implement conditional detection for combinations of objects
