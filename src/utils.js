const { isObject, isFunction } = require('lodash');

const customFieldResolver = function (source, args, context, info) {
  if (isObject(source) || isFunction(source)) {
    let property = source[info.fieldName];
    if (isFunction(property)) return source[info.fieldName](args, context, info);
    if (!property && source.hasOwnProperty('entity') && source.entity[info.fieldName]) {
      property = source.entity[info.fieldName];
    }
    return property;
  }
};

module.exports = { customFieldResolver };
