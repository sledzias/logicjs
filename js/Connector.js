logicjs.Connector =  Kinetic.Group.extend({
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
});