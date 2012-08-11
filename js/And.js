logicjs.And =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this.oType = 'Gate';
        // call super constructor
        this._super(config);

        this.add(new Kinetic.Shape({
            drawFunc:function (context) {
                context.fillStyle = 'white';
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
            y : 0
        }));
        this.add(new logicjs.Anchor({
            name:'input',
            x : 0,
            y : 20
        }));

        this.add(new logicjs.Anchor({
            name:'input',
            x : 0,
            y : 40
        }));

        this.add(new logicjs.Anchor({
            name:'output',
            x : 60,
            y : 30
        }));

    }



});