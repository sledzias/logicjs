var logicjs={};logicjs._toJSON=function(c){var b=Kinetic.Type;var d={};d.attrs={};for(var a in c.attrs){var e=c.attrs[a];if(!b._isFunction(e)&&!b._isElement(e)&&!b._hasMethods(e)){d.attrs[a]=e}}d.nodeType=c.nodeType;d.shapeType=c.shapeType;d.oType=c.oType||"";return d};logicjs.Gate=Kinetic.Group.extend({init:function(a){this.setDefaultAttrs({radius:5,stroke:"black",fill:"#ddd",strokeWidth:2,draggable:false});this.oType="Gate";this._super(a)},toJSON:function(){var c=logicjs._toJSON(this);c.inputs=[];var a=this.get(".input");for(var d=0;d<a.length;d++){var b=a[d];c.inputs.push(b.toJSON())}return c},load:function(b){this.attrs=b.attrs;var a=b.inputs;for(var c;c<b.inputs.length;c++){this.add(new logicjs.Anchor(b.inputs[c]))}}});logicjs.Anchor=Kinetic.Circle.extend({init:function(a){this.setDefaultAttrs({radius:5,stroke:"black",fill:"#ddd",strokeWidth:2,draggable:false});this.oType="Anchor";this._super(a)},toJSON:function(){return logicjs._toJSON(this)},load:function(a){this.attrs=a.attrs}});logicjs.And=logicjs.Gate.extend({init:function(a){this.setDefaultAttrs({radius:5,stroke:"black",fill:"#ddd",strokeWidth:2,draggable:false});this.oType="Gate";this._super(a);this.add(new logicjs.Anchor({name:"input",x:0,y:10}));this.add(new logicjs.Anchor({name:"input",x:0,y:50}));this.add(new logicjs.Anchor({name:"output",x:0,y:30}))}});