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


        this.add(new Kinetic.Shape({
            drawFunc:function (context) {
                context.fillStyle = this.attrs.fill;
                context.strokeStyle = 'black';
                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(30, 0);
                context.arc(30, 30, 30, -Math.PI / 2, Math.PI / 2);
                context.moveTo(30, 60);
                context.lineTo(0, 60);
                context.lineTo(0, 0);
                context.stroke();
                context.fill();
            },
            name : 'shape',
            x : 0,
            y : 0,
            fill : 'red'

        }));

        this.add(new logicjs.GateAnchor({
            name:'output',
            x : 60,
            y : 30
        }));

        this.on('click', function(){
            this.getAttrs().logicState = this.getAttrs().logicState == 1 ? 0 : 1;
            console.log(this.getShape());
            this.getAttrs().logicState == 1 ? this.getShape().setFill('green') :  this.getShape().setFill('red');
            this.calculateOutputs();
            this.getStage().draw();
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