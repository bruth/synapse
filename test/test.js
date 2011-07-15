var prim, model, view, router, collection, dom, cxt, text, check, radio, select, span, button, email, submit;

$(function() {
    prim = Synapse({});
    model = Synapse(new Backbone.Model);
    view = Synapse(new Backbone.View);
    router = Synapse(new Backbone.Router);
    collection = Synapse(new Backbone.Collection);
    dom = Synapse(document.getElementById('text-input'));

    cxt = $('#qunit-fixture');

    text = Synapse('[type=text]', cxt);
    check = Synapse('[type=checkbox]', cxt);
    radio = Synapse('[type=radio]', cxt);
    select = Synapse('select', cxt);
    span = Synapse('span', cxt);
    button = Synapse('button', cxt);
    email = Synapse('[type=email]', cxt);
    submit = Synapse('[type=submit]', cxt);
});

module('Utilities');

test('object types', function() {
	expect(8);

    equals(text.type, Synapse.types.jquery, 'jQuery object');
    equals(Synapse('input').type, Synapse.types.jquery, 'jQuery object (selector)');
    equals(dom.type, Synapse.types.jquery, 'DOM element');
	equals(prim.type, Synapse.types.object, 'a plain object');
    equals(view.type, Synapse.types.view, 'Backbone view');
    equals(router.type, Synapse.types.router, 'Backbone router');
    equals(model.type, Synapse.types.model, 'Backbone model');
    equals(collection.type, Synapse.types.collection, 'Backbone collection');
});


test('detectElementInterface', function() {
    expect(7);

    equals(Synapse.detectElementInterface(text), 'value', 'text input');
    equals(Synapse.detectElementInterface(check), 'checked', 'checkbox');
    equals(Synapse.detectElementInterface(radio), 'checked', 'radio button');
    equals(Synapse.detectElementInterface(select), 'value', 'select box');
    equals(Synapse.detectElementInterface(button), 'html', 'button');
    equals(Synapse.detectElementInterface(email), 'value', 'email (variant of text input)');
    equals(Synapse.detectElementInterface(submit), 'value', 'submit button');
});


test('detectDomEvent', function() {
    expect(7);

    equals(Synapse.detectDomEvent(text), 'keyup', 'text input');
    equals(Synapse.detectDomEvent(check), 'change', 'checkbox');
    equals(Synapse.detectDomEvent(radio), 'change', 'radio button');
    equals(Synapse.detectDomEvent(select), 'change', 'select box');
    equals(Synapse.detectDomEvent(button), 'click', 'button');
    equals(Synapse.detectDomEvent(email), 'keyup', 'email (variant of text input)');
    equals(Synapse.detectDomEvent(submit), 'submit', 'submit button');
});


test('getEvents', function() {
    expect(9);

    deepEqual(Synapse.getEvents(text), ['keyup'], 'text input');
    deepEqual(Synapse.getEvents(check), ['change'], 'checkbox');
    deepEqual(Synapse.getEvents(radio), ['change'], 'radio button');
    deepEqual(Synapse.getEvents(select), ['change'], 'select box');
    deepEqual(Synapse.getEvents(button), ['click'], 'button');
    deepEqual(Synapse.getEvents(email), ['keyup'], 'email (variant of text input)');
    deepEqual(Synapse.getEvents(submit), ['submit'], 'submit button');

    raises(function() {
        Synapse.getEvents(span);
    }, 'span element has to default DOM event');

    deepEqual(Synapse.getEvents(model), ['change']);
});


test('getInterfaces - detected', function() {
    expect(9);

    deepEqual(Synapse.getInterfaces(text, model, null, true), [['value', 'text']]);
    deepEqual(Synapse.getInterfaces(check, text, null, true), [['checked', 'value']]);
    deepEqual(Synapse.getInterfaces(radio, text, null, true), [['checked', 'value']]);
    deepEqual(Synapse.getInterfaces(select, model, null, true), [['value', 'select']]);
    deepEqual(Synapse.getInterfaces(model, button, null, true), [['button', 'html']]);
    deepEqual(Synapse.getInterfaces(email, model, null, true), [['value', 'email']]);
    deepEqual(Synapse.getInterfaces(span, text, null, true), [['text', 'value']]);
    deepEqual(Synapse.getInterfaces(model, span, null, true), [['', 'text']]);

    raises(function() {
        Synapse.getInterfaces(model, model, null, true);
    }, 'model observing a model.. no interfaces');

});


test('getInterfaces - notifier interface', function() {
    expect(4);

    deepEqual(Synapse.getInterfaces(model, text, 'title', true), [['title', 'value']]);
    deepEqual(Synapse.getInterfaces(model, check, 'public', true), [['public', 'checked']]);
    deepEqual(Synapse.getInterfaces(model, text, [[['first', 'last'], null]], true), [[['first', 'last'], 'value']]);
    deepEqual(Synapse.getInterfaces(model, span, 'title', true), [['title', 'text']]);
});


