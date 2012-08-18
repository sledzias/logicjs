var logicjs={};logicjs._toJSON=function(c){var b=Kinetic.Type;var d={};d.attrs={};for(var a in c.attrs){var e=c.attrs[a];if(!b._isFunction(e)&&!b._isElement(e)&&!b._hasMethods(e)){d.attrs[a]=e}}d.nodeType=c.nodeType;d.shapeType=c.shapeType;d.oType=c.oType||"";return d};logicjs.logicStates=["high","low","undefined"];logicjs.gatePinTypes=["input","output","clock"];logicjs.Gate=Kinetic.Group.extend({init:function(a){this.oType="Gate";this.shapeType="Gate";this._super(a);this.on("dragstart",function(){this.moveToTop()});this.on("dragmove",function(){_.each(this.getAnchors(),function(b){b.notifyConnectors("dragmove")})});this.on("dragend",function(){_.each(this.getAnchors(),function(b){b.notifyConnectors("dragend")})});this.on("pinChanged",function(){this.calculateOutputs();console.log("pinchanged")})},toJSON:function(){var c=logicjs._toJSON(this);c.inputs=[];var a=this.get(".input");for(var d=0;d<a.length;d++){var b=a[d];c.inputs.push(b.toJSON())}return c},load:function(b){this.attrs=b.attrs;var a=b.inputs;for(var c;c<b.inputs.length;c++){this.add(new logicjs.Anchor(b.inputs[c]))}},getAnchors:function(){arguments=_.flatten(arguments);var a=arguments.length!=0?arguments:["input","output","clock"];return _.filter(this.getChildren(),function(b){return _.indexOf(a,b.getName())>-1})},calculateOutputs:function(){console.log("Gate: calculateOutputs");_.each(this.getAnchors("outputs"),function(a){a.setLogicState("undefined")})},getShape:function(){return _.first(this.get(".shape"))}});logicjs.Anchor=Kinetic.Circle.extend({init:function(a){this.setDefaultAttrs({radius:5,stroke:"black",fill:"#ddd",strokeWidth:2,draggable:false});this.oType="Anchor";this.shapeType="Anchor";this._super(a);this.on("mouseover",function(){$("body").css("cursor","pointer")});this.on("mouseout",function(){$("body").css("cursor","default")})},setLogicState:function(a){var b=a||"undefined";b=_.indexOf(logicjs.logicStates,b)>-1?b:"undefined";this.getAttrs().logicState=b;this.triggerLogicState(b);console.log(this.getName()+" state "+b)},getLogicState:function(){return this.getAttrs().logicState||"undefined"},getLogicStateInt:function(){switch(this.getLogicState()){case"high":return 1;case"low":return 0;default:return NaN}},setLogicStateInt:function(a){if(_.isNaN(a)||_.isUndefined(a)){this.setLogicState("undefined");return}if(a==1){this.setLogicState("high");return}if(a==0){this.setLogicState("low");return}},triggerLogicState:function(a){},toJSON:function(){return logicjs._toJSON(this)},load:function(a){this.attrs=a.attrs}});logicjs.And=logicjs.Gate.extend({init:function(b){this.setDefaultAttrs({draggable:true,x:0,y:0});this._super(b);this.oType="Gate";this.nodeType="And";this.add(new Kinetic.Shape({drawFunc:function(c){c.fillStyle="white";c.strokeStyle="black";c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(30,0);c.arc(30,30,30,-Math.PI/2,Math.PI/2);c.moveTo(30,60);c.lineTo(0,60);c.lineTo(0,0);c.stroke();c.fill()},name:"shape",x:0,y:0}));var a=new logicjs.GateAnchor({name:"input",x:0,y:20});this.add(a);this.add(new logicjs.GateAnchor({name:"input",x:0,y:40}));this.add(new logicjs.GateAnchor({name:"output",x:60,y:30}));this.calculateOutputs()},calculateOutputs:function(){console.log("And: calculateOutputs");var a=_.reduce(this.getAnchors("input"),function(b,c){console.log(b);return b*c.getLogicStateInt()},1);console.log(a);_.each(this.getAnchors("output"),function(b){b.setLogicStateInt(a)})}});logicjs.Connector=Kinetic.Group.extend({init:function(a){var b=this;this.setDefaultAttrs({draggable:false,points:[0,0,10,10],stroke:"black",strokeWidth:2});this._super(a);this.oType="Connector";this.nodeType="Connector";this.add(new logicjs.ConnectorAnchor({x:b.getAttrs().points[0].x,y:b.getAttrs().points[0].y,draggable:true}));this.add(new logicjs.ConnectorAnchor({x:b.getAttrs().points[b.getAttrs().points.length-1].x,y:b.getAttrs().points[b.getAttrs().points.length-1].y,draggable:true}));this.line=new Kinetic.Line({name:"line",points:b.getAttrs().points,strokeWidth:4,stroke:"black"});this.drawLine();this.add(this.line);this.on("dragmove dragend",function(c){b.drawLine();this.getLayer().draw()});this.on("dragend mouseout ",function(c){this._getLine().saveImageData()});this._getLine().on("click",function(){console.log("line click!")});this.on("pinChanged",this.setLogicState);_.bindAll(this,"setLogicState")},setLogicState:function(){console.log(this);var b=_.first(_.filter(this._getAnchors(),function(e){return e.isConnectedTo("input")}));var d=_.first(_.filter(this._getAnchors(),function(e){return e.isConnectedTo("output")}));var a=_.first(_.filter(this._getAnchors(),function(e){return !e.isConnectedTo()}));var c=_.isObject(d)?d.getLogicState():"undefined";if(_.isObject(b)){b.setLogicState(c)}if(_.isObject(a)){a.setLogicState(c)}console.log(c);switch(c){case"low":this._getLine().setStroke("red");break;case"high":this._getLine().setStroke("green");break;default:this._getLine().setStroke("black");break}},drawLine:function(){var d=this._getAnchors();var c=[];for(var b=0;b<d.length;b++){c.push(d[b].getPosition())}var a=this.line;a.setPoints(c);if(a.getParent()!==undefined){a.moveToBottom()}},_getLine:function(){var a={};return _.filter(this.getChildren(),function(b){return b.getName()=="line"})[0]},_getAnchors:function(){return _.filter(this.getChildren(),function(a){return a.getName()=="connectorAnchor"})},_setAnchors:function(c){for(var b in c){this.add(c[b])}},connectTo:function(b){var d=[];for(var e in b){console.log(b[e]);var c=new logicjs.ConnectorAnchor({x:b[e].getAbsolutePosition().x,y:b[e].getAbsolutePosition().y});c.connectTo(b[e]);this.add(c)}},eliminate:function(){_.each(this._getAnchors(),function(a){a.disconnectFrom()});this.getLayer().remove(this)},toJSON:function(){var c=logicjs._toJSON(this);c.inputs=[];var a=this.get(".input");for(var d=0;d<a.length;d++){var b=a[d];c.inputs.push(b.toJSON())}return c},load:function(b){this.attrs=b.attrs;var a=b.inputs;for(var c;c<b.inputs.length;c++){this.add(new logicjs.Anchor(b.inputs[c]))}}});logicjs.ConnectorAnchor=logicjs.Anchor.extend({init:function(a){this._super(a);this.oType="ConnectorAnchor";this.shapeType="ConnectorAnchor";this.setDefaultAttrs({name:"connectorAnchor"});this.on("dragstart",function(){this.getParent().moveToTop();console.log("connector anchor dragstart")});this.on("dragmove",function(c){var b=this.getDroppedAnchors(c);if(b.length>0){this.setFill("green");this.setRadius(7)}else{this.setFill("#ddd");this.setRadius(5)}});this.on("dragend",function(c){var b=this.getDroppedAnchors(c);if(b.length>0){this.connectTo(_.first(b))}else{this.disconnectFrom();this.eliminate()}this.simulate("dragmove");this.getLayer().draw()})},getDroppedAnchors:function(b,a){a=a==undefined?["input","output"]:a;return _.filter(this.getStage().getIntersections({x:b.layerX,y:b.layerY}),function(d){var c=d.getName();return _.indexOf(a,c)>-1})},updatePosition:function(a){this.setPosition(a);this.simulate("dragmove")},connectTo:function(a){if(this.getConnectedAnchor()!=null){this.disconnectFrom()}this.setConnectedAnchor(a);this.setPosition(a.getAbsolutePosition());a.connectTo(this);this.setLogicState(a.getLogicState());this.getParent().simulate("pinChange")},disconnectFrom:function(){if(this.getConnectedAnchor()!=null){this.getConnectedAnchor().disconnectFrom(this)}this.setConnectedAnchor(null)},getConnectedAnchor:function(){if(this.getAttrs().connectedAnchor==undefined){return null}return this.getAttrs().connectedAnchor},setConnectedAnchor:function(b){var a=this.getAttrs().connectedAnchor;this.getAttrs().connectedAnchor=b;return a},eliminate:function(){this.getParent().eliminate()},connectToHoverAnchor:function(){var a=this.getDroppedAnchors({layerX:this.getAbsolutePosition().x,layerY:this.getAbsolutePosition().y});if(a.length>0){this.connectTo(_.first(a))}this.simulate("dragmove");this.getLayer().draw()},triggerLogicState:function(){if(this.isConnectedTo("output")){this.getParent().simulate("pinChanged")}else{if(this.isConnectedTo("input")||this.isConnectedTo("clock")){this.getConnectedAnchor().setLogicState(this.getLogicState())}}},isConnectedTo:function(){var a=_.toArray(arguments).length==0?logicjs.gatePinTypes:_.toArray(arguments);return this.getConnectedAnchor()&&_.indexOf(a,this.getConnectedAnchor().getName())>-1}});logicjs.GateAnchor=logicjs.Anchor.extend({init:function(a){this._super(a);this.oType="GateAnchor";this.shapeType="GateAnchor";this.getAttrs().connectors=[];this.on("mousedown",function(b){console.log("anchor mousedown");b.cancelBubble=true;this.getStage().makeConnector(this)})},connectTo:function(a){if(_.indexOf(this.getConnectors(),a)==-1){this.getAttrs().connectors.push(a)}if(this.getName()=="input"){this.setLogicState(a.getLogicState())}return a},disconnectFrom:function(a){this.getConnectors().splice(_.indexOf(this.getConnectors(),a),1);if(this.getName()=="input"){this.setLogicState("undefined")}},getConnectors:function(){return this.getAttrs().connectors},notifyConnectors:function(a){_.each(this.getConnectors(),function(b){b.updatePosition(this.getAbsolutePosition());if(a=="dragend"){b.getParent().simulate(a)}},this)},triggerLogicState:function(){if(this.getName()=="input"){this.getParent().simulate("pinChanged")}else{if(this.getName()=="output"){_.each(this.getConnectors(),function(a){a.setLogicState(this.getLogicState())},this)}}},calculateOutputs:function(){_.each(this.getAnchors("outputs"),function(a){a.setLogicState("undefined")})}});logicjs.Switch=logicjs.Gate.extend({init:function(a){this.setDefaultAttrs({draggable:true,x:0,y:0,logicState:0});this._super(a);this.oType="Gate";this.nodeType="Switch";this.add(new Kinetic.Shape({drawFunc:function(b){b.fillStyle=this.attrs.fill;b.strokeStyle="black";b.lineWidth=3;b.beginPath();b.moveTo(0,0);b.lineTo(30,0);b.arc(30,30,30,-Math.PI/2,Math.PI/2);b.moveTo(30,60);b.lineTo(0,60);b.lineTo(0,0);b.stroke();b.fill()},name:"shape",x:0,y:0,fill:"red"}));this.add(new logicjs.GateAnchor({name:"output",x:60,y:30}));this.on("click",function(){this.getAttrs().logicState=this.getAttrs().logicState==1?0:1;console.log(this.getShape());this.getAttrs().logicState==1?this.getShape().setFill("green"):this.getShape().setFill("red");this.calculateOutputs();this.getStage().draw()});this.calculateOutputs()},calculateOutputs:function(){var a=this.getAttrs().logicState;_.each(this.getAnchors("output"),function(b){b.setLogicStateInt(a)})}});logicjs.Workflow=Kinetic.Stage.extend({init:function(a){this.setDefaultAttrs({});this.oType="Workflow";this._super(a);this.add(new Kinetic.Layer({id:"mainLayer"}));this.add(new Kinetic.Layer({id:"topLayer"}));this.add(new Kinetic.Layer({id:"connectorsLayer"}))},addGate:function(c,a){var b=new logicjs[a](c);var d=this.get("#mainLayer")[0];d.add(b);d.draw()},makeConnector:function(b){var a=new logicjs.Connector({points:[b.getAbsolutePosition().x,b.getAbsolutePosition().y,b.getAbsolutePosition().x,b.getAbsolutePosition().y],stroke:"black",strokeWidth:2});this.get("#connectorsLayer")[0].add(a);a._getAnchors()[0]._initDrag();a._getAnchors()[1].connectTo(b);this.draw()},toJSON:function(){var a=Kinetic.Type;function b(e){var f={};f.attrs={};for(var d in e.attrs){var g=e.attrs[d];if(!a._isFunction(g)&&!a._isElement(g)&&!a._hasMethods(g)){f.attrs[d]=g}}f.nodeType=e.nodeType;f.shapeType=e.shapeType;if(e.nodeType!=="Shape"){f.children=[];var c=e.getChildren();for(var i=0;i<c.length;i++){var h=c[i];f.children.push(b(h))}}return f}return JSON.stringify(b(this))},load:function(a){this.reset();function c(g,i){var d=i.children;if(d!==undefined){for(var l=0;l<d.length;l++){var k=d[l];var f;if(k.nodeType==="Shape"){if(k.shapeType===undefined){f="Shape"}else{f=k.shapeType}}else{f=k.nodeType}try{var j=new Kinetic[f](k.attrs)}catch(h){console.log(f);var j=new logicjs[f](k.attrs);if(f=="Connector"){j.removeChildren()}}g.add(j);c(j,k)}}}var b=JSON.parse(a);this.attrs=b.attrs;c(this,b);this.draw();_.each(this.get(".connectorAnchor"),function(d){d.connectToHoverAnchor()})}});