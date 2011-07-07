var cxt, text, check, radio, select, span, button, email, submit;

$(function() {
    cxt = $('#qunit-fixture');
    text = $('[type=text]', cxt);
    check = $('[type=checkbox]', cxt);
    radio = $('[type=radio]', cxt);
    select = $('select', cxt);
    span = $('span', cxt);
    button = $('button', cxt);
    email = $('[type=email]', cxt);
    submit = $('[type=submit]', cxt);
});

module('Utilities');

test('getObjectType', function() {
	expect(8);

    var object;

    object = $('input', cxt)
    equals(BKVO.getObjectType(object), BKVO.types.jquery,
        'jQuery object');

    object = {};
	equals(BKVO.getObjectType(object), BKVO.types.evented,
        'an object that has been extended with event methods');
    ok(object.bind && object.unbind && object.trigger,
        'event methods set');

    // test with autoExtendObjects turned off
    BKVO.autoExtendObjects = false;
    object = {};
	raises(function() {
        BKVO.getObjectType(object);
    }, 'the object must be extended already. autoExtendObjects turned off');

    object = new Backbone.View;
    equals(BKVO.getObjectType(object), BKVO.types.view,
        'Backbone view');

    object = new Backbone.Router;
    equals(BKVO.getObjectType(object), BKVO.types.router,
        'Backbone router');

    object = new Backbone.Model;
    equals(BKVO.getObjectType(object), BKVO.types.model,
        'Backbone model');

    object = new Backbone.Collection;
    equals(BKVO.getObjectType(object), BKVO.types.collection,
        'Backbone router');

});


test('detectElementInterface', function() {
    expect(7);

    equals(BKVO.detectElementInterface(text), 'value',
        'text input');
    equals(BKVO.detectElementInterface(check), 'checked',
        'checkbox');
    equals(BKVO.detectElementInterface(radio), 'checked',
        'radio button');
    equals(BKVO.detectElementInterface(select), 'value',
        'select box');
    equals(BKVO.detectElementInterface(button), 'text',
        'button');
    equals(BKVO.detectElementInterface(email), 'value',
        'email (variant of text input)');
    equals(BKVO.detectElementInterface(submit), 'value',
        'submit button');
});


test('detectDomEvent', function() {
    expect(7);

    equals(BKVO.detectDomEvent(text), 'keyup',
        'text input');
    equals(BKVO.detectDomEvent(check), 'change',
        'checkbox');
    equals(BKVO.detectDomEvent(radio), 'change',
        'radio button');
    equals(BKVO.detectDomEvent(select), 'change',
        'select box');
    equals(BKVO.detectDomEvent(button), 'click',
        'button');
    equals(BKVO.detectDomEvent(email), 'keyup',
        'email (variant of text input)');
    equals(BKVO.detectDomEvent(submit), 'submit',
        'submit button');
});


module('Built-in Interfaces');

test('get value', function() {
    expect(4);

    equals(BKVO.interfaces.get(text, 'value'),'hello world', 'alias');
    equals(BKVO.interfaces.get(text, 'prop:value'), 'hello world', 'prop');

    equals(BKVO.interfaces.get(select, 'value'), '', 'alias');
    equals(BKVO.interfaces.get(select, 'prop:value'), '', 'prop');
});

test('set value', function() {
    expect(10);

    // input
    BKVO.interfaces.set(text, 'value', 'foobar');
    equals(BKVO.interfaces.get(text, 'value'), 'foobar', 'text, string');

    BKVO.interfaces.set(text, 'value', 1);
    equals(BKVO.interfaces.get(text, 'value'), '1', 'text, number');

    BKVO.interfaces.set(text, 'value', []);
    equals(BKVO.interfaces.get(text, 'value'), '', 'text, array');

    BKVO.interfaces.set(text, 'value', true);
    equals(BKVO.interfaces.get(text, 'value'), 'true', 'text, bool');

    // select
    BKVO.interfaces.set(select, 'value', 'not an option');
    equals(BKVO.interfaces.get(select, 'value'), '', 'select, string');

    BKVO.interfaces.set(select, 'value', 1);
    equals(BKVO.interfaces.get(select, 'value'), '1', 'select, number');

    BKVO.interfaces.set(select, 'value', []);
    equals(BKVO.interfaces.get(select, 'value'), null, 'select, array (empty)');

    BKVO.interfaces.set(select, 'value', [1]);
    equals(BKVO.interfaces.get(select, 'value'), '1', 'select, array (choice)');

    BKVO.interfaces.set(select, 'value', ['foo']);
    equals(BKVO.interfaces.get(select, 'value'), '', 'select, array (bad choice)');

    BKVO.interfaces.set(select, 'value', true);
    equals(BKVO.interfaces.get(select, 'value'), '', 'select, bool');

});


test('get text', function() {
    expect(2);

    equals(BKVO.interfaces.get(span, 'text'), 'Hello World', 'span');
    equals(BKVO.interfaces.get(span, 'prop:innerText'), 'Hello World', 'span');

});


test('set text', function() {
    expect(3);

    BKVO.interfaces.set(span, 'text', 'Foo Bar');
    equals(BKVO.interfaces.get(span, 'text'), 'Foo Bar', 'span string');

    BKVO.interfaces.set(span, 'text', 1);
    equals(BKVO.interfaces.get(span, 'text'), '1', 'span number');

    BKVO.interfaces.set(span, 'text', []);
    equals(BKVO.interfaces.get(span, 'text'), '', 'span array');

    // reset
    BKVO.interfaces.set(span, 'text', 'Hello World');

});


