logicjs.Or =  logicjs.Gate.extend({
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
            data : 'M 25,77.094505 L 25,77.157005 C 27.198731,80.972177 28.46875,85.377717 28.46875,90.094505 C 28.46875,94.811293 27.198731,99.216833 25,103.03202 L 25,103.09452 L 28.46875,103.09452 L 38.46875,103.09452 C 48.079465,103.09452 56.468823,97.855209 60.96875,90.094505 C 56.468824,82.333802 48.079464,77.094506 38.46875,77.094505 L 28.46875,77.094505 L 25,77.094505 z M 60.999719,90.094512 L 70.000279,90.094512 M 18.5,83.594514 L 27.50006,83.594514 M 18.5,96.594512 L 27.50006,96.594512',
            fill: 'white',
            name : 'shape',
            x : -25,
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
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});