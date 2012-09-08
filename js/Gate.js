logicjs.Gate = Kinetic.Group.extend({
    init:function (config) {
        var that = this;
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Gate';
        this.nodeType = 'Gate';
        this.on('dragstart', function () {
            this.moveToTop();
        });

        this.on('dragmove', function () {
            _.each(this.getAnchors(), function (anchor) {
                anchor.notifyConnectors('dragmove');
            });
        });

        this.on('dragend', function () {
            _.each(this.getAnchors(), function (anchor) {
                anchor.notifyConnectors('dragend');
            });
        });

        this.on('pinChanged', function () {
            this.calculateOutputs();
        });

        this.on('click', function (e) {
            var isSelected = this.getStage().toggleSelectedItem(that);
            if (isSelected) {
                that.getShape().setShadow({
                    color:'blue',
                    blur:10,
                    offset:[0, 0],
                    alpha:1
                });
            }
            else {
                that.clearSelection();
            }
            that.getLayer().draw();

            e.cancelBubble = true;

        });

        this.on('mouseover', function () {
            $('body').css('cursor', 'pointer');
        });

        this.on('mouseout', function () {

            $('body').css('cursor', 'default');


        });

        this.on('rotationChange', function () {
            this.simulate('dragmove');
            this.getStage().draw();
        });


    },

    /**
     * usuwa efekt zaznaczenia z bramki
     */
    clearSelection:function () {
        this.getShape().setShadow(null);
        this.getLayer().draw();
    },

    /** @return  JSON z atrybutami*/
    toJSON:function () {
        var json = logicjs._toJSON(this);
        json.inputs = [];

        var inputs = this.get('.input');
        for (var n = 0; n < inputs.length; n++) {
            var input = inputs[n];
            json.inputs.push(input.toJSON());
        }
        ;
        return json;

    },

    load:function (obj) {
        this.attrs = obj.attrs;
        var inputs = obj.inputs;
        for (var n; n < obj.inputs.length; n++) {
            this.add(new logicjs.Anchor(obj.inputs[n]));
        }
    },

    /**
     * zwraca wszystkie piny danej bramki
     */
    getAnchors:function () {
        arguments = _.flatten(arguments);
        var types = arguments.length != 0 ? arguments : ['input', 'output', 'clock'];

        return _.filter(this.getChildren(), function (element) {
            return _.indexOf(types, element.getName()) > -1;
        });
    },

    /**
     * funckja oblicza stan wyjscia bramki, funkcja do nadpisania w klasach rozszerzajacych
     */
    calculateOutputs:function () {
        _.each(this.getAnchors('outputs'), function (anchor) {
            anchor.setLogicState('undefined');
        });
    },

    getShape:function () {
        return _.first(_.filter(this.getChildren(), function (element) {
            return element.getName() == 'shape'
        }));
    },

    /**
     * funkcja usuwa bramke wraz ze wszystkimi polaczeniami polaczonymi do niej
     */
    eliminate:function () {
        _.each(this.getAnchors(), function (anchor) {
            _.each(anchor.getConnectors(), function (connectorAnchor) {
                connectorAnchor.getParent().eliminate();
            });

        });
        this.getLayer().remove(this);
    }

});