test('get html', function() {
    expect(2);

    equals(BKVO.interfaces.get(span, 'html'), 'Hello World', 'alias');
    equals(BKVO.interfaces.get(span, 'prop:innerHTML'), 'Hello World', 'prop');

});


test('set html', function() {
    expect(4);

    BKVO.interfaces.set(span, 'html', '<em>Hello</em>');
    equals(BKVO.interfaces.get(span, 'html'), '<em>Hello</em>', 'span html');

    BKVO.interfaces.set(span, 'html', 'Hello');
    equals(BKVO.interfaces.get(span, 'html'), 'Hello', 'span string');

    BKVO.interfaces.set(span, 'html', 1);
    equals(BKVO.interfaces.get(span, 'html'), '1', 'span number');

    BKVO.interfaces.set(span, 'html', []);
    equals(BKVO.interfaces.get(span, 'html'), '', 'span array');

    // reset
    BKVO.interfaces.set(span, 'html', 'Hello World');
});


test('get checked', function() {
    expect(4);

    equals(BKVO.interfaces.get(check, 'checked'), true, 'checkbox alias');
    equals(BKVO.interfaces.get(check, 'prop:checked'), true, 'checkbox prop');

    equals(BKVO.interfaces.get(radio, 'checked'), false, 'radio alias');
    equals(BKVO.interfaces.get(radio, 'prop:checked'), false, 'radio prop');

});


test('set checked', function() {
    expect(4);

    BKVO.interfaces.set(check, 'checked', true);
    equals(BKVO.interfaces.get(check, 'checked'), true, 'checkbox bool');

    BKVO.interfaces.set(check, 'checked', 0);
    equals(BKVO.interfaces.get(check, 'checked'), false, 'checkbox zero');

    BKVO.interfaces.set(check, 'checked', []);
    equals(BKVO.interfaces.get(check, 'checked'), false, 'checkbox empty array');

    BKVO.interfaces.set(check, 'checked', null);
    equals(BKVO.interfaces.get(check, 'checked'), false, 'checkbox null');

});


test('get disabled', function() {
    expect(4);

    equals(BKVO.interfaces.get(check, 'disabled'), false, 'checkbox alias');
    equals(BKVO.interfaces.get(check, 'prop:disabled'), false, 'checkbox prop');

    equals(BKVO.interfaces.get(radio, 'disabled'), true, 'radio alias');
    equals(BKVO.interfaces.get(radio, 'prop:disabled'), true, 'radio prop');

});


test('set disabled', function() {
    expect(4);

    BKVO.interfaces.set(check, 'disabled', true);
    equals(BKVO.interfaces.get(check, 'disabled'), true, 'checkbox bool');

    BKVO.interfaces.set(check, 'disabled', 0);
    equals(BKVO.interfaces.get(check, 'disabled'), false, 'checkbox zero');

    BKVO.interfaces.set(check, 'disabled', []);
    equals(BKVO.interfaces.get(check, 'disabled'), false, 'checkbox empty array');

    BKVO.interfaces.set(check, 'disabled', null);
    equals(BKVO.interfaces.get(check, 'disabled'), false, 'checkbox null');

});


test('get enabled', function() {
    expect(4);

    equals(BKVO.interfaces.get(check, 'enabled'), true, 'checkbox alias');
    equals(!BKVO.interfaces.get(check, 'prop:disabled'), true, 'checkbox prop');

    equals(BKVO.interfaces.get(radio, 'enabled'), false, 'radio alias');
    equals(!BKVO.interfaces.get(radio, 'prop:disabled'), false, 'radio prop');

});


test('set enabled', function() {
    expect(4);

    BKVO.interfaces.set(check, 'enabled', true);
    equals(BKVO.interfaces.get(check, 'enabled'), true, 'checkbox bool');

    BKVO.interfaces.set(check, 'enabled', 0);
    equals(BKVO.interfaces.get(check, 'enabled'), false, 'checkbox zero');

    BKVO.interfaces.set(check, 'enabled', []);
    equals(BKVO.interfaces.get(check, 'enabled'), false, 'checkbox empty array');

    BKVO.interfaces.set(check, 'enabled', null);
    equals(BKVO.interfaces.get(check, 'enabled'), false, 'checkbox null');

});


test('get visible', function() {
    expect(2);
    equals(BKVO.interfaces.get(select, 'visible'), false, 'alias');
    equals(BKVO.interfaces.get(select, 'style:display'), 'none', 'style');
});


test('get hidden', function() {
    expect(2);
    equals(BKVO.interfaces.get(select, 'hidden'), true, 'alias');
    equals(BKVO.interfaces.get(select, 'style:display'), 'none', 'style');
});


/*
module('jQuery Observers');

// jQuery observers have two means of being notified by the subject. 
test('read-only non-form element', function() {
    expect(2);

    model = new Backbone.Model;

    // shorthand for specifying a particular target for the observers
    BKVO.registerObserver(span, model, 'title');
    model.set({title: 'Cool Title'});
    equals(span.text(), 'Cool Title', 'the span element observers the title attr on the model');

    model.unbind();

    BKVO.registerObserver(span, model, {
        target: ['title', 'author'],
        handler: function(attrs) {
            return attrs.title + ' by ' + attrs.author;
        }
    });

    model.set({title: 'Yet Again!', author: 'John Doe'});
    equals(span.text(), 'Yet Again! by John Doe', 'the span element observers the title and author attr on the model');


    // reset
    span.text('Hello World');

});
*/