module('Built-in Interfaces', {
    setup: function() {
        span.context.html('Hello World');
        text.context.val('hello world');
        check.context.prop('checked', true);
        radio.context.prop('disabled', true);
        select.context.hide().val('');
        button.context.html('Click Me!');
    }
});

test('get value', function() {
    expect(4);

    equals(Synapse.interfaces.get(text, 'value'),'hello world', 'alias');
    equals(Synapse.interfaces.get(text, 'prop:value'), 'hello world', 'prop');

    equals(Synapse.interfaces.get(select, 'value'), '', 'alias');
    equals(Synapse.interfaces.get(select, 'prop:value'), '', 'prop');
});

test('set value', function() {
    expect(10);

    // input
    Synapse.interfaces.set(text, 'value', 'foobar');
    equals(Synapse.interfaces.get(text, 'value'), 'foobar', 'text, string');

    Synapse.interfaces.set(text, 'value', 1);
    equals(Synapse.interfaces.get(text, 'value'), '1', 'text, number');

    Synapse.interfaces.set(text, 'value', []);
    equals(Synapse.interfaces.get(text, 'value'), '', 'text, array');

    Synapse.interfaces.set(text, 'value', true);
    equals(Synapse.interfaces.get(text, 'value'), 'true', 'text, bool');

    // select
    Synapse.interfaces.set(select, 'value', 'not an option');
    equals(Synapse.interfaces.get(select, 'value'), '', 'select, string');

    Synapse.interfaces.set(select, 'value', 1);
    equals(Synapse.interfaces.get(select, 'value'), '1', 'select, number');

    Synapse.interfaces.set(select, 'value', []);
    equals(Synapse.interfaces.get(select, 'value'), null, 'select, array (empty)');

    Synapse.interfaces.set(select, 'value', [1]);
    equals(Synapse.interfaces.get(select, 'value'), '1', 'select, array (choice)');

    Synapse.interfaces.set(select, 'value', ['foo']);
    equals(Synapse.interfaces.get(select, 'value'), '', 'select, array (bad choice)');

    Synapse.interfaces.set(select, 'value', true);
    equals(Synapse.interfaces.get(select, 'value'), '', 'select, bool');

});


test('get text', function() {
    expect(2);

    equals(Synapse.interfaces.get(span, 'text'), 'Hello World', 'span');
    equals(Synapse.interfaces.get(span, 'prop:innerText'), 'Hello World', 'span');

});


test('set text', function() {
    expect(3);

    Synapse.interfaces.set(span, 'text', 'Foo Bar');
    equals(Synapse.interfaces.get(span, 'text'), 'Foo Bar', 'span string');

    Synapse.interfaces.set(span, 'text', 1);
    equals(Synapse.interfaces.get(span, 'text'), '1', 'span number');

    Synapse.interfaces.set(span, 'text', []);
    equals(Synapse.interfaces.get(span, 'text'), '', 'span array');

});


test('get html', function() {
    expect(2);

    equals(Synapse.interfaces.get(span, 'html'), 'Hello World', 'alias');
    equals(Synapse.interfaces.get(span, 'prop:innerHTML'), 'Hello World', 'prop');

});


test('set html', function() {
    expect(4);

    Synapse.interfaces.set(span, 'html', '<em>Hello</em>');
    equals(Synapse.interfaces.get(span, 'html').toLowerCase(), '<em>hello</em>', 'span html');

    Synapse.interfaces.set(span, 'html', 'Hello');
    equals(Synapse.interfaces.get(span, 'html'), 'Hello', 'span string');

    Synapse.interfaces.set(span, 'html', 1);
    equals(Synapse.interfaces.get(span, 'html'), '1', 'span number');

    Synapse.interfaces.set(span, 'html', []);
    equals(Synapse.interfaces.get(span, 'html'), '', 'span array');

});


test('get checked', function() {
    expect(4);

    equals(Synapse.interfaces.get(check, 'checked'), true, 'checkbox alias');
    equals(Synapse.interfaces.get(check, 'prop:checked'), true, 'checkbox prop');

    equals(Synapse.interfaces.get(radio, 'checked'), false, 'radio alias');
    equals(Synapse.interfaces.get(radio, 'prop:checked'), false, 'radio prop');

});


test('set checked', function() {
    expect(4);

    Synapse.interfaces.set(check, 'checked', true);
    equals(Synapse.interfaces.get(check, 'checked'), true, 'checkbox bool');

    Synapse.interfaces.set(check, 'checked', 0);
    equals(Synapse.interfaces.get(check, 'checked'), false, 'checkbox zero');

    Synapse.interfaces.set(check, 'checked', []);
    equals(Synapse.interfaces.get(check, 'checked'), false, 'checkbox empty array');

    Synapse.interfaces.set(check, 'checked', null);
    equals(Synapse.interfaces.get(check, 'checked'), false, 'checkbox null');

});


