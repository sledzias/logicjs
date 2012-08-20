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
test( "Gate: Zwracanie wejsc i wyjsc", 7, function() {
    var gate = new logicjs.Gate({});
    this.layer.add(gate);
    var and = new logicjs.And({});
    this.layer.add(and);

    equal( typeof(gate.get('.input')), "object", "get('.input') powinno byc lista'" );
    equal( typeof(gate.get('.output')), "object", "get('.output') powinno byc lista'" );

    equal(and.getAnchors().length, 3, 'and powinien miec 3 piny (getAnchors bez parametru)');
    equal(and.getAnchors(['input']).length, 2, 'and powinien miec 2 piny wejsciowe');
    equal(and.getAnchors(['output']).length, 1, 'and powinien miec 1 pin wyjsciowy');
    equal(and.getAnchors('output').length, 1, 'and powinien miec 1 pin wyjsciowy');
    equal(and.getAnchors(['input','output']).length, 3, 'and powinien miec 3 piny (getAnchors z parametrami input i output)');
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

test( "test metody ConnectorAnchor.isConnectedTo()",12, function() {
    var gateInputAnchor = new logicjs.GateAnchor({name:'input'});
    var gateOutputAnchor = new logicjs.GateAnchor({name:'output'});
    var gateClockAnchor = new logicjs.GateAnchor({name:'clock'});
    var connectorAnchor = new logicjs.ConnectorAnchor({});

    this.layer.add(gateInputAnchor);
    this.layer.add(gateOutputAnchor);
    this.layer.add(gateClockAnchor);
    this.layer.add(connectorAnchor);

    connectorAnchor.connectTo(gateInputAnchor);
    ok(connectorAnchor.isConnectedTo(), 'pin polaczenia jest polaczony do dowolnego pinu bramki');
    ok(connectorAnchor.isConnectedTo('input'), 'pin polaczenia jest polaczony do wejsciowego pinu bramki');
    ok(!connectorAnchor.isConnectedTo('output'), 'pin polaczenia nie jest polaczony do wyjsciowego pinu bramki');
    ok(!connectorAnchor.isConnectedTo('clock'), 'pin polaczenia nie jest polaczony do zegarowego pinu bramki');

    connectorAnchor.connectTo(gateOutputAnchor);
    ok(connectorAnchor.isConnectedTo(), 'pin polaczenia jest polaczony do dowolnego pinu bramki');
    ok(!connectorAnchor.isConnectedTo('input'), 'pin polaczenia nie jest polaczony do wejsciowego pinu bramki');
    ok(connectorAnchor.isConnectedTo('output'), 'pin polaczenia  jest polaczony do wyjsciowego pinu bramki');
    ok(!connectorAnchor.isConnectedTo('clock'), 'pin polaczenia nie jest polaczony do zegarowego pinu bramki');

    connectorAnchor.connectTo(gateClockAnchor);
    ok(connectorAnchor.isConnectedTo(), 'pin polaczenia jest polaczony do dowolnego pinu bramki');
    ok(!connectorAnchor.isConnectedTo('input'), 'pin polaczenia nie jest polaczony do wejsciowego pinu bramki');
    ok(!connectorAnchor.isConnectedTo('output'), 'pin polaczenia nie jest polaczony do wyjsciowego pinu bramki');
    ok(connectorAnchor.isConnectedTo('clock'), 'pin polaczenia jest polaczony do zegarowego pinu bramki');


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

module( "Logicjs symulacja" ,{
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

test( "Ustawianie poziomu logicznego pinu zwyklego",12, function() {


    var anchor = new logicjs.Anchor({});

    this.layer.add(anchor);

       anchor.setLogicState();
    equal(anchor.getLogicState(), 'undefined', "ustawienie pustego parametru powinno dac stan niezdefiniowany");

    anchor.setLogicState('high');
    equal(anchor.getLogicState(), 'high', "ustawienie wysokiego stanu");

    anchor.setLogicState('hightasd  as');
    equal(anchor.getLogicState(), 'undefined', "ustawienie blednego stanu powinno zwracac stan niezdefiniowany");

    anchor.setLogicState('low');
    equal(anchor.getLogicState(), 'low', "ustawienie niskiego stanu");

    anchor.setLogicState('undefined');
    equal(anchor.getLogicState(), 'undefined', "ustawienie niezdefiniowanego stanu");

    anchor.setLogicStateInt(NaN);
    ok(_.isNaN(anchor.getLogicStateInt()), 'niezdefiniowany stan zwraca  liczbowo NaN');

    anchor.setLogicStateInt(1);
    equal(anchor.getLogicStateInt(),1, 'poziom wysoki  zwraca  liczbowo 1');

    anchor.setLogicStateInt(0);
    equal(anchor.getLogicStateInt(),0, 'poziom niski  liczbowo 0');

    anchor.setLogicStateInt(1);
    equal(anchor.getLogicState(),'high', 'ustawienie poziomu wysokiego liczbowo powinien dac \'high\'');

    anchor.setLogicStateInt(0);
    equal(anchor.getLogicState(),'low', 'ustawienie poziomu niskiego liczbowo powinien dac \'low\'');

    anchor.setLogicState('high');
    equal(anchor.getLogicStateInt(),1, 'ustawienie poziomu high  powinien dac liczbowo 1');

    anchor.setLogicState('low');
    equal(anchor.getLogicStateInt(),0, 'ustawienie poziomu low powinien dac liczbowo 0');


});

test( "Test funkcji logicjs.invertLogicState",5, function() {

    equal(logicjs.invertLogicState(1),0,'1 => 0');
    equal(logicjs.invertLogicState(0),1,'0 => 1');
    ok(_.isNaN(logicjs.invertLogicState(NaN)),'NaN => NaN');
    ok(_.isNaN(logicjs.invertLogicState('string')),'"string" => NaN');
    equal(logicjs.invertLogicState(5),0,'5 => 0');

});

test( "Test funkcji logicznej bramki and",13, function() {
    var and = new logicjs.And({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
    connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'undefined', 'low && undefined => undefined');
    equal(connectorAnchor1.getLogicState(),outputAnchor.getLogicState(), 'pin1 polaczenia ma taki sam stan jak pic wyjsciowy bramki');
    equal(connectorAnchor2.getLogicState(),outputAnchor.getLogicState(), 'pin2 polaczenia ma taki sam stan jak pic wyjsciowy bramki');


    inputAnchors[1].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'low', 'low && low => low');
    equal(connectorAnchor1.getLogicState(),outputAnchor.getLogicState(), 'pin1 polaczenia ma taki sam stan jak pic wyjsciowy bramki');
    equal(connectorAnchor2.getLogicState(),outputAnchor.getLogicState(), 'pin2 polaczenia ma taki sam stan jak pic wyjsciowy bramki');


    inputAnchors[1].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'low && high => low');
    equal(connectorAnchor1.getLogicState(),outputAnchor.getLogicState(), 'pin1 polaczenia ma taki sam stan jak pic wyjsciowy bramki');
    equal(connectorAnchor2.getLogicState(),outputAnchor.getLogicState(), 'pin2 polaczenia ma taki sam stan jak pic wyjsciowy bramki');


    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'high', 'high && high => high');
    equal(connectorAnchor1.getLogicState(),outputAnchor.getLogicState(), 'pin1 polaczenia ma taki sam stan jak pic wyjsciowy bramki');
    equal(connectorAnchor2.getLogicState(),outputAnchor.getLogicState(), 'pin2 polaczenia ma taki sam stan jak pic wyjsciowy bramki');
});

test( "Test funkcji logicznej bramki or",5, function() {
    var and = new logicjs.Or({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
    connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'undefined', 'low && undefined => undefined');
    inputAnchors[1].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'low', 'low && low => low');
    inputAnchors[1].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'high', 'low && high => high');
    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'high', 'high && high => high');
});

test( "Test funkcji logicznej bramki nand",5, function() {
    var and = new logicjs.Nand({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
    connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'undefined', 'low && undefined => undefined');
    inputAnchors[1].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'high', 'low && low => high');
    inputAnchors[1].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'high', 'low && high => high');
    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'high && high => low');
});

