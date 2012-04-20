test('Core', function() {
    expect(1);
    Synapse.hooks = [];
    raises(function() {
        Synapse({});
    }, 'No hooks have been added, therefore no objects are supported');
});

module('Object Hook');

test('checkObjectType', function() {
    expect(2);
    ok(ObjectHook.checkObjectType({}));
    ok(ObjectHook.checkObjectType(new Object));
});

test('getHandler', function() {
    expect(3);
    var obj = {
        foo: 'bar',
        baz: function() {
            return 'qux';
        }
    };
    equal(ObjectHook.getHandler(obj, 'foo'), 'bar', 'property');
    equal(ObjectHook.getHandler(obj, 'baz'), 'qux', 'method');
    equal(undefined, ObjectHook.getHandler(obj, 'nope'), 'undefined');
});

test('setHandler', function() {
    expect(2);
    var obj = {
        foo: 'bar',
        baz: function(value) {
            this._secret = value;
        }
    };
    ObjectHook.setHandler(obj, 'foo', 3);
    ok(obj.foo, 3, 'property');
    ObjectHook.setHandler(obj, 'baz', 5);
    ok(obj._secret, 5, 'method');
});

test('eventHandler', function() {
    expect(1);
    raises(function() {
        ObjectHook.onEventHandler({}, 'foo', function() {});
    }, 'Plain objects do not support events');
});

module('Backbone Model');

test('checkObjectType', function() {
    expect(1);
    ok(BackboneModelHook.checkObjectType(new Backbone.Model));
});

test('getHandler', function() {
    expect(3);
    var obj = new Backbone.Model;
    obj.set({foo: 'bar'});
    obj.baz = function() {
        return 'qux';
    }

    equal(BackboneModelHook.getHandler(obj, 'foo'), 'bar', 'property');
    equal(BackboneModelHook.getHandler(obj, 'baz'), 'qux', 'method');
    equal(undefined, BackboneModelHook.getHandler(obj, 'nope'), 'undefined');
});

test('setHandler', function() {
    expect(2);
    var obj = new Backbone.Model;
    obj.baz = function(value) {
        this.set({qux: value});
    }
    BackboneModelHook.setHandler(obj, 'foo', 3);
    ok(obj.get('foo'), 3, 'property');
    BackboneModelHook.setHandler(obj, 'baz', 5);
    ok(obj.get('qux'), 5, 'method');
});


test('eventHandler', function() {
    expect(1);

    var obj = new Backbone.Model;

    BackboneModelHook.onEventHandler(obj, 'change:foo', function() {
        ok(1);
    });
    BackboneModelHook.triggerEventHandler(obj, 'change:foo');
    BackboneModelHook.offEventHandler(obj, 'change:foo');
    BackboneModelHook.triggerEventHandler(obj, 'change:foo');
});

test('detectEvent', function() {
    expect(2);

    var obj = new Backbone.Model;
    equal(BackboneModelHook.detectEvent(obj), 'change');
    equal(BackboneModelHook.detectEvent(obj, 'foo'), 'change:foo');
});


module('jQuery Hook');

test('checkObjectType', function() {
    expect(3);
    ok(jQueryHook.checkObjectType('input'));
    ok(jQueryHook.checkObjectType(document.createElement('input')));
    ok(jQueryHook.checkObjectType(jQuery('input')));
});

test('getHandler', function() {
    expect(3);

    var obj = jQuery('<input type="text" style="color: #ddd" value="hello world">');

    equal(jQueryHook.getHandler(obj, 'value'), 'hello world', 'simple interface');
    equal(jQueryHook.getHandler(obj, 'css.color'), 'rgb(221, 221, 221)', 'complex');
    equal(jQueryHook.getHandler(obj, 'nope'), undefined, 'undefined');
});


