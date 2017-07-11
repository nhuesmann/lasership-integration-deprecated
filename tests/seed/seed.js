const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

const validOrder = {
  SALES_ORDER_: '123456',
  CONTACT_NAME: 'Nathan Huesmann',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '90245',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '3105311935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '7/7/17',
  REFERENCE: 'PC FAM EAST',
  TNT: 2,
  CARRIER: 'LaserShip'
};

const invalidOrder = {
  SALES_ORDER_: '123987',
  CONTACT_NAME: '',
  COMPANY_NAME: '',
  ADDRESS_1: '123 Fake Street',
  ADDRESS_2: '',
  POSTAL_CODE: '97477',
  CITY: 'Springfield',
  STATE: 'OR',
  COUNTRY: 'US',
  TELEPHONE: '3105311935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '7/7/17',
  REFERENCE: 'PC FAM EAST',
  TNT: 2,
  CARRIER: 'LaserShip'
};

const orderToValidate = {
  SALES_ORDER_: '123987',
  CONTACT_NAME: 'Nathan Huesmann',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '1234',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '(310) 531-1935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '7/7/17',
  REFERENCE: 'PC FAM EAST',
  TNT: '2',
  CARRIER: 'LaserShip'
};

const matchOrder = {
  SALES_ORDER_: '123456',
  CONTACT_NAME: 'Dr. Steven Brule',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '90245',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '5551234567',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'check it out',
  SHIP_DATE: '7/7/17',
  REFERENCE: 'FOR YOUR HEALTH',
  TNT: '1',
  CARRIER: 'LaserShip'
};

const forLsOrderConstructor = {
  SALES_ORDER_: '123456',
  CONTACT_NAME: 'Nathan Huesmann',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '90245',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '3105311935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '7/7/17',
  REFERENCE: 'PC FAM EAST',
  TNT: 2,
  CARRIER: 'LaserShip',
  DELIVERY_DATE: '2017-07-10T04:00:00Z'
};

const TestDates = () => {
  let utcRFP = moment().utc().day(8).hours(20).minutes(0).seconds(0).format();
  let utcDepart = moment().utc().day(8).hours(22).minutes(0).seconds(0).format();
  let utcDeliver = moment(utcRFP).utc().add(2, 'days').hours(1).minutes(0).seconds(0).format();
  return {
    utcRFP,
    utcDepart,
    utcDeliver
  };
};

const validLsOrder = {
	"CustomerBranch": "CFDBRKLN",
	"CustomerOrderNumber": "123456",
	"OrderedFor": "Nathan Huesmann",
	"OrderedBy": {
		"Name": "Chef'd",
		"Phone": "3105311935",
		"Email": "tech@chefd.com"
	},
	"Reference1": "API TEST",
	"Reference2": "",
	"ServiceCode": "RD",
	"PickupType": "LaserShip",
	"Origin": {
		"LocationType": "Business",
		"CustomerClientID": "",
		"Contact": "Purple Carrot",
		"Organization": "Purple Carrot",
		"Address": "365 Ten Eyck St.",
		"Address2": "",
		"PostalCode": "11206",
		"City": "BROOKLYN",
		"State": "NY",
		"Country": "US",
		"Phone": "8577038188",
		"PhoneExtension": "",
		"Email": "tech@chefd.com",
		"Payor": "",
		"Instruction": "",
		"Note": "",
		"UTCExpectedReadyForPickupBy": TestDates().utcRFP,
		"UTCExpectedDeparture": TestDates().utcDepart,
		"CustomerRoute": "",
		"CustomerSequence": ""
	},
	"Destination": {
		"LocationType": "Residence",
		"CustomerClientID": "",
		"Contact": "Nathan Huesmann",
		"Organization": "",
		"Address": "28 E 20th St",
		"Address2": "",
		"PostalCode": "10003",
		"City": "New York",
		"State": "NY",
		"Country": "US",
		"Phone": "3105311935",
		"PhoneExtension": "",
		"Email": "tech@chefd.com",
		"Payor": "",
		"Instruction": "",
		"Note": "",
		"UTCExpectedDeliveryBy": TestDates().utcDeliver,
		"CustomerRoute": "",
		"CustomerSequence": ""
	},
	"Pieces": [{
		"ContainerType": "CustomPackaging",
		"CustomerBarcode": "",
		"CustomerPalletBarcode": "",
		"Weight": 10,
		"WeightUnit": "lbs",
		"Width": 13,
		"Length": 13,
		"Height": 13,
		"DimensionUnit": "in",
		"Description": "Meal Kit",
		"Reference": "",
		"DeclaredValue": 65,
		"DeclaredValueCurrency": "USD",
		"SignatureType": "NotRequired",
		"Attributes": [{
			"Type": "Perishable",
			"Description": ""
		}]
	}]
};

