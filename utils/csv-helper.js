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

      fs.ensureDir(archiveDir, (err) => {
        if (err) {
          fs.appendFile('lasership.log', 'Error creating archive directory.\n', (e) => {
            if (e) console.log('Unable to append to lasership.log.');
          });
        }

        fs.writeFile(`${archiveDir}/TRACKING-${csvName}.csv`, output).then(() => {
          resolve(labels);
        }).catch(e => {
          reject(e);
        });
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
  trackingCSV
};
