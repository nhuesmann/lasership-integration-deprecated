// Set up env variables
require('./config/config.js');

// NPM packages
const fs = require('fs-extra');

// Custom modules
const {OrderValidator} = require('./utils/order-validator.js');
const {parseCSV, archiveCSV, getCSVName} = require('./utils/csv-helper.js');
const {LasershipOrder, getDeliveryDate, submitOrder} = require('./utils/lasership-helper.js');
const {saveLabel, mergeLabels, archiveLabels} = require('./utils/label-helper.js');

// Global variables
const now = Math.floor(new Date() / 1000);
const log = `${new Date().toString()}:`;
const csvName = getCSVName().replace('.csv', '');

// Parse the CSV to retrieve order objects
let orders = parseCSV();
// Validate all orders
let {validOrders, invalidOrders} = new OrderValidator(orders);

// Loop through all valid orders...
let createdLabels = validOrders.map(order => {
  return new Promise((resolve, reject) => {
    // Get the expected local delivery converted to UTC
    getDeliveryDate(order).then(deliveryDate => {
      order.DELIVERY_DATE = deliveryDate;
      // Create the order JSON
      return new LasershipOrder(order);
    }).then(lsOrder => {
      // Send the request
      return submitOrder(lsOrder);
    }).then(response => {
      // Get the label
      return saveLabel(response);
    }).then(labelPath => {
      // Resolve the promise with the PDF label path
      resolve(labelPath);
    }).catch(e => {
      // If errors occured, add order to invalid orders array but resolve the
      // Promise to Promise.all can proceed

      // Handle rejected request promise
      // TODO: log the error in file (special error flag?)
      order.ERRORS = e.error ? e.error : e;
      invalidOrders.push(order);
      resolve();
    });
  });
});

// After all labels have been created, merge and clean up
Promise.all(createdLabels).then(labelsToFilter => {
  let labels = labelsToFilter.filter(label => {
    return label;
  });

  // Log the quantity of orders purchased successfully
  let orderQty = labels.length;
  let ships = orderQty === 1 ? 'shipment' : 'shipments';
  fs.appendFile('lasership.log', `${log} ${orderQty} ${ships} purchased successfully.\n`, (err) => {
    if (err) {
      console.log('Unable to append to lasership.log.');
    }
  });
  // Log the invalid orders that need to be re-processed
  if (invalidOrders.length > 0) {
    // console.log(invalidOrders, true);
    // console.log(typeof invalidOrders[0].ERRORS);
    let ordersLog = invalidOrders.map(order => {
      let order_number = order.SALES_ORDER_;
      let errors = order.ERRORS.toString();
      let message = {
        order_number,
        errors
      };
      return JSON.stringify(message);
    });
    let logMsg = `${log} The following orders encountered errors and could not be purchased:
      ${ordersLog}\n`;
    fs.appendFile('lasership.log', logMsg, (err) => {
      if (err) {
        console.log('Unable to append to lasership.log.');
      }
    });
  }

  // Merge labels
  return mergeLabels(labels, csvName);
}).then(mergedLabels => {

  // Archive labels
  return archiveLabels(mergedLabels, now);
}).then(labelsMoved => {

  // Archive CSV
  return archiveCSV(now);
}).catch(e => {
  fs.appendFile('lasership.log', `${log} Final errors: ${e}\n`, (err) => {
    if (err) {
      console.log('Unable to append to lasership.log.');
    }
  });
});

// TODO: return/log array of invalid orders
// TODO: set up logging
// TODO: error handling should return an array of failed orders to retry
