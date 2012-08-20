logicjs.Nor =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.nodeType = 'Or';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 95,77.094482 L 95,77.156982 C 97.19873,80.972154 98.46875,85.377694 98.46875,90.094482 C 98.46875,94.81127 97.19873,99.21681 95,103.03199 L 95,103.09449 L 98.46875,103.09449 L 108.46875,103.09449 C 118.07946,103.09449 126.46882,97.855186 130.96875,90.094482 C 126.46882,82.333779 118.07946,77.094483 108.46875,77.094482 L 98.46875,77.094482 L 95,77.094482 z M 135,90.094848 C 135,91.198848 134.104,92.094848 133,92.094848 C 131.896,92.094848 131,91.198848 131,90.094848 C 131,88.990848 131.896,88.094848 133,88.094848 C 134.104,88.094848 135,88.990848 135,90.094848 z M 134.99973,90.094481 L 144.00032,90.094481 M 88.5,83.594487 L 97.50006,83.594487 M 88.5,96.594485 L 97.50006,96.594485',
            fill: 'white',
            name : 'shape',
            x : -132,
            y : -103,
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
            memo += anchor.getLogicStateInt();
            if (_.isNaN(memo)) return NaN;
            else{
                return (memo + anchor.getLogicStateInt() > 0) ? 1 : 0;
            }

        },0);
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});