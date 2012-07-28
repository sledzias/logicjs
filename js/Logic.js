var logicjs = {};


logicjs._toJSON = function(node){
        var type = Kinetic.Type;

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
            obj.oType = node.oType || '';
        return obj;
};