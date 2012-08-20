logicjs.Switch =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0,
            logicState : 0


        });
        this._super(config);
        this.oType = 'Gate';
        this.nodeType = 'Switch';
        // call super constructor


        this.add(new Kinetic.Rect({
            x: 0,
            y:0,
            width: 30,
            height: 30,
            name: 'shape',
            fill : 'white',
            stroke: 'black',
            strokeWidth: 1
        }));

        var button = new Kinetic.Circle({
            radius: 10,
            name : 'button',
            x : 15,
            y : 15,
            fill : 'red',
            strokeWidth : 1,
            stroke : 1

        });
        this.add(button);









        this.add(new logicjs.GateAnchor({
            name:'output',
            x : 35,
            y : 15
        }));

        button.on('click', function(e){
            this.getParent().getAttrs().logicState = this.getParent().getAttrs().logicState == 1 ? 0 : 1;
            //console.log(this.getShape());
            this.getParent().getAttrs().logicState == 1 ? button.setFill('green') :  button.setFill('red');
            this.getParent().calculateOutputs();
            this.getStage().draw();
            e.cancelBubble = true;
        });
        this.calculateOutputs();


    },

    calculateOutputs : function(){
        var val = this.getAttrs().logicState;

        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});