logicjs.And =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'And';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 44.000001,44.094484 C 36.824001,44.094484 25,44.094486 25,44.094486 L 25,18.095913 L 44.000001,18.094485 C 51.176001,18.094485 57.000001,23.918484 57.000001,31.094484 C 57.000001,38.270485 51.176001,44.094484 44.000001,44.094484 z M 57,31.094485 L 66.056394,31.094485 M 16,24.594486 L 25.00006,24.594486 M 16,37.594484 L 25.00006,37.594484',
            fill: 'white',
            name : 'shape',
            x : -25,
            y : -15,
            stroke : 'black',
            strokeWidth : 1,
            scale : [1.5,1.5]

        }));
       var  anchor = new logicjs.GateAnchor({
            name:'input',
            x : 0,
            y : 22
        });
        this.add(anchor);



        this.add(new logicjs.GateAnchor({
            name:'input',
            x : 0,
            y : 40
        }));

        this.add(new logicjs.GateAnchor({
            name:'output',
            x : 80,
            y : 32
        }));
        this.calculateOutputs();

    },

    calculateOutputs : function(){
        console.log('And: calculateOutputs');
        var val = _.reduce(this.getAnchors('input'), function(memo, anchor){
            console.log(memo);
            return memo * anchor.getLogicStateInt();
        },1);
        console.log(val);

        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});