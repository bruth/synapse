test('getObjectType', function() {
	expect(8);

    var object;

    object = $('input')
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

    object = new Backbone.Controller;
    equals(BKVO.getObjectType(object), BKVO.types.controller,
        'Backbone controller');

    object = new Backbone.Model;
    equals(BKVO.getObjectType(object), BKVO.types.model,
        'Backbone model');

    object = new Backbone.Collection;
    equals(BKVO.getObjectType(object), BKVO.types.collection,
        'Backbone controller');

});


test('detectObjectInterface', function() {
    expect(4);

    var input, select;

    input = $('input[type=text]');
    equals(BKVO.detectObjectInterface(input), 'value');

    input = $('input[type=checkbox]');
    equals(BKVO.detectObjectInterface(input), 'prop:checked');

    input = $('input[type=radio]');
    equals(BKVO.detectObjectInterface(input), 'prop:checked');

    select = $('select');
    equals(BKVO.detectObjectInterface(select), 'value');

});
