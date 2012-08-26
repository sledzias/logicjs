logicjs.Xor =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Xor';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 30,136.09446 L 30,136.15696 C 32.198731,139.97213 33.46875,144.37767 33.46875,149.09446 C 33.46875,153.81125 32.198731,158.21679 30,162.03196 L 30,162.09446 L 33.46875,162.09446 L 43.46875,162.09446 C 53.079465,162.09446 61.468823,156.85516 65.96875,149.09446 C 61.468824,141.33376 53.079464,136.09446 43.46875,136.09446 L 33.46875,136.09446 L 30,136.09446 z M 25,136.15696 C 27.198731,139.97213 28.46875,144.37767 28.46875,149.09446 C 28.46875,153.81125 27.198731,158.21679 25,162.03196 M 65.999971,149.09448 L 75.000027,149.09448 M 18.5,142.59446 L 27.50006,142.59446 M 18.5,155.59446 L 27.50006,155.59446',
            fill: 'white',
            name : 'shape',
            x : -28,
            y : -192,
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
        var a1 = _.first(this.getAnchors('input')).getLogicStateInt();
        var a2 = _.last(this.getAnchors('input')).getLogicStateInt();
        var val;
        if (_.isNaN(a1) || _.isNaN(a2)){
            val = NaN;
        }
        else{
            val = a1 == a2 ? 0 : 1;
        }
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});