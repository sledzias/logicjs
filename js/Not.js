logicjs.Not =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.nodeType = 'Not';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 48.499947,208.09448 C 48.499947,209.19848 47.603947,210.09448 46.499948,210.09448 C 45.395948,210.09448 44.499948,209.19848 44.499948,208.09448 C 44.499948,206.99048 45.395948,206.09448 46.499948,206.09448 C 47.603947,206.09448 48.499947,206.99048 48.499947,208.09448 z M 25,219.09448 L 25,197.09448 L 43.985582,208.09448 L 25,219.09448 z M 48.5,208.09448 L 57.50006,208.09448 M 16,208.09448 L 25.00006,208.09448',
            fill: 'white',
            name : 'shape',
            x : -20,
            y : -292,
            stroke : 'black',
            strokeWidth : 1,
            scale : [1.5,1.5]

        }));
        var  anchor = new logicjs.GateAnchor({
            name:'input',
            x : 0,
            y : 20
        });
        this.add(anchor);


        this.add(new logicjs.GateAnchor({
            name:'output',
            x : 70,
            y : 20
        }));
        this.calculateOutputs();

    },

    calculateOutputs : function(){

        var val = _.first(this.getAnchors('input')).getLogicStateInt();
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});