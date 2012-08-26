logicjs.Nand =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Nand';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 114,44.09448 C 106.824,44.09448 95,44.094482 95,44.094482 L 95,18.095909 L 114,18.094481 C 121.176,18.094481 127,23.91848 127,31.09448 C 127,38.270481 121.176,44.09448 114,44.09448 z M 131,31.094482 C 131,32.198482 130.104,33.094482 129,33.094482 C 127.896,33.094482 127,32.198482 127,31.094482 C 127,29.990482 127.896,29.094482 129,29.094482 C 130.104,29.094482 131,29.990482 131,31.094482 z M 130.9997,31.094481 L 139.99976,31.094481 M 86,24.594478 L 95.00006,24.594478 M 86,37.594476 L 95.00006,37.594476',
            fill: 'white',
            name : 'shape',
            x : -130,
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
        var val = _.reduce(this.getAnchors('input'), function(memo, anchor){
            console.log(memo);
            return memo * anchor.getLogicStateInt();
        },1);
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});