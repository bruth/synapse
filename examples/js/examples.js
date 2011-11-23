require([
    'synapse',
    'synapse/hooks/jquery',
    'synapse/hooks/object',
    'synapse/hooks/backbone-model'
], function(Synapse, jQueryHook, ObjectHook, BackboneModelHook) {
   
    Synapse.addHooks(jQueryHook, BackboneModelHook, ObjectHook);

    $(function() {

        Synapse('#ex1 span').observe('#ex1 input');

    });
});
