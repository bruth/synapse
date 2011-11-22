asyncTest('Core', function() {
    require(['synapse'], function() {
        start();
        expect(1);
        raises(function() {
            Synapse({});
        }, 'No hooks have been added, therefore no objects are supported');
    });
});

module('Object Hook');

asyncTest('checkObjectType', function() {
    require(['synapse/hooks/object'], function(hook) {
        start();
        expect(2);
        ok(hook.checkObjectType({}));
        ok(hook.checkObjectType(new Object));
    });
});

asyncTest('getHandler', function() {
    require(['synapse/hooks/object'], function(hook) {
        start();
        expect(3);
        var obj = {
            foo: 'bar',
            baz: function() {
                return 'qux';
            }
        };
        equal(hook.getHandler(obj, 'foo'), 'bar', 'property');
        equal(hook.getHandler(obj, 'baz'), 'qux', 'method');
        equal(undefined, hook.getHandler(obj, 'nope'), 'undefined');
    });
});

asyncTest('setHandler', function() {
    require(['synapse/hooks/object'], function(hook) {
        start();
        expect(2);
        var obj = {
            foo: 'bar',
            baz: function(value) {
                this._secret = value;
            }
        };
        hook.setHandler(obj, 'foo', 3);
        ok(obj.foo, 3, 'property');
        hook.setHandler(obj, 'baz', 5);
        ok(obj._secret, 5, 'method');
    });
});

asyncTest('eventHandler', function() {
    require(['synapse/hooks/object'], function(hook) {
        start();
        expect(1);
        raises(function() {
            hook.onEventHandler({}, 'foo', function() {});
        }, 'Plain objects do not support events');
    });
});

module('Backbone Model');

asyncTest('checkObjectType', function() {
    require(['synapse/hooks/backbone-model'], function(hook) {
        start();
        expect(1);
        ok(hook.checkObjectType(new Backbone.Model));
    });
});

asyncTest('getHandler', function() {
    require(['synapse/hooks/backbone-model'], function(hook) {
        start();
        expect(3);
        var obj = new Backbone.Model;
        obj.set({foo: 'bar'});
        obj.baz = function() {
            return 'qux';
        }

        equal(hook.getHandler(obj, 'foo'), 'bar', 'property');
        equal(hook.getHandler(obj, 'baz'), 'qux', 'method');
        equal(undefined, hook.getHandler(obj, 'nope'), 'undefined');
    });
});

asyncTest('setHandler', function() {
    require(['synapse/hooks/backbone-model'], function(hook) {
        start();
        expect(2);
        var obj = new Backbone.Model;
        obj.baz = function(value) {
            this.set({qux: value});
        }
        hook.setHandler(obj, 'foo', 3);
        ok(obj.get('foo'), 3, 'property');
        hook.setHandler(obj, 'baz', 5);
        ok(obj.get('qux'), 5, 'method');
    });
});


asyncTest('eventHandler', function() {
    require(['synapse/hooks/backbone-model'], function(hook) {
        start();
        expect(1);

        var obj = new Backbone.Model;

        hook.onEventHandler(obj, 'change:foo', function() {
            ok(1);
        });
        hook.triggerEventHandler(obj, 'change:foo');
        hook.offEventHandler(obj, 'change:foo');
        hook.triggerEventHandler(obj, 'change:foo');
    });
});

asyncTest('detectEvent', function() {
    require(['synapse/hooks/backbone-model'], function(hook) {
        start();
        expect(2);

        var obj = new Backbone.Model;
        equal(hook.detectEvent(obj), 'change');
        equal(hook.detectEvent(obj, 'foo'), 'change:foo');
    });
});


module('jQuery Hook');

asyncTest('checkObjectType', function() {
    require(['synapse/hooks/jquery'], function(hook) {
        start();
        expect(3);
        ok(hook.checkObjectType('input'));
        ok(hook.checkObjectType(document.createElement('input')));
        ok(hook.checkObjectType(jQuery('input')));
    });
});

asyncTest('getHandler', function() {
    require(['synapse/hooks/jquery'], function(hook) {
        start();
        expect(3);

        var obj = jQuery('<input type="text" style="color: #ddd" value="hello world">');

        equal(hook.getHandler(obj, 'value'), 'hello world', 'simple interface');
        equal(hook.getHandler(obj, 'style.color'), 'rgb(221, 221, 221)', 'complex');
        equal(hook.getHandler(obj, 'nope'), undefined, 'undefined');
    });
});


asyncTest('setHandler', function() {
    require(['synapse/hooks/jquery'], function(hook) {
        start();
        expect(2);

        var obj = jQuery('<input type="text" value="hello world">');

        hook.setHandler(obj, 'value', 'foobar');
        equal(obj.val(), 'foobar', 'simple interface');
        hook.setHandler(obj, 'style.color', '#ddd');
        equal(obj.css('color'), 'rgb(221, 221, 221)', 'complex');
    });
});


