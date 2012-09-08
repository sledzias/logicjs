logicjs.GateAnchor =  logicjs.Anchor.extend({
    init: function(config) {

        // call super constructor
        this._super(config);
        this.oType = 'GateAnchor';
        this.shapeType = 'GateAnchor';
        this.getAttrs().connectors = [];
        this.on('mousedown',function(e){
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

    /**
     * zwraca polaczenia polaczone z pinem
     * @return {Array}
     */
    getConnectors : function(){
        return this.getAttrs().connectors;
    },

    /**
     * Powiadamia polaczone polaczenia o zmianie pozycji na obszarze roboczym
     * @param event_str
     */
    notifyConnectors : function(event_str){
        _.each(this.getConnectors(),function(connector){
                connector.updatePosition(this.getAbsolutePosition());
                if(event_str == 'dragend'){
                    // wymuszenie m.in. oktualizacji saveImageData()
                    connector.getParent().simulate(event_str);
                }
        },this);
    },

    /**
     *  dla pinu wejsciowego: powiadamia bramke o zmianie stanu logicznego
     *  dla pinu wyjsciowego: powiadamia polaczone polaczenia o zmianie stanu logicznego
     */
    triggerLogicState : function(){
        if(this.getName()=='input'){
            this.getParent().simulate('pinChanged');
        }
        else if (this.getName() == 'output'){
            _.each(this.getConnectors(), function(anchorConnector){
               anchorConnector.setLogicState(this.getLogicState());
            },this);
        }
    }
});