test('setHandler', function() {
    expect(2);

    var obj = jQuery('<input type="text" value="hello world">');

    jQueryHook.setHandler(obj, 'value', 'foobar');
    equal(obj.val(), 'foobar', 'simple interface');
    jQueryHook.setHandler(obj, 'css.color', '#ddd');
    equal(obj.css('color'), 'rgb(221, 221, 221)', 'complex');
});


test('eventHandler', function() {
    expect(1);

    var obj = jQuery('<input type="text" value="hello world">');

    jQueryHook.onEventHandler(obj, 'keyup', function() {
        ok(1);
    });
    jQueryHook.triggerEventHandler(obj, 'keyup');
    jQueryHook.offEventHandler(obj, 'keyup');
    jQueryHook.triggerEventHandler(obj, 'keyup');
});

test('detectEvent', function() {
    expect(1);

    var obj = jQuery('<input type="text" value="hello world">');
    equal(jQueryHook.detectEvent(obj), 'keyup');
});

module('Backbone View');

test('checkObjectType', function() {
    expect(1);
    ok(BackboneViewHook.checkObjectType(new Backbone.View));
});

test('getHandler', function() {
    expect(3);

    var obj = new Backbone.View({
        el: jQuery('<input type="text" style="color: #ddd" value="hello world">')
    });

    equal(BackboneViewHook.getHandler(obj, 'value'), 'hello world', 'simple interface');
    equal(BackboneViewHook.getHandler(obj, 'css.color'), 'rgb(221, 221, 221)', 'complex');
    equal(BackboneViewHook.getHandler(obj, 'nope'), undefined, 'undefined');
});


test('setHandler', function() {
    expect(2);

    var obj = new Backbone.View({
        el: jQuery('<input type="text" value="hello world">')
    });

    BackboneViewHook.setHandler(obj, 'value', 'foobar');
    equal(obj.el.val(), 'foobar', 'simple interface');
    BackboneViewHook.setHandler(obj, 'css.color', '#ddd');
    equal(obj.el.css('color'), 'rgb(221, 221, 221)', 'complex');
});


test('eventHandler', function() {
    expect(1);

    var obj = new Backbone.View({
        el: jQuery('<input type="text" value="hello world">')
    });

    BackboneViewHook.onEventHandler(obj, 'keyup', function() {
        ok(1);
    });
    BackboneViewHook.triggerEventHandler(obj, 'keyup');
    BackboneViewHook.offEventHandler(obj, 'keyup');
    BackboneViewHook.triggerEventHandler(obj, 'keyup');
});

test('detectEvent', function() {
    expect(1);

    var obj = new Backbone.View({
        el: jQuery('<input type="text" value="hello world">')
    });
    equal(BackboneViewHook.detectEvent(obj), 'keyup');
});

module('Zepto Hook');

test('checkObjectType', function() {
    expect(3);
    ok(ZeptoHook.checkObjectType('input'));
    ok(ZeptoHook.checkObjectType(document.createElement('input')));
    ok(ZeptoHook.checkObjectType(Zepto('input')));
});

test('getHandler', function() {
    expect(3);

    var obj = Zepto('<input type="text" style="color: #ddd" value="hello world">');

    equal(ZeptoHook.getHandler(obj, 'value'), 'hello world', 'simple interface');
    equal(ZeptoHook.getHandler(obj, 'css.color'), 'rgb(221, 221, 221)', 'complex');
    equal(ZeptoHook.getHandler(obj, 'nope'), undefined, 'undefined');
});


test('setHandler', function() {
    expect(2);

    var obj = Zepto('<input type="text" value="hello world">');

    ZeptoHook.setHandler(obj, 'value', 'foobar');
    equal(obj.val(), 'foobar', 'simple interface');
    ZeptoHook.setHandler(obj, 'css.color', '#ddd');
    equal(obj.css('color'), 'rgb(221, 221, 221)', 'complex');
});


