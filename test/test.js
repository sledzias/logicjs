module( "Logicjs serialization" ,{
setup: function() {
    this.stage = new Kinetic.Stage({
        container: "container",
        width: 500,
        height: 200
    });

    this.layer = new Kinetic.Layer();
    this.stage.add(this.layer);

},
teardown: function() {

}
});
test( "Gate: Zwracanie wejsc i wyjsc", 2, function() {
    var gate = new logicjs.Gate({});
    this.layer.add(gate);

    equal( typeof(gate.get('.input')), "object", "get('.input') powinno byc lista'" );
    equal( typeof(gate.get('.output')), "object", "get('.output') powinno byc lista'" );

});

test( "Gate: serializacja i deserializacja", 3, function() {
    var gate = new logicjs.Gate({});
    this.layer.add(gate);
    var json = gate.toJSON();
    var copyGate = new logicjs.Gate({});
    copyGate.load(json);
    this.layer.add(copyGate);

    equal( gate.get('.input').length,  copyGate.get('.input').length, "liczba wejsc powinna byc taka sama"+copyGate.get('.input').length );
    equal( gate.get('.output').length,  copyGate.get('.output').length, "liczba wyjsc powinna byc taka sama"+copyGate.get('.output').length );
    equal( gate.get('.input').length,  0, "liczba wejsc powinna byc rowna 0" );
});

test( "And: serializacja i deserializacja",4, function() {
    var gate = new logicjs.And({});
    this.layer.add(gate);
    var json = gate.toJSON();
    var copyGate = new logicjs.And({});
    copyGate.load(json);
    this.layer.add(copyGate);

    equal( gate.get('.input').length,  copyGate.get('.input').length, "liczba wejsc powinna byc taka sama");
    equal( gate.get('.output').length,  copyGate.get('.output').length, "liczba wyjsc powinna byc taka sama");
    equal(  copyGate.get('.input').length,  2, "liczba wejsc powinna byc rowna 2" );
    equal(  copyGate.get('.output').length,  1, "liczba wyjsc powinna byc rowna 1" );

});