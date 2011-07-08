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

TODO
----
* Provide way to unobserve an object
