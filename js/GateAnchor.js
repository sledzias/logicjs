logicjs.GateAnchor =  logicjs.Anchor.extend({
    init: function(config) {

        // call super constructor
        this._super(config);
        this.oType = 'GateAnchor';
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
        return connector;
    },

    /**
     *  Usuwa wybrane polaczenie
     *  @param {logicjs.Connector} connector
     */
    disconnectFrom : function(connector){
        this.getConnectors().splice(_.indexOf(this.getConnectors(),connector),1);
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
    }


});

