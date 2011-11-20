Extensions
==========
An extension provides the necessary components for interfacing with
some object. As an example, two built-in extensions include interfaces
for `jQuery` and `Backbone.Model` objects. This means that a `jQuery`
object can seamlessly interface with `Backbone.Model` object or with
another object of the same type.

The following components must be defined for an extension:

- `typeName` - a string which defines a the name of the type
- `checkObjectType(object)` - a function that takes an `object` and checks
whether it is the correct type for this extension.
- `getHandler(object, key)` - a handler which takes an `object` and a `key`
which denotes the target property or method used to retrieve a value.
- `setHandler(object, key, value)` - a handler which takes an `object`, `key`
and `value` to set a property on the object.
- `onEventHandler(object, event, handler)` - a function that takes an
`object` and binds an event `handler` to the object.
- `offEventHandler(object, event, handler)` - a function that takes an
`event` and unbinds the `handler` from the `object`.
- `triggerEventHandler(object, event)` - a function that takes an `event` and
triggers all handlers for that event.
