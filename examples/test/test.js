var prim, model, view, router, collection, dom, cxt, text, check,
    radio, select, span, button, email, submit;

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
	expect(6);

	equals(prim.type, Synapse.types.object, 'a plain object');
    equals(dom.type, Synapse.types.jquery, 'DOM element');
    equals(view.type, Synapse.types.view, 'Backbone view');
    equals(router.type, Synapse.types.router, 'Backbone router');
    equals(model.type, Synapse.types.model, 'Backbone model');
    equals(collection.type, Synapse.types.collection, 'Backbone collection');
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


test('getInterfaces', function() {
    expect(9);

    deepEqual(Synapse.getInterfaces(text, model), {get: ['value'], set: ['text']});
    deepEqual(Synapse.getInterfaces(check, text), {get: ['checked'], set: ['value']});
    deepEqual(Synapse.getInterfaces(radio, text), {get: ['checked'], set: ['value']});
    deepEqual(Synapse.getInterfaces(select, model), {get: ['value'], set: ['select']});
    deepEqual(Synapse.getInterfaces(model, button), {get: ['button'], set: ['html']});
    deepEqual(Synapse.getInterfaces(email, model), {get: ['value'], set: ['email']});
    deepEqual(Synapse.getInterfaces(span, text), {get: ['text'], set: ['value']});
    deepEqual(Synapse.getInterfaces(model, span), {get: [''], set: ['text']});

    raises(function() {
        Synapse.getInterfaces(model, model);
    }, 'model observing a model.. ambiguous interfaces');
});


test('getInterfaces - notifier interface', function() {
    expect(4);

    deepEqual(Synapse.getInterfaces(model, text, {get: 'title'}), {get: ['title'], set: ['value']});
    deepEqual(Synapse.getInterfaces(model, check, {get: 'public'}), {get: ['public'], set: ['checked']});
    deepEqual(Synapse.getInterfaces(model, text, {get: ['first', 'last']}), {get: ['first', 'last'], set: ['value']});
    deepEqual(Synapse.getInterfaces(model, span, {get: 'title'}), {get: ['title'], set: ['text']});
});


