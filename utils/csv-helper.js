const parse = require('csv-parse/lib/sync');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const csvDir = `${rootPath}/DROP_CSV_HERE`;

/**
 * Retrieves the CSV name from the drop directory.
 * @param  {string} dir The name of the directory to check. Defaults to csvDir.
 * @return {string}     The name of the CSV.
 */
const getCSVName = (dir = csvDir) => {
  return fs.readdirSync(dir).filter(filename => {
    return filename.endsWith('.csv');
  })[0];
};

/**
 * Reads the CSV
 * @param  {string} dir The name of the directory to check.
 * @return {buffer}     Buffer representing the CSV.
 */
const getCSVData = (dir) => {
  return fs.readFileSync(`${dir}/${getCSVName(dir)}`);
};

/**
 * Converts the order lines in the CSV to an array of order objects.
 * @param  {string} dir The name of the directory to check. Defaults to csvDir.
 * @return {array} Array of order objects.
 */
const parseCSV = (dir = csvDir) => {
  return parse(getCSVData(dir), {columns: validateHeaders});
};

/**
 * Moves the CSV used for the script from the drop folder to the archive.
 * @param  {string} now Unix epoch timestamp string.
 * @return {Promise}    Fulfilled Promise if Lodash move() command is successful.
 */
const archiveCSV = (now, dir = csvDir, root_path = rootPath) => {
  let newDir = `${root_path}/archive/${now}`;
  let oldFilePath = `${dir}/${getCSVName(dir)}`;
  let fileName = _.replace(oldFilePath, `${dir}/`, '');
  let newFilePath = `${newDir}/${fileName}`;

  return fs.move(oldFilePath, newFilePath);
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
  archiveCSV
};
