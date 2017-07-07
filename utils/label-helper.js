// NPM packages
const fs = require('fs-extra');
const _ = require('lodash');
const PDFMerge = require('pdf-merge');
const mkdirp = require('mkdirp');
const path = require('path');

// Global variables
const rootPath = path.join(__dirname, '../');
const pdftkPath = '/usr/local/bin/pdftk';
const tempPDFDir = `${rootPath}/pdfs-temp`;
let mergedPDFDir = `${rootPath}/merged-pdf-label`;

// Ensure the needed directories are in place
mkdirp(tempPDFDir, (err) => {
  if (err) {
    fs.appendFile('lasership.log', 'Error creating temp PDF directory.\n', (e) => {
      if (e) console.log('Unable to append to lasership.log.');
    });
  }
});
mkdirp(mergedPDFDir, (err) => {
  if (err) {
    fs.appendFile('lasership.log', 'Error creating temp PDF directory.\n', (e) => {
      if (e) console.log('Unable to append to lasership.log.');
    });
  }
});

/**
 * Creates a pdf label from the buffer retrieved from the API response.
 * @param  {object} response The LaserShip API response.
 * @return {Promise}         Resolves the shipping label path or rejects a new Error.
 */
const saveLabel = response => {
  let res;
  try {
    res = JSON.parse(response);
  }
  catch(e) {
    return new Error(e);
  }
  let reference = res.Order.CustomerOrderNumber;
  let label = res.Order.Label;
  let labelBuffer = Buffer.from(label, 'base64');
  return fs.writeFile(`${tempPDFDir}/${reference}.pdf`, labelBuffer).then(savedPDF => {
    return `${tempPDFDir}/${reference}.pdf`;
  });
};

/**
 * Merges all shipping label PDFs into a single PDF.
 * @return {Promise} Resolves an array of filenames or rejects a new Error.
 */
const mergeLabels = (labelPaths, mergedPDFName) => {
  return new Promise((resolve, reject) => {
    let pdfMerge = new PDFMerge(labelPaths, pdftkPath);

    pdfMerge.merge((err, buffer) => {
      if (err) {
        // TODO: log this
        reject(new Error(err));
      }
      // Write the merged PDF to disk
      fs.writeFile(`${mergedPDFDir}/${mergedPDFName}.pdf`, buffer, (err, data) => {
        if (err) {
          // TODO: log this
          reject(new Error(err));
        }
        resolve(labelPaths);
      });
    });
  });
};

/**
* Moves all individual PDFs to a folder labeled with current epoch timestamp.
* @param  {array} mergedLabels Array of label filepaths.
* @return {Promise}            Contains no data. Completes the Promise chain.
*/
const archiveLabels = (mergedLabels, now) => {
  // Create the new directory
  let newDir = `${rootPath}/archive/${now}/label_archive`;

  // Move the files
  let moveFiles = mergedLabels.map(oldFilePath => {
    let fileName = _.replace(oldFilePath, tempPDFDir, '');
    let newFilePath = `${newDir}/${fileName}`;
    return fs.move(oldFilePath, newFilePath);
  });

  return Promise.all(moveFiles);
};

module.exports = {
  saveLabel,
  mergeLabels,
  archiveLabels
};