test('get disabled', function() {
    expect(4);

    equals(Synapse.interfaces.get(check, 'disabled'), false, 'checkbox alias');
    equals(Synapse.interfaces.get(check, 'prop:disabled'), false, 'checkbox prop');

    equals(Synapse.interfaces.get(radio, 'disabled'), true, 'radio alias');
    equals(Synapse.interfaces.get(radio, 'prop:disabled'), true, 'radio prop');

});


test('set disabled', function() {
    expect(4);

    Synapse.interfaces.set(check, 'disabled', true);
    equals(Synapse.interfaces.get(check, 'disabled'), true, 'checkbox bool');

    Synapse.interfaces.set(check, 'disabled', 0);
    equals(Synapse.interfaces.get(check, 'disabled'), false, 'checkbox zero');

    Synapse.interfaces.set(check, 'disabled', []);
    equals(Synapse.interfaces.get(check, 'disabled'), false, 'checkbox empty array');

    Synapse.interfaces.set(check, 'disabled', null);
    equals(Synapse.interfaces.get(check, 'disabled'), false, 'checkbox null');

});


test('get enabled', function() {
    expect(4);

    equals(Synapse.interfaces.get(check, 'enabled'), true, 'checkbox alias');
    equals(!Synapse.interfaces.get(check, 'prop:disabled'), true, 'checkbox prop');

    equals(Synapse.interfaces.get(radio, 'enabled'), false, 'radio alias');
    equals(!Synapse.interfaces.get(radio, 'prop:disabled'), false, 'radio prop');

});


test('set enabled', function() {
    expect(4);

    Synapse.interfaces.set(check, 'enabled', true);
    equals(Synapse.interfaces.get(check, 'enabled'), true, 'checkbox bool');

    Synapse.interfaces.set(check, 'enabled', 0);
    equals(Synapse.interfaces.get(check, 'enabled'), false, 'checkbox zero');

    Synapse.interfaces.set(check, 'enabled', []);
    equals(Synapse.interfaces.get(check, 'enabled'), false, 'checkbox empty array');

    Synapse.interfaces.set(check, 'enabled', null);
    equals(Synapse.interfaces.get(check, 'enabled'), false, 'checkbox null');

});


test('get visible', function() {
    expect(2);
    equals(Synapse.interfaces.get(select, 'visible'), false, 'alias');
    equals(Synapse.interfaces.get(select, 'style:display'), 'none', 'style');
});


test('get hidden', function() {
    expect(2);
    equals(Synapse.interfaces.get(select, 'hidden'), true, 'alias');
    equals(Synapse.interfaces.get(select, 'style:display'), 'none', 'style');
});


test('css', function() {
    expect(3);

    Synapse.interfaces.set(submit, 'css:fancy', false);
    equals(Synapse.interfaces.get(submit, 'css:fancy'), false, 'css bool');

    Synapse.interfaces.set(submit, 'css:fancy', 'Hello');
    equals(Synapse.interfaces.get(submit, 'css:fancy'), true, 'css string');

    Synapse.interfaces.set(submit, 'css:fancy', []);
    equals(Synapse.interfaces.get(submit, 'css:fancy'), false, 'css empty array');
});



module('jQuery Observers', {
    setup: function() {
        span.context.html('Hello World');
        text.context.val('hello world');
        check.context.prop('checked', true);
        radio.context.prop('disabled', true);
        select.context.hide().val('');
        button.context.html('Click Me!');
    }
});

// jQuery observers have two means of being notified by the notifier. 
test('read-only non-form element', function() {
    expect(5);

    // shorthand for specifying a particular interface for the observers
    span.observe(model, 'title');
    model.set({title: 'Cool Title'});
    equals(span.context.text(), 'Cool Title', 'the span element observes the title attr on the model');

    model.context.unbind();

    span.observe(model, {
        interfaces: [['title', 'author']],
        handler: function() {
            return model.get('title') + ' by ' + model.get('author');
        }
    });

    model.set({title: 'Yet Again!', author: 'John Doe'});
    equals(span.context.text(), 'Yet Again! by John Doe', 'the span element observes the title and author attr on the model'); 

    model.context.unbind();

    var model2 = new Backbone.Model({
        foo: 'Bar'
    });

    model.observe(model2, 'foo');
    equals(model.context.get('foo'), 'Bar', 'initial value');
    model2.set({foo: 'Hello'});
    equals(model.get('foo'), 'Hello', 'model is observing model2');

    text.observe(model);

    model.set({text: 'Foo'});
    equals(text.context.val(), 'Foo');

    model.context.unbind();
});

