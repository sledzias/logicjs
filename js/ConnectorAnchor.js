logicjs.ConnectorAnchor =  logicjs.Anchor.extend({
    init: function(config) {
        this._super(config);
        this.oType = 'ConnectorAnchor';
        this.shapeType =  'ConnectorAnchor';
        this.setDefaultAttrs({
           name : 'connectorAnchor'
        });
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

    /**
     * tworzy polaczenie z pinem bramki
     * @param anchor
     */
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

    /**
     * zrywa polaczenie z pinem bramki
     */
    disconnectFrom : function(){
        if(this.getConnectedAnchor()!= null){
            this.getConnectedAnchor().disconnectFrom(this);
        };
        this.setConnectedAnchor(null);
    },

    /**
     * funkcja zwraca obiekt pinu, z ktorym jest polaczony lub null, jezeli nie ma takiego polaczenia
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

    /**
     * funckja usuwa polaczenie do ktorego nalezy pin
     */
    eliminate : function(){
        this.getParent().eliminate();
    },

    /**
     * tworzy polaczenie z pinem bramki, ktory znajduje sie pod pinem polaczenia
     */
    connectToHoverAnchor : function(){
        var anchors = this.getDroppedAnchors({layerX : this.getAbsolutePosition().x, layerY : this.getAbsolutePosition().y});
        if (anchors.length > 0){
           this.connectTo(_.first(anchors));
        }
        this.simulate('dragmove');
        this.getLayer().draw();
    },

    /**
     * informuje polaczenie lub bramke o zmianie stanu logicznego
     */
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

