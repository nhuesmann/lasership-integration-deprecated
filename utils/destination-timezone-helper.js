const moment = require('moment');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_API_KEY
});

/**
 * Uses Google geocode and timezone APIs to get the destination address UTC offset.
 * @param {string} address The destination address.
 * @return {Promise}       A promise that returns the offset string if resolved
 * and a new Error object if rejected.
 */
const getDestOffset = (address) => {
  return new Promise((resolve, reject) => {
    googleMapsClient.geocode({
      address
    }, (err, response) => {
      if (err) {
        reject(new Error(err));
      } else if (response.json.status === 'ZERO_RESULTS') {
        reject(new Error(`Address not found: ${address}`));
      } else if (response.json.status === 'OK') {
        let geoLat = response.json.results[0].geometry.location.lat;
        let geoLng = response.json.results[0].geometry.location.lng;

        googleMapsClient.timezone({
          location: [geoLat, geoLng],
          timestamp: Math.floor(new Date() / 1000)
        }, (err, response) => {
          if (err) {
            reject(new Error(err));
          } else if (response.json.status === 'ZERO_RESULTS') {
            reject(new Error(`Address not found: ${address}`));
          } else if (response.json.status === 'OK') {
            // Calculate the offset in hours, accounting for Daylight Savings
            let dstOffset = response.json.dstOffset;
            let rawOffset = response.json.rawOffset;
            let offset = (dstOffset + rawOffset)/3600;

            // Convert offset to string, formatted for moment.js
            let negative;
            if (offset < 0) {
              negative = true;
              offset = (offset * -1);
            }
            let offsetString = offset < 10 ? `0${offset}:00` : `${offset}:00`;
            offsetString = negative ? `-${offsetString}` : offsetString;

            resolve(offsetString);
          }
        });
      }
    });
  });
};

/**
 * Calculates the local delivery date and converts to UTC.
 * @param  {string} address  The destination address.
 * @param  {string} datetime The UTC timestamp to convert.
 * @param  {number} shipDays The number of days it will take to deliver the package.
 * @return {Promise}         A promise that returns a new UTC timestamp if resolved
 * and a new Error object if rejected.
 */
const localDeliveryDate = (address, datetime, shipDays) => {
  return getDestOffset(address).then(offset => {
    return moment.utc(`${datetime.replace('Z', '')}${offset}`).add(shipDays, 'days').format();
  });
};

module.exports = {
  localDeliveryDate
};
