Synapse (The Backbone KVO Library)
==================================

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

    var A = $('input[name=title]');
    var B = new Backbone.Model;

    Synapse(A).addObserver(B);

The subject ``A`` is an input element with a name attribute of 'title'.
Assuming the input element is a text input, Synapse determines the appropriate
event to be 'keyup'. That is, whenever the 'keyup' event is triggered (via user
interaction) ``A`` will notify ``B`` of this occurence.

To infer the next two components, the types of ``A`` and ``B`` in combination
must be considered. Since ``A`` is a form element, the *message* that is
sent by the notification is the value of input element at that current state.

Given that ``B`` is model instance, we can assume to store the *message* from
``A`` as a property on ``B``, but under what name? We use the name attribute
'title'. Thus the non-Synapse code would look like this:

    A.bind('keyup', function() {
        var key = A.attr('name'),
            value = A.val(),
            data = {};

        data[key] = value;

        B.set(data);
    });

The above is not difficult to write, but there may be a lot of these depending
on the types of objects that are interacting. For example:

    var C = $(':checkbox');
    Synapse(A).addObserver(C);

The observer in this case is a checkbox. The default behavior (in virtually all
cases) is to become 'checked' or 'unchecked' depending the *falsy* nature of
the message sent by the subject. The non-Synapse code:

     A.bind('keyup', function() {
        var value = A.val();
        C.prop('checked', Boolean(value));
    });

That is, ``C`` will only be checked if the value of ``A`` is not the empty
string.

The goal of Synapse is to handle majority of the common behaviors between
various objects, but with the ability to explicitly define these behaviors.


TODO
----
* Add more examples
* Provide way to unobserve an object
* Determine if format of options is totally obscure
* Determine if options can be simplified
* Implement conditional detection for combinations of objects