asyncTest('eventHandler', function() {
    require(['synapse/hooks/jquery'], function(hook) {
        start();
        expect(1);

        var obj = jQuery('<input type="text" value="hello world">');

        hook.onEventHandler(obj, 'keyup', function() {
            ok(1);
        });
        hook.triggerEventHandler(obj, 'keyup');
        hook.offEventHandler(obj, 'keyup');
        hook.triggerEventHandler(obj, 'keyup');
    });
});

asyncTest('detectEvent', function() {
    require(['synapse/hooks/jquery'], function(hook) {
        start();
        expect(1);

        var obj = jQuery('<input type="text" value="hello world">');
        equal(hook.detectEvent(obj), 'keyup');
    });
});


module('Backbone View');

asyncTest('checkObjectType', function() {
    require(['synapse/hooks/backbone-view', 'jquery'], function(hook, $) {
        start();
        expect(1);
        ok(hook.checkObjectType(new Backbone.View));
    });
});

asyncTest('getHandler', function() {
    require(['synapse/hooks/backbone-view', 'jquery'], function(hook, $) {
        start();
        expect(3);

        var obj = new Backbone.View({
            el: jQuery('<input type="text" style="color: #ddd" value="hello world">')
        });

        equal(hook.getHandler(obj, 'value'), 'hello world', 'simple interface');
        equal(hook.getHandler(obj, 'style.color'), 'rgb(221, 221, 221)', 'complex');
        equal(hook.getHandler(obj, 'nope'), undefined, 'undefined');
    });
});


asyncTest('setHandler', function() {
    require(['synapse/hooks/backbone-view', 'jquery'], function(hook, $) {
        start();
        expect(2);

        var obj = new Backbone.View({
            el: jQuery('<input type="text" value="hello world">')
        });

        hook.setHandler(obj, 'value', 'foobar');
        equal(obj.el.val(), 'foobar', 'simple interface');
        hook.setHandler(obj, 'style.color', '#ddd');
        equal(obj.el.css('color'), 'rgb(221, 221, 221)', 'complex');
    });
});


asyncTest('eventHandler', function() {
    require(['synapse/hooks/backbone-view', 'jquery'], function(hook, $) {
        start();
        expect(1);

        var obj = new Backbone.View({
            el: jQuery('<input type="text" value="hello world">')
        });

        hook.onEventHandler(obj, 'keyup', function() {
            ok(1);
        });
        hook.triggerEventHandler(obj, 'keyup');
        hook.offEventHandler(obj, 'keyup');
        hook.triggerEventHandler(obj, 'keyup');
    });
});

asyncTest('detectEvent', function() {
    require(['synapse/hooks/backbone-view', 'jquery'], function(hook, $) {
        start();
        expect(1);

        var obj = new Backbone.View({
            el: jQuery('<input type="text" value="hello world">')
        });
        equal(hook.detectEvent(obj), 'keyup');
    });
});

module('Zepto Hook');

asyncTest('checkObjectType', function() {
    require(['synapse/hooks/zepto'], function(hook) {
        start();
        expect(3);
        ok(hook.checkObjectType('input'));
        ok(hook.checkObjectType(document.createElement('input')));
        ok(hook.checkObjectType(Zepto('input')));
    });
});

asyncTest('getHandler', function() {
    require(['synapse/hooks/zepto'], function(hook) {
        start();
        expect(3);

        var obj = Zepto('<input type="text" style="color: #ddd" value="hello world">');

        equal(hook.getHandler(obj, 'value'), 'hello world', 'simple interface');
        equal(hook.getHandler(obj, 'style.color'), 'rgb(221, 221, 221)', 'complex');
        equal(hook.getHandler(obj, 'nope'), undefined, 'undefined');
    });
});


asyncTest('setHandler', function() {
    require(['synapse/hooks/zepto'], function(hook) {
        start();
        expect(2);

        var obj = Zepto('<input type="text" value="hello world">');

        hook.setHandler(obj, 'value', 'foobar');
        equal(obj.val(), 'foobar', 'simple interface');
        hook.setHandler(obj, 'style.color', '#ddd');
        equal(obj.css('color'), 'rgb(221, 221, 221)', 'complex');
    });
});


asyncTest('eventHandler', function() {
    require(['synapse/hooks/zepto'], function(hook) {
        start();
        expect(1);

        var obj = Zepto('<input type="text" value="hello world">');

        hook.onEventHandler(obj, 'keyup', function() {
            ok(1);
        });
        hook.triggerEventHandler(obj, 'keyup');
        hook.offEventHandler(obj, 'keyup');
        hook.triggerEventHandler(obj, 'keyup');
    });
});

asyncTest('detectEvent', function() {
    require(['synapse/hooks/zepto'], function(hook) {
        start();
        expect(1);

        var obj = Zepto('<input type="text" value="hello world">');
        equal(hook.detectEvent(obj), 'keyup');
    });
});


