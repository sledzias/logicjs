logicjs.Connector =  Kinetic.Group.extend({
    init: function(config) {
        var that = this;
        this.setDefaultAttrs({
            draggable:false,
            points : [0,0,10,10],
            stroke: "black",
            strokeWidth: 2
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

        //return this;
        var line = {};

            return _.filter(this.getChildren(),function(child){
                return child.getName() == 'line'
            })[0];

    },

    _getAnchors : function(){
        return _.filter(this.getChildren(),function(child){
                return child.getName() == 'anchor';
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
});