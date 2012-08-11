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

    },

    addGate : function(coords){
        var and = new logicjs.And(coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);
        mainLayer.add(new logicjs.Connector({
            points: [73, 70, 340, 23, 450, 60, 500, 20],
            stroke: "black",
            strokeWidth: 2

        }));
        mainLayer.draw();
        //this.draw();

    }

})

