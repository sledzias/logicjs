jscircuit.basicGatesSet = {};

jscircuit.Anchor = function (gate, _x, _y) {
    this.lines = [];
    this.connectors = [];
    this.gate = gate;
    this.state = 'undefined'
    Kinetic.Circle.call(this, {
        x:_x,
        y:_y,
        radius:5,
        stroke:"black",
        fill:"#ddd",
        strokeWidth:2,
        draggable:false
    });
    this.on("mouseover", function () {
        this.setStrokeWidth(4);
        this.getLayer().draw();
    });

    this.on("mouseout", function () {
        this.setStrokeWidth(2);
        //this.getLayer().draw();
        console.log("anchor mouseout2");
    });


}

jscircuit.Anchor.prototype = {};

jscircuit.Anchor.prototype._setState = function (state) {
    if (state === undefined || typeof(state) != 'string') {
        throw 'one parameter [string] required, possible values "undefined", "high", "low"'

    }

    if (state == 'high' || state == 'low' || state == 'undefined') {
        this.state = state;

        if (state == 'high') {
            this.attrs.fill = "#0f0";
        }
        if (state == 'low') {
            this.attrs.fill = "#f00";
        }
        if (state == 'undefined') {
            this.attrs.fill = "#ddd";
        }
        if (this.getName() == 'output') {
            for (var j = 0; j < this.connectors.length; j++) {
                if (this.connectors[j] != null) {
                    this.connectors[j]._setState(this.state);

                }
            }
        }
        else if (this.getName() == 'input') {
            this.getParent()._calculateState();
            this.getParent()._setState(state);
        }


    }
    else {
        throw 'one parameter [string] required, possible values "undefined", "high", "low"'
    }
}


jscircuit.Anchor.prototype._getState = function () {
    return this.state;
}

jscircuit.Anchor.prototype._getStateInt = function () {
    if (this.state == 'high') {
        return 1;
    }
    if (this.state == 'low') {
        return 0;
    }

    return NaN;
}

jscircuit.Anchor.prototype._setStateInt = function (state) {
    if (state == 1) {
        this._setState('high');
    }
    else if (state == 0) {
        this._setState('low');
    }
    else {
        this._setState('undefined')
    }

}


jscircuit.Anchor.prototype.getRadius = function () {
    return this.attrs.radius;
}

jscircuit.Anchor.prototype.setHover = function (isHover) {
    if (isHover) {
        this.attrs.strokeWidth = 4;
    }
    else {
        this.attrs.strokeWidth = 2;
    }
}

jscircuit.Anchor.prototype.isNear = function (anchor) {
    var pos1 = anchor.getAbsolutePosition();
    var pos2 = this.getAbsolutePosition();

    var dist = Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    var sumrad = anchor.getRadius() + this.getRadius();


    if (dist <= sumrad) {
        return true;
    }
    else {
        return false;
    }
}

jscircuit.Anchor.prototype.addGateEvents = function () {
    this.on("mouseover", function () {
        /* if (this.gate != null) {
         this.gate.draggable(false);
         }*/
    });

    this.on("mouseout", function () {
        /*  if (this.gate != null) {
         this.gate.draggable(true);
         }
         */

    });


    this.on("mousedown", function (e) {
        //    this.draggable(true);
        //this.gate.draggable(false);
        e.cancelBubble = true;
        var cm = this.gate.getWorkflow().connectorsManager;
        cm.startConnection(this);

        //this.gate.draggable(true);


    });

    this.on("dragstart", function () {
        /*  if (this.gate != null) {

         } */


    });
    this.on("dragend", function () {

    });

    this.on("mouseup", function () {
        //  this.draggable = false;
    });
    this.on('mousedown', function () {
        console.log(this._getState());
        var state = this._getState();
        if (state == 'undefined') {
            this._setState('high');
        }
        else if (state == 'high') {
            this._setState('low');
        }
        else {
            this._setState('undefined');
        }
        this.gate._calculateState();
    });

}

