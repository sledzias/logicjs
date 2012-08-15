logicjs.Workflow =  Kinetic.Stage.extend({
    init: function(config) {
        this.setDefaultAttrs({
               // container : $('#container')
        });

        this.oType = 'Workflow';
        // call super constructor
        this._super(config);

        this.add(new Kinetic.Layer({
            id : 'mainLayer'
        }));

        this.add(new Kinetic.Layer({
            id : 'topLayer'
        }));
        this.add(new Kinetic.Layer({
            id : 'connectorsLayer'
        }));

    },

    addGate : function(coords){
        var and = new logicjs.And(coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);

        mainLayer.draw();



    },

    makeConnector : function(anchor){
        var connector = new logicjs.Connector({
            points : [anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y,
                      anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y],
            stroke: "black",
            strokeWidth: 2
        });
      //  connector.connectTo([anchor]);
        this.get('#connectorsLayer')[0].add(connector);
        connector._getAnchors()[0]._initDrag();
        connector._getAnchors()[1].connectTo(anchor);
        this.draw();


    }

})