test('eventHandler', function() {
    expect(1);

    var obj = Zepto('<input type="text" value="hello world">');

    ZeptoHook.onEventHandler(obj, 'keyup', function() {
        ok(1);
    });
    ZeptoHook.triggerEventHandler(obj, 'keyup');
    ZeptoHook.offEventHandler(obj, 'keyup');
    ZeptoHook.triggerEventHandler(obj, 'keyup');
});

test('detectEvent', function() {
    expect(1);

    var obj = Zepto('<input type="text" value="hello world">');
    equal(ZeptoHook.detectEvent(obj), 'keyup');
});


module('Observer Methods');

/* Full examples */

test('Toggle Observing', function() {
    expect(4);
    Synapse.hooks = [];
    Synapse.hooks = [jQueryHook, ObjectHook];

    var input = new Synapse('<input />');
    var span = new Synapse('<span />');

    span.observe(input);

    input.set('value', 'hello world!');
    // mimic the event
    input.raw.trigger('keyup');
    // ensure the data propagated
    equal(span.get('text'), 'hello world!');
    // pause observing
    span.pauseObserving();

    input.set('value', 'foobar');
    // mimic the event
    input.raw.trigger('keyup');
    // ensure the value has not changed propagated
    equal(span.get('text'), 'hello world!');

    // resume observing of all weak refs
    span.resumeObserving();

    // mimic the event
    input.raw.trigger('keyup');
    // ensure the value has not changed propagated
    equal(span.get('text'), 'foobar');

    // detach all event handlers
    span.stopObserving();
    equal(input.raw.data('events'), undefined);
});

test('Toggle Notifying', function() {
    expect(4);
    Synapse.hooks = [];
    Synapse.hooks = [jQueryHook, ObjectHook];

    var input = new Synapse('<input />');
    var span = new Synapse('<span />');

    span.observe(input);

    input.set('value', 'hello world!');
    // mimic the event
    input.raw.trigger('keyup');
    // ensure the data propagated
    equal(span.get('text'), 'hello world!');
    // pause observing
    input.pauseNotifying();

    input.set('value', 'foobar');
    // mimic the event
    input.raw.trigger('keyup');
    // ensure the value has not changed propagated
    equal(span.get('text'), 'hello world!');

    // resume observing of all weak refs
    input.resumeNotifying();

    // mimic the event
    input.raw.trigger('keyup');
    // ensure the value has not changed propagated
    equal(span.get('text'), 'foobar');

    // detach all event handlers
    input.stopNotifying();
    equal(input.raw.data('events'), undefined);
});


test('Toggle Single Observer', function() {
    expect(8);
    Synapse.hooks = [];
    Synapse.hooks = [jQueryHook, ObjectHook];

    var input = new Synapse('<input />');
    var span = new Synapse('<span />');
    var h1 = new Synapse('<h1 />');

    span.observe(input);
    h1.observe(input);

    input.set('value', 'hello world!');
    // mimic the event
    input.raw.trigger('keyup');
    // ensure the data propagated
    equal(span.get('text'), 'hello world!');
    // pause observing
    span.pauseObserving();

    input.set('value', 'foobar');
    // mimic the event
    input.raw.trigger('keyup');
    // h1 still updates
    equal(h1.get('text'), 'foobar');
    equal(span.get('text'), 'hello world!');

    // resume observing of all weak refs
    span.resumeObserving();
    input.pauseNotifying();

    // mimic the event
    input.raw.trigger('keyup');
    // ensure the value still hasn't changed
    equal(span.get('text'), 'hello world!');

    input.resumeNotifying();

    // mimic the event
    input.raw.trigger('keyup');
    // the value has now updated
    equal(span.get('text'), 'foobar');

    // detach all event handlers
    span.stopObserving();
    // One event for the h1
    equal(input.raw.data('events')['keyup'].length, 1)
    input.stopNotifying();
    equal(input.raw.data('events'), undefined);
    deepEqual(h1._observing, {});
});