Kinetic.Shape.extend(jscircuit.Anchor, Kinetic.Circle);


jscircuit.And = function (x, y) {
    this.anchors = [];
    this.selected = false;
    this.workflow = null;

    Kinetic.Group.call(this, {draggable:true});

    this.shape = new Kinetic.Shape({
        drawFunc:function () {
            var context = this.getContext();
            if (this.parent.selected == true) {
                context.shadowColor = "green";
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.shadowBlur = 10;
            }
            context.fillStyle = this.attrs.fill;
            context.strokeStyle = this.attrs.stroke;
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(0, 0);
            context.lineTo(30, 0);
            context.arc(30, 30, 30, -Math.PI / 2, Math.PI / 2);
            context.moveTo(30, 60);
            context.lineTo(0, 60);
            context.lineTo(0, 0);
            context.stroke();
            context.fill();

        },
        stroke:"black",
        fill:"#fff"
    });
    this.add(this.shape);

    this.anchors.push(new jscircuit.Anchor(this, 0, 20));

    this.anchors.push(new jscircuit.Anchor(this, 60, 30));
    this.anchors.push(new jscircuit.Anchor(this, 0, 40));


    /*
     this.add(new jscircuit.Anchor(this, 0, 20));
     this.add(new jscircuit.Anchor(this, 0, 40));
     this.add(new jscircuit.Anchor(this, 60, 30));
     */


    for (var i = 0; i < this.anchors.length; ++i) {
        this.anchors[i].addGateEvents();
        this.add(this.anchors[i]);
    }
    this.on("dragmove", function () {
        this._updateConnectors();
        this.workflow.layers.connectorsLayer.draw();
        this.workflow.layers.topLayer.draw();
    });

    this.on("dragend", function () {
        this._updateConnectors(function (connector) {
            connector._refreshData();
        });
        this.workflow.layers.connectorsLayer.draw();
        this.workflow.layers.topLayer.draw();
    });

    this.on("mousedown", function () {
        document.body.style.cursor = "move";
    });

    this.on("mouseup", function () {
        document.body.style.cursor = "pointer";
    });
    this.on("mouseover", function () {
        document.body.style.cursor = "pointer";
    });
    this.on("mouseout", function () {

        document.body.style.cursor = "default";
    });

    this.shape.on("click", function (e) {
        this.parent.workflow.selectionManager.register(this.parent);

    });


    this.setPosition(x, y);


}

jscircuit.And.prototype = {};
jscircuit.And.prototype.setWorkflow = function (workflow) {
    this.workflow = workflow;
};

jscircuit.And.prototype.getWorkflow = function () {
    return this.workflow;
};

jscircuit.And.prototype.setSelected = function (isSelected) {
    this.selected = isSelected;
};


jscircuit.And.prototype.getAnchors = function () {
    return this.anchors;
};

jscircuit.And.prototype.remove2 = function () {

    while (this.anchors.length > 0) {
        var anchor = this.anchors.pop();
        if (anchor.connector != null) {
            console.log(anchor.connector);
            anchor.connector.getLayer().remove(anchor.connector);
        }


    }
    this.getLayer().remove(this);
};

jscircuit.And.prototype._updateConnectors = function (func) {
    for (var i = 0; i < this.anchors.length; i++) {
        for (var j = 0; j < this.anchors[i].connectors.length; j++) {
            if (this.anchors[i].connectors[j] != null) {
                this.anchors[i].connectors[j].updateConnectedWith(this.anchors[i]);
                if (func !== undefined) {
                    func(this.anchors[i].connectors[j]);
                }
                //this.anchors[i].connectors[0].firstAnchor.setAbsolutePosition( this.anchors[i].getAbsolutePosition());
            }
        }

    }
}

Kinetic.Shape.extend(jscircuit.And, Kinetic.Group);


