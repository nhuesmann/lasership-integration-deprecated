const _ = require('lodash');

const propsToValidate = [
  'CONTACT_NAME',
  'ADDRESS_1',
  'CITY',
  'COUNTRY',
  'CARRIER',
  'STATE',
  'TELEPHONE',
  'POSTAL_CODE',
  'SHIP_DATE',
  'WEIGHT',
  'TNT'
];

const validate = {
  TELEPHONE: function(phone) {
    return phone.length < 10
      ? '1111111111'
      : phone.replace(/\W/g, " ").replace(/\s+/g, "");
  },
  POSTAL_CODE: function(zip) {
    return zip.length === 4
      ? `0${zip}`
      : zip;
  },
  TNT: function(tnt) {
    return +tnt;
  }
};

/**
 * Validates all required order properties are present. Cleanses phone and zip.
 * @param  {array} orders The order objects from the CSV.
 * @return {object}       An object with two properties: validOrders and
 * invalidOrders, each an array of the respective order type.
 */
const OrderValidator = function (orders) {
  let validated = orders.map(order => {
    let orderErrors;
    let newOrder = order;
    // loop through list of props to validate
    propsToValidate.forEach(prop => {
      // loop through order keys to find a match
      _.forIn(order, (value, key) => {
        if (key === prop) {
          // verify the property has a value
          let error = !value;
          // if additional tests are available, run them
          if (validate[key] && !error) {
            newOrder[key] = validate[key](value);
          }
          // if errors occurred, add to errors array
          if (error) {
            orderErrors = orderErrors instanceof Array
              ? orderErrors
              : [];
            orderErrors.push(` Missing ${key}`);
          }
        }
      });
    });
    // If errors were found, add them to the order
    if (orderErrors) {
      newOrder.ERRORS = `Sales Order ${order.SALES_ORDER_}:${orderErrors}`;
    }
    // Else return the validated order
    return newOrder;
  });

  this.validOrders = validated.filter(newOrder => {
    return !newOrder.ERRORS;
  });

  this.invalidOrders = validated.filter(newOrder => {
    return newOrder.ERRORS;
  });
};

module.exports = {
  OrderValidator
};
