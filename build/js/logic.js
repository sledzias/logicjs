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

        this.on('dragmove',function(){
            _.each(this.getAnchors(),function(anchor){
                    anchor.notifyConnectors();
            });
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
    },

    /**
     * zwraca wszystkie piny danej bramki
     * todo dodac parametr listy, ktory ograniczalby piny do wejsciowych,wyjsciowych,zegara
     */
    getAnchors : function(){
           return _.filter(this.getChildren(),function(element){
               return _.indexOf(['input','output'],element.getName()) > -1;
           });
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

        this.on('mouseover',function(){
            $('body').css('cursor','pointer');
        });

        this.on('mouseout',function(){

                $('body').css('cursor','default');


        });


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
       var  anchor = new logicjs.GateAnchor({
            name:'input',
            x : 0,
            y : 20
        });
        this.add(anchor);



        this.add(new logicjs.GateAnchor({
            name:'input',
            x : 0,
            y : 40
        }));

        this.add(new logicjs.GateAnchor({
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



        this.add(new logicjs.ConnectorAnchor({
            name:'anchor',
            x : that.getAttrs().points[0].x,
            y : that.getAttrs().points[0].y,
            draggable  : true
        }));
        this.add(new logicjs.ConnectorAnchor({
            name:'anchor',
            x : that.getAttrs().points[that.getAttrs().points.length-1].x,
            y : that.getAttrs().points[that.getAttrs().points.length-1].y,
            draggable  : true
        }));
       // this.drawLine();
        this.line =new Kinetic.Line({
            name : 'line',
            points : that.getAttrs().points,
            strokeWidth : 4,
            stroke : 'black'

        });
        this.drawLine();
        this.add(this.line);
        this.on('dragmove dragend', function(e){
           that.drawLine();
            this.getLayer().draw();
        });

        this.on('dragend mouseout ', function(e){
            this._getLine().saveImageData();
        });

        this._getLine().on('click', function(){
            console.log('line click!');
        });


    },

    drawLine : function(){
    //    console.log(this);
        var anchors = this._getAnchors();
        var points = [];
        for (var i=0; i<anchors.length; i++){
            points.push(anchors[i].getPosition());
        }
       // console.log(points);
        var line  = this.line;
        line.setPoints(points);
        if (line.getParent() !== undefined){
            line.moveToBottom();
        }

        //line.saveImageData();
       // console.log(this.get('.line'));
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

    _getAnchors : function(){
        return _.filter(this.getChildren(),function(child){
                return child.getName() == 'anchor';
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
});logicjs.ConnectorAnchor =  logicjs.Anchor.extend({
    init: function(config) {
        this.oType = 'ConnectorAnchor';
        // call super constructor
        this._super(config);
        this.on('dragstart',function(){
            this.getParent().moveToTop();

        });
        this.on('dragmove',function(e){
            var anchors = this.getDroppedAnchors(e);
            if (anchors.length > 0){
                this.setFill('green');
                this.setRadius(7);
            }
            else{
                this.setFill('#ddd');
                this.setRadius(5);
            }
        });
        this.on('dragend',function(e){
            var anchors = this.getDroppedAnchors(e);
            if (anchors.length > 0){
                this.connectTo(_.first(anchors));

            }
            else{
                this.disconnectFrom();
            }
        });


    },

    /**
     * pobiera wszystkie piny ktore znajduja sie pod kursorem
     * @return {Array}
     */
    getDroppedAnchors : function(e,selection){
       selection = selection == undefined ? ['input','output'] : selection;
       return _.filter(this.getStage().getIntersections({x:e.layerX,y :e.layerY}),function(element){
            var elementName = element.getName();
            return  _.indexOf(selection,elementName) > -1;
        });
    },

    /**
     * Aktualizacja pozycji pinu
     * @param {Object} pozycja {x,y}
     */
    updatePosition : function(pos){
        this.setPosition(pos);
        this.simulate('dragmove');
    },

    connectTo : function(anchor){
        if (this.getAttrs().connectedAnchor != null){
            this.disconnectFrom();
        }
        this.getAttrs().connectedAnchor =   anchor ;
        anchor.connectTo(this);
    },

    disconnectFrom : function(){
        if(this.getAttrs().connectedAnchor != null){
            this.getAttrs().connectedAnchor.disconnectFrom(this);
        }
    }



});

logicjs.GateAnchor =  logicjs.Anchor.extend({
    init: function(config) {

        // call super constructor
        this._super(config);
        this.oType = 'GateAnchor';
        this.getAttrs().connectors = [];
    },

    /**
     * Polaczenie pinu do connectora
     * @param {logicjs.Connector} connector
     */
    connectTo : function(connector){
        if (_.indexOf(this.getConnectors(),connector) == -1){
            this.getAttrs().connectors.push(connector);
        }
        return connector;
    },

    /**
     *  Usuwa wybrane polaczenie
     *  @param {logicjs.Connector} connector
     */
    disconnectFrom : function(connector){
        this.getConnectors().splice(_.indexOf(this.getConnectors(),connector),1);
    },

    getConnectors : function(){
        return this.getAttrs().connectors;
    },

    notifyConnectors : function(){
        console.log('anchor '+this._id + this.getConnectors());
        _.each(this.getConnectors(),function(connector){
                connector.updatePosition(this.getAbsolutePosition());
        },this);
    }


});

logicjs.Workflow =  Kinetic.Stage.extend({
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
        this.add(new Kinetic.Layer({
            id : 'connectorsLayer'
        }));

    },

    addGate : function(coords){
        var and = new logicjs.And(coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);
        this.get('#connectorsLayer')[0].add(new logicjs.Connector({
            points: [73, 70, 340, 23, 450, 60, 500, 20],
            stroke: "black",
            strokeWidth: 2

        }));
        mainLayer.draw();
        this.get('#connectorsLayer')[0].draw();
        //this.draw();

    }

})