jscircuit.Gate = function (options) {
    this.anchors = [];
    this.selected = false;
    this.workflow = null;

    Kinetic.Group.call(this, {draggable:true});


    /*
     this.add(new jscircuit.Anchor(this, 0, 20));
     this.add(new jscircuit.Anchor(this, 0, 40));
     this.add(new jscircuit.Anchor(this, 60, 30));
     */


//    for (var i = 0; i < this.anchors.length; ++i) {
//        this.anchors[i].addGateEvents();
//        this.add(this.anchors[i]);
//    }


    this.setPosition(options.x, options.y);


}

jscircuit.Gate.prototype = {};

/**
 * Ustawia obiekt przedstawiajacy kształt bramki
 * @param shape
 * @private
 */
jscircuit.Gate.prototype._setShape = function (shape) {
    this.shape = shape;
    this.add(shape);
    shape.moveToBottom();
};
/**
 * Pobiera obiekt przedstawiajacy kształt bramki
 * @return {Kinetic.Shape}
 * @private
 */
jscircuit.Gate.prototype._getShape = function () {
    return this.get('#shape');
};

jscircuit.Gate.prototype._addInputAnchor = function (x, y) {
    var anchor = new jscircuit.Anchor(this, x, y);
    anchor.addGateEvents();
    anchor.attrs.name = 'input';
    this.add(anchor);
}

jscircuit.Gate.prototype._addOutputAnchor = function (x, y) {
    var anchor = new jscircuit.Anchor(this, x, y);
    anchor.addGateEvents();
    anchor.attrs.name = 'output';
    this.add(anchor);
}

jscircuit.Gate.prototype._getInputAnchors = function (x, y) {
    return this.get('.input');
}

jscircuit.Gate.prototype._getOutputAnchors = function () {
    return this.get('.output');
}


jscircuit.Gate.prototype._setInputAnchors = function () {
    this._addInputAnchor(0, 20);
    this._addInputAnchor(0, 40);


};

jscircuit.Gate.prototype._setState = function (state) {
    return;
}

jscircuit.Gate.prototype._setOutputAnchors = function () {
    this._addOutputAnchor(60, 30);
};


jscircuit.Gate.prototype._setGateEvents = function () {
    this.on("dragmove", function () {
        this._updateConnectors();
        this.workflow.layers.connectorsLayer.draw();
        this.workflow.layers.topLayer.draw();
    });

    this.on("dragend", function () {
        this._updateConnectors(function (connector) {
            connector._refreshData();
        });
        this.workflow.layers.connectorsLayer.draw();
        this.workflow.layers.topLayer.draw();
    });

    this.on("mousedown", function () {
        document.body.style.cursor = "move";
    });

    this.on("mouseup", function () {
        document.body.style.cursor = "pointer";
    });
    this.on("mouseover", function () {
        document.body.style.cursor = "pointer";
    });
    this.on("mouseout", function () {

        document.body.style.cursor = "default";
    });

    this.shape.on("click", function (e) {
        this.parent.workflow.selectionManager.register(this.parent);

    });
};

jscircuit.Gate.prototype.setWorkflow = function (workflow) {
    this.workflow = workflow;
};

jscircuit.Gate.prototype.getWorkflow = function () {
    return this.workflow;
};

jscircuit.Gate.prototype.setSelected = function (isSelected) {
    this.selected = isSelected;
};


jscircuit.Gate.prototype.getAnchors = function () {
    var anchors = this.get('.input');

    return anchors.concat(this.get('.output'));
};

jscircuit.Gate.prototype.remove2 = function () {

//    while (this.anchors.length > 0) {
//        var anchor = this.anchors.pop();
//        if (anchor.connector != null) {
//            console.log(anchor.connector);
//            anchor.connector.getLayer().remove(anchor.connector);
//        }
//
//
//    }
//    this.getLayer().remove(this);
};

jscircuit.Gate.prototype._calculateState = function () {
    throw 'calculate function excepted!'
}

