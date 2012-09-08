logicjs.Workflow = Kinetic.Stage.extend({
    init:function (config) {
        this.setDefaultAttrs({
            selectedItems:[]
            // container : $('#container')
        });

        this.oType = 'Workflow';
        // call super constructor
        this._super(config);

        this.add(new Kinetic.Layer({
            id:'mainLayer'
        }));

        this.add(new Kinetic.Layer({
            id:'topLayer'
        }));
        this.add(new Kinetic.Layer({
            id:'connectorsLayer'
        }));

        this.get('#mainLayer')[0].add(new Kinetic.Rect({
            x:0,
            y:0,
            width:this.getAttrs().width,
            height:this.getAttrs().height,
            fill:'white',
            alpha:0

        }));

        this.on('click', function () {
            this.clearSelectedItems();
        });
    },

    /**
     * dodaje bramke do sceny
     * @param coords pozycja na ktorej ma zostac umieszczona bramka
     * @param gate nazwa bramki ktora ma powstac
     */
    addGate:function (coords, gate) {
        var and = new logicjs[gate](coords);
        var mainLayer = this.get('#mainLayer')[0];
        mainLayer.add(and);

        mainLayer.draw();
    },


    /**
     * tworzy polaczenie miedzy bramkami
     * @param anchor
     */
    makeConnector:function (anchor) {
        var connector = new logicjs.Connector({
            points:[anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y,
                anchor.getAbsolutePosition().x, anchor.getAbsolutePosition().y],
            stroke:"black",
            strokeWidth:2
        });

        this.get('#connectorsLayer')[0].add(connector);
        connector._getAnchors()[0]._initDrag();
        connector._getAnchors()[1].connectTo(anchor);
        this.draw();
    },

    /**
     * Serializuje scene do formatu json
     *   @name toJSON
     */
    toJSON:function () {
        var type = Kinetic.Type;

        function addNode(node) {
            var obj = {};

            obj.attrs = {};


            for (var key in node.attrs) {
                var val = node.attrs[key];
                if (!type._isFunction(val) && !type._isElement(val) && !type._hasMethods(val)) {
                    obj.attrs[key] = val;
                }
            }

            obj.nodeType = node.nodeType;
            obj.shapeType = node.shapeType;

            if (node.nodeType !== 'Shape') {

                obj.children = [];

                var children = node.getChildren();
                for (var n = 0; n < children.length; n++) {
                    var child = children[n];
                    obj.children.push(addNode(child));
                }
            }

            return obj;
        }

        return JSON.stringify(addNode(this));
    },
    /**
     * wczytuje dane z fomratu json i tworzy scene
     * @name load
     * @methodOf Kinetic.Stage.prototype
     * @param {String} JSON string
     */
    load:function (json) {
        this.reset();

        function loadNode(node, obj) {
            var children = obj.children;
            if (children !== undefined) {
                for (var n = 0; n < children.length; n++) {
                    var child = children[n];
                    var type;

                    // determine type
                    if (child.nodeType === 'Shape') {
                        // add custom shape
                        if (child.shapeType === undefined) {
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
                    try {
                        var no = new Kinetic[type](child.attrs);

                    }
                    catch (e) {
                        if (type == 'Gate') {
                            type = child.shapeType;
                            child.children = [];
                        }
                        var no = new logicjs[type](child.attrs);

                        if (child.nodeType == 'Connector') {

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
        _.each(this.get('.connectorAnchor'), function (anchor) {
            anchor.connectToHoverAnchor();
        });
        _.each(this.get('.switch-button'), function (anchor) {
            anchor.simulate('click');
        });
    },

    /**
     * usuwa zaznaczenie ze wskazanego obiektu
     * @param item
     */
    removeSelectedItem:function (item) {
        this.getAttrs().selectedItems = _.without(this.getSelectedItems(), item);

    },

    /**
     * Dodaje zaznaczenie do wskazanego obiektu
     * @param item
     */
    addSelectedItem:function (item) {
        if (_.indexOf(this.getSelectedItems(), item) == -1) {
            this.getSelectedItems().push(item);
        }
        ;
    },

    /**
     * zwraca zaznaczone obiektu
     * @return {Array}
     */
    getSelectedItems:function () {
        return this.getAttrs().selectedItems;
    },

    /**
     * funkcja sprawdza, czy obiekt jest zaznaczony
     * @param item
     * @return {Boolean}
     */
    isSelectedItem:function (item) {
        return _.indexOf(this.getSelectedItems(), item) > -1;
    },

    /**
     * Odwraca zaznaczneie obiektu
     * @param item
     * @return {Boolean}
     */
    toggleSelectedItem:function (item) {
        this.isSelectedItem(item) ? this.removeSelectedItem(item) : this.addSelectedItem(item);
        return this.isSelectedItem(item);
    },

    /**
     * usuwa zaznaczone obiekty
     */
    deleteSelectedItems:function () {
        _.each(this.getSelectedItems(), function (item) {
            this.removeSelectedItem(item);
            item.eliminate();
        }, this);
        this.draw();


    },

    /**
     * usuwa zaznaczenie ze wszystkich obiektow
     */
    clearSelectedItems:function () {
        _.each(this.getSelectedItems(), function (item) {
            item.clearSelection();
            this.removeSelectedItem(item);
        }, this);
        this.draw();
    },

    /**
     * obraca lewoskretnie zaznaczone obiekty
     */
    rotateLeftSelectedItems:function () {
        _.each(this.getSelectedItems(), function (item) {
            if (item.oType != 'Connector') {
                item.setRotationDeg(item.getRotationDeg() - 90);
            }
        });

    },

    /**
     * obraca prawoskretnie zaznaczone obiekty
     */
    rotateRightSelectedItems:function () {
        _.each(this.getSelectedItems(), function (item) {
            if (item.oType != 'Connector') {
                item.setRotationDeg(item.getRotationDeg() + 90);
            }
        });
    }

})

