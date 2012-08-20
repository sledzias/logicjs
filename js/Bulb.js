logicjs.Bulb =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0,
            logicState : 0


        });
        this._super(config);
        this.oType = 'Gate';
        this.nodeType = 'Bulb';
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



});