jscircuit.Gate.prototype._updateConnectors = function (func) {
    var anchors = this.getAnchors();
    console.log(anchors);
    for (var i = 0; i < anchors.length; i++) {
        for (var j = 0; j < anchors[i].connectors.length; j++) {
            if (anchors[i].connectors[j] != null) {
                anchors[i].connectors[j].updateConnectedWith(anchors[i]);
                if (func !== undefined) {
                    func(anchors[i].connectors[j]);
                }
                //this.anchors[i].connectors[0].firstAnchor.setAbsolutePosition( this.anchors[i].getAbsolutePosition());
            }
        }

    }
}

jscircuit.Gate.prototype.remove2 = function () {

    while (this.anchors.length > 0) {
        var anchor = this.anchors.pop();
        if (anchor.connector != null) {
            console.log(anchor.connector);
            anchor.connector.getLayer().remove(anchor.connector);
        }


    }
    this.getLayer().remove(this);
};


Kinetic.Shape.extend(jscircuit.Gate, Kinetic.Group);


jscircuit.And1 = function (_x, _y) {
    jscircuit.Gate.call(this, {x:_x, y:_y});

    this._setShape(new Kinetic.Shape({
        drawFunc:function () {
            var context = this.getContext();
            if (this.parent.selected == true) {
                context.shadowColor = "green";
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.shadowBlur = 10;
            }
            context.fillStyle = this.attrs.fill;
            context.strokeStyle = this.attrs.stroke;
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(0, 0);
            context.lineTo(30, 0);
            context.arc(30, 30, 30, -Math.PI / 2, Math.PI / 2);
            context.moveTo(30, 60);
            context.lineTo(0, 60);
            context.lineTo(0, 0);
            context.stroke();
            context.fill();


        },
        stroke:"black",
        fill:"#fff"
    }));

    this.setDraggable(true);
    this._setGateEvents();
    this._setInputAnchors();
    this._setOutputAnchors();
}


jscircuit.And1.prototype = {};
jscircuit.And1.prototype._calculateState = function () {
    var inputs = this._getInputAnchors();
    var outputs = this._getOutputAnchors();

    var result = 1;
    for (var i = 0; i < inputs.length; i++) {

        result *= inputs[i]._getStateInt();
    }

    console.log("result:");
    console.log(result);
    for (var i = 0; i < outputs.length; i++) {
        outputs[i]._setStateInt(result);
    }

}
Kinetic.Shape.extend(jscircuit.And1, jscircuit.Gate);

jscircuit.Or = function (_x, _y) {
    jscircuit.Gate.call(this, {x:_x, y:_y});

    this._setShape(new Kinetic.Shape({
        drawFunc:function () {
            var context = this.getContext();
            if (this.parent.selected == true) {
                context.shadowColor = "green";
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.shadowBlur = 10;
            }
            context.fillStyle = this.attrs.fill;
            context.strokeStyle = this.attrs.stroke;
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(0, 0);
            context.lineTo(30, 0);
            context.arc(30, 30, 30, -Math.PI / 2, Math.PI / 2);
            context.moveTo(30, 60);
            context.lineTo(0, 60);
//            context.lineTo(0, 0);
            context.bezierCurveTo(20, 40, 20, 20, 0, 0)
            context.stroke();
            context.fill();

        },
        stroke:"black",
        fill:"#fff"
    }));

    this.setDraggable(true);
    this._setGateEvents();
    this._setInputAnchors();
    this._setOutputAnchors();
}


jscircuit.Or.prototype = {};
jscircuit.Or.prototype._calculateState = function () {
    var inputs = this._getInputAnchors();
    var outputs = this._getOutputAnchors();

    var result = 0;
    for (var i = 0; i < inputs.length; i++) {

        result += inputs[i]._getStateInt();
    }
    if (result > 0) result = 1;
    console.log("result:");
    console.log(result);
    for (var i = 0; i < outputs.length; i++) {
        outputs[i]._setStateInt(result);
    }

}
Kinetic.Shape.extend(jscircuit.Or, jscircuit.Gate);


