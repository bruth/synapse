What Is It
==========
Synapse is a JavaScript data binding library. The API was written to work
_all-in-code_, that is, it does not depend on any template library or special
attributes (e.g. ``data-bind``) to work. Hooks to support these features may
come in the future.

Try the interactive demo: http://jsfiddle.net/bruth/bufeK/

Build
-----
To build from source you must have CoffeeScript (and thus Node)
installed:

```
make build
```

This will output to a `build` directory. You can also optionally optimize
the files:

```
make optimize 
```

which will output to a ``dist`` directory.

Integrate
--------
**Change in 0.3** - Synapse now uses the AMD format for keeping code
modularized. The core of Synapse is optimized into a single file, but
no hooks are included by default. The general flow of bootstrapping
Synapse is now:

```javascript
require(['synapse', 'synapse/hooks/jquery', 'synapse/hooks/object'], function(Synapse, jQueryHook, ObjectHook) {
    // The order in which hooks are added matter. The more specific the object
    // the earlier it should be added.
    Synapse.addHooks(jQueryHook, ObjectHook)

    // Use Synapse...
});
```

This is due mainly to the new Hooks architecture, but also allows developers to
freely define and add their own hooks for their application's use.

Bundled Hooks
-------------

- jQuery objects, CSS selectors, DOM elements (all via jQuery)
- Backbone Model objects
- Backbone View objects
- Plain objects (observer only)

Introduction
------------
Synapse provides a mechanism for defining a communication channel between two
objects. In order for two objects to communicate, there are three components
needing to be defined for ``A`` &rarr; ``B``:

* the event that will trigger when ``A``'s state changes
* the function to call on/for ``A`` that returns a representation of the changed
state (typically the data that has changed)
* the function to call on/for ``B`` that handles this data from ``A``

The channel can be defined with respect to either the subject ``A`` or the
observer ``B`` depending on the system. In either case, whenever a change in
state occurs in ``A``, ``B`` (and all other observers of that event) will be
notified.

To facilitate the most common cases, Synapse infers the three components above
from the objects' types. Currently, Synapse has built-in support for "plain"
objects (or instances), jQuery/Zepto objects (and thus DOM elements), and
Backbone Model instances. The various subject/observer combinations infer
different connections between the objects. For example:

```javascript
var A = $('input[name=title]');
var B = new Backbone.Model;

Synapse(A).notify(B);
```

The subject ``A`` is an input element with a name attribute of _title_.
Assuming the input element is a text input, Synapse determines the appropriate
event to be _keyup_. That is, whenever the _keyup_ event is triggered (via user
interaction) ``B`` will be notified of this occurrence on behalf of ``A``.

To infer the next two components, the types of ``A`` and ``B`` in combination
must be considered. Since ``A`` is a form element, the _data_ that is
sent by ``A`` is it's input value at that current state.

Given that ``B`` is a ``Backbone.Model`` instance, we assume to store the
data from ``A`` as a property on ``B``, but under what name? We use the name
attribute _title_. Thus the equivalent non-Synapse code would look like this:

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
cases) is to become _checked_ or _unchecked_ depending the falsy nature of
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

For example:

```javascript
var intB = Synapse(B);        // model

intB.get('foo');              // get the value of the 'foo' property
intB.set('hello', 'moto');    // sets the 'hello' property to 'moto'
```

jQuery Interfaces
-----------------
Due to their greater depth and complexity, DOM element interface handlers target
a variety of APIs on the element including attributes, properties, and styles.
Models and plain objects are much simpler and simply get/set properties
on themselves.

```javascript
var intA = Synapse(A);        // input element interface

intA.get('value');            // gets the 'value' property
intA.get('enabled');          // returns true if the 'disabled' attr is not set
intA.get('visible');          // returns true if the element is visible
intA.get('style.background'); // gets the element's CSS background details

intA.set('value', 'foobar');  // sets the 'value' property
intA.set('visible', false);   // makes the element hidden
intA.set('disabled', true);   // makes the element disabled
intA.set('attr.foo', 'bar');  // adds an attribute 'foo=bar' on the element
```

The interfaces registry can be extended by registering new interfaces or
unregistering built-in interfaces and overriding them with custom ones.

Built-in jQuery Interface Handlers
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

Breaking change in 0.3: The delimiter between the compound key and actual `key` is now
a period (.) rather than a colon (:). This mentally maps better to a it's
utility.

* ``prop.<key>`` - gets/sets the property ``key``
* ``attr.<key>`` - gets/sets the attribute ``key``
* ``style.<key>`` - gets/sets the CSS style ``key``
* ``css.<key>`` - gets/sets the CSS class name ``key``
* ``data.<key>`` - gets/sets arbitrary data ``key`` using jQuery data API

Channel Configuration
---------------------

* ``event`` - The event(s) that will trigger the notification by the subject
* ``subjectInterface`` - The interface handler to use by the subject for
returning the data to be passed to all observers.

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

* ``observerInterface`` - The interface handler to use by the subject for
returning the data to be passed to all observers.
``subjectInterface`` and performs some manipulation prior to passing it to
the ``observerInterface``.
* ``converter`` - A function which takes the data returned from the

An explicit binding can be defined as follows:

```javascript
Synapse('input').notify('span', {
    event: 'keyup',
    subjectInterface: 'value',
    observerInterface: 'text'
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
    observerInterface: 'data.title'
});
```

Hooks
-----
A hook provides the necessary components for interfacing with
some object. As an example, two built-in hooks include interfaces
for `jQuery` and `Backbone.Model` objects. This means that a `jQuery`
object can seamlessly interface with `Backbone.Model` object or with
another object of the same type.

The following components are required for bare minimum functionality:

- `typeName` - a string which defines a the name of the type
- `checkObjectType(object)` - a function that takes an `object` and checks
whether it is the correct type for this hook.
- `getHandler(object, key)` - a handler which takes an `object` and a `key`
which denotes the target property or method used to retrieve a value.
- `setHandler(object, key, value)` - a handler which takes an `object`, `key`
and `value` to set a property on the object.

The options above allows for an object of this type to be an _observer_ of
other objects who are capable of being _subjects_. An bare minimum example
can be seen here for plain objects: https://github.com/bruth/synapse/blob/master/src/synapse/hooks/object.coffee

For an object to be capable of being observed, these methods must be defined:

- `onEventHandler(object, event, handler)` - a function that takes an
`object` and binds an event `handler` to the object.
- `offEventHandler(object, event, handler)` - a function that takes an
`event` and unbinds the `handler` from the `object`.
- `triggerEventHandler(object, event)` - a function that takes an `event` and
triggers all handlers for that event.

This enables an object to be aware and capable of doing something when it's
state changes.

These set of methods can be defined are for interface and event detection:

- `detectEvent` - a function that returns an event (or array of events) that
is triggered when the object's state changes.
- `detectInterface` - a function that returns an interface that appropriate
for a channel
- `detectOtherInterface` - a function that returns an interface for the other
object involved (subject or observer)

These are at the core of the power and simplicity of Synapse. Take a look at
the jQuery hook to see the potential: https://github.com/bruth/synapse/blob/master/src/synapse/hooks/jquery.coffee

The final method that may be defined is `coerceObject` which takes the object
in the raw state (passed in to the Synapse constructor) and returns another
object (typically wrapping it like the jQuery constructor). This can be coupled
with the `checkObjectType` to allow for various objects types, but ultimately
using the wrapped object for the remaining setup of the channel.

Examples
--------
View examples here to gradually learn the API:
http://bruth.github.com/synapse/examples/
