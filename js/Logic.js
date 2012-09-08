/**
 * Przestrzen nazw dla biblioteki logic.js
 * @namespace
 */
var logicjs = {};

/**
 * zwraca obiekt z parametrami bez funkcji i obiektow zawierajacych  metody
 */

logicjs._toJSON = function(node){
        var type = Kinetic.Type;
            var obj = {};
            obj.attrs = {};
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

/**
 * lista stanow logicznych
 * @type {Array}
 */
logicjs.logicStates = ['high', 'low', 'undefined'];

/**
 * lista rodzajow pinow bramek
 * @type {Array}
 */
logicjs.gatePinTypes = ['input', 'output','clock'];


/**
 * funckja odwraca stan logiczny
 * @param {Number} state  stan logiczny
 * @return {Number}
 */
logicjs.invertLogicState = function(state){
       if (_.isNaN(state) || !_.isNumber(state)){
           return NaN;
       }
       return state > 0 ? 0 : 1;
};