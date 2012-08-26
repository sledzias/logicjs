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
logicjs.gatePinTypes = ['input', 'output','clock'];

logicjs.invertLogicState = function(state){
       if (_.isNaN(state) || !_.isNumber(state)){
           return NaN;
       }
       return state > 0 ? 0 : 1;
};logicjs.Gate =  Kinetic.Group.extend({
    init: function(config) {

        var that = this;
        // call super constructor
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Gate';
        this.nodeType = 'Gate';
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

        this.on('click', function(e){
             var isSelected = this.getStage().toggleSelectedItem(that);
            if (isSelected){
             that.getShape().setShadow({
                color: 'blue',
                blur: 10,
                offset: [0, 0],
                alpha: 1
            });
            }
            else{
                that.clearSelection();
            }
            that.getLayer().draw();

            e.cancelBubble = true;

        });

        this.on('mouseover',function(){
            $('body').css('cursor','pointer');
        });

        this.on('mouseout',function(){

            $('body').css('cursor','default');


        });

        this.on('rotationChange',function(){
            this.simulate('dragmove');
            this.getStage().draw();
        });



    },

    clearSelection : function(){
        this.getShape().setShadow(null);
        this.getLayer().draw();
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
        return _.first(_.filter(this.getChildren(),function(element){
            return element.getName() == 'shape'
        }));
    },
    eliminate : function(){
        _.each(this.getAnchors(), function(anchor){
            _.each(anchor.getConnectors(), function(connectorAnchor){
                connectorAnchor.getParent().eliminate();
            });

        });
        this.getLayer().remove(this);
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
        this.shapeType = 'And';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 44.000001,44.094484 C 36.824001,44.094484 25,44.094486 25,44.094486 L 25,18.095913 L 44.000001,18.094485 C 51.176001,18.094485 57.000001,23.918484 57.000001,31.094484 C 57.000001,38.270485 51.176001,44.094484 44.000001,44.094484 z M 57,31.094485 L 66.056394,31.094485 M 16,24.594486 L 25.00006,24.594486 M 16,37.594484 L 25.00006,37.594484',
            fill: 'white',
            name : 'shape',
            x : -25,
            y : -15,
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



});logicjs.Bulb =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0,
            logicState : 0


        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Bulb';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'm 388.99911,281.12 c -97.09359,-1.23472 -111.34892,90.69558 -109.55303,115.83883 1.80161,25.22294 9.03465,39.48689 33.22507,71.83804 18.63295,24.91881 26.9392,17.76298 26.93926,73.63403 0,8.08176 4.48992,16.16352 4.48992,16.16352 0,0 18.8575,17.95952 42.20486,17.06155 23.34736,-0.89797 44.89876,-15.2656 46.69476,-24.24534 1.7959,-8.97973 1.6993,-28.97787 8.0817,-52.98053 3.644,-13.70398 47.1176,-52.82453 53.8786,-87.10364 7.158,-36.29263 -7.9696,-128.97175 -105.96114,-130.20646 z',
       //    data : 'M 44.000001,44.094484 C 36.824001,44.094484 25,44.094486 25,44.094486 L 25,18.095913 L 44.000001,18.094485 C 51.176001,18.094485 57.000001,23.918484 57.000001,31.094484 C 57.000001,38.270485 51.176001,44.094484 44.000001,44.094484 z M 57,31.094485 L 66.056394,31.094485 M 16,24.594486 L 25.00006,24.594486 M 16,37.594484 L 25.00006,37.594484',
            name : 'shape',
            x : 0,
            y : 0,
            fill : 'red',
            stroke: 'black',
            strokeWidth : 1,
            //  scale : [1.5,1.5]
            scale : [0.17,0.17]
        }));









        this.add(new logicjs.GateAnchor({
            name:'input',
            x : 66,
            y : 103
        }));

        this.on('click', function(){
//            this.getAttrs().logicState = this.getAttrs().logicState == 1 ? 0 : 1;
//            console.log(this.getShape());
//            this.getAttrs().logicState == 1 ? this.getShape().setFill('green') :  this.getShape().setFill('red');
//            this.calculateOutputs();
//            this.getStage().draw();
        });
        this.calculateOutputs();


    },

    calculateOutputs : function(){
        var val = _.first(this.getAnchors('input')).getLogicStateInt();

        if(_.isNaN(val)){
            this.getShape().setFill('black')
        }
        else{
            val == 1 ? this.getShape().setFill('green') :  this.getShape().setFill('red');
        }


        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });

            try{
                this.getLayer().draw();
            }
        catch(e){

        }

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

        this.on('mouseover',function(){
            $('body').css('cursor','pointer');
        });

        this.on('mouseout',function(){

            $('body').css('cursor','default');


        });


        this.on('click', function(e){
            var isSelected = this.getStage().toggleSelectedItem(that);
            if(isSelected){
            that._getLine().setShadow({
                color: 'blue',
                blur: 10,
                offset: [0, 0],
                alpha: 0.7
            });
            }
            else{
                that.clearSelection();
            }
            that.getLayer().draw();
            e.cancelBubble = true;

        });

       _.bindAll(this,'setLogicState');

    },

    clearSelection : function(){
        this._getLine().setShadow(null);
        this.getLayer().draw();
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
        if (_.isObject(this.getParent()))  this.getParent().simulate('pinChange');
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
     *  @param {logicjs.Connector} connector; jezeli nie podany to usuwa wszystke polaczenia
     */
    disconnectFrom : function(connector){
        if (arguments.length == 0){
            this.getConnectors().splice(0,this.getConnectors().length);
        }
        else{
        this.getConnectors().splice(_.indexOf(this.getConnectors(),connector),1);
        }
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

logicjs.High =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'High';
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

        this.add( new Kinetic.Text({
            x: 5,
            y: 5,
            text: "1",
            fontSize: 20,
            fontFamily: "Calibri",
            textFill: "black"
        }));

        this.add(new logicjs.GateAnchor({
            name:'output',
            x : 35,
            y : 15
        }));
        this.calculateOutputs();

    },

    calculateOutputs : function(){
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(1);
        });
    }



});logicjs.Low =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Low';
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

        this.add( new Kinetic.Text({
            x: 5,
            y: 5,
            text: "0",
            fontSize: 20,
            fontFamily: "Calibri",
            textFill: "black"
        }));


        this.add(new logicjs.GateAnchor({
            name:'output',
            x : 35,
            y : 15
        }));
        this.calculateOutputs();

    },

    calculateOutputs : function(){
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(0);
        });
    }



});logicjs.Nand =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Nand';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 114,44.09448 C 106.824,44.09448 95,44.094482 95,44.094482 L 95,18.095909 L 114,18.094481 C 121.176,18.094481 127,23.91848 127,31.09448 C 127,38.270481 121.176,44.09448 114,44.09448 z M 131,31.094482 C 131,32.198482 130.104,33.094482 129,33.094482 C 127.896,33.094482 127,32.198482 127,31.094482 C 127,29.990482 127.896,29.094482 129,29.094482 C 130.104,29.094482 131,29.990482 131,31.094482 z M 130.9997,31.094481 L 139.99976,31.094481 M 86,24.594478 L 95.00006,24.594478 M 86,37.594476 L 95.00006,37.594476',
            fill: 'white',
            name : 'shape',
            x : -130,
            y : -15,
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
            console.log(memo);
            return memo * anchor.getLogicStateInt();
        },1);
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});logicjs.Nor =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = "Nor";
       // this.nodeType = 'Nor';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 95,77.094482 L 95,77.156982 C 97.19873,80.972154 98.46875,85.377694 98.46875,90.094482 C 98.46875,94.81127 97.19873,99.21681 95,103.03199 L 95,103.09449 L 98.46875,103.09449 L 108.46875,103.09449 C 118.07946,103.09449 126.46882,97.855186 130.96875,90.094482 C 126.46882,82.333779 118.07946,77.094483 108.46875,77.094482 L 98.46875,77.094482 L 95,77.094482 z M 135,90.094848 C 135,91.198848 134.104,92.094848 133,92.094848 C 131.896,92.094848 131,91.198848 131,90.094848 C 131,88.990848 131.896,88.094848 133,88.094848 C 134.104,88.094848 135,88.990848 135,90.094848 z M 134.99973,90.094481 L 144.00032,90.094481 M 88.5,83.594487 L 97.50006,83.594487 M 88.5,96.594485 L 97.50006,96.594485',
            fill: 'white',
            name : 'shape',
            x : -132,
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
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});logicjs.Not =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Not';
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



});logicjs.Nxor =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Nxor';
        // call super constructor


        this.add(new Kinetic.Path({
            data : 'M 100,136.09448 L 100,136.15698 C 102.19873,139.97215 103.46875,144.37769 103.46875,149.09448 C 103.46875,153.81127 102.19873,158.21681 100,162.03198 L 100,162.09448 L 103.46875,162.09448 L 113.46875,162.09448 C 123.07946,162.09448 131.46882,156.85518 135.96875,149.09448 C 131.46882,141.33378 123.07946,136.09448 113.46875,136.09448 L 103.46875,136.09448 L 100,136.09448 z M 95,136.15698 C 97.19873,139.97215 98.46875,144.37769 98.46875,149.09448 C 98.46875,153.81127 97.19873,158.21681 95,162.03198 M 140,149.09521 C 140,150.19921 139.104,151.09521 138,151.09521 C 136.896,151.09521 136,150.19921 136,149.09521 C 136,147.99121 136.896,147.09521 138,147.09521 C 139.104,147.09521 140,147.99121 140,149.09521 z M 140,149.0945 L 149.00006,149.0945 M 88.5,142.59448 L 97.50006,142.59448 M 88.5,155.59448 L 97.50006,155.59448',
            fill: 'white',
            name : 'shape',
            x : -135,
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
            x : 84,
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
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function(anchor){
            anchor.setLogicStateInt(val);
        });
    }



});logicjs.Or =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Or';
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



});logicjs.Switch =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0,
            logicState : 0


        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Switch';

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
            console.log('switch click');
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



});logicjs.Workflow =  Kinetic.Stage.extend({
    init: function(config) {
        this.setDefaultAttrs({
                selectedItems : []
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

        this.get('#mainLayer')[0].add(new Kinetic.Rect({
           x : 0,
           y : 0,
           width : this.getAttrs().width,
           height : this.getAttrs().height,
           fill : 'white',
           alpha : 0

        }));

        this.on('click', function(){
            this.clearSelectedItems();
            console.log('stage click');
        });
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

                       if (type == 'Gate') {
                           type = child.shapeType;
                           child.children=[];
                       }
                           var no = new logicjs[type](child.attrs);

                       if (child.nodeType == 'Connector'){

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
    },

    removeSelectedItem: function(item){
        this.getAttrs().selectedItems= _.without(this.getSelectedItems(), item);

    },

    addSelectedItem : function(item){
        if(_.indexOf(this.getSelectedItems(),item) == -1){
            this.getSelectedItems().push(item);
        };
    },
    getSelectedItems : function(){
        return this.getAttrs().selectedItems;
    },

    isSelectedItem : function(item){
        return _.indexOf(this.getSelectedItems(),item) > -1;
    },
    toggleSelectedItem : function(item){
       this.isSelectedItem(item) ? this.removeSelectedItem(item) : this.addSelectedItem(item);
       return this.isSelectedItem(item);
    },

    deleteSelectedItems : function(){
        _.each(this.getSelectedItems(),function(item){
            this.removeSelectedItem(item);
            item.eliminate();
        },this);
        this.draw();


    },
    clearSelectedItems : function(){
        _.each(this.getSelectedItems(), function(item){
           item.clearSelection();
           this.removeSelectedItem(item);
        },this);
        this.draw();
    },
    rotateLeftSelectedItems : function(){
        _.each(this.getSelectedItems(),function(item){
            if(item.oType != 'Connector'){
                item.setRotationDeg(item.getRotationDeg() - 90);
            }
        });

    },

    rotateRightSelectedItems : function(){
        _.each(this.getSelectedItems(),function(item){
            if(item.oType != 'Connector'){
                item.setRotationDeg(item.getRotationDeg() + 90);
            }
        });
    }

})

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