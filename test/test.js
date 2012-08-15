module( "Logicjs serialization" ,{
setup: function() {
    this.stage = new logicjs.Workflow({
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

module( "Logicjs Obsluga polaczen" ,{
    setup: function() {
        this.stage = new logicjs.Workflow({
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


test( "Dodawanie polaczenia do bramki",6, function() {
    var gateAnchor = new logicjs.GateAnchor({});
    var connectorAnchor = new logicjs.ConnectorAnchor({});


    ok(gateAnchor !== null, 'utworzono gateAnchor');
    ok(connectorAnchor !== null, 'utworzono connectorAnchor');
    equal(gateAnchor.getConnectors().length, 0, 'getConnector powinien byc rowny 0 dla niedodanych polaczen');
    //gateAnchor.connectTo(connectorAnchor);
    connectorAnchor.connectTo(gateAnchor);
    equal(gateAnchor.getConnectors().length, 1, 'getConnector powinien byc rowny 1 dla dodanego polaczenia');
    var tempAnchor = gateAnchor.getConnectors()[0];
    deepEqual(connectorAnchor,tempAnchor,'zwrocony pin powinien byc taki sam jak dodany');
    //gateAnchor.connectTo(connectorAnchor);
    connectorAnchor.connectTo(gateAnchor);
    equal(gateAnchor.getConnectors().length, 1, 'getConnector powinien byc rowny 1 dla dodania istniejacego polaczenia');

});

test( "Usuwanie polaczenia z bramki",4, function() {
    var gateAnchor = new logicjs.GateAnchor({});
    var connectorAnchor = new logicjs.ConnectorAnchor({});
    gateAnchor.connectTo(connectorAnchor);
    gateAnchor.disconnectFrom(connectorAnchor);


    equal(gateAnchor.getConnectors().length, 0, 'getConnector powinien byc rowny 0 po usunieciu polaczenia');

    gateAnchor.connectTo(new logicjs.ConnectorAnchor({}));
    gateAnchor.connectTo(connectorAnchor);
    var tempAnchor = new logicjs.ConnectorAnchor({});
    gateAnchor.connectTo(tempAnchor);
    gateAnchor.connectTo(new logicjs.ConnectorAnchor({}));
    gateAnchor.disconnectFrom(connectorAnchor);
    equal(gateAnchor.getConnectors().length, 3, 'getConnector powinien byc rowny 3 po dodaniu 4 i usunieciu 1 polaczenia');
    ok(_.indexOf(gateAnchor.getConnectors(),connectorAnchor)==-1, 'getConnector nie powinien zawierac usunietego polaczenia');
    ok(_.indexOf(gateAnchor.getConnectors(),tempAnchor)>-1, 'getConnector powinien zaiwerac nieusuniete polaczenie');

});

test( "Dodawanie kilku polaczen do jednego pinu bramki",15, function() {
    var gateAnchor = new logicjs.GateAnchor({});
    var connectorAnchor1 = new logicjs.ConnectorAnchor({});
    var connectorAnchor2 = new logicjs.ConnectorAnchor({});
    var connectorAnchor3 = new logicjs.ConnectorAnchor({});


    ok(connectorAnchor2.getConnectedAnchor() == null, 'Pin connectora 2 nie powinien byc polaczony z zadnym pinem bramki');

    connectorAnchor1.connectTo(gateAnchor);
    connectorAnchor1.connectTo(gateAnchor);
    connectorAnchor1.connectTo(gateAnchor);

    equal(gateAnchor.getConnectors().length, 1, 'getConnector powinien byc rowny 1 po dodaniu 3 razy tego samego polaczenia');
    equal(connectorAnchor1.getConnectedAnchor(), gateAnchor, 'Pin connectora   powinien byc polaczony z pinem bramki');

    connectorAnchor2.connectTo(gateAnchor);
    connectorAnchor3.connectTo(gateAnchor);

    equal(gateAnchor.getConnectors().length, 3, 'getConnector powinien byc rowny 1 po dodaniu 3 roznych  polaczen');
    equal(connectorAnchor1.getConnectedAnchor(), gateAnchor, 'Pin connectora 1   powinien byc polaczony z pinem bramki');
    equal(connectorAnchor2.getConnectedAnchor(), gateAnchor, 'Pin connectora 2  powinien byc polaczony z pinem bramki');
    equal(connectorAnchor3.getConnectedAnchor(), gateAnchor, 'Pin connectora 3  powinien byc polaczony z pinem bramki');

    connectorAnchor2.disconnectFrom();

    equal(gateAnchor.getConnectors().length, 2, 'getConnector powinien byc rowny 2 po usunieciu 1  polaczenia');
    equal(connectorAnchor1.getConnectedAnchor(), gateAnchor, 'Pin connectora 1   powinien byc polaczony z pinem bramki');
    ok(connectorAnchor2.getConnectedAnchor()==null, 'Pin connectora 2 nie powinien byc polaczony z zadnym pinem bramki');
    equal(connectorAnchor3.getConnectedAnchor(), gateAnchor, 'Pin connectora 3  powinien byc polaczony z pinem bramki');

    connectorAnchor2.connectTo(gateAnchor);
    equal(gateAnchor.getConnectors().length, 3, 'getConnector powinien byc rowny 3 po dodaniu po ponownym dodaniu pinu connectora 2');
    equal(connectorAnchor1.getConnectedAnchor(), gateAnchor, 'Pin connectora 1   powinien byc polaczony z pinem bramki');
    equal(connectorAnchor2.getConnectedAnchor(), gateAnchor, 'Pin connectora 2  powinien byc polaczony z pinem bramki');
    equal(connectorAnchor3.getConnectedAnchor(), gateAnchor, 'Pin connectora 3  powinien byc polaczony z pinem bramki');
});


test( "Usuwanie polaczenia",10, function() {

    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var gateAnchor1 = new logicjs.GateAnchor({});
    var gateAnchor2 = new logicjs.GateAnchor({});
    this.layer.add(connector);
    this.layer.add(gateAnchor1);
    this.layer.add(gateAnchor2);

    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];

    ok(connectorAnchor1.getParent() === connector, 'pin1 powinien nalezec do polaczenia');
    ok(connectorAnchor2.getParent() === connector, 'pin2 powinien nalezec do polaczenia');
    ok(connectorAnchor1.getConnectedAnchor() == null, 'pin1 polaczenia nie powinien byc podlaczony');
    ok(connectorAnchor2.getConnectedAnchor() == null, 'pin2 polaczenia nie powinien byc podlaczony');
    deepEqual(gateAnchor1.getConnectors() , [], 'pin bramki1 nie powinien byc polaczony');
    deepEqual(gateAnchor2.getConnectors() , [], 'pin bramki2 nie powinien byc polaczony');

    connectorAnchor1.connectTo(gateAnchor1);
    connectorAnchor2.connectTo(gateAnchor2);

    deepEqual(gateAnchor1.getConnectors(), [connectorAnchor1], 'pin bramki1 powinien byc polaczony z pinem 1 polaczenia');
    deepEqual(gateAnchor2.getConnectors(), [connectorAnchor2], 'pin bramki2 powinien byc polaczony z pinem 2 polaczenia');

    connector.eliminate();

    equal(gateAnchor1.getConnectors().length , 0, 'pin bramki1 nie powinien byc polaczony');
    equal(gateAnchor2.getConnectors().length , 0, 'pin bramki2 nie powinien byc polaczony');




});


