logicjs.High = logicjs.Gate.extend({
    init:function (config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'High';
        this.add(new Kinetic.Rect({
            x:0,
            y:0,
            width:30,
            height:30,
            name:'shape',
            fill:'white',
            stroke:'black',
            strokeWidth:1
        }));

        this.add(new Kinetic.Text({
            x:5,
            y:5,
            text:"1",
            fontSize:20,
            fontFamily:"Calibri",
            textFill:"black"
        }));

        this.add(new logicjs.GateAnchor({
            name:'output',
            x:35,
            y:15
        }));
        this.calculateOutputs();

    },

    calculateOutputs:function () {
        _.each(this.getAnchors('output'), function (anchor) {
            anchor.setLogicStateInt(1);
        });
    }



});