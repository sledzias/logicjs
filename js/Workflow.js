logicjs.Workflow =  Kinetic.Stage.extend({
    init: function(config) {
        this.setDefaultAttrs({
                selectedItems : []
               // container : $('#container')
        });

        this.oType = 'Workflow';
        // call super constructor
        this._super(config);

        this.add(new Kinetic.Layer({
            id : 'mainLayer'
        }));

        this.add(new Kinetic.Layer({
            id : 'topLayer'
        }));
        this.add(new Kinetic.Layer({
            id : 'connectorsLayer'
        }));

        this.get('#mainLayer')[0].add(new Kinetic.Rect({
           x : 0,
           y : 0,
           width : this.getAttrs().width,
           height : this.getAttrs().height,
           fill : 'white',
           alpha : 0

        }));

        this.on('click', function(){
            this.clearSelectedItems();
            console.log('stage click');
        });
    },

    addGate : function(coords,gate){
        var and = new logicjs[gate](coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);

        mainLayer.draw();



    },

    makeConnector : function(anchor){
        var connector = new logicjs.Connector({
            points : [anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y,
                      anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y],
            stroke: "black",
            strokeWidth: 2
        });
      //  connector.connectTo([anchor]);
        this.get('#connectorsLayer')[0].add(connector);
        connector._getAnchors()[0]._initDrag();
        connector._getAnchors()[1].connectTo(anchor);
        this.draw();


    },
    /**
     * serialize stage and children as a JSON object and return
     *  the result as a json string
     * @name toJSON
     * @methodOf Kinetic.Stage.prototype
     */
    toJSON: function() {
        var type = Kinetic.Type;

        function addNode(node) {
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

            if(node.nodeType !== 'Shape') {
                obj.children = [];

                var children = node.getChildren();
                for(var n = 0; n < children.length; n++) {
                    var child = children[n];
                    obj.children.push(addNode(child));
                }
            }

            return obj;
        }
        return JSON.stringify(addNode(this));
    },
    /**
     * load stage with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     * 	serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage()
     * @name load
     * @methodOf Kinetic.Stage.prototype
     * @param {String} JSON string
     */
    load: function(json) {
        this.reset();

        function loadNode(node, obj) {
            var children = obj.children;
            if(children !== undefined) {
                for(var n = 0; n < children.length; n++) {
                    var child = children[n];
                    var type;

                    // determine type
                    if(child.nodeType === 'Shape') {
                        // add custom shape
                        if(child.shapeType === undefined) {
                            type = 'Shape';
                        }
                        // add standard shape
                        else {
                            type = child.shapeType;
                        }
                    }
                    else {
                        type = child.nodeType;
                    }
                    try{
                        var no = new Kinetic[type](child.attrs);

                    }
                   catch(e){
                        console.log(type);

                       var no = new logicjs[type](child.attrs);
                       if (type == 'Connector'){
                           no.removeChildren();
                       }


                   }
                    node.add(no);
                    loadNode(no, child);

                }
            }
        }
        var obj = JSON.parse(json);

        // copy over stage properties
        this.attrs = obj.attrs;

        loadNode(this, obj);

        this.draw();
        _.each(this.get('.connectorAnchor'),function(anchor){
            anchor.connectToHoverAnchor();
        });
    },

    removeSelectedItem: function(item){
        this.getAttrs().selectedItems= _.without(this.getSelectedItems(), item);

    },

    addSelectedItem : function(item){
        if(_.indexOf(this.getSelectedItems(),item) == -1){
            this.getSelectedItems().push(item);
        };
    },
    getSelectedItems : function(){
        return this.getAttrs().selectedItems;
    },

    isSelectedItem : function(item){
        return _.indexOf(this.getSelectedItems(),item) > -1;
    },
    toggleSelectedItem : function(item){
       this.isSelectedItem(item) ? this.removeSelectedItem(item) : this.addSelectedItem(item);
       return this.isSelectedItem(item);
    },

    deleteSelectedItems : function(){
        _.each(this.getSelectedItems(),function(item){
            this.removeSelectedItem(item);
            item.eliminate();
        },this);
        this.draw();


    },
    clearSelectedItems : function(){
        _.each(this.getSelectedItems(), function(item){
           item.clearSelection();
        });
        this.draw();
    }

})

