logicjs.Gate =  Kinetic.Group.extend({
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

