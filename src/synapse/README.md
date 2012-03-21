Hooks
=====
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
can be seen here for plain objects:

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
the jQuery hook to see the potential:

The final method that may be defined is `coerceObject` which takes the object
in the raw state (passed in to the Synapse constructor) and returns another
object (typically wrapping it like the jQuery constructor). This can be coupled
with the `checkObjectType` to allow for various objects types, but ultimately
using the wrapped object for the remaining setup of the channel.
