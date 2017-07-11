const request = require('request-promise');
const argv = require('yargs').alias('test', 't').alias('production', 'p').argv;

const {localDeliveryDate} = require('./destination-timezone-helper.js');

const apiId = process.env.LASERSHIP_API_ID;
const apiKey = process.env.LASERSHIP_API_KEY;
const testFlag = argv.t ? 1 : argv.p ? 0 : 1;

// ENUM of key LaserShip times (Critical Pull Time & CPT +/- 1 hr)
// All times are in UTC and relative to Brooklyn
const LasershipTimes = (order) => {
  let lsTimeObject = [
    { label: 'expRFP', hrs: 20 },
    { label: 'CPT', hrs: 21 },
    { label: 'expDeparture', hrs: 22 }
  ];

  return lsTimeObject.reduce((obj, shipObj) => {
    let laserDate = new Date(order.SHIP_DATE);
    laserDate.setUTCHours(shipObj.hrs);
    obj[shipObj.label] = laserDate.toISOString().replace('.000Z', 'Z');
    return obj;
  }, {});
};

/**
 * Calls the localDeliveryDate function to get the destination delivery date.
 * @param  {object} order The order object from the CSV.
 * @return {string}       The timestamp for the delivery date.
 */
const getDeliveryDate = (order) => {
  let toAddress = `${order.ADDRESS_1} ${order.ADDRESS_2}, ${order.CITY}, ${order.STATE} ${order.POSTAL_CODE}`;
  return localDeliveryDate(toAddress, LasershipTimes(order).CPT, order.TNT);
};

/**
 * Constructor function for creating LaserShip order JSON.
 * @param  {object} order The order object from the CSV.
 * @return {object}       The order JSON to send to LaserShip.
 */
const LasershipOrder = function (order) {
  let lsTimes = LasershipTimes(order);

  // Begin object construction
  this.CustomerBranch = "CFDBRKLN";
  this.CustomerOrderNumber = order.SALES_ORDER_;
  this.OrderedFor = order.CONTACT_NAME;
  this.OrderedBy = {
    Name: "Chef'd",
    Phone: "3105311935",
    Email: "tech@chefd.com"
  };
  this.Reference1 = order.REFERENCE;
  this.Reference2 = order.SALES_ORDER_;
  this.ServiceCode = "RD";
  this.PickupType = "LaserShip";
  this.Origin = {
    LocationType: "Business",
    CustomerClientID: "",
    Contact: "Purple Carrot",
    Organization: "Purple Carrot",
    Address: "365 Ten Eyck St.",
    Address2: "",
    PostalCode: "11206",
    City: "BROOKLYN",
    State: "NY",
    Country: "US",
    Phone: "8577038188",
    PhoneExtension: "",
    Email: "tech@chefd.com",
    Payor: "",
    Instruction: "",
    Note: "",
    UTCExpectedReadyForPickupBy: lsTimes.expRFP,
    UTCExpectedDeparture: lsTimes.expDeparture,
    CustomerRoute: "",
    CustomerSequence: ""
  };
  this.Destination = {
    LocationType: "Residence",
    CustomerClientID: "",
    Contact: order.CONTACT_NAME,
    Organization: order.COMPANY_NAME,
    Address: order.ADDRESS_1,
    Address2: order.ADDRESS_2,
    PostalCode: order.POSTAL_CODE,
    City: order.CITY,
    State: order.STATE,
    Country: order.COUNTRY,
    Phone: order.TELEPHONE,
    PhoneExtension: "",
    Email: "",
    Payor: "",
    Instruction: order.SPECIAL_DELIVERY_INSTRUCTIONS,
    Note: "",
    UTCExpectedDeliveryBy: order.DELIVERY_DATE,
    CustomerRoute: "",
    CustomerSequence: ""
  };
  this.Pieces = [{
    ContainerType: "CustomPackaging",
    CustomerBarcode: "",
    CustomerPalletBarcode: "",
    Weight: order.WEIGHT,
    WeightUnit: "lbs",
    Width: 13,
    Length: 13,
    Height: 13,
    DimensionUnit: "in",
    Description: "Meal Kit",
    Reference: "",
    DeclaredValue: 65,
    DeclaredValueCurrency: "USD",
    SignatureType: "NotRequired",
    Attributes: [{
      Type: "Perishable",
      Description: ""
    }]
  }];
};

/**
 * Submits an order to LaserShip API.
 * @param  {object} order The JSON order object.
 * @return {Promise}      Resolves with response data from a successful request
 * or rejects a new Error.
 */
const submitOrder = order => {
  let endpoint = `https://api.lasership.com/Method/PlaceOrder/json/${apiId}/${apiKey}/${testFlag}/1/DN4x6`;
  let encodedOrder = encodeURIComponent(JSON.stringify(order));

  return request.post(endpoint).form({Order: encodedOrder});
};

module.exports = {
  LasershipOrder,
  getDeliveryDate,
  submitOrder
};
