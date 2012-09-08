logicjs.Nxor = logicjs.Gate.extend({
    init:function (config) {
        this.setDefaultAttrs({
            draggable:true,
            x:0,
            y:0
        });
        this._super(config);
        this.oType = 'Gate';
        this.shapeType = 'Nxor';
        this.add(new Kinetic.Path({
            data:'M 100,136.09448 L 100,136.15698 C 102.19873,139.97215 103.46875,144.37769 103.46875,149.09448 C 103.46875,153.81127 102.19873,158.21681 100,162.03198 L 100,162.09448 L 103.46875,162.09448 L 113.46875,162.09448 C 123.07946,162.09448 131.46882,156.85518 135.96875,149.09448 C 131.46882,141.33378 123.07946,136.09448 113.46875,136.09448 L 103.46875,136.09448 L 100,136.09448 z M 95,136.15698 C 97.19873,139.97215 98.46875,144.37769 98.46875,149.09448 C 98.46875,153.81127 97.19873,158.21681 95,162.03198 M 140,149.09521 C 140,150.19921 139.104,151.09521 138,151.09521 C 136.896,151.09521 136,150.19921 136,149.09521 C 136,147.99121 136.896,147.09521 138,147.09521 C 139.104,147.09521 140,147.99121 140,149.09521 z M 140,149.0945 L 149.00006,149.0945 M 88.5,142.59448 L 97.50006,142.59448 M 88.5,155.59448 L 97.50006,155.59448',
            fill:'white',
            name:'shape',
            x:-135,
            y:-192,
            stroke:'black',
            strokeWidth:1,
            scale:[1.5, 1.5]

        }));
        var anchor = new logicjs.GateAnchor({
            name:'input',
            x:0,
            y:22
        });
        this.add(anchor);


        this.add(new logicjs.GateAnchor({
            name:'input',
            x:0,
            y:40
        }));

        this.add(new logicjs.GateAnchor({
            name:'output',
            x:84,
            y:32
        }));
        this.calculateOutputs();

    },

    calculateOutputs:function () {
        var a1 = _.first(this.getAnchors('input')).getLogicStateInt();
        var a2 = _.last(this.getAnchors('input')).getLogicStateInt();
        var val;
        if (_.isNaN(a1) || _.isNaN(a2)) {
            val = NaN;
        }
        else {
            val = a1 == a2 ? 0 : 1;
        }
        val = logicjs.invertLogicState(val);
        _.each(this.getAnchors('output'), function (anchor) {
            anchor.setLogicStateInt(val);
        });
    }



});