module('Built-in Interfaces', {
    setup: function() {
        // we use native methods here to ensure these don't break
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

    equals(text.get('value'), 'hello world', 'alias');
    equals(text.get('prop:value'), 'hello world', 'prop');

    equals(select.get('value'), '', 'alias');
    equals(select.get('prop:value'), '', 'prop');
});

test('set value', function() {
    expect(10);

    // input
    text.set('value', 'foobar');
    equals(text.get('value'), 'foobar', 'text, string');

    text.set('value', 1);
    equals(text.get('value'), '1', 'text, number');

    text.set('value', []);
    equals(text.get('value'), '', 'text, array');

    text.set('value', true);
    equals(text.get('value'), 'true', 'text, bool');

    // select
    select.set('value', 'not an option');
    equals(select.get('value'), '', 'select, string');

    select.set('value', 1);
    equals(select.get('value'), '1', 'select, number');

    select.set('value', []);
    equals(select.get('value'), null, 'select, array (empty)');

    select.set('value', [1]);
    equals(select.get('value'), '1', 'select, array (choice)');

    select.set('value', ['foo']);
    equals(select.get('value'), '', 'select, array (bad choice)');

    select.set('value', true);
    equals(select.get('value'), '', 'select, bool');

});


test('get text', function() {
    expect(2);

    equals(span.get('text'), 'Hello World', 'span');
    equals(span.get('prop:innerText'), 'Hello World', 'span');

});


test('set text', function() {
    expect(3);

    span.set('text', 'Foo Bar');
    equals(span.get('text'), 'Foo Bar', 'span string');

    span.set('text', 1);
    equals(span.get('text'), '1', 'span number');

    span.set('text', []);
    equals(span.get('text'), '', 'span array');

});


test('get html', function() {
    expect(2);

    equals(span.get('html'), 'Hello World', 'alias');
    equals(span.get('prop:innerHTML'), 'Hello World', 'prop');

});


test('set html', function() {
    expect(4);

    span.set('html', '<em>Hello</em>');
    equals(span.get('html').toLowerCase(), '<em>hello</em>', 'span html');

    span.set('html', 'Hello');
    equals(span.get('html'), 'Hello', 'span string');

    span.set('html', 1);
    equals(span.get('html'), '1', 'span number');

    span.set('html', []);
    equals(span.get('html'), '', 'span array');

});


test('get checked', function() {
    expect(4);

    equals(check.get('checked'), true, 'checkbox alias');
    equals(check.get('prop:checked'), true, 'checkbox prop');

    equals(radio.get('checked'), false, 'radio alias');
    equals(radio.get('prop:checked'), false, 'radio prop');

});


test('set checked', function() {
    expect(4);

    check.set('checked', true);
    equals(check.get('checked'), true, 'checkbox bool');

    check.set('checked', 0);
    equals(check.get('checked'), false, 'checkbox zero');

    check.set('checked', []);
    equals(check.get('checked'), false, 'checkbox empty array');

    check.set('checked', null);
    equals(check.get('checked'), false, 'checkbox null');

});


test('get disabled', function() {
    expect(4);

    equals(check.get('disabled'), false, 'checkbox alias');
    equals(check.get('prop:disabled'), false, 'checkbox prop');

    equals(radio.get('disabled'), true, 'radio alias');
    equals(radio.get('prop:disabled'), true, 'radio prop');

});


test('set disabled', function() {
    expect(4);

    check.set('disabled', true);
    equals(check.get('disabled'), true, 'checkbox bool');

    check.set('disabled', 0);
    equals(check.get('disabled'), false, 'checkbox zero');

    check.set('disabled', []);
    equals(check.get('disabled'), false, 'checkbox empty array');

    check.set('disabled', null);
    equals(check.get('disabled'), false, 'checkbox null');

});


test('get enabled', function() {
    expect(4);

    equals(check.get('enabled'), true, 'checkbox alias');
    equals(!check.get('prop:disabled'), true, 'checkbox prop');

    equals(radio.get('enabled'), false, 'radio alias');
    equals(!radio.get('prop:disabled'), false, 'radio prop');

});


test('set enabled', function() {
    expect(4);

    check.set('enabled', true);
    equals(check.get('enabled'), true, 'checkbox bool');

    check.set('enabled', 0);
    equals(check.get('enabled'), false, 'checkbox zero');

    check.set('enabled', []);
    equals(check.get('enabled'), false, 'checkbox empty array');

    check.set('enabled', null);
    equals(check.get('enabled'), false, 'checkbox null');

});


test('get visible', function() {
    expect(2);
    equals(select.get('visible'), false, 'alias');
    equals(select.get('style:display'), 'none', 'style');
});


test('get hidden', function() {
    expect(2);
    equals(select.get('hidden'), true, 'alias');
    equals(select.get('style:display'), 'none', 'style');
});


test('css', function() {
    expect(3);

    submit.set('css:fancy', false);
    equals(submit.get('css:fancy'), false, 'css bool');

    submit.set('css:fancy', 'Hello');
    equals(submit.get('css:fancy'), true, 'css string');

    submit.set('css:fancy', []);
    equals(submit.get('css:fancy'), false, 'css empty array');
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
    model.addObserver(span, { get: 'title' });

    model.set({title: 'Cool Title'});
    equals(span.get('text'), 'Cool Title', 'the span element observes the title attr on the model');

    model.unbind();

    span.addNotifier(model, {
        get: ['title', 'author'],
        convert: function() {
            return model.get('title') + ' by ' + model.get('author');
        }
    });

    model.set({title: 'Yet Again!', author: 'John Doe'});
    equals(span.get('text'), 'Yet Again! by John Doe', 'the span element observes the title and author attr on the model'); 

    model.unbind();

    var model2 = new Backbone.Model({
        foo: 'Bar'
    });


    model.addNotifier(model2, {get: 'foo'});
    equals(model.get('foo'), 'Bar', 'initial value');
    model2.set({foo: 'Hello'});
    equals(model.get('foo'), 'Hello', 'model is observing model2');

    text.addNotifier(model);

    model.set({text: 'Foo'});
    equals(text.get('value'), 'Foo');

    model.unbind();

});

