var logicjs = {};


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
        this.setDefaultAttrs({
            radius:5,
            stroke:"black",
            fill:"#ddd",
            strokeWidth:2,
            draggable:false
        });
        this.oType = 'Gate';
        // call super constructor
        this._super(config);
//        this.add(new logicjs.Anchor({
//            name:'input',
//            x : 0,
//            y : 10
//        }));



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
            radius:5,
            stroke:"black",
            fill:"#ddd",
            strokeWidth:2,
            draggable:false
        });
        this.oType = 'Gate';
        // call super constructor
        this._super(config);
        this.add(new logicjs.Anchor({
            name:'input',
            x : 0,
            y : 10
        }));

        this.add(new logicjs.Anchor({
            name:'input',
            x : 0,
            y : 50
        }));

        this.add(new logicjs.Anchor({
            name:'output',
            x : 0,
            y : 30
        }));
    }

});