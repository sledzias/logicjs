var logicjs = {};

//zwraca obiekt z parametrami bez funkcji i obiektow z metodami
logicjs._toJSON = function(node){
        var type = Kinetic.Type;

            var obj = {};

            obj.attrs = {};

            // serialize only attributes that are not function, image, DOM, or objects with methods
            for(var key in node.attrs) {
                var val = node.attrs[key];
                if(!type._isFunction(val) && !type._isElement(val) && !type._hasMethods(val)) {
                    obj.attrs[key] = val;
                }
            }

            obj.nodeType = node.nodeType;
            obj.shapeType = node.shapeType;
            obj.oType = node.oType || '';
        return obj;
};logicjs.Gate =  Kinetic.Group.extend({
    init: function(config) {
        this.oType = 'Gate';
        // call super constructor
        this._super(config);
//        this.add(new logicjs.Anchor({
//            name:'input',
//            x : 0,
//            y : 10
//        }));

        this.on('dragstart', function(){
         this.moveToTop();
        });

    },


    /** @return  JSON z atrybutami*/
    toJSON: function(){
        var json = logicjs._toJSON(this);
        json.inputs = [];

        var inputs = this.get('.input');
        for(var n = 0; n < inputs.length; n++) {
            var input = inputs[n];
            json.inputs.push(input.toJSON());
        };
        return json;

    },

    load : function(obj){
        this.attrs = obj.attrs;
        var inputs = obj.inputs;
        for (var n; n<obj.inputs.length; n++){
            this.add(new logicjs.Anchor(obj.inputs[n]));
        }
    }
  });

logicjs.Anchor =  Kinetic.Circle.extend({
    init: function(config) {
        this.setDefaultAttrs({
            radius:5,
            stroke:"black",
            fill:"#ddd",
            strokeWidth:2,
            draggable:false
        });

        this.oType = 'Anchor';
        // call super constructor
        this._super(config);
    },


    /** @return  JSON z atrybutami*/
    toJSON: function(){
        return logicjs._toJSON(this);
    },

    load : function(obj){
        this.attrs = obj.attrs;
    }

});

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



});logicjs.Connector =  Kinetic.Group.extend({
    init: function(config) {
        var that = this;
        this.setDefaultAttrs({
            draggable:false,
            points : [0,0,10,10]
        });
        this.oType = 'Connector';
        // call super constructor
        this._super(config);



        this.add(new logicjs.Anchor({
            name:'anchor',
            x : that.getAttrs().points[0].x,
            y : that.getAttrs().points[0].y,
            draggable  : true
        }));
        this.add(new logicjs.Anchor({
            name:'anchor',
            x : that.getAttrs().points[that.getAttrs().points.length-1].x,
            y : that.getAttrs().points[that.getAttrs().points.length-1].y,
            draggable  : true
        }));
       // this.drawLine();
        this.add(new Kinetic.Line({
            name : 'line',
            points : that.getAttrs().points,
            strokeWidth : 2,
            stroke : 'black'

        }));
        this.on('dragmove', function(e){
           that.drawLine();
        });

        this._getLine().on('click', function(){
            console.log('line click!');
        });


    },

    drawLine : function(){
        console.log(this);
        var anchors = this.get('.anchor');
        var points = [];
        for (var i=0; i<anchors.length; i++){
            points.push(anchors[i].getPosition());
        }
        console.log(points);
        var line  = this.get('.line')[0];
        line.setPoints(points);
        line.moveToBottom();
        //line.saveImageData();
        console.log(this.get('.line'));
       // this.get('.line').moveToBottom();
    },

    _getLine : function(){

        return this;
        var line = {};
        if (this.get('.line').length() == 0){

        }
        else{
            return _.filter(this.getChildren(),function(child){
                return child.getName() == 'line'
            })[0];
        }
    },


    /** @return  JSON z atrybutami*/
    toJSON: function(){
        var json = logicjs._toJSON(this);
        json.inputs = [];

        var inputs = this.get('.input');
        for(var n = 0; n < inputs.length; n++) {
            var input = inputs[n];
            json.inputs.push(input.toJSON());
        };
        return json;

    },

    load : function(obj){
        this.attrs = obj.attrs;
        var inputs = obj.inputs;
        for (var n; n<obj.inputs.length; n++){
            this.add(new logicjs.Anchor(obj.inputs[n]));
        }
    }
});logicjs.Workflow =  Kinetic.Stage.extend({
    init: function(config) {
        this.setDefaultAttrs({
               // container : $('#container')
        });

        this.oType = 'Workflow';
        // call super constructor
        this._super(config);

        this.add(new Kinetic.Layer({
            id : 'mainLayer'
        }));

        this.add(new Kinetic.Layer({
            id : 'topLayer'
        }));

    },

    addGate : function(coords){
        var and = new logicjs.And(coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);
        mainLayer.add(new logicjs.Connector({
            points: [73, 70, 340, 23, 450, 60, 500, 20],
            stroke: "black",
            strokeWidth: 2

        }));
        mainLayer.draw();
        //this.draw();

    }

})

