require('./config/config.js');

const fs = require('fs-extra');

const {OrderValidator} = require('./utils/order-validator.js');
const {parseCSV, archiveCSV, getCSVName, trackingCSV, failedCSV} = require('./utils/csv-helper.js');
const {LasershipOrder, getDeliveryDate, submitOrder} = require('./utils/lasership-helper.js');
const {saveLabelAndTracking, mergeLabels, archiveLabels} = require('./utils/label-helper.js');

const now = Math.floor(new Date() / 1000);
const log = `${new Date().toString()}:`;
const csvName = getCSVName().replace('.csv', '');

// Parse the CSV to retrieve order objects
let orders = parseCSV();
// Validate all orders
let {validOrders, invalidOrders} = new OrderValidator(orders);
console.log('Validated all orders. Submitting orders to LaserShip...');

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
      // Save the label and get the tracking number
      return saveLabelAndTracking(response);
    }).then(labelAndTrackObj => {
      // Resolve the promise with the label and tracking number object
      resolve(labelAndTrackObj);
    }).catch(e => {
      // If errors occured, add order to invalid orders array but resolve the
      // Promise so Promise.all can proceed
      order.ERRORS = e.error ? e.error : e;
      invalidOrders.push(order);
      resolve();
    });
  });
});

// After all labels have been created, merge labels, create tracking CSV, and clean up
Promise.all(createdLabels).then(ordersToFilter => {
  let successfulOrders = ordersToFilter.filter(order => {
    return order;
  });

  // Log the quantity of orders purchased successfully
  let successQty = successfulOrders.length;
  let successMsg;
  if (successQty === orders.length) {
    successMsg = 'All shipments purchased successfully.';
  } else {
    successMsg = `${successQty} of ${orders.length} shipments purchased successfully.`;
  }
  console.log(successMsg);
  fs.appendFile('lasership.log', `${log} ${successMsg}\n`, (err) => {
    if (err) console.log('Unable to append to lasership.log.');
  });

  // Process any failed orders
  if (invalidOrders.length > 0) {
    // Stringify error messages
    invalidOrders.forEach(order => {
      order.ERRORS = order.ERRORS.toString();
    });

    // Create CSV of failed orders to retry
    failedCSV(invalidOrders, now, csvName);

    // Log the invalid orders that need to be re-processed
    let ordersLog = invalidOrders.map(order => {
      let order_number = order.SALES_ORDER_;
      let errors = order.ERRORS;
      let message = {
        order_number,
        errors
      };
      return JSON.stringify(message);
    });
    let failedQty = invalidOrders.length;
    let failedOrd = failedQty === 1 ? 'order' : 'orders';
    let failureMsg = `${failedQty} ${failedOrd} encountered errors and could not be purchased.`;
    fs.appendFile('lasership.log', `${log} ${failureMsg}\n${ordersLog}\n`, (err) => {
      console.log(`${failureMsg} See log for details.`);
      if (err) console.log('Unable to append to lasership.log.');
    });
  }
  console.log('Got all labels. Creating tracking CSV...');

  // Create the tracking CSV
  return trackingCSV(successfulOrders, now, csvName);
}).then(labels => {
  console.log('Merging labels and cleaning up...');

  // Merge labels
  return mergeLabels(labels, csvName);
}).then(mergedLabels => {

  // Archive labels
  return archiveLabels(mergedLabels, now);
}).then(labelsMoved => {

  // Archive CSV
  return archiveCSV(now);
}).then(() => {
  console.log('Done!');
}).catch(e => {
  fs.appendFile('lasership.log', `${log} Final errors: ${e}\n`, (err) => {
    if (err) console.log('Unable to append to lasership.log.');
  });
});
