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
};

logicjs.logicStates = ['high', 'low', 'undefined'];
logicjs.gatePinTypes = ['input', 'output','clock'];logicjs.Gate =  Kinetic.Group.extend({
    init: function(config) {
        this.oType = 'Gate';
        this.shapeType = 'Gate';
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
                    anchor.notifyConnectors('dragmove');
            });
        });

        this.on('dragend',function(){
            _.each(this.getAnchors(),function(anchor){
                anchor.notifyConnectors('dragend');
            });
        });

        this.on('pinChanged', function(){
            this.calculateOutputs();
            console.log('pinchanged');
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
     */
    getAnchors : function(){
           arguments = _.flatten(arguments);
           var types = arguments.length != 0 ? arguments :  ['input','output','clock'];

           return _.filter(this.getChildren(),function(element){
               return _.indexOf(types,element.getName()) > -1;
           });
    },

    calculateOutputs : function(){
        console.log('Gate: calculateOutputs');
        _.each(this.getAnchors('outputs'), function(anchor){
           anchor.setLogicState('undefined');
        });
    },
    getShape : function(){
        return _.first(this.get('.shape'));
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
        this.shapeType = 'Anchor';
        // call super constructor
        this._super(config);

        this.on('mouseover',function(){
            $('body').css('cursor','pointer');
        });

        this.on('mouseout',function(){

                $('body').css('cursor','default');


        });


    },


    setLogicState : function(logicState){
        var s = logicState || 'undefined';

        s =  _.indexOf(logicjs.logicStates, s) > -1 ? s : 'undefined'

        this.getAttrs().logicState=s;
        this.triggerLogicState(s);
        console.log(this.getName()+' state ' + s);
    },

    getLogicState : function(){
        return this.getAttrs().logicState || 'undefined';
    },

    getLogicStateInt : function(){
        switch(this.getLogicState()){
            case 'high':
                return 1;
            case 'low':
                return 0;
            default:
                return NaN;
        }
    },

    setLogicStateInt : function(logicStateInt){
        if(_.isNaN(logicStateInt) || _.isUndefined(logicStateInt)){
            this.setLogicState('undefined');
            return;
        }
        if (logicStateInt == 1){
            this.setLogicState('high');
            return;
        }
        if (logicStateInt == 0){
            this.setLogicState('low');
            return;
        }
    },

    // funkcja wirtualna, do implemetacji w GateAnchor i ConnectorAnchor
    triggerLogicState : function(s){

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
        this._super(config);
        this.oType = 'Gate';
        this.nodeType = 'And';
        // call super constructor


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
        this.calculateOutputs();

    },

    calculateOutputs : function(){
        console.log('And: calculateOutputs');
        var val = _.reduce(this.getAnchors('input'), function(memo, anchor){
            console.log(memo);
            return memo * anchor.getLogicStateInt();
        },1);
        console.log(val);

        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});logicjs.Connector =  Kinetic.Group.extend({
    init: function(config) {
        var that = this;
        this.setDefaultAttrs({
            draggable:false,
            points : [0,0,10,10],
            stroke: "black",
            strokeWidth: 2
        });
        this._super(config);
        this.oType = 'Connector';
        this.nodeType = 'Connector';
        // call super constructor




        this.add(new logicjs.ConnectorAnchor({

            x : that.getAttrs().points[0].x,
            y : that.getAttrs().points[0].y,
            draggable  : true
        }));
        this.add(new logicjs.ConnectorAnchor({

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
        this.on('pinChanged', this.setLogicState);

       _.bindAll(this,'setLogicState');

    },

    setLogicState : function(){
        console.log(this);
        var connectedToInputAnchor = _.first(_.filter(this._getAnchors(),function(anchor){
            return anchor.isConnectedTo('input');
        }));

        var connectedToOutputAnchor = _.first(_.filter(this._getAnchors(),function(anchor){
            return anchor.isConnectedTo('output');
        }));

        var disconnectedAnchor = _.first(_.filter(this._getAnchors(),function(anchor){
            return !anchor.isConnectedTo();
        }));

        var state = _.isObject(connectedToOutputAnchor) ? connectedToOutputAnchor.getLogicState() : 'undefined';

        if (_.isObject(connectedToInputAnchor)){
           connectedToInputAnchor.setLogicState(state);
        }

        if (_.isObject(disconnectedAnchor)){
            disconnectedAnchor.setLogicState(state);
        }

        console.log(state);
        switch(state){
            case 'low':
                this._getLine().setStroke('red');
                break;
            case 'high':
                this._getLine().setStroke('green');
                break;
            default:
                this._getLine().setStroke('black');
                break;
        }
 


//        if (_.isObject(this.getStage())) this.getStage().draw();
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

        //return this;
        var line = {};

            return _.filter(this.getChildren(),function(child){
                return child.getName() == 'line'
            })[0];

    },

    _getAnchors : function(){
        return _.filter(this.getChildren(),function(child){
                return child.getName() == 'connectorAnchor';
        });
    },

    _setAnchors : function(anchors){
        for (var a in anchors) {
            this.add(anchors[a]);
        }
    },

    connectTo : function(gateAnchors){
        var anchors = [];
        for (var ga in gateAnchors){
            console.log(gateAnchors[ga]);
            var a = new logicjs.ConnectorAnchor({x : gateAnchors[ga].getAbsolutePosition().x, y : gateAnchors[ga].getAbsolutePosition().y});
            a.connectTo(gateAnchors[ga]);
            this.add(a);

        }
    },

    eliminate : function(){
        _.each(this._getAnchors(), function(anchor){
           anchor.disconnectFrom();
        });
        this.getLayer().remove(this);
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
        this._super(config);
        this.oType = 'ConnectorAnchor';
        this.shapeType =  'ConnectorAnchor';
        this.setDefaultAttrs({
           name : 'connectorAnchor'
        });
        this.on('dragstart',function(){
            this.getParent().moveToTop();
            console.log('connector anchor dragstart');

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
              this.eliminate();

            }
            this.simulate('dragmove');
            this.getLayer().draw();
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
        if (this.getConnectedAnchor() != null){
            this.disconnectFrom();
        }
        this.setConnectedAnchor(anchor) ;
        this.setPosition(anchor.getAbsolutePosition());
        anchor.connectTo(this);
        this.setLogicState(anchor.getLogicState());
        this.getParent().simulate('pinChange');
    },

    disconnectFrom : function(){
        if(this.getConnectedAnchor()!= null){
            this.getConnectedAnchor().disconnectFrom(this);
        };
        this.setConnectedAnchor(null);
    },

    /**
     * funcka zwraca obiekt pinu, z ktorym jest polaczony lub null, jezeli nie ma takiego polaczenia
     * @return {*}
     */
    getConnectedAnchor : function(){
        if (this.getAttrs().connectedAnchor == undefined){
            return null;
        }
        return this.getAttrs().connectedAnchor;
    },
    /**
     * ustawia obiekt pinu, z ktorym jest polaczony lub null, jezeli nie ma takiego polaczenia
     * @return {*} zwraca poprzednia wartosc
     */
    setConnectedAnchor : function(anchor){
        var old = this.getAttrs().connectedAnchor;
        this.getAttrs().connectedAnchor = anchor;
        return old;

    },
    eliminate : function(){
        this.getParent().eliminate();
    },

    connectToHoverAnchor : function(){
        var anchors = this.getDroppedAnchors({layerX : this.getAbsolutePosition().x, layerY : this.getAbsolutePosition().y});
        if (anchors.length > 0){
           this.connectTo(_.first(anchors));
        }
        this.simulate('dragmove');
        this.getLayer().draw();
    },

    triggerLogicState : function(){
       if(this.isConnectedTo('output')){
            this.getParent().simulate('pinChanged');
       }
       else if(this.isConnectedTo('input') || this.isConnectedTo('clock')){
           this.getConnectedAnchor().setLogicState(this.getLogicState());
       }
    },

    /**
     * zwraca informacje, czy pin jest polaczony do podanego typu lub czy wogole jest polaczony, jezeli argument pusty.
     * @param {string} jeden z typow logicjs.gatePinTypes lub pusty
     */
    isConnectedTo : function(){
        var types = _.toArray(arguments).length == 0 ? logicjs.gatePinTypes : _.toArray(arguments);

        return this.getConnectedAnchor() && _.indexOf(types,this.getConnectedAnchor().getName()) > -1;
    }





});

logicjs.GateAnchor =  logicjs.Anchor.extend({
    init: function(config) {

        // call super constructor
        this._super(config);
        this.oType = 'GateAnchor';
        this.shapeType = 'GateAnchor';
        this.getAttrs().connectors = [];
        this.on('mousedown',function(e){
            console.log('anchor mousedown')
            e.cancelBubble = true;
            this.getStage().makeConnector(this);

        });
    },

    /**
     * Polaczenie pinu do connectora
     * @param {logicjs.Connector} connector
     */
    connectTo : function(connector){
        if (_.indexOf(this.getConnectors(),connector) == -1){
            this.getAttrs().connectors.push(connector);
        }
        if (this.getName()=='input'){
            this.setLogicState(connector.getLogicState());
        }
        return connector;
    },

    /**
     *  Usuwa wybrane polaczenie
     *  @param {logicjs.Connector} connector
     */
    disconnectFrom : function(connector){
        this.getConnectors().splice(_.indexOf(this.getConnectors(),connector),1);
        if (this.getName()=='input'){
            this.setLogicState('undefined');
        }
    },

    getConnectors : function(){
        return this.getAttrs().connectors;
    },

    notifyConnectors : function(event_str){
       // console.log('anchor '+this._id + this.getConnectors());
        _.each(this.getConnectors(),function(connector){
                connector.updatePosition(this.getAbsolutePosition());
                if(event_str == 'dragend'){
                    // wymuszenie m.in. oktualizacji saveImageData()
                    connector.getParent().simulate(event_str);
                }
        },this);
    },
    triggerLogicState : function(){
        if(this.getName()=='input'){
            this.getParent().simulate('pinChanged');
        }
        else if (this.getName() == 'output'){
            _.each(this.getConnectors(), function(anchorConnector){
               anchorConnector.setLogicState(this.getLogicState());
            },this);
        }
    },
    calculateOutputs : function(){


        _.each(this.getAnchors('outputs'), function(anchor){
            anchor.setLogicState('undefined');
        });
    }



});

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
        this.add(new Kinetic.Layer({
            id : 'connectorsLayer'
        }));

    },

    addGate : function(coords,gate){
        var and = new logicjs[gate](coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);

        mainLayer.draw();



    },

    makeConnector : function(anchor){
        var connector = new logicjs.Connector({
            points : [anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y,
                      anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y],
            stroke: "black",
            strokeWidth: 2
        });
      //  connector.connectTo([anchor]);
        this.get('#connectorsLayer')[0].add(connector);
        connector._getAnchors()[0]._initDrag();
        connector._getAnchors()[1].connectTo(anchor);
        this.draw();


    },
    /**
     * serialize stage and children as a JSON object and return
     *  the result as a json string
     * @name toJSON
     * @methodOf Kinetic.Stage.prototype
     */
    toJSON: function() {
        var type = Kinetic.Type;

        function addNode(node) {
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

            if(node.nodeType !== 'Shape') {
                obj.children = [];

                var children = node.getChildren();
                for(var n = 0; n < children.length; n++) {
                    var child = children[n];
                    obj.children.push(addNode(child));
                }
            }

            return obj;
        }
        return JSON.stringify(addNode(this));
    },
    /**
     * load stage with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     * 	serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage()
     * @name load
     * @methodOf Kinetic.Stage.prototype
     * @param {String} JSON string
     */
    load: function(json) {
        this.reset();

        function loadNode(node, obj) {
            var children = obj.children;
            if(children !== undefined) {
                for(var n = 0; n < children.length; n++) {
                    var child = children[n];
                    var type;

                    // determine type
                    if(child.nodeType === 'Shape') {
                        // add custom shape
                        if(child.shapeType === undefined) {
                            type = 'Shape';
                        }
                        // add standard shape
                        else {
                            type = child.shapeType;
                        }
                    }
                    else {
                        type = child.nodeType;
                    }
                    try{
                        var no = new Kinetic[type](child.attrs);

                    }
                   catch(e){
                        console.log(type);

                       var no = new logicjs[type](child.attrs);
                       if (type == 'Connector'){
                           no.removeChildren();
                       }


                   }
                    node.add(no);
                    loadNode(no, child);

                }
            }
        }
        var obj = JSON.parse(json);

        // copy over stage properties
        this.attrs = obj.attrs;

        loadNode(this, obj);

        this.draw();
        _.each(this.get('.connectorAnchor'),function(anchor){
            anchor.connectToHoverAnchor();
        });
    }

})

