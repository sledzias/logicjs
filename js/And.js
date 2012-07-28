logicjs.And =  logicjs.Gate.extend({
    init: function(config) {
        this.setDefaultAttrs({
            radius:5,
            stroke:"black",
            fill:"#ddd",
            strokeWidth:2,
            draggable:false
        });
        this.oType = 'Gate';
        // call super constructor
        this._super(config);
        this.add(new logicjs.Anchor({
            name:'input',
            x : 0,
            y : 10
        }));

        this.add(new logicjs.Anchor({
            name:'input',
            x : 0,
            y : 50
        }));

        this.add(new logicjs.Anchor({
            name:'output',
            x : 0,
            y : 30
        }));
    }

});