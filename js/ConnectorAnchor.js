logicjs.ConnectorAnchor =  logicjs.Anchor.extend({
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

