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