const invalidLsOrder = {
	"CustomerBranch": "CFDBRKLN",
	"CustomerOrderNumber": "123456",
	"OrderedFor": "Nathan Huesmann",
	"OrderedBy": {
		"Name": "Chef'd",
		"Phone": "3105311935",
		"Email": "tech@chefd.com"
	},
	"Reference1": "API TEST",
	"Reference2": "",
	"ServiceCode": "RD",
	"PickupType": "LaserShip",
	"Origin": {
		"LocationType": "Business",
		"CustomerClientID": "",
		"Contact": "Purple Carrot",
		"Organization": "Purple Carrot",
		"Address": "365 Ten Eyck St.",
		"Address2": "",
		"PostalCode": "11206",
		"City": "BROOKLYN",
		"State": "NY",
		"Country": "US",
		"Phone": "8577038188",
		"PhoneExtension": "",
		"Email": "tech@chefd.com",
		"Payor": "",
		"Instruction": "",
		"Note": "",
		"UTCExpectedReadyForPickupBy": TestDates().utcRFP,
		"UTCExpectedDeparture": TestDates().utcDepart,
		"CustomerRoute": "",
		"CustomerSequence": ""
	},
	"Destination": {
		"LocationType": "Residence",
		"CustomerClientID": "",
		"Contact": "",
		"Organization": "",
		"Address": "28 E 20th St",
		"Address2": "",
		"PostalCode": "10003",
		"City": "New York",
		"State": "NY",
		"Country": "US",
		"Phone": "3105311935",
		"PhoneExtension": "",
		"Email": "tech@chefd.com",
		"Payor": "",
		"Instruction": "",
		"Note": "",
		"UTCExpectedDeliveryBy": TestDates().utcDeliver,
		"CustomerRoute": "",
		"CustomerSequence": ""
	},
	"Pieces": [{
		"ContainerType": "CustomPackaging",
		"CustomerBarcode": "",
		"CustomerPalletBarcode": "",
		"Weight": 10,
		"WeightUnit": "lbs",
		"Width": 13,
		"Length": 13,
		"Height": 13,
		"DimensionUnit": "in",
		"Description": "Meal Kit",
		"Reference": "",
		"DeclaredValue": 65,
		"DeclaredValueCurrency": "USD",
		"SignatureType": "NotRequired",
		"Attributes": [{
			"Type": "Perishable",
			"Description": ""
		}]
	}]
};

const prepCSV = (done) => {
  const csvSource = path.join(__dirname, '/test.csv');
  const csvDestination = path.join(__dirname, '../test-drop-csv-here/test.csv');
  fs.copy(csvSource, csvDestination).then(() => {
    fs.removeSync(path.join(__dirname, '../archive'));
    done();
  });
};

module.exports = {
  validOrder,
  invalidOrder,
  orderToValidate,
  matchOrder,
  prepCSV,
  forLsOrderConstructor,
  validLsOrder,
  invalidLsOrder
};