test( "Test funkcji logicznej bramki nor",5, function() {
    var and = new logicjs.Nor({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
    connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'undefined', 'low && undefined => undefined');
    inputAnchors[1].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'high', 'low && low => high');
    inputAnchors[1].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'low && high => low');
    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'high && high => low');
});

test( "Test funkcji logicznej bramki xor",5, function() {
    var and = new logicjs.Xor({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
    connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'undefined', 'low && undefined => undefined');
    inputAnchors[1].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'low', 'low && low => low');
    inputAnchors[1].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'high', 'low && high => high');
    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'high && high => low');
});

test( "Test funkcji logicznej bramki nxor",5, function() {
    var and = new logicjs.Nxor({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
    connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'undefined', 'low && undefined => undefined');
    inputAnchors[1].setLogicState('low');
    equal(outputAnchor.getLogicState(), 'high', 'low && low => high');
    inputAnchors[1].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'low && high => low');
    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'high', 'high && high => high');
});

test( "Test funkcji logicznej bramki not",3, function() {
    var and = new logicjs.Not({});
    this.layer.add(and);
    var connector = new logicjs.Connector({ points : [0,0,10,10]});
    var connectorAnchor1 = connector._getAnchors()[0];
    //var connectorAnchor2 = connector._getAnchors()[1];
    this.layer.add(connector);
    var inputAnchors = and.getAnchors('input');
    var outputAnchor = _.first(and.getAnchors('output'));

    connectorAnchor1.connectTo(outputAnchor);
  //  connectorAnchor2.connectTo(outputAnchor);

    equal(outputAnchor.getLogicState(), 'undefined', 'niezainicjowana bramka na wyjsciu ma undefined');
    inputAnchors[0].setLogicState('low');


    equal(outputAnchor.getLogicState(), 'high', 'low => high');

    inputAnchors[0].setLogicState('high');
    equal(outputAnchor.getLogicState(), 'low', 'high => low');
});
