Synapse (The Backbone KVO Library)
==================================

Introduction
------------
Synapse provides a mechanism for defining a communication hub between two
objects. In order for two objects to communicate, there are three components
needing to be defined:

    - the event that will trigger the pipeline ``A`` -> ``B``
    - the function to call on ``A`` that returns a message for ``B``
    - the function to call on ``B`` that accepts the message from ``A``

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
'title'. Thus the non-Synapse code would look like this:

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
the message sent by the subject. Here is the non-Synapse code:

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
The above examples explain the most simple interactions between two
objects. But how does each object return or accept a message from the
other object?

As stated above, Synapse is aware of each object's type and whether they
are the subject or observer for a given pipeline. For the cases when an
object is the subject, the message is typically derived from a subject's
property to be notified to it's observers. The observer on the other hand,
must know how to accept the message and usually persists it by storing it
locally.

Continuing the example from above using ``A`` and ``B``, since ``A`` is the
subject, the input value will be sent to it's observers every time it changes.
The observer, ``B``, is a model instance and thus *sets* the property on
itself.

```javascript
    A.trigger('keyup');     // sends the 'value' to observers
                            // B.get('title') returns the value
```javascript

Just like how events are inferred by the objects' types, the *interfaces*
for getting/setting properties are also inferred. ``Synapse.interfaces``
is a registry of interfaces by name that each have a ``get`` and ``set``
method associated with them. Synapse has quite a few built-in ones for
interfacing with DOM elements (represented as a jQuery instance) for the
most common behaviors. For example:

```javascript

    A.get('value');             // $('input[name=title]').val()
    A.set('value', 'hello')     // $('input[name=title]').val('hello')
```

The concept was derived from the simple API the Backbone Model class provides
for getting/setting attributes. That being said, the ``get`` and ``set``
methods when used on a wrapped model instance will use the native ones.
Likewise when ``get`` and ``set`` are called on a wrapped plain object, it
will simply get or set the property on the object.

The interfaces registry can be extended by registering new interfaces or
unregistering built-in interfaces and overriding them with custom ones.


Examples
--------
View examples here to gradually learn the API:
http://bruth.github.com/backbone-kvo/examples/


TODO
----
* Add more examples
* Provide way to unobserve an object
* Determine if format of options is totally obscure
* Determine if options can be simplified
* Implement conditional detection for combinations of objects
