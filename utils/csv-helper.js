const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');

const rootPath = path.join(__dirname, process.env.ROOT_PATH);
const csvDir = `${rootPath}/DROP_CSV_HERE`;

/**
 * Retrieves the CSV name from the drop directory.
 * @return {string} The name of the CSV.
 */
const getCSVName = () => {
  return fs.readdirSync(csvDir).filter(filename => {
    return filename.endsWith('.csv');
  })[0];
};

/**
 * Reads the CSV.
 * @return {buffer} Buffer representing the CSV.
 */
const getCSVData = () => {
  return fs.readFileSync(`${csvDir}/${getCSVName()}`);
};

/**
 * Converts the order lines in the CSV to an array of order objects.
 * @return {array} Array of order objects.
 */
const parseCSV = () => {
  return parse(getCSVData(csvDir), {columns: validateHeaders});
};

/**
 * Moves the CSV used for the script from the drop folder to the archive.
 * @param  {string} now Unix epoch timestamp string.
 * @return {Promise}    Fulfilled Promise if Lodash move() command is successful.
 */
const archiveCSV = (now) => {
  let newDir = `${rootPath}/archive/${now}`;
  let oldFilePath = `${csvDir}/${getCSVName()}`;
  let fileName = _.replace(oldFilePath, `${csvDir}/`, '');
  let newFilePath = `${newDir}/${fileName}`;

  return fs.move(oldFilePath, newFilePath);
};

/**
 * Creates a CSV of order number and tracking number pairs.
 * @param  {object} orders  The successful orders.
 * @param  {string} now     Unix epoch timestamp string.
 * @param  {string} csvName The name of the original CSV.
 * @return {Promise}        Resolves with array of label paths, rejects new Error.
 */
const trackingCSV = (orders, now, csvName) => {
  return new Promise((resolve, reject) => {
    let archiveDir = `${rootPath}/archive/${now}`;
    let csvInput = orders.map(order => {
      return [order.order, order.tracking];
    });
    let labels = orders.map(order => {
      return order.label;
    });

    let columns = {
      order: 'Order',
      tracking: 'Tracking Number'
    };

    stringify(csvInput, {
      columns,
      header: true
    }, (err, output) => {
      if (err) {
        reject(new Error(err));
      }

      fs.ensureDir(archiveDir).then(() => {
        return fs.writeFile(`${archiveDir}/TRACKING-${csvName}.csv`, output);
      }).then(() => {
        resolve(labels);
      }).catch(err => {
        fs.appendFile(`${rootPath}/lasership.log`, 'Error creating failed order CSV.\n', (e) => {
          if (e) console.log('Unable to append to lasership.log.');
        });
        reject(err);
      });
    });
  });
};

/**
 * Creates a CSV containing only the failed orders.
 * @param  {array} orders   The failed orders.
 * @param  {string} now     Unix epoch timestamp string.
 * @param  {string} csvName The name of the original CSV.
 * @return {Promise}        Resolves if CSV write operation is successful, rejects
 * new Error.
 */
const failedCSV = (orders, now, csvName) => {
  return new Promise((resolve, reject) => {
    let failedDir = `${rootPath}/archive/${now}`;
    let columnKeys = Object.keys(orders[0]);
    let columns = columnKeys.reduce((obj, key) => {
      obj[key] = key;
      return obj;
    }, {});

    stringify(orders, {
      formatters: 'object',
      columns,
      header: true
    }, (err, output) => {
      if (err) return console.log('Could not stringify() failed CSV.');

      fs.ensureDir(failedDir).then(() => {
        return fs.writeFile(`${failedDir}/FAILED_ORDERS-${csvName}.csv`, output);
      }).then(() => {
        resolve();
      }).catch(err => {
        fs.appendFile(`${rootPath}/lasership.log`, 'Error creating failed order CSV.\n', (e) => {
          if (e) console.log('Unable to append to lasership.log.');
        });
        reject(new Error(err));
      });
    });
  });
};

/**
 * Converts CSV headers into valid strings usable as object properties.
 * @param  {array} headers Original column headers.
 * @return {array}         Renamed column headers.
 */
const validateHeaders = (headers) => {
  return headers.map(function(header) {
    return header.replace(/\W/g, " ").replace(/\s+/g, "_").toUpperCase();
  });
};

module.exports = {
  getCSVName,
  parseCSV,
  archiveCSV,
  trackingCSV,
  failedCSV
};
