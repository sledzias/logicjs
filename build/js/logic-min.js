var logicjs={};logicjs._toJSON=function(c){var b=Kinetic.Type;var d={};d.attrs={};for(var a in c.attrs){var e=c.attrs[a];if(!b._isFunction(e)&&!b._isElement(e)&&!b._hasMethods(e)){d.attrs[a]=e}}d.nodeType=c.nodeType;d.shapeType=c.shapeType;d.oType=c.oType||"";return d};logicjs.Gate=Kinetic.Group.extend({init:function(a){this.oType="Gate";this._super(a);this.on("dragstart",function(){this.moveToTop()});this.on("dragmove",function(){_.each(this.getAnchors(),function(b){b.notifyConnectors()})})},toJSON:function(){var c=logicjs._toJSON(this);c.inputs=[];var a=this.get(".input");for(var d=0;d<a.length;d++){var b=a[d];c.inputs.push(b.toJSON())}return c},load:function(b){this.attrs=b.attrs;var a=b.inputs;for(var c;c<b.inputs.length;c++){this.add(new logicjs.Anchor(b.inputs[c]))}},getAnchors:function(){return _.filter(this.getChildren(),function(a){return _.indexOf(["input","output"],a.getName())>-1})}});logicjs.Anchor=Kinetic.Circle.extend({init:function(a){this.setDefaultAttrs({radius:5,stroke:"black",fill:"#ddd",strokeWidth:2,draggable:false});this.oType="Anchor";this._super(a);this.on("mouseover",function(){$("body").css("cursor","pointer")});this.on("mouseout",function(){$("body").css("cursor","default")})},toJSON:function(){return logicjs._toJSON(this)},load:function(a){this.attrs=a.attrs}});logicjs.And=logicjs.Gate.extend({init:function(b){this.setDefaultAttrs({draggable:true,x:0,y:0});this.oType="Gate";this._super(b);this.add(new Kinetic.Shape({drawFunc:function(c){c.fillStyle="white";c.strokeStyle="black";c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(30,0);c.arc(30,30,30,-Math.PI/2,Math.PI/2);c.moveTo(30,60);c.lineTo(0,60);c.lineTo(0,0);c.stroke();c.fill()},name:"shape",x:0,y:0}));var a=new logicjs.GateAnchor({name:"input",x:0,y:20});this.add(a);this.add(new logicjs.GateAnchor({name:"input",x:0,y:40}));this.add(new logicjs.GateAnchor({name:"output",x:60,y:30}))}});logicjs.Connector=Kinetic.Group.extend({init:function(a){var b=this;this.setDefaultAttrs({draggable:false,points:[0,0,10,10],stroke:"black",strokeWidth:2});this.oType="Connector";this._super(a);this.add(new logicjs.ConnectorAnchor({name:"anchor",x:b.getAttrs().points[0].x,y:b.getAttrs().points[0].y,draggable:true}));this.add(new logicjs.ConnectorAnchor({name:"anchor",x:b.getAttrs().points[b.getAttrs().points.length-1].x,y:b.getAttrs().points[b.getAttrs().points.length-1].y,draggable:true}));this.line=new Kinetic.Line({name:"line",points:b.getAttrs().points,strokeWidth:4,stroke:"black"});this.drawLine();this.add(this.line);this.on("dragmove dragend",function(c){b.drawLine();this.getLayer().draw()});this.on("dragend mouseout ",function(c){this._getLine().saveImageData()});this._getLine().on("click",function(){console.log("line click!")})},drawLine:function(){var d=this._getAnchors();var c=[];for(var b=0;b<d.length;b++){c.push(d[b].getPosition())}var a=this.line;a.setPoints(c);if(a.getParent()!==undefined){a.moveToBottom()}},_getLine:function(){var a={};return _.filter(this.getChildren(),function(b){return b.getName()=="line"})[0]},_getAnchors:function(){return _.filter(this.getChildren(),function(a){return a.getName()=="anchor"})},_setAnchors:function(c){for(var b in c){this.add(c[b])}},connectTo:function(b){var d=[];for(var e in b){console.log(b[e]);var c=new logicjs.ConnectorAnchor({x:b[e].getAbsolutePosition().x,y:b[e].getAbsolutePosition().y});c.connectTo(b[e]);this.add(c)}},eliminate:function(){_.each(this._getAnchors(),function(a){a.disconnectFrom()});this.getLayer().remove(this)},toJSON:function(){var c=logicjs._toJSON(this);c.inputs=[];var a=this.get(".input");for(var d=0;d<a.length;d++){var b=a[d];c.inputs.push(b.toJSON())}return c},load:function(b){this.attrs=b.attrs;var a=b.inputs;for(var c;c<b.inputs.length;c++){this.add(new logicjs.Anchor(b.inputs[c]))}}});logicjs.ConnectorAnchor=logicjs.Anchor.extend({init:function(a){this.oType="ConnectorAnchor";this._super(a);this.on("dragstart",function(){this.getParent().moveToTop();console.log("connector anchor dragstart")});this.on("dragmove",function(c){var b=this.getDroppedAnchors(c);if(b.length>0){this.setFill("green");this.setRadius(7)}else{this.setFill("#ddd");this.setRadius(5)}});this.on("dragend",function(c){var b=this.getDroppedAnchors(c);if(b.length>0){this.connectTo(_.first(b))}else{this.disconnectFrom();this.eliminate()}})},getDroppedAnchors:function(b,a){a=a==undefined?["input","output"]:a;return _.filter(this.getStage().getIntersections({x:b.layerX,y:b.layerY}),function(d){var c=d.getName();return _.indexOf(a,c)>-1})},updatePosition:function(a){this.setPosition(a);this.simulate("dragmove")},connectTo:function(a){if(this.getConnectedAnchor()!=null){this.disconnectFrom()}this.setConnectedAnchor(a);a.connectTo(this)},disconnectFrom:function(){if(this.getConnectedAnchor()!=null){this.getConnectedAnchor().disconnectFrom(this)}this.setConnectedAnchor(null)},getConnectedAnchor:function(){if(this.getAttrs().connectedAnchor==undefined){return null}return this.getAttrs().connectedAnchor},setConnectedAnchor:function(b){var a=this.getAttrs().connectedAnchor;this.getAttrs().connectedAnchor=b;return a},eliminate:function(){this.getParent().eliminate()}});logicjs.GateAnchor=logicjs.Anchor.extend({init:function(a){this._super(a);this.oType="GateAnchor";this.getAttrs().connectors=[];this.on("mousedown",function(b){console.log("anchor mousedown");b.cancelBubble=true;this.getStage().makeConnector(this)})},connectTo:function(a){if(_.indexOf(this.getConnectors(),a)==-1){this.getAttrs().connectors.push(a)}return a},disconnectFrom:function(a){this.getConnectors().splice(_.indexOf(this.getConnectors(),a),1)},getConnectors:function(){return this.getAttrs().connectors},notifyConnectors:function(){_.each(this.getConnectors(),function(a){a.updatePosition(this.getAbsolutePosition())},this)}});logicjs.Workflow=Kinetic.Stage.extend({init:function(a){this.setDefaultAttrs({});this.oType="Workflow";this._super(a);this.add(new Kinetic.Layer({id:"mainLayer"}));this.add(new Kinetic.Layer({id:"topLayer"}));this.add(new Kinetic.Layer({id:"connectorsLayer"}))},addGate:function(b){var a=new logicjs.And(b);var c=this.get("#mainLayer")[0];c.add(a);c.draw()},makeConnector:function(b){var a=new logicjs.Connector({points:[b.getAbsolutePosition().x,b.getAbsolutePosition().y,b.getAbsolutePosition().x,b.getAbsolutePosition().y],stroke:"black",strokeWidth:2});this.get("#connectorsLayer")[0].add(a);a._getAnchors()[0]._initDrag();a._getAnchors()[1].connectTo(b);this.draw()}});