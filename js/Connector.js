logicjs.Connector = Kinetic.Group.extend({
    init:function (config) {
        var that = this;
        this.setDefaultAttrs({
            draggable:false,
            points:[0, 0, 10, 10],
            stroke:"black",
            strokeWidth:2
        });
        this._super(config);
        this.oType = 'Connector';
        this.nodeType = 'Connector';
        this.add(new logicjs.ConnectorAnchor({

            x:that.getAttrs().points[0].x,
            y:that.getAttrs().points[0].y,
            draggable:true
        }));
        this.add(new logicjs.ConnectorAnchor({

            x:that.getAttrs().points[that.getAttrs().points.length - 1].x,
            y:that.getAttrs().points[that.getAttrs().points.length - 1].y,
            draggable:true
        }));
        this.line = new Kinetic.Line({
            name:'line',
            points:that.getAttrs().points,
            strokeWidth:4,
            stroke:'black'

        });
        this.drawLine();
        this.add(this.line);
        this.on('dragmove dragend', function (e) {

            that.drawLine();
            this.getLayer().draw();

        });

        this.on('dragend mouseout ', function (e) {
            this._getLine().saveImageData();
        });

        this.on('pinChanged', this.setLogicState);

        this.on('mouseover', function () {
            $('body').css('cursor', 'pointer');
        });

        this.on('mouseout', function () {

            $('body').css('cursor', 'default');


        });


        this.on('click', function (e) {
            var isSelected = this.getStage().toggleSelectedItem(that);
            if (isSelected) {
                that._getLine().setShadow({
                    color:'blue',
                    blur:10,
                    offset:[0, 0],
                    alpha:0.7
                });
            }
            else {
                that.clearSelection();
            }
            that.getLayer().draw();
            e.cancelBubble = true;

        });

        _.bindAll(this, 'setLogicState');

    },

    /**
     * usuwa efekt zaznaczenia
     */
    clearSelection:function () {
        this._getLine().setShadow(null);
        this.getLayer().draw();
    },

    /**
     * ustawia stan logiczny polaczenia
     */
    setLogicState:function () {
        var connectedToInputAnchor = _.first(_.filter(this._getAnchors(), function (anchor) {
            return anchor.isConnectedTo('input');
        }));

        var connectedToOutputAnchor = _.first(_.filter(this._getAnchors(), function (anchor) {
            return anchor.isConnectedTo('output');
        }));

        var disconnectedAnchor = _.first(_.filter(this._getAnchors(), function (anchor) {
            return !anchor.isConnectedTo();
        }));

        var state = _.isObject(connectedToOutputAnchor) ? connectedToOutputAnchor.getLogicState() : 'undefined';

        if (_.isObject(connectedToInputAnchor)) {
            connectedToInputAnchor.setLogicState(state);
        }

        if (_.isObject(disconnectedAnchor)) {
            disconnectedAnchor.setLogicState(state);
        }
        switch (state) {
            case 'low':
                this._getLine().setStroke('red');
                break;
            case 'high':
                this._getLine().setStroke('green');
                break;
            default:
                this._getLine().setStroke('black');
                break;
        }
    },

    drawLine:function () {
        var anchors = this._getAnchors();
        var points = [];
        for (var i = 0; i < anchors.length; i++) {
            points.push(anchors[i].getPosition());
        }
        var line = this.line;
        line.setPoints(points);
        if (line.getParent() !== undefined) {
            line.moveToBottom();
        }
    },

    _getLine:function () {

        //return this;
        var line = {};

        return _.filter(this.getChildren(), function (child) {
            return child.getName() == 'line'
        })[0];

    },

    _getAnchors:function () {
        return _.filter(this.getChildren(), function (child) {
            return child.getName() == 'connectorAnchor';
        });
    },

    _setAnchors:function (anchors) {
        for (var a in anchors) {
            this.add(anchors[a]);
        }
    },

    connectTo:function (gateAnchors) {
        var anchors = [];
        for (var ga in gateAnchors) {
            var a = new logicjs.ConnectorAnchor({x:gateAnchors[ga].getAbsolutePosition().x, y:gateAnchors[ga].getAbsolutePosition().y});
            a.connectTo(gateAnchors[ga]);
            this.add(a);
        }
    },

    /**
     * usuwa polaczenie
     */
    eliminate:function () {
        _.each(this._getAnchors(), function (anchor) {
            anchor.disconnectFrom();
        });
        this.getLayer().remove(this);
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
    }
});