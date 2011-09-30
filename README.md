What Is It
==========
Synapse is a JavaScript data binding library. The API was written to work
_all-in-code_, that is, it does not depend on any templating library or special
attributes (e.g. ``data-bind``) to work. Hooks to support these features may
come in the future.

Read the annotated source to learn your way around a bit:
http://bruth.github.com/synapse/docs/synapse.html

Get It
------
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

in either case, there will be a ``dist`` directory created that will
contain the built files ``synapse.js`` and ``synapse.min.js``.

Introduction
------------
Synapse provides a mechanism for defining a communication pipeline between two
objects. In order for two objects to communicate, there are three components
needing to be defined for ``A`` &rarr; ``B``:

* the event that will trigger when ``A``'s state changes
* the function to call on ``A`` that returns a representation of the changed
state (typically the data that has changed)
* the function to call on ``B`` that handles this data from ``A``

The hub can be defined with respect to either the subject ``A`` or the observer
``B`` depending on the system. In either case, whenever a change in state occurs
in ``A``, it will notify ``B`` (and all other observers of that data).

To facilitate the most common cases, Synapse infers the three components above
from the objects' types. Currently, Synapse has built-in support for "plain"
objects (or instances), jQuery objects (and thus DOM elements), and Backbone
Model instances. The various subject/observer combinations infer different
interactions between the objects. For example:

```javascript
var A = $('input[name=title]');
var B = new Backbone.Model;

Synapse(A).notify(B);
```

The subject ``A`` is an input element with a name attribute of 'title'.
Assuming the input element is a text input, Synapse determines the appropriate
event to be 'keyup'. That is, whenever the 'keyup' event is triggered (via user
interaction) ``A`` will notify ``B`` of this occurence.

To infer the next two components, the types of ``A`` and ``B`` in combination
must be considered. Since ``A`` is a form element, the _data_ that is
sent by ``A`` is it's input value at that current state.

Given that ``B`` is a model instance, we assume to store the _data_ from
``A`` as a property on ``B``, but under what name? We use the name attribute
'title'. Thus the equivalent non-Synapse code would look like this:

```javascript
A.bind('keyup', function() {
    var key = A.attr('name'),
        value = A.val(),
        data = {};

    // key is 'title'
    data[key] = value;

    // sets the input value for the 'title' attribute
    B.set(data);
});
```

The above is not difficult to write, but there may be a lot of these depending
on the types of objects that are interacting. For example:

```javascript
var C = $(':checkbox');
Synapse(A).notify(C);
```

The observer in this case is a checkbox. The default behavior (in virtually all
cases) is to become 'checked' or 'unchecked' depending the _falsy_ nature of
the data sent by the subject. Here is the equivalent non-Synapse code:

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
But how is data returned from or sent to each object if they are of different
types?

Synapse interfaces provide a way to generically **get** and **set** properties
on Synapse supported objects. Every interface has ``get`` and ``set`` methods
to provide a common API across all interfaces (Synapse objects).

As one would expect, ``get`` simply takes a ``key`` and returns the
corresponding value, while ``set`` takes a ``key`` and ``value``.

Due to their greater depth and complexity, DOM element interface handlers target
a variety of APIs on the element including attributes, properties, and styles.
Models and plain objects are much simplier and simply get/set properties
on themselves.

A few examples of interface handlers:

```javascript
var intA = Synapse(A);        // input element interface

intA.get('value');            // gets the 'value' property
intA.get('enabled');          // returns true if the 'disabled' attr is not set
intA.get('visible');          // returns true if the element is visible
intA.get('style:background'); // gets the element's CSS background details

intA.set('value', 'foobar');  // sets the 'value' property
intA.set('visible', false);   // makes the element hidden
intA.set('disabled', true);   // makes the element disabled
intA.set('attr:foo', 'bar');  // adds an attribute 'foo=bar' on the element

var intB = Synapse(B);        // model

intB.get('foo');              // get the value of the 'foo' property
intB.set('hello', 'moto');    // sets the 'hello' property to 'moto'
```

The interfaces registry can be extended by registering new interfaces or
unregistering built-in interfaces and overriding them with custom ones.

Built-in Element Interface Handlers
-----------------------------------

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

Bind Options
------------

* ``event`` - The event(s) that will trigger the notification by the subject
* ``getHandler`` - The interface handler to use by the subject for
returning the data to be passed to all observers. For non-jQuery objects, a
method will checked for first:

```javascript
var Author = Backbone.Model.extend({
    fullName: function() {
        return this.get('firstName') + ' ' + this.get('lastName');
    }
});

var spanInt = Synapse('span').observe(model, {
    getHandler: 'fullName'
});
```
* ``setHandler`` - The interface handler to use by the subject for
returning the data to be passed to all observers. For non-jQuery objects, a
method will checked for first as explained above for ``getHandler``.
* ``converter`` - A function which takes the data from the subject and performs
some manipulation prior to passing it to the observer.

An explicit binding can be defined as follows:

```javascript
Synapse('input').notify('span', {
    event: 'keyup',
    getHandler: 'value',
    setHandler: 'text'
});
```

or multiple bindings can be defined:

```javascript
Synapse('input').notify('span', {
    event: 'keyup',
    subjectInterface: 'value',
    observerInterface: 'text'
}, {
    event: 'blur',
    subjectInterface: 'value',
    observerInterface: 'data:title'
});
```

Examples
--------
View examples here to gradually learn the API:
http://bruth.github.com/synapse/examples/


TODO
----
* Add more examples
* Provide way to unobserve an object
