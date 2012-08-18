logicjs.GateAnchor =  logicjs.Anchor.extend({
    init: function(config) {

        // call super constructor
        this._super(config);
        this.oType = 'GateAnchor';
        this.shapeType = 'GateAnchor';
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
        if (this.getName()=='input'){
            this.setLogicState(connector.getLogicState());
        }
        return connector;
    },

    /**
     *  Usuwa wybrane polaczenie
     *  @param {logicjs.Connector} connector
     */
    disconnectFrom : function(connector){
        this.getConnectors().splice(_.indexOf(this.getConnectors(),connector),1);
        if (this.getName()=='input'){
            this.setLogicState('undefined');
        }
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
    },
    triggerLogicState : function(){
        if(this.getName()=='input'){
            this.getParent().simulate('pinChanged');
        }
        else if (this.getName() == 'output'){
            _.each(this.getConnectors(), function(anchorConnector){
               anchorConnector.setLogicState(this.getLogicState());
            },this);
        }
    },
    calculateOutputs : function(){


        _.each(this.getAnchors('outputs'), function(anchor){
            anchor.setLogicState('undefined');
        });
    }



});

