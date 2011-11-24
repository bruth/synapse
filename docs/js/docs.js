require([
    'synapse',
    'synapse/hooks/jquery',
    'synapse/hooks/object',
    'synapse/hooks/backbone-model'
], function(Synapse, jQueryHook, ObjectHook, BackboneModelHook) {
   
    Synapse.addHooks(jQueryHook, BackboneModelHook, ObjectHook);

    $(function() {
        prettyPrint();
        Synapse('#ex1 span').observe('#ex1 input');

        $('#ex2 tr').each(function() {
            var int = $('td:nth(0) code', this),
                trigger = $('td:nth(1)', this).children(),
                target = $('td:nth(2)', this).children();

            Synapse(trigger).notify(target, null, int.text());
        });

        $('#ex3 tr').each(function() {
            var int = $('td:nth(0) code', this),
                trigger = $('td:nth(1)', this).children(),
                target = $('td:nth(2)', this).children();

            Synapse(trigger).notify(target, null, int.text());
        });

        this.ex3 = $('#ex3 tr:nth(3) td:nth(2) span');

    });
});