jscircuit.Switch = function (_x, _y) {
    jscircuit.Gate.call(this, {x:_x, y:_y});

    this._setShape(new Kinetic.Rect({
        x:0,
        y:0,
        width:40,
        height:40,
        fill:"green",
        stroke:"black",
        strokeWidth:1
    }));


    this.add(new Kinetic.Text({
        x:20,
        y:20,
        text:"On",
        fontSize:10,
        fontFamily:"Calibri",
        textFill:"black",
        align:"center",
        verticalAlign:"middle",
        name:'stateText'
    })
    );

    this.setDraggable(true);
    this._setGateEvents();
    this._setInputAnchors();
    this._setOutputAnchors();
    this.on('click', function () {
        var output = this._getOutputAnchors()[0];
        console.log(output);

        if (output._getState() == 'low') {
            output._setState('high');
            this.shape.setFill('green');
            var text = this.get('.stateText');

            text[0].setText('On')

        }
        else {
            output._setState('low');
            this.shape.setFill('red');
//           this.get('#stateText').setText('Off');
            var text = this.get('.stateText');
            text[0].setText('Off')
        }
        this.getLayer().draw();
    });
//    var output = this._getOutputAnchors();
//    output._setState('high');
}


jscircuit.Switch.prototype = {};
jscircuit.Switch.prototype._calculateState = function () {
    var inputs = this._getInputAnchors();
    var outputs = this._getOutputAnchors();

    var result = 1;
    for (var i = 0; i < inputs.length; i++) {

        result *= inputs[i]._getStateInt();
    }
    console.log("result:");
    console.log(result);
    for (var i = 0; i < outputs.length; i++) {
        outputs[i]._setStateInt(result);
    }


}

jscircuit.Switch.prototype._setInputAnchors = function () {
    return;
}
jscircuit.Switch.prototype._setOutputAnchors = function () {
    this._addOutputAnchor(40, 20);
};

Kinetic.Shape.extend(jscircuit.Switch, jscircuit.Gate);

jscircuit.Bulb = function (_x, _y) {
    jscircuit.Gate.call(this, {x:_x, y:_y});

    this._setShape(new Kinetic.Circle({
        x:20,
        y:20,
        radius:20,
        fill:"green",
        stroke:"black",
        strokeWidth:1
    }));


    this.setDraggable(true);
    this._setGateEvents();
    this._setInputAnchors();
    this._setOutputAnchors();
    this.add(new Kinetic.Text({
        x:20,
        y:20,
        text:"1",
        fontSize:10,
        fontFamily:"Calibri",
        textFill:"black",
        align:"center",
        verticalAlign:"middle",
        name:'stateText'
    })
    );

//    var output = this._getOutputAnchors();
//    output._setState('high');
}


jscircuit.Bulb.prototype = {};
jscircuit.Bulb.prototype._calculateState = function () {
    var inputs = this._getInputAnchors();
    var outputs = this._getOutputAnchors();

    var result = 1;
    for (var i = 0; i < inputs.length; i++) {

        result *= inputs[i]._getStateInt();
    }
    console.log("result:");
    console.log(result);
    for (var i = 0; i < outputs.length; i++) {
        outputs[i]._setStateInt(result);
    }


}

jscircuit.Bulb.prototype._setInputAnchors = function () {
    this._addInputAnchor(0, 20);
}
jscircuit.Bulb.prototype._setOutputAnchors = function () {
    //this._addOutputAnchor(30,10);
    return;
};

jscircuit.Bulb.prototype._setState = function (state) {

    if (state == 'low') {
        this.shape.setFill('red');
        var text = this.get('.stateText');
        text[0].setText('0');
    }
    if (state == 'high') {
        this.shape.setFill('green');
        var text = this.get('.stateText');
        text[0].setText('1');

    }
    this.getLayer().draw();


}

Kinetic.Shape.extend(jscircuit.Bulb, jscircuit.Gate